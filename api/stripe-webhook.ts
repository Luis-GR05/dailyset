// api/stripe-webhook.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper para leer el body crudo (raw buffer) necesario para la firma de Stripe
async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', (err) => reject(err));
  });
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_ANON_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  if (!stripeSecretKey) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY no configurado.' });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Supabase URL o Service Key no configurados.' });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-02-24.acacia' as any,
  });

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers['stripe-signature'] as string;

    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } else {
      // Si aún no se configuró webhook secret en test local, parsear JSON directo
      event = JSON.parse(rawBody.toString('utf8'));
    }
  } catch (err: any) {
    console.error('Error al verificar webhook de Stripe:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`[Stripe Webhook] Recibido evento: ${event.type}`);

  try {
    switch (event.type) {
      // 1. Pago completado en Stripe Checkout
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.userId;
        const planId = (session.metadata?.planId as 'pro' | 'ultra') || 'pro';
        const ciclo = (session.metadata?.ciclo as 'mensual' | 'anual') || 'mensual';
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (userId) {
          // Obtener suscripción de Stripe para saber fecha de fin de periodo
          let fechaRenovacion = new Date();
          if (ciclo === 'mensual') {
            fechaRenovacion.setMonth(fechaRenovacion.getMonth() + 1);
          } else {
            fechaRenovacion.setFullYear(fechaRenovacion.getFullYear() + 1);
          }

          if (subscriptionId) {
            try {
              const sub = await stripe.subscriptions.retrieve(subscriptionId);
              fechaRenovacion = new Date((sub as any).current_period_end * 1000);
            } catch (e) {
              console.warn('No se pudo obtener detalles de la suscripción:', e);
            }
          }

          // Cargar perfil actual para merge seguro de preferencias
          const { data: profile } = await supabase
            .from('perfiles')
            .select('preferencias')
            .eq('id', userId)
            .single();

          const currentPrefs = profile?.preferencias || {};
          const newPrefs = {
            ...currentPrefs,
            plan: planId,
            cicloFacturacion: ciclo,
            fechaRenovacionPlan: fechaRenovacion.toISOString().split('T')[0],
            renovacionAutomatica: true,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
          };

          const { error: updateError } = await supabase
            .from('perfiles')
            .update({ preferencias: newPrefs })
            .eq('id', userId);

          if (updateError) {
            console.error('Error al actualizar perfil en Supabase:', updateError);
          } else {
            console.log(`[Stripe Webhook] Usuario ${userId} actualizado a plan ${planId}`);
          }
        }
        break;
      }

      // 2. Suscripción cancelada o finalizada
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Buscar perfil con este stripeCustomerId
        const { data: profiles } = await supabase
          .from('perfiles')
          .select('id, preferencias')
          .filter('preferencias->>stripeCustomerId', 'eq', customerId);

        if (profiles && profiles.length > 0) {
          for (const p of profiles) {
            const currentPrefs = p.preferencias || {};
            const newPrefs = {
              ...currentPrefs,
              plan: 'free',
              renovacionAutomatica: false,
              stripeSubscriptionId: null,
            };

            await supabase
              .from('perfiles')
              .update({ preferencias: newPrefs })
              .eq('id', p.id);

            console.log(`[Stripe Webhook] Suscripción cancelada. Usuario ${p.id} revertido a FREE.`);
          }
        }
        break;
      }

      // 3. Suscripción modificada o renovada
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const cancelAtPeriodEnd = subscription.cancel_at_period_end;
        const fechaRenovacion = new Date((subscription as any).current_period_end * 1000);

        const { data: profiles } = await supabase
          .from('perfiles')
          .select('id, preferencias')
          .filter('preferencias->>stripeCustomerId', 'eq', customerId);

        if (profiles && profiles.length > 0) {
          for (const p of profiles) {
            const currentPrefs = p.preferencias || {};
            const newPrefs = {
              ...currentPrefs,
              renovacionAutomatica: !cancelAtPeriodEnd,
              fechaRenovacionPlan: fechaRenovacion.toISOString().split('T')[0],
            };

            await supabase
              .from('perfiles')
              .update({ preferencias: newPrefs })
              .eq('id', p.id);
          }
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Evento no manejado: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('Error procesando evento webhook:', err);
    return res.status(500).json({ error: 'Error interno en webhook.' });
  }
}
