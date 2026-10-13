// api/stripe-checkout.ts
// Crea una sesión de Stripe Checkout para contratar Pro o Ultra.
// Seguridad: el usuario se identifica con su token de Supabase (no con un userId del body).
// Si ya tiene una suscripción activa, devuelve el portal de facturación para cambiar de plan
// en vez de crear una segunda suscripción.
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  aplicarCors, clienteStripe, importeCentimos, precioConfigurado, responderError, supabaseAdmin, urlBase, usuarioAutenticado,
  type Ciclo, type PlanPago,
} from './_comun.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (aplicarCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido. Usa POST.' });

  try {
    const usuario = await usuarioAutenticado(req);
    if (!usuario) return res.status(401).json({ error: 'Debes iniciar sesión para contratar un plan.' });

    const { planId, ciclo } = req.body || {};
    if (planId !== 'pro' && planId !== 'ultra') {
      return res.status(400).json({ error: 'El plan debe ser "pro" o "ultra".' });
    }
    const plan: PlanPago = planId;
    const cicloSel: Ciclo = ciclo === 'anual' ? 'anual' : 'mensual';

    const stripe = clienteStripe();
    const db = supabaseAdmin();
    const base = urlBase(req);

    const { data: sus } = await db
      .from('suscripciones')
      .select('stripe_customer_id, stripe_subscription_id, plan, estado')
      .eq('usuario_id', usuario.id)
      .maybeSingle();

    // Ya tiene una suscripción de pago activa → gestionar el cambio en el portal de Stripe
    if (sus?.stripe_subscription_id && sus.plan !== 'free' && ['active', 'trialing', 'past_due'].includes(sus.estado || 'active')) {
      const portal = await stripe.billingPortal.sessions.create({
        customer: sus.stripe_customer_id,
        return_url: `${base}/suscripciones`,
      });
      return res.status(200).json({ url: portal.url, portal: true });
    }

    // Cliente de Stripe: reutilizar el guardado o crear uno nuevo ligado al usuario
    let customerId: string | undefined = sus?.stripe_customer_id || undefined;
    if (!customerId) {
      const cliente = await stripe.customers.create({
        email: usuario.email,
        metadata: { userId: usuario.id },
      });
      customerId = cliente.id;
      await db.from('suscripciones').upsert(
        { usuario_id: usuario.id, stripe_customer_id: customerId, actualizado_en: new Date().toISOString() },
        { onConflict: 'usuario_id' }
      );
    }

    const priceId = precioConfigurado(plan, cicloSel);
    const nombre = plan === 'pro' ? 'DailySet Pro' : 'DailySet Ultra';
    const lineItems = priceId
      ? [{ price: priceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: 'eur',
              unit_amount: importeCentimos(plan, cicloSel),
              recurring: { interval: (cicloSel === 'mensual' ? 'month' : 'year') as 'month' | 'year' },
              product_data: { name: `${nombre} (${cicloSel})`, metadata: { planId: plan } },
            },
            quantity: 1,
          },
        ];

    const metadata = { userId: usuario.id, planId: plan, ciclo: cicloSel };
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: usuario.id,
      metadata,
      subscription_data: { metadata },
      line_items: lineItems,
      success_url: `${base}/suscripciones?status=success`,
      cancel_url: `${base}/suscripciones?status=cancelled`,
      allow_promotion_codes: true,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    return responderError(res, err, 'stripe-checkout');
  }
}
