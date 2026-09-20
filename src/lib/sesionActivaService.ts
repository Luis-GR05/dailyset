// src/lib/sesionActivaService.ts
// Servicio de persistencia y recuperación de entrenamientos activos serie a serie y sincronización offline-first

export const ACTIVE_SESSION_EVENT = 'dailyset_active_session_change';
export const OFFLINE_SYNC_EVENT = 'dailyset_offline_sync_done';

export interface SerieGuardada {
  numero: number;
  kg: number;
  reps: number;
  completada: boolean;
}

export interface EjercicioGuardado {
  id: number;
  nombre: string;
  series: SerieGuardada[];
}

export interface SesionActivaData {
  id: string;
  userId: string;
  rutinaId: number | null;
  nombreRutina: string;
  startedAtMs: number;
  lastSavedAtMs: number;
  ejerciciosUI: EjercicioGuardado[];
  segundosDescansoConfig?: number;
  elapsedSeconds?: number;
}

export interface SesionPendienteSync {
  id: string;
  userId: string;
  fecha: string;
  duracionMin: number;
  puntuacion?: number | null;
  rutinaId?: number | null;
  nombreRutina?: string;
  ejercicios: {
    ejercicioId: number;
    series: { kg: number; reps: number; completada: boolean }[];
  }[];
  creadaEnMs: number;
}

const getActiveSessionKey = (userId: string) => `dailyset_sesion_activa_${userId || 'anonimo'}`;
const getOfflineQueueKey = (userId: string) => `dailyset_offline_queue_${userId || 'anonimo'}`;

/**
 * Guarda el progreso completo de la sesión activa en almacenamiento local de inmediato
 */
export function guardarProgresoSesion(data: SesionActivaData): void {
  if (typeof window === 'undefined' || !data.userId) return;

  try {
    const payload: SesionActivaData = {
      ...data,
      lastSavedAtMs: Date.now(),
    };
    localStorage.setItem(getActiveSessionKey(data.userId), JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent(ACTIVE_SESSION_EVENT, { detail: payload }));
  } catch (err) {
    console.error('Error guardando progreso de sesion activa:', err);
  }
}

/**
 * Obtiene la sesión activa si existe y tiene menos de 24 horas de antigüedad
 */
export function obtenerSesionActiva(userId: string): SesionActivaData | null {
  if (typeof window === 'undefined' || !userId) return null;

  try {
    const raw = localStorage.getItem(getActiveSessionKey(userId));
    if (!raw) return null;

    const sesion: SesionActivaData = JSON.parse(raw);
    const ahora = Date.now();
    const limite24hMs = 24 * 60 * 60 * 1000;

    // Si la sesión tiene más de 24 horas, se considera expirada
    if (ahora - (sesion.lastSavedAtMs || sesion.startedAtMs) > limite24hMs) {
      descartarSesionActiva(userId);
      return null;
    }

    return sesion;
  } catch (err) {
    console.error('Error al leer sesion activa:', err);
    return null;
  }
}

/**
 * Descarta y elimina definitivamente la sesión activa guardada
 */
export function descartarSesionActiva(userId: string): void {
  if (typeof window === 'undefined' || !userId) return;

  try {
    localStorage.removeItem(getActiveSessionKey(userId));
    window.dispatchEvent(new CustomEvent(ACTIVE_SESSION_EVENT, { detail: null }));
  } catch (err) {
    console.error('Error descartando sesion activa:', err);
  }
}

/**
 * Guarda una sesión terminada en la cola de sincronización offline si falló la red
 */
export function guardarSesionPendienteSync(sesion: SesionPendienteSync): void {
  if (typeof window === 'undefined' || !sesion.userId) return;

  try {
    const key = getOfflineQueueKey(sesion.userId);
    const raw = localStorage.getItem(key);
    const actuales: SesionPendienteSync[] = raw ? JSON.parse(raw) : [];

    // Reemplazar o insertar
    const filtradas = actuales.filter(s => s.id !== sesion.id);
    filtradas.push(sesion);

    localStorage.setItem(key, JSON.stringify(filtradas));
  } catch (err) {
    console.error('Error guardando sesion en cola offline:', err);
  }
}

/**
 * Obtiene la lista de sesiones pendientes de sincronización offline
 */
export function obtenerSesionesPendientes(userId: string): SesionPendienteSync[] {
  if (typeof window === 'undefined' || !userId) return [];

  try {
    const key = getOfflineQueueKey(userId);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Elimina una sesión de la cola offline tras sincronizarse con éxito
 */
export function eliminarSesionPendiente(userId: string, id: string): void {
  if (typeof window === 'undefined' || !userId) return;

  try {
    const key = getOfflineQueueKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) return;

    const actuales: SesionPendienteSync[] = JSON.parse(raw);
    const actualizadas = actuales.filter(s => s.id !== id);

    if (actualizadas.length === 0) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(actualizadas));
    }
  } catch (err) {
    console.error('Error eliminando sesion sincronizada:', err);
  }
}

/**
 * Sincroniza todas las sesiones pendientes en cola con Supabase
 */
export async function sincronizarSesionesPendientes(
  userId: string,
  crearSesionApi: (args: any) => Promise<any>
): Promise<{ sincronizadas: number; errores: number }> {
  if (!userId || typeof window === 'undefined') return { sincronizadas: 0, errores: 0 };

  const pendientes = obtenerSesionesPendientes(userId);
  if (pendientes.length === 0) return { sincronizadas: 0, errores: 0 };

  let sincronizadas = 0;
  let errores = 0;

  for (const sesion of pendientes) {
    try {
      await crearSesionApi({
        fecha: sesion.fecha,
        duracionMin: sesion.duracionMin,
        puntuacion: sesion.puntuacion ?? null,
        rutinaId: sesion.rutinaId ?? null,
        ejercicios: sesion.ejercicios,
      });
      eliminarSesionPendiente(userId, sesion.id);
      sincronizadas += 1;
    } catch (err) {
      console.warn(`Error sincronizando sesion offline ${sesion.id}:`, err);
      errores += 1;
    }
  }

  if (sincronizadas > 0) {
    window.dispatchEvent(new CustomEvent(OFFLINE_SYNC_EVENT, { detail: { sincronizadas } }));
  }

  return { sincronizadas, errores };
}
