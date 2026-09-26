// api/stripe-checkout.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configuración de CORS para peticiones desde Web y App móvil
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  if (!stripeSecretKey) {
    return res.status(500).json({
      error: 'La variable de entorno STRIPE_SECRET_KEY no está configurada.',
    });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-02-24.acacia' as any,
  });

  try {
    const { planId, ciclo, userId, userEmail, returnUrl } = req.body || {};

    if (!planId || !userId) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos (planId, userId).' });
    }

    if (planId !== 'pro' && planId !== 'ultra') {
      return res.status(400).json({ error: 'El plan debe ser "pro" o "ultra".' });
    }

    const cicloSeleccionado: 'mensual' | 'anual' = ciclo === 'anual' ? 'anual' : 'mensual';

    // Determinar precio en céntimos
    // Pro: 2.99 €/mes o 30.50 €/año
    // Ultra: 4.99 €/mes o 50.90 €/año
    const amountInCents =
      planId === 'pro'
        ? cicloSeleccionado === 'mensual'
          ? 299
          : 3050
        : cicloSeleccionado === 'mensual'
        ? 499
        : 5090;

    const planNombre = planId === 'pro' ? 'DailySet Pro' : 'DailySet Ultra';
    const planDesc =
      planId === 'pro'
        ? 'Plan básico avanzado para atletas comprometidos'
        : 'Potencia total premium sin límites ni restricciones';

    // Buscar o reutilizar cliente de Stripe
    let customerId: string | undefined;
    if (userEmail) {
      const existingCustomers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });
      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        const newCustomer = await stripe.customers.create({
          email: userEmail,
          metadata: { userId },
        });
        customerId = newCustomer.id;
      }
    }

    const baseUrl = returnUrl || req.headers.origin || 'http://localhost:5173';

    const priceId =
      planId === 'pro'
        ? cicloSeleccionado === 'mensual'
          ? process.env.STRIPE_PRICE_PRO_MENSUAL
          : process.env.STRIPE_PRICE_PRO_ANUAL
        : cicloSeleccionado === 'mensual'
        ? process.env.STRIPE_PRICE_ULTRA_MENSUAL
        : process.env.STRIPE_PRICE_ULTRA_ANUAL;

    const lineItems = priceId
      ? [{ price: priceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: 'eur',
              unit_amount: amountInCents,
              recurring: {
                interval: (cicloSeleccionado === 'mensual' ? 'month' : 'year') as 'month' | 'year',
              },
              product_data: {
                name: planNombre,
                description: `${planDesc} (${cicloSeleccionado})`,
              },
            },
            quantity: 1,
          },
        ];

    // Crear sesión de Stripe Checkout en modo suscripción recurrente
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      client_reference_id: userId,
      metadata: {
        userId,
        planId,
        ciclo: cicloSeleccionado,
      },
      subscription_data: {
        metadata: {
          userId,
          planId,
          ciclo: cicloSeleccionado,
        },
      },
      line_items: lineItems,
      success_url: `${baseUrl}/suscripciones?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/suscripciones?status=cancelled`,
      allow_promotion_codes: true,
    });

    return res.status(200).json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (err: any) {
    console.error('Error al crear checkout session:', err);
    return res.status(500).json({
      error: err.message || 'Error interno al procesar el pago con Stripe.',
    });
  }
}
