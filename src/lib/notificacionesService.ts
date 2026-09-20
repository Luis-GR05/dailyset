// src/lib/notificacionesService.ts
// Servicio para gestionar notificaciones de usuario (Supabase + sincronización local en tiempo real)

import { supabase } from './supabaseClient';
import type { NotificacionItem, TipoNotificacion } from '../types/social';

export const NOTIFICATION_EVENT = 'dailyset_notification_update';

const getStorageKey = (userId: string) => `dailyset_notifs_${userId}`;

function formatTiempo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutos = Math.floor(diff / (1000 * 60));
  const horas = Math.floor(diff / (1000 * 60 * 60));
  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutos < 1) return 'Ahora';
  if (minutos < 60) return `Hace ${minutos} min`;
  if (horas < 24) return `Hace ${horas} h`;
  if (dias === 1) return 'Ayer';
  return `Hace ${dias} d`;
}

/**
 * Obtiene las notificaciones del usuario (intentando Supabase con fallback a almacenamiento local)
 */
export async function getNotificaciones(userId: string): Promise<NotificacionItem[]> {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('notificaciones')
      .select(`
        id,
        tipo,
        titulo,
        mensaje,
        enlace,
        actor_id,
        rutina_id,
        leida,
        created_at
      `)
      .eq('usuario_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (!error && data && data.length > 0) {
      const items: NotificacionItem[] = data.map((n: any) => {
        const timestamp = new Date(n.created_at).getTime();
        return {
          id: n.id,
          tipo: n.tipo as TipoNotificacion,
          titulo: n.titulo,
          mensaje: n.mensaje,
          enlace: n.enlace,
          tiempo: formatTiempo(timestamp),
          timestamp,
          leida: Boolean(n.leida),
          actorId: n.actor_id,
          rutinaId: n.rutina_id,
        };
      });

      // Guardar copia local
      if (typeof window !== 'undefined') {
        localStorage.setItem(getStorageKey(userId), JSON.stringify(items));
      }

      return items;
    }
  } catch {
    // Si la tabla no está creada aún en Supabase, recurrimos a local
  }

  // Fallback a localStorage
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(getStorageKey(userId));
      if (raw) {
        const parsed: NotificacionItem[] = JSON.parse(raw);
        return parsed.map(n => ({
          ...n,
          tiempo: formatTiempo(n.timestamp),
        }));
      }
    } catch {
      return [];
    }
  }

  return [];
}

/**
 * Crea y envía una notificación al usuario destinatario
 */
export async function crearNotificacion({
  usuarioId,
  tipo,
  titulo,
  mensaje,
  enlace,
  actorId,
  actorNombre,
  actorAvatar,
  rutinaId,
}: {
  usuarioId: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  enlace?: string;
  actorId?: string;
  actorNombre?: string;
  actorAvatar?: string | null;
  rutinaId?: number;
}): Promise<void> {
  if (!usuarioId) return;

  const now = Date.now();
  const newItem: NotificacionItem = {
    id: `notif-${now}-${Math.random().toString(36).substring(2, 7)}`,
    tipo,
    titulo,
    mensaje,
    enlace,
    tiempo: 'Ahora',
    timestamp: now,
    leida: false,
    actorId,
    actorNombre,
    actorAvatar,
    rutinaId,
  };

  // 1. Guardar en almacenamiento local del usuario destinatario
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(getStorageKey(usuarioId));
      const actuales: NotificacionItem[] = raw ? JSON.parse(raw) : [];
      const actualizadas = [newItem, ...actuales.filter(n => n.id !== newItem.id)].slice(0, 40);
      localStorage.setItem(getStorageKey(usuarioId), JSON.stringify(actualizadas));

      // Emitir evento para actualizar en tiempo real si es la pestaña activa del usuario
      window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail: { usuarioId, notificacion: newItem } }));
    } catch (e) {
      console.error('Error guardando notificacion localmente:', e);
    }
  }

  // 2. Intentar guardar en Supabase si está disponible
  try {
    await supabase.from('notificaciones').insert({
      usuario_id: usuarioId,
      tipo,
      titulo,
      mensaje,
      enlace: enlace || null,
      actor_id: actorId || null,
      rutina_id: rutinaId || null,
      leida: false,
    });
  } catch (err) {
    console.warn('Error insertando en tabla notificaciones de Supabase:', err);
  }
}

/**
 * Marca una notificación como leída
 */
export async function marcarComoLeida(userId: string, notifId: string): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(getStorageKey(userId));
      if (raw) {
        const items: NotificacionItem[] = JSON.parse(raw);
        const actualizadas = items.map(n => (n.id === notifId ? { ...n, leida: true } : n));
        localStorage.setItem(getStorageKey(userId), JSON.stringify(actualizadas));
        window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail: { userId } }));
      }
    } catch (e) {
      console.error(e);
    }
  }

  try {
    await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('id', notifId)
      .eq('usuario_id', userId);
  } catch {
    // Ignorar si falla Supabase
  }
}

/**
 * Marca todas las notificaciones del usuario como leídas
 */
export async function marcarTodasComoLeidas(userId: string): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(getStorageKey(userId));
      if (raw) {
        const items: NotificacionItem[] = JSON.parse(raw);
        const actualizadas = items.map(n => ({ ...n, leida: true }));
        localStorage.setItem(getStorageKey(userId), JSON.stringify(actualizadas));
        window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail: { userId } }));
      }
    } catch (e) {
      console.error(e);
    }
  }

  try {
    await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('usuario_id', userId);
  } catch {
    // Ignorar si falla Supabase
  }
}

/**
 * Elimina una notificación específica
 */
export async function eliminarNotificacion(userId: string, notifId: string): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(getStorageKey(userId));
      if (raw) {
        const items: NotificacionItem[] = JSON.parse(raw);
        const actualizadas = items.filter(n => n.id !== notifId);
        localStorage.setItem(getStorageKey(userId), JSON.stringify(actualizadas));
        window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail: { userId } }));
      }
    } catch (e) {
      console.error(e);
    }
  }

  try {
    await supabase
      .from('notificaciones')
      .delete()
      .eq('id', notifId)
      .eq('usuario_id', userId);
  } catch {
    // Ignorar si falla Supabase
  }
}

/**
 * Limpia todas las notificaciones del usuario
 */
export async function limpiarNotificaciones(userId: string): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(getStorageKey(userId));
    window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail: { userId } }));
  }

  try {
    await supabase
      .from('notificaciones')
      .delete()
      .eq('usuario_id', userId);
  } catch {
    // Ignorar
  }
}
