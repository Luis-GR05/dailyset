// src/lib/suscripcionService.ts
// Lectura del plan de suscripción del usuario (compartido web ↔ app).
//
// El plan vive en la tabla public.suscripciones (ver supabase/planes_seguros.sql):
// el usuario sólo puede LEERLA; únicamente el webhook de Stripe la modifica.
// Nunca se guarda ni se lee el plan de localStorage ni de perfiles.preferencias.
import { supabase } from './supabaseClient';

export type PlanUsuario = 'free' | 'pro' | 'ultra';

export interface DatosSuscripcion {
  plan: PlanUsuario;
  cicloFacturacion?: 'mensual' | 'anual';
  fechaRenovacionPlan?: string;
  renovacionAutomatica: boolean;
  /** true si el usuario tiene cliente en Stripe (puede abrir el portal de facturación). */
  tieneClienteStripe: boolean;
}

export const SUSCRIPCION_FREE: DatosSuscripcion = {
  plan: 'free',
  renovacionAutomatica: false,
  tieneClienteStripe: false,
};

const DIAS_GRACIA = 3;

/** Misma regla que la función SQL public.plan_usuario(). */
export function planEfectivo(fila: {
  plan?: string | null;
  estado?: string | null;
  fecha_renovacion?: string | null;
}): PlanUsuario {
  const plan = fila.plan === 'pro' || fila.plan === 'ultra' ? fila.plan : 'free';
  if (plan === 'free') return 'free';
  const estadoOk = ['active', 'trialing'].includes(fila.estado || 'active');
  if (!estadoOk) return 'free';
  if (fila.fecha_renovacion) {
    const limite = new Date(`${fila.fecha_renovacion}T23:59:59`);
    limite.setDate(limite.getDate() + DIAS_GRACIA);
    if (limite.getTime() < Date.now()) return 'free';
  }
  return plan;
}

export async function obtenerSuscripcion(userId: string): Promise<DatosSuscripcion> {
  try {
    const { data, error } = await supabase
      .from('suscripciones')
      .select('plan, ciclo, estado, fecha_renovacion, renovacion_automatica, stripe_customer_id')
      .eq('usuario_id', userId)
      .maybeSingle();
    if (error || !data) return SUSCRIPCION_FREE;
    const plan = planEfectivo(data);
    return {
      plan,
      cicloFacturacion: plan !== 'free' && (data.ciclo === 'mensual' || data.ciclo === 'anual') ? data.ciclo : undefined,
      fechaRenovacionPlan: plan !== 'free' ? data.fecha_renovacion ?? undefined : undefined,
      renovacionAutomatica: plan !== 'free' && !!data.renovacion_automatica,
      tieneClienteStripe: !!data.stripe_customer_id,
    };
  } catch {
    return SUSCRIPCION_FREE;
  }
}

/** Códigos que lanzan los triggers de límites de plan en la base de datos. */
export type CodigoLimitePlan = 'LIMIT_RUTINAS_PLAN' | 'LIMIT_SEGUIDOS_FREE';

export function esErrorLimitePlan(err: unknown, codigo: CodigoLimitePlan): boolean {
  const msg = (err as { message?: string } | null)?.message || String(err ?? '');
  return msg.includes(codigo);
}

/**
 * Tras volver de Stripe, el webhook puede tardar unos segundos en actualizar el plan.
 * Consulta la suscripción hasta que deja de ser `planAnterior` (o se agotan los intentos).
 */
export async function esperarCambioDePlan(
  userId: string,
  planAnterior: PlanUsuario,
  opciones: { intentos?: number; intervaloMs?: number } = {}
): Promise<DatosSuscripcion> {
  const { intentos = 8, intervaloMs = 2000 } = opciones;
  let ultima = await obtenerSuscripcion(userId);
  for (let i = 1; i < intentos && ultima.plan === planAnterior; i++) {
    await new Promise((r) => setTimeout(r, intervaloMs));
    ultima = await obtenerSuscripcion(userId);
  }
  return ultima;
}
