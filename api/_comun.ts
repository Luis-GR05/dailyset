// api/_comun.ts
// Utilidades compartidas por las funciones serverless de Stripe.
// Vercel no publica como endpoint los archivos de /api que empiezan por "_".
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type PlanPago = 'pro' | 'ultra';
export type Ciclo = 'mensual' | 'anual';

// ── Variables de entorno (configurar en Vercel → Settings → Environment Variables) ──
// NUNCA uses el prefijo VITE_ para claves secretas: Vite las incrustaría en el JS público.
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

/** URL pública de la web, usada para las URLs de retorno de Stripe. */
export function urlBase(req: VercelRequest): string {
  const configurada = process.env.APP_URL?.replace(/\/+$/, '');
  if (configurada) return configurada;
  const origen = req.headers.origin;
  if (typeof origen === 'string' && /^https?:\/\//.test(origen)) return origen.replace(/\/+$/, '');
  return 'https://dailyset.vercel.app';
}

export function aplicarCors(req: VercelRequest, res: VercelResponse): boolean {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

export function clienteStripe(): Stripe {
  if (!STRIPE_SECRET_KEY) throw new ErrorConfig('STRIPE_SECRET_KEY no está configurada.');
  return new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' as any });
}

/** Cliente de Supabase con la service_role key: ignora RLS. Sólo en el servidor. */
export function supabaseAdmin(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new ErrorConfig('SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no están configuradas.');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

export class ErrorConfig extends Error {}

/**
 * Identifica al usuario a partir del token de sesión de Supabase
 * (cabecera `Authorization: Bearer <access_token>`). Nunca se confía en un userId del body.
 */
export async function usuarioAutenticado(req: VercelRequest): Promise<{ id: string; email?: string } | null> {
  const cabecera = req.headers.authorization || '';
  const token = cabecera.startsWith('Bearer ') ? cabecera.slice(7).trim() : '';
  if (!token) return null;
  const { data, error } = await supabaseAdmin().auth.getUser(token);
  if (error || !data?.user) return null;
  return { id: data.user.id, email: data.user.email ?? undefined };
}

/** Precio de Stripe configurado para cada plan y ciclo. */
export function precioConfigurado(plan: PlanPago, ciclo: Ciclo): string | undefined {
  const mapa: Record<string, string | undefined> = {
    'pro-mensual': process.env.STRIPE_PRICE_PRO_MENSUAL,
    'pro-anual': process.env.STRIPE_PRICE_PRO_ANUAL,
    'ultra-mensual': process.env.STRIPE_PRICE_ULTRA_MENSUAL,
    'ultra-anual': process.env.STRIPE_PRICE_ULTRA_ANUAL,
  };
  return mapa[`${plan}-${ciclo}`];
}

/** Importe en céntimos (sólo si no hay precios configurados en Stripe). Debe coincidir con data/planesSuscripcion.ts. */
export function importeCentimos(plan: PlanPago, ciclo: Ciclo): number {
  if (plan === 'pro') return ciclo === 'mensual' ? 299 : 3050;
  return ciclo === 'mensual' ? 499 : 5090;
}

/** Deduce plan y ciclo de una suscripción de Stripe (sirve también tras cambiar de plan en el portal). */
export function planDeSuscripcion(sub: Stripe.Subscription): { plan: PlanPago; ciclo: Ciclo } {
  const item = sub.items?.data?.[0];
  const priceId = item?.price?.id;
  for (const plan of ['pro', 'ultra'] as PlanPago[]) {
    for (const ciclo of ['mensual', 'anual'] as Ciclo[]) {
      if (priceId && precioConfigurado(plan, ciclo) === priceId) return { plan, ciclo };
    }
  }
  const ciclo: Ciclo = item?.price?.recurring?.interval === 'year' ? 'anual' : 'mensual';
  const metaPlan = (item?.price?.metadata?.planId || sub.metadata?.planId) as PlanPago | undefined;
  return { plan: metaPlan === 'ultra' ? 'ultra' : 'pro', ciclo };
}

export function finDePeriodo(sub: Stripe.Subscription): string | null {
  const segundos = (sub as any).current_period_end ?? (sub.items?.data?.[0] as any)?.current_period_end;
  return typeof segundos === 'number' ? new Date(segundos * 1000).toISOString().split('T')[0] : null;
}

export function responderError(res: VercelResponse, err: unknown, contexto: string) {
  console.error(`[${contexto}]`, err);
  const mensaje = err instanceof ErrorConfig ? err.message : 'Error interno del servidor de pagos.';
  return res.status(500).json({ error: mensaje });
}
