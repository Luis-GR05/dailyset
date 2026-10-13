import { describe, expect, it, vi } from 'vitest';

// suscripcionService importa el cliente de Supabase: no hace falta para la lógica pura
vi.mock('../src/lib/supabaseClient', () => ({ supabase: {} }));

import { esErrorLimitePlan, planEfectivo } from '../src/lib/suscripcionService';
import { esMismaPassword, esSesionRecuperacionInvalida, leerEnlaceRecuperacion, traducirErrorAuth } from '../src/lib/recuperacionPassword';

describe('planEfectivo (misma regla que la función SQL plan_usuario)', () => {
  const futuro = new Date(Date.now() + 20 * 864e5).toISOString().split('T')[0];
  const pasado = new Date(Date.now() - 10 * 864e5).toISOString().split('T')[0];

  it('un plan de pago activo cuenta', () => {
    expect(planEfectivo({ plan: 'pro', estado: 'active', fecha_renovacion: futuro })).toBe('pro');
    expect(planEfectivo({ plan: 'ultra', estado: 'trialing', fecha_renovacion: null })).toBe('ultra');
  });

  it('una suscripción cancelada, impagada o caducada vuelve a Free', () => {
    expect(planEfectivo({ plan: 'pro', estado: 'canceled', fecha_renovacion: futuro })).toBe('free');
    expect(planEfectivo({ plan: 'pro', estado: 'past_due', fecha_renovacion: futuro })).toBe('free');
    expect(planEfectivo({ plan: 'ultra', estado: 'active', fecha_renovacion: pasado })).toBe('free');
  });

  it('valores desconocidos se tratan como Free', () => {
    expect(planEfectivo({ plan: 'diamante', estado: 'active' })).toBe('free');
    expect(planEfectivo({})).toBe('free');
  });

  it('reconoce los errores de límite lanzados por los triggers', () => {
    const err = { message: 'LIMIT_SEGUIDOS_FREE: el plan Free permite seguir a 20 atletas' };
    expect(esErrorLimitePlan(err, 'LIMIT_SEGUIDOS_FREE')).toBe(true);
    expect(esErrorLimitePlan(err, 'LIMIT_RUTINAS_PLAN')).toBe(false);
    expect(esErrorLimitePlan(null, 'LIMIT_RUTINAS_PLAN')).toBe(false);
  });
});

describe('enlace de recuperación de contraseña', () => {
  it('lee los tokens del flujo implícito (hash)', () => {
    const r = leerEnlaceRecuperacion('dailyset://restablecer-password#access_token=abc&refresh_token=def&type=recovery');
    expect(r).toEqual({ code: undefined, accessToken: 'abc', refreshToken: 'def', invalido: false });
  });

  it('lee el código PKCE (query) también en Expo Go', () => {
    const r = leerEnlaceRecuperacion('exp://192.168.0.21:8081/--/restablecer-password?code=xyz');
    expect(r.code).toBe('xyz');
    expect(r.invalido).toBe(false);
  });

  it('detecta enlaces caducados', () => {
    expect(leerEnlaceRecuperacion('https://x.app/restablecer-password#error=access_denied&error_code=otp_expired').invalido).toBe(true);
    expect(leerEnlaceRecuperacion('https://x.app/restablecer-password?error_description=Email+link+is+invalid+or+has+expired').invalido).toBe(true);
  });

  it('clasifica los errores de Supabase', () => {
    expect(esMismaPassword({ code: 'same_password' })).toBe(true);
    expect(esMismaPassword({ message: 'New password should be different from the old password.' })).toBe(true);
    expect(esSesionRecuperacionInvalida({ message: 'Auth session missing!' })).toBe(true);
    expect(traducirErrorAuth('Password should be at least 6 characters', 'es')).toBe('La contraseña debe tener al menos 6 caracteres.');
    expect(traducirErrorAuth('rate limit exceeded', 'en')).toContain('Too many requests');
  });
});
