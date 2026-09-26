// api/stripe-portal.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
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
    const { customerId, userEmail, returnUrl } = req.body || {};

    let stripeCustomerId = customerId;

    if (!stripeCustomerId && userEmail) {
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });
      if (customers.data.length > 0) {
        stripeCustomerId = customers.data[0].id;
      }
    }

    if (!stripeCustomerId) {
      return res.status(404).json({
        error: 'No se encontró ningún cliente registrado en Stripe para esta cuenta.',
      });
    }

    const baseUrl = returnUrl || req.headers.origin || 'http://localhost:5173';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${baseUrl}/suscripciones`,
    });

    return res.status(200).json({ url: portalSession.url });
  } catch (err: any) {
    console.error('Error al abrir Customer Portal de Stripe:', err);
    return res.status(500).json({
      error: err.message || 'Error interno al generar el portal de facturación.',
    });
  }
}
