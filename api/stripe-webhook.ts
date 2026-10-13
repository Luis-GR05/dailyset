// api/stripe-webhook.ts
// Única vía por la que cambia el plan de un usuario: Stripe avisa y se actualiza
// public.suscripciones con la service_role key (ver supabase/planes_seguros.sql).
// Seguridad: se rechaza cualquier evento sin firma válida de Stripe.
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type Stripe from 'stripe';
import { clienteStripe, finDePeriodo, planDeSuscripcion, supabaseAdmin } from './_comun.js';

export const config = { api: { bodyParser: false } };

function leerCuerpo(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const trozos: Buffer[] = [];
    req.on('data', (t: Buffer) => trozos.push(t));
    req.on('end', () => resolve(Buffer.concat(trozos)));
    req.on('error', reject);
  });
}

/** Guarda en Supabase el estado actual de una suscripción de Stripe. */
async function sincronizarSuscripcion(sub: Stripe.Subscription, usuarioIdPista?: string | null) {
  const db = supabaseAdmin();
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

  // Localizar al usuario: metadata de la suscripción → pista del checkout → cliente guardado
  let usuarioId = sub.metadata?.userId || usuarioIdPista || null;
  if (!usuarioId) {
    const { data } = await db.from('suscripciones').select('usuario_id').eq('stripe_customer_id', customerId).maybeSingle();
    usuarioId = data?.usuario_id ?? null;
  }
  if (!usuarioId) {
    console.warn(`[stripe-webhook] No se encontró usuario para el cliente ${customerId}`);
    return;
  }

  const activa = ['active', 'trialing', 'past_due'].includes(sub.status);
  const { plan, ciclo } = planDeSuscripcion(sub);

  // Si termina una suscripción antigua mientras el usuario ya tiene otra distinta, no tocar nada
  if (!activa) {
    const { data: actual } = await db.from('suscripciones').select('stripe_subscription_id').eq('usuario_id', usuarioId).maybeSingle();
    if (actual?.stripe_subscription_id && actual.stripe_subscription_id !== sub.id) {
      console.log(`[stripe-webhook] Ignorado fin de ${sub.id}: el usuario ${usuarioId} tiene ${actual.stripe_subscription_id}`);
      return;
    }
  }

  const { error } = await db.from('suscripciones').upsert(
    {
      usuario_id: usuarioId,
      plan: activa ? plan : 'free',
      ciclo: activa ? ciclo : null,
      estado: sub.status,
      fecha_renovacion: activa ? finDePeriodo(sub) : null,
      renovacion_automatica: activa && !sub.cancel_at_period_end,
      stripe_customer_id: customerId,
      stripe_subscription_id: activa ? sub.id : null,
      actualizado_en: new Date().toISOString(),
    },
    { onConflict: 'usuario_id' }
  );
  if (error) throw new Error(`Error guardando suscripción: ${error.message}`);
  console.log(`[stripe-webhook] Usuario ${usuarioId} → ${activa ? plan : 'free'} (${sub.status})`);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido. Usa POST.' });

  const secreto = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secreto) {
    console.error('[stripe-webhook] Falta STRIPE_WEBHOOK_SECRET: se rechazan todos los eventos.');
    return res.status(500).json({ error: 'Webhook no configurado.' });
  }

  let stripe: Stripe;
  let evento: Stripe.Event;
  try {
    stripe = clienteStripe();
    const firma = req.headers['stripe-signature'];
    if (typeof firma !== 'string') return res.status(400).send('Falta la firma de Stripe.');
    evento = stripe.webhooks.constructEvent(await leerCuerpo(req), firma, secreto);
  } catch (err: any) {
    console.error('[stripe-webhook] Firma inválida:', err?.message);
    return res.status(400).send(`Webhook Error: ${err?.message}`);
  }

  try {
    switch (evento.type) {
      case 'checkout.session.completed': {
        const session = evento.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription) {
          const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          await sincronizarSuscripcion(sub, session.client_reference_id || session.metadata?.userId);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await sincronizarSuscripcion(evento.data.object as Stripe.Subscription);
        break;
      default:
        console.log(`[stripe-webhook] Evento ignorado: ${evento.type}`);
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[stripe-webhook] Error procesando evento:', err);
    // 500 → Stripe reintentará el envío
    return res.status(500).json({ error: 'Error interno en webhook.' });
  }
}
