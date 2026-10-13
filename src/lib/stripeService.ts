// src/lib/stripeService.ts
// Cliente de los endpoints de Stripe (/api) para la WEB.
// La app tiene su propia versión (dailyset-app/src/lib/stripeService.ts) con las mismas firmas.
//
// Seguridad: el backend identifica al usuario con el token de sesión de Supabase
// (cabecera Authorization). Nunca se envía el userId en el cuerpo.
import { supabase } from './supabaseClient';

export interface CheckoutParams {
  planId: 'pro' | 'ultra';
  ciclo: 'mensual' | 'anual';
}

export interface RespuestaStripe {
  url?: string;
  /** true si, al tener ya una suscripción, se abrió el portal en lugar del checkout. */
  portal?: boolean;
  error?: string;
}

async function llamarApi(ruta: string, cuerpo: object): Promise<RespuestaStripe> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Tu sesión ha caducado. Vuelve a iniciar sesión.');

  const res = await fetch(ruta, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(cuerpo),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Error de conexión con la pasarela de pago.');
  if (!json.url) throw new Error('No se recibió la URL de Stripe.');
  return json;
}

export async function iniciarCheckoutStripe(params: CheckoutParams): Promise<RespuestaStripe> {
  try {
    const r = await llamarApi('/api/stripe-checkout', params);
    window.location.href = r.url!;
    return r;
  } catch (err: any) {
    console.error('Error en iniciarCheckoutStripe:', err);
    return { error: err.message || 'Error de conexión con la pasarela de pago.' };
  }
}

export async function abrirPortalFacturacion(): Promise<RespuestaStripe> {
  try {
    const r = await llamarApi('/api/stripe-portal', {});
    window.location.href = r.url!;
    return r;
  } catch (err: any) {
    console.error('Error en abrirPortalFacturacion:', err);
    return { error: err.message || 'Error de conexión con el portal de Stripe.' };
  }
}
