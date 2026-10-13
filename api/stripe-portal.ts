// api/stripe-portal.ts
// Abre el portal de facturación de Stripe (cambiar plan, cancelar o reactivar la
// renovación, actualizar la tarjeta, descargar facturas).
// Seguridad: sólo abre el portal del cliente de Stripe ligado al usuario autenticado.
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { aplicarCors, clienteStripe, responderError, supabaseAdmin, urlBase, usuarioAutenticado } from './_comun';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (aplicarCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido. Usa POST.' });

  try {
    const usuario = await usuarioAutenticado(req);
    if (!usuario) return res.status(401).json({ error: 'Debes iniciar sesión.' });

    const { data: sus } = await supabaseAdmin()
      .from('suscripciones')
      .select('stripe_customer_id')
      .eq('usuario_id', usuario.id)
      .maybeSingle();

    if (!sus?.stripe_customer_id) {
      return res.status(404).json({ error: 'Todavía no tienes ninguna suscripción de pago.' });
    }

    const portal = await clienteStripe().billingPortal.sessions.create({
      customer: sus.stripe_customer_id,
      return_url: `${urlBase(req)}/suscripciones`,
    });
    return res.status(200).json({ url: portal.url });
  } catch (err) {
    return responderError(res, err, 'stripe-portal');
  }
}
