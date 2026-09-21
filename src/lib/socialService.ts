// src/lib/socialService.ts
// Servicio de datos para el módulo Social con soporte de moderación, bloqueos, invitaciones, sugerencias y notificaciones de eventos

import { supabase } from './supabaseClient';
import type { PerfilPublico, RutinaPublica, EjercicioSimple, ReporteContenido } from '../types/social';
import { crearNotificacion } from './notificacionesService';

const LOCAL_BLOQUEOS_KEY = (userId: string) => `dailyset_bloqueos_${userId}`;
const LOCAL_REPORTES_KEY = 'dailyset_reportes_locales';
const LOCAL_REACCIONES_KEY = 'dailyset_reacciones_locales';

/**
 * Obtiene el feed de rutinas públicas con ejercicios, estado de seguimiento y reacciones.
 */
export async function getFeedPublico({
  currentUserId,
  soloSeguidos = false,
  seguidosIds = [],
  bloqueadosIds = [],
  limite = 20,
}: {
  currentUserId?: string;
  soloSeguidos?: boolean;
  seguidosIds?: string[];
  bloqueadosIds?: string[];
  limite?: number;
} = {}): Promise<RutinaPublica[]> {
  try {
    let query = supabase
      .from('rutinas')
      .select(`
        id,
        usuario_id,
        nombre,
        categoria,
        duracion_estimada_minutos,
        is_public,
        created_at,
        perfil:perfiles!rutinas_usuario_id_fkey(
          id,
          nombre_usuario,
          nombre_completo,
          avatar_url,
          bio,
          nivel_entrenamiento
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limite + (bloqueadosIds.length > 0 ? 10 : 0));

    if (soloSeguidos) {
      if (!seguidosIds || seguidosIds.length === 0) {
        return [];
      }
      query = query.in('usuario_id', seguidosIds);
    }

    const { data, error } = await query;

    if (error) {
      return await getFeedPublicoFallback({ currentUserId, soloSeguidos, seguidosIds, bloqueadosIds, limite });
    }

    if (!data || data.length === 0) return [];

    const rutinasFiltradas = data.filter((r: any) => !bloqueadosIds.includes(r.usuario_id));
    const rutinaIds = rutinasFiltradas.map((r: any) => r.id);

    const [ejerciciosPorRutina, seguidosPorMi, reaccionesMap] = await Promise.all([
      getEjerciciosDeRutinas(rutinaIds),
      currentUserId ? getIdsSeguidos(currentUserId) : Promise.resolve([]),
      getReaccionesRutinasMap(rutinaIds, currentUserId),
    ]);

    return rutinasFiltradas.slice(0, limite).map((r: any) => {
      const perfilRaw = Array.isArray(r.perfil) ? r.perfil[0] : r.perfil;
      const ejercicios = ejerciciosPorRutina[r.id] || [];
      const perfilObj = perfilRaw || {
        id: r.usuario_id,
        nombre_usuario: 'atleta',
        nombre_completo: 'Atleta DailySet',
        avatar_url: null,
        nivel_entrenamiento: 'ATLETA',
      };
      perfilObj.esSeguido = seguidosPorMi.includes(r.usuario_id);

      const reacc = reaccionesMap[r.id] || { count: 0, userLiked: false };

      return {
        id: r.id,
        usuario_id: r.usuario_id,
        nombre: r.nombre,
        categoria: r.categoria || 'General',
        duracion_estimada_minutos: r.duracion_estimada_minutos || 45,
        is_public: r.is_public ?? true,
        created_at: r.created_at,
        perfil: perfilObj,
        ejercicios,
        ejerciciosCount: ejercicios.length,
        ejerciciosIds: ejercicios.map(e => e.id),
        likesCount: reacc.count,
        esLikeada: reacc.userLiked,
      };
    });
  } catch (err) {
    console.error('Error en getFeedPublico:', err);
    return [];
  }
}

/**
 * Fallback en caso de que la clave foránea entre rutinas y perfiles no esté nombrada explícitamente en PostgREST
 */
async function getFeedPublicoFallback({
  currentUserId,
  soloSeguidos,
  seguidosIds,
  bloqueadosIds = [],
  limite = 20,
}: {
  currentUserId?: string;
  soloSeguidos?: boolean;
  seguidosIds?: string[];
  bloqueadosIds?: string[];
  limite?: number;
}): Promise<RutinaPublica[]> {
  let query = supabase
    .from('rutinas')
    .select('id, usuario_id, nombre, categoria, duracion_estimada_minutos, is_public, created_at')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limite + (bloqueadosIds.length > 0 ? 10 : 0));

  if (soloSeguidos && seguidosIds && seguidosIds.length > 0) {
    query = query.in('usuario_id', seguidosIds);
  }

  const { data: rutinasData, error: rutinasError } = await query;
  if (rutinasError || !rutinasData) return [];

  const rutinasFiltradas = rutinasData.filter((r: any) => !bloqueadosIds.includes(r.usuario_id));
  const userIds = [...new Set(rutinasFiltradas.map((r: any) => r.usuario_id).filter(Boolean))];
  const rutinaIds = rutinasFiltradas.map((r: any) => r.id);

  const [perfilesMap, ejerciciosPorRutina, seguidosPorMi, reaccionesMap] = await Promise.all([
    getPerfilesMap(userIds as string[]),
    getEjerciciosDeRutinas(rutinaIds),
    currentUserId ? getIdsSeguidos(currentUserId) : Promise.resolve([]),
    getReaccionesRutinasMap(rutinaIds, currentUserId),
  ]);

  return rutinasFiltradas.slice(0, limite).map((r: any) => {
    const perfil = perfilesMap[r.usuario_id] || {
      id: r.usuario_id,
      nombre_usuario: 'atleta',
      nombre_completo: 'Atleta DailySet',
      avatar_url: null,
      nivel_entrenamiento: 'ATLETA',
    };
    perfil.esSeguido = seguidosPorMi.includes(r.usuario_id);
    const ejercicios = ejerciciosPorRutina[r.id] || [];
    const reacc = reaccionesMap[r.id] || { count: 0, userLiked: false };

    return {
      id: r.id,
      usuario_id: r.usuario_id,
      nombre: r.nombre,
      categoria: r.categoria || 'General',
      duracion_estimada_minutos: r.duracion_estimada_minutos || 45,
      is_public: r.is_public ?? true,
      created_at: r.created_at,
      perfil,
      ejercicios,
      ejerciciosCount: ejercicios.length,
      ejerciciosIds: ejercicios.map(e => e.id),
      likesCount: reacc.count,
      esLikeada: reacc.userLiked,
    };
  });
}

/**
 * Obtiene los ejercicios asociados a un grupo de rutinas
 */
async function getEjerciciosDeRutinas(rutinaIds: number[]): Promise<Record<number, EjercicioSimple[]>> {
  if (!rutinaIds || rutinaIds.length === 0) return {};

  try {
    const { data, error } = await supabase
      .from('ejercicios_rutina')
      .select(`
        rutina_id,
        ejercicio_id,
        indice_orden,
        ejercicio:ejercicios(id, nombre, grupo)
      `)
      .in('rutina_id', rutinaIds)
      .order('indice_orden', { ascending: true });

    if (error || !data) {
      const { data: simpleData } = await supabase
        .from('ejercicios_rutina')
        .select('rutina_id, ejercicio_id')
        .in('rutina_id', rutinaIds);

      const map: Record<number, EjercicioSimple[]> = {};
      (simpleData || []).forEach((row: any) => {
        if (!map[row.rutina_id]) map[row.rutina_id] = [];
        map[row.rutina_id].push({ id: row.ejercicio_id, nombre: `Ejercicio #${row.ejercicio_id}` });
      });
      return map;
    }

    const map: Record<number, EjercicioSimple[]> = {};
    data.forEach((row: any) => {
      const rid = row.rutina_id;
      if (!map[rid]) map[rid] = [];
      const ejInfo = Array.isArray(row.ejercicio) ? row.ejercicio[0] : row.ejercicio;
      map[rid].push({
        id: row.ejercicio_id,
        nombre: ejInfo?.nombre || `Ejercicio #${row.ejercicio_id}`,
        grupo: ejInfo?.grupo,
      });
    });
    return map;
  } catch {
    return {};
  }
}

/**
 * Devuelve un mapa clave-valor id -> PerfilPublico
 */
async function getPerfilesMap(userIds: string[]): Promise<Record<string, PerfilPublico>> {
  if (!userIds || userIds.length === 0) return {};

  try {
    const { data } = await supabase
      .from('perfiles')
      .select('id, nombre_usuario, nombre_completo, avatar_url, bio, nivel_entrenamiento')
      .in('id', userIds);

    const map: Record<string, PerfilPublico> = {};
    (data || []).forEach((p: any) => {
      map[p.id] = {
        id: p.id,
        nombre_usuario: p.nombre_usuario || 'atleta',
        nombre_completo: p.nombre_completo || p.nombre_usuario,
        avatar_url: p.avatar_url,
        bio: p.bio,
        nivel_entrenamiento: p.nivel_entrenamiento,
      };
    });
    return map;
  } catch {
    return {};
  }
}

/**
 * Comprueba si un nombre de usuario está disponible (no existe en la base de datos).
 */
export async function esNombreUsuarioDisponible(
  nombreUsuario: string,
  userIdActual?: string
): Promise<boolean> {
  const usernameLimpio = nombreUsuario.trim().toLowerCase().replace(/^@/, '');
  if (!usernameLimpio || usernameLimpio.length < 3) return false;

  try {
    let query = supabase
      .from('perfiles')
      .select('id')
      .ilike('nombre_usuario', usernameLimpio);

    if (userIdActual) {
      query = query.neq('id', userIdActual);
    }

    const { data, error } = await query.limit(1);
    if (error) {
      return true;
    }

    return !data || data.length === 0;
  } catch (err) {
    console.error('Error comprobando username:', err);
    return true;
  }
}

/**
 * Busca perfiles públicos por nombre o nombre de usuario en Supabase, excluyendo bloqueados.
 */
export async function buscarUsuarios(
  termino: string,
  currentUserId?: string,
  bloqueadosIds: string[] = []
): Promise<PerfilPublico[]> {
  const cleanTerm = termino.trim().replace(/^@/, '');
  if (!cleanTerm) return [];

  try {
    let query = supabase
      .from('perfiles')
      .select('id, nombre_usuario, nombre_completo, avatar_url, bio, nivel_entrenamiento, es_publico')
      .or(`nombre_usuario.ilike.%${cleanTerm}%,nombre_completo.ilike.%${cleanTerm}%`)
      .limit(15);

    let { data, error } = await query;
    if (error) {
      const fallbackQuery = await supabase
        .from('perfiles')
        .select('id, nombre_usuario, nombre_completo, avatar_url, nivel_entrenamiento')
        .or(`nombre_usuario.ilike.%${cleanTerm}%,nombre_completo.ilike.%${cleanTerm}%`)
        .limit(15);
      data = fallbackQuery.data as any;
    }

    if (!data || data.length === 0) return [];

    const perfilesFiltrados = data.filter((p: any) => {
      if (p.es_publico === false) return false;
      if (currentUserId && p.id === currentUserId) return false;
      if (bloqueadosIds.includes(p.id)) return false;
      const u = (p.nombre_usuario || '').toLowerCase();
      const n = (p.nombre_completo || '').toLowerCase();
      if (u.includes('test_user') || u.includes('tester') || u.includes('ficticio') || u.includes('demo') || n.includes('test user') || n.includes('ficticio')) {
        return false;
      }
      return true;
    });

    const userIds = perfilesFiltrados.map((p: any) => p.id);
    const [seguidoresMap, rutinasMap, seguidosPorMi] = await Promise.all([
      getContadoresSeguidores(userIds),
      getContadoresRutinas(userIds),
      currentUserId ? getIdsSeguidos(currentUserId) : Promise.resolve([]),
    ]);

    return perfilesFiltrados.map((p: any) => ({
      id: p.id,
      nombre_usuario: p.nombre_usuario || 'atleta',
      nombre_completo: p.nombre_completo || p.nombre_usuario,
      avatar_url: p.avatar_url,
      bio: p.bio,
      nivel_entrenamiento: p.nivel_entrenamiento,
      seguidoresCount: seguidoresMap[p.id] || 0,
      rutinasCount: rutinasMap[p.id] || 0,
      esSeguido: seguidosPorMi.includes(p.id),
      esBloqueado: false,
    }));
  } catch (err) {
    console.error('Error en buscarUsuarios:', err);
    return [];
  }
}

/**
 * Obtiene el perfil de un usuario dado su nombre_usuario (ej: para invitaciones o enlaces directos)
 */
export async function getPerfilPorNombreUsuario(
  nombreUsuario: string,
  currentUserId?: string
): Promise<PerfilPublico | null> {
  const usernameLimpio = nombreUsuario.trim().toLowerCase().replace(/^@/, '');
  if (!usernameLimpio) return null;

  try {
    const { data, error } = await supabase
      .from('perfiles')
      .select('id, nombre_usuario, nombre_completo, avatar_url, bio, nivel_entrenamiento, es_publico')
      .ilike('nombre_usuario', usernameLimpio)
      .maybeSingle();

    if (error || !data) return null;

    return await getPerfilPublico(data.id, currentUserId);
  } catch (err) {
    console.error('Error en getPerfilPorNombreUsuario:', err);
    return null;
  }
}

/**
 * Obtiene atletas registrados sugeridos para explorar con categorización inteligente
 */
export async function getUsuariosSugeridos(
  currentUserId?: string,
  limite = 10,
  bloqueadosIds: string[] = []
): Promise<PerfilPublico[]> {
  try {
    let query = supabase
      .from('perfiles')
      .select('id, nombre_usuario, nombre_completo, avatar_url, bio, nivel_entrenamiento, es_publico, created_at')
      .limit(limite * 2);

    if (currentUserId) {
      query = query.neq('id', currentUserId);
    }

    let { data, error } = await query;
    if (error) {
      const fallback = await supabase
        .from('perfiles')
        .select('id, nombre_usuario, nombre_completo, avatar_url, nivel_entrenamiento')
        .limit(limite * 2);
      data = fallback.data as any;
    }

    if (!data || data.length === 0) return [];

    const perfilesFiltrados = data.filter((p: any) => {
      if (p.es_publico === false) return false;
      if (currentUserId && p.id === currentUserId) return false;
      if (bloqueadosIds.includes(p.id)) return false;
      const u = (p.nombre_usuario || '').toLowerCase();
      const n = (p.nombre_completo || '').toLowerCase();
      if (u.includes('test_user') || u.includes('tester') || u.includes('ficticio') || u.includes('demo') || n.includes('test user') || n.includes('ficticio')) {
        return false;
      }
      return true;
    });

    const userIds = perfilesFiltrados.map((p: any) => p.id);
    const [seguidoresMap, rutinasMap, seguidosPorMi] = await Promise.all([
      getContadoresSeguidores(userIds),
      getContadoresRutinas(userIds),
      currentUserId ? getIdsSeguidos(currentUserId) : Promise.resolve([]),
    ]);

    const perfilesCompletos: PerfilPublico[] = perfilesFiltrados.map((p: any) => {
      const segCount = seguidoresMap[p.id] || 0;
      const rutCount = rutinasMap[p.id] || 0;
      const esSeguido = seguidosPorMi.includes(p.id);

      let tipoSugerencia: PerfilPublico['tipoSugerencia'] = undefined;
      if (rutCount >= 5) {
        tipoSugerencia = 'creador_activo';
      } else if (segCount >= 10) {
        tipoSugerencia = 'popular';
      }

      return {
        id: p.id,
        nombre_usuario: p.nombre_usuario || 'atleta',
        nombre_completo: p.nombre_completo || p.nombre_usuario,
        avatar_url: p.avatar_url,
        bio: p.bio,
        nivel_entrenamiento: p.nivel_entrenamiento,
        seguidoresCount: segCount,
        rutinasCount: rutCount,
        esSeguido,
        esBloqueado: false,
        tipoSugerencia,
      };
    });

    perfilesCompletos.sort((a, b) => {
      const scoreA = (a.rutinasCount || 0) * 2 + (a.seguidoresCount || 0);
      const scoreB = (b.rutinasCount || 0) * 2 + (b.seguidoresCount || 0);
      return scoreB - scoreA;
    });

    return perfilesCompletos.slice(0, limite);
  } catch (err) {
    console.error('Error en getUsuariosSugeridos:', err);
    return [];
  }
}

/**
 * Obtiene el detalle de un perfil público con estadísticas y estado de bloqueo
 */
export async function getPerfilPublico(
  perfilId: string,
  currentUserId?: string,
  bloqueadosIds: string[] = []
): Promise<PerfilPublico | null> {
  try {
    const { data, error } = await supabase
      .from('perfiles')
      .select('id, nombre_usuario, nombre_completo, avatar_url, bio, nivel_entrenamiento, es_publico')
      .eq('id', perfilId)
      .single();

    if (error || !data) return null;

    const esBloqueado = bloqueadosIds.includes(perfilId);

    const [seguidoresRes, siguiendoRes, rutinasRes, isFollowedRes] = await Promise.all([
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', perfilId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', perfilId),
      supabase.from('rutinas').select('*', { count: 'exact', head: true }).eq('usuario_id', perfilId).eq('is_public', true),
      currentUserId && currentUserId !== perfilId
        ? supabase.from('follows').select('following_id').eq('follower_id', currentUserId).eq('following_id', perfilId).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    return {
      id: data.id,
      nombre_usuario: data.nombre_usuario || 'atleta',
      nombre_completo: data.nombre_completo || data.nombre_usuario,
      avatar_url: data.avatar_url,
      bio: data.bio,
      nivel_entrenamiento: data.nivel_entrenamiento,
      es_publico: data.es_publico ?? true,
      seguidoresCount: seguidoresRes.count || 0,
      siguiendoCount: siguiendoRes.count || 0,
      rutinasCount: rutinasRes.count || 0,
      esSeguido: Boolean(isFollowedRes.data),
      esBloqueado,
    };
  } catch (err) {
    console.error('Error en getPerfilPublico:', err);
    return null;
  }
}

/**
 * Obtiene las rutinas públicas de un usuario específico
 */
export async function getRutinasPublicasDeUsuario(
  usuarioId: string,
  currentUserId?: string
): Promise<RutinaPublica[]> {
  try {
    const { data, error } = await supabase
      .from('rutinas')
      .select('id, usuario_id, nombre, categoria, duracion_estimada_minutos, is_public, created_at')
      .eq('usuario_id', usuarioId)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    const rutinaIds = data.map((r: any) => r.id);
    const [ejerciciosPorRutina, reaccionesMap] = await Promise.all([
      getEjerciciosDeRutinas(rutinaIds),
      getReaccionesRutinasMap(rutinaIds, currentUserId),
    ]);

    return data.map((r: any) => {
      const ejercicios = ejerciciosPorRutina[r.id] || [];
      const reacc = reaccionesMap[r.id] || { count: 0, userLiked: false };
      return {
        id: r.id,
        usuario_id: r.usuario_id,
        nombre: r.nombre,
        categoria: r.categoria || 'General',
        duracion_estimada_minutos: r.duracion_estimada_minutos || 45,
        is_public: true,
        created_at: r.created_at,
        ejercicios,
        ejerciciosCount: ejercicios.length,
        ejerciciosIds: ejercicios.map(e => e.id),
        likesCount: reacc.count,
        esLikeada: reacc.userLiked,
      };
    });
  } catch (err) {
    console.error('Error en getRutinasPublicasDeUsuario:', err);
    return [];
  }
}

/**
 * Obtiene la lista de IDs de usuarios a los que sigue un usuario
 */
export async function getIdsSeguidos(followerId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', followerId);

    if (error || !data) return [];
    return data.map((row: any) => row.following_id);
  } catch {
    return [];
  }
}

/**
 * Acción de seguir a un usuario con disparo de notificación social
 */
export async function seguirUsuario(followerId: string, followingId: string): Promise<boolean> {
  if (followerId === followingId) return false;
  try {
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: followingId,
      });

    if (error && error.code !== '23505') {
      throw error;
    }

    // Notificar al usuario seguido
    try {
      const { data: seguidorPerfil } = await supabase
        .from('perfiles')
        .select('nombre_usuario')
        .eq('id', followerId)
        .maybeSingle();

      const nombreSeguidor = seguidorPerfil?.nombre_usuario || 'Un atleta';
      await crearNotificacion({
        usuarioId: followingId,
        tipo: 'seguidor',
        titulo: 'Nuevo seguidor',
        mensaje: `@${nombreSeguidor} ha comenzado a seguirte.`,
        enlace: `/social?perfil=${followerId}`,
        actorId: followerId,
      });
    } catch (notifErr) {
      console.warn('Error enviando notificacion de seguidor:', notifErr);
    }

    return true;
  } catch (err) {
    console.error('Error al seguir usuario:', err);
    throw err;
  }
}

/**
 * Acción de dejar de seguir a un usuario
 */
export async function dejarDeSeguir(followerId: string, followingId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error al dejar de seguir usuario:', err);
    throw err;
  }
}

/**
 * Alterna la privacidad de una rutina (pública/privada)
 */
export async function toggleVisibilidadRutina(
  rutinaId: number,
  nuevoEstadoPublico: boolean,
  usuarioId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('rutinas')
      .update({ is_public: nuevoEstadoPublico })
      .eq('id', rutinaId)
      .eq('usuario_id', usuarioId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error al cambiar privacidad de rutina:', err);
    throw err;
  }
}

/**
 * Clona una rutina pública al perfil del usuario actual y envía notificación al creador original
 */
export async function clonarRutina(
  rutinaOriginalId: number,
  targetUserId: string,
  nuevoNombre?: string
): Promise<number | null> {
  try {
    const { data: rutinaOriginal, error: getError } = await supabase
      .from('rutinas')
      .select('*')
      .eq('id', rutinaOriginalId)
      .single();

    if (getError || !rutinaOriginal) throw new Error('No se pudo encontrar la rutina original');

    const { data: ejerciciosOriginales } = await supabase
      .from('ejercicios_rutina')
      .select('ejercicio_id, indice_orden')
      .eq('rutina_id', rutinaOriginalId)
      .order('indice_orden', { ascending: true });

    const nombreCopia = nuevoNombre || `${rutinaOriginal.nombre} (Copia)`;
    const { data: nuevaRutina, error: insertRutinaError } = await supabase
      .from('rutinas')
      .insert({
        usuario_id: targetUserId,
        nombre: nombreCopia,
        categoria: rutinaOriginal.categoria,
        etiquetas: rutinaOriginal.etiquetas || [rutinaOriginal.categoria],
        duracion_estimada_minutos: rutinaOriginal.duracion_estimada_minutos,
        es_plantilla: false,
        esta_activa: true,
        is_public: false,
      })
      .select('id')
      .single();

    if (insertRutinaError || !nuevaRutina) throw insertRutinaError;

    if (ejerciciosOriginales && ejerciciosOriginales.length > 0) {
      const inserts = ejerciciosOriginales.map((e: any, index: number) => ({
        rutina_id: nuevaRutina.id,
        ejercicio_id: e.ejercicio_id,
        indice_orden: e.indice_orden ?? index,
      }));

      await supabase.from('ejercicios_rutina').insert(inserts);
    }

    // Notificar al autor original si no es el mismo usuario
    if (rutinaOriginal.usuario_id && rutinaOriginal.usuario_id !== targetUserId) {
      try {
        const { data: clonerPerfil } = await supabase
          .from('perfiles')
          .select('nombre_usuario')
          .eq('id', targetUserId)
          .maybeSingle();

        const nombreCloner = clonerPerfil?.nombre_usuario || 'Un atleta';
        await crearNotificacion({
          usuarioId: rutinaOriginal.usuario_id,
          tipo: 'clonacion',
          titulo: 'Rutina clonada',
          mensaje: `@${nombreCloner} ha guardado y clonado tu rutina "${rutinaOriginal.nombre}".`,
          enlace: `/social?perfil=${targetUserId}`,
          actorId: targetUserId,
          rutinaId: rutinaOriginalId,
        });
      } catch (notifErr) {
        console.warn('Error enviando notificacion de clonacion:', notifErr);
      }
    }

    return nuevaRutina.id;
  } catch (err) {
    console.error('Error al clonar rutina:', err);
    throw err;
  }
}

// ------------------------------------------------------------------------------
// REACCIONES (LIKES) EN RUTINAS PÚBLICAS
// ------------------------------------------------------------------------------

/**
 * Obtiene el mapa de reacciones (conteo total y si el usuario actual ha reaccionado)
 */
export async function getReaccionesRutinasMap(
  rutinaIds: number[],
  currentUserId?: string
): Promise<Record<number, { count: number; userLiked: boolean }>> {
  if (!rutinaIds || rutinaIds.length === 0) return {};
  const map: Record<number, { count: number; userLiked: boolean }> = {};
  rutinaIds.forEach(id => {
    map[id] = { count: 0, userLiked: false };
  });

  // 1. Intentar desde Supabase
  try {
    const { data, error } = await supabase
      .from('social_reacciones')
      .select('rutina_id, usuario_id')
      .in('rutina_id', rutinaIds);

    if (!error && data) {
      data.forEach((row: any) => {
        const rid = Number(row.rutina_id);
        if (!map[rid]) map[rid] = { count: 0, userLiked: false };
        map[rid].count += 1;
        if (currentUserId && row.usuario_id === currentUserId) {
          map[rid].userLiked = true;
        }
      });
      return map;
    }
  } catch {
    // Continuar a respaldo local
  }

  // 2. Respaldo local
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_REACCIONES_KEY);
      if (raw) {
        const localReaccs: { rutina_id: number; usuario_id: string }[] = JSON.parse(raw);
        localReaccs.forEach(item => {
          const rid = Number(item.rutina_id);
          if (map[rid]) {
            map[rid].count += 1;
            if (currentUserId && item.usuario_id === currentUserId) {
              map[rid].userLiked = true;
            }
          }
        });
      }
    } catch {
      // Ignorar
    }
  }

  return map;
}

/**
 * Da o quita reacción a una rutina pública y notifica al autor
 */
export async function toggleReaccionRutina({
  rutinaId,
  usuarioId,
  autorRutinaId,
  nombreRutina,
}: {
  rutinaId: number;
  usuarioId: string;
  autorRutinaId: string;
  nombreRutina: string;
}): Promise<{ liked: boolean; countDelta: number }> {
  if (!usuarioId || !rutinaId) return { liked: false, countDelta: 0 };

  let currentlyLiked = false;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_REACCIONES_KEY);
      const list: { rutina_id: number; usuario_id: string }[] = raw ? JSON.parse(raw) : [];
      currentlyLiked = list.some(r => r.rutina_id === rutinaId && r.usuario_id === usuarioId);
    } catch {
      // Ignorar
    }
  }

  if (currentlyLiked) {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(LOCAL_REACCIONES_KEY);
        const list: { rutina_id: number; usuario_id: string }[] = raw ? JSON.parse(raw) : [];
        const filtrada = list.filter(r => !(r.rutina_id === rutinaId && r.usuario_id === usuarioId));
        localStorage.setItem(LOCAL_REACCIONES_KEY, JSON.stringify(filtrada));
      } catch {
        // Ignorar
      }
    }

    try {
      await supabase
        .from('social_reacciones')
        .delete()
        .eq('rutina_id', rutinaId)
        .eq('usuario_id', usuarioId);
    } catch {
      // Ignorar
    }

    return { liked: false, countDelta: -1 };
  } else {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(LOCAL_REACCIONES_KEY);
        const list: { rutina_id: number; usuario_id: string }[] = raw ? JSON.parse(raw) : [];
        list.push({ rutina_id: rutinaId, usuario_id: usuarioId });
        localStorage.setItem(LOCAL_REACCIONES_KEY, JSON.stringify(list));
      } catch {
        // Ignorar
      }
    }

    try {
      await supabase
        .from('social_reacciones')
        .insert({ rutina_id: rutinaId, usuario_id: usuarioId });
    } catch {
      // Ignorar
    }

    if (autorRutinaId && autorRutinaId !== usuarioId) {
      try {
        const { data: usuarioPerfil } = await supabase
          .from('perfiles')
          .select('nombre_usuario')
          .eq('id', usuarioId)
          .maybeSingle();

        const nombreUsuario = usuarioPerfil?.nombre_usuario || 'Un atleta';
        await crearNotificacion({
          usuarioId: autorRutinaId,
          tipo: 'reaccion',
          titulo: 'Reacción a tu rutina',
          mensaje: `@${nombreUsuario} ha reaccionado a tu rutina "${nombreRutina}".`,
          enlace: `/social?perfil=${usuarioId}`,
          actorId: usuarioId,
          rutinaId,
        });
      } catch (e) {
        console.warn('Error enviando notificacion de reaccion:', e);
      }
    }

    return { liked: true, countDelta: 1 };
  }
}

// ------------------------------------------------------------------------------
// MODERACIÓN: BLOQUEO DE USUARIOS
// ------------------------------------------------------------------------------

export async function getUsuariosBloqueadosIds(userId: string): Promise<string[]> {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('social_bloqueos')
      .select('bloqueado_id')
      .eq('bloqueador_id', userId);

    if (!error && data) {
      const ids = data.map((b: any) => b.bloqueado_id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_BLOQUEOS_KEY(userId), JSON.stringify(ids));
      }
      return ids;
    }
  } catch {
    // Fallback local
  }

  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(LOCAL_BLOQUEOS_KEY(userId));
      if (cached) return JSON.parse(cached);
    } catch {
      return [];
    }
  }
  return [];
}

export async function getPerfilesBloqueados(userId: string): Promise<PerfilPublico[]> {
  const ids = await getUsuariosBloqueadosIds(userId);
  if (ids.length === 0) return [];

  try {
    const { data } = await supabase
      .from('perfiles')
      .select('id, nombre_usuario, nombre_completo, avatar_url, bio, nivel_entrenamiento')
      .in('id', ids);

    return (data || []).map((p: any) => ({
      id: p.id,
      nombre_usuario: p.nombre_usuario || 'atleta',
      nombre_completo: p.nombre_completo || p.nombre_usuario,
      avatar_url: p.avatar_url,
      bio: p.bio,
      nivel_entrenamiento: p.nivel_entrenamiento,
      esBloqueado: true,
    }));
  } catch {
    return ids.map(id => ({
      id,
      nombre_usuario: 'usuario_bloqueado',
      nombre_completo: 'Usuario Bloqueado',
      esBloqueado: true,
    }));
  }
}

export async function bloquearUsuario(bloqueadorId: string, bloqueadoId: string): Promise<boolean> {
  if (!bloqueadorId || !bloqueadoId || bloqueadorId === bloqueadoId) return false;

  try {
    await Promise.allSettled([
      supabase.from('follows').delete().eq('follower_id', bloqueadorId).eq('following_id', bloqueadoId),
      supabase.from('follows').delete().eq('follower_id', bloqueadoId).eq('following_id', bloqueadorId),
    ]);
  } catch {
    // Continuar
  }

  try {
    await supabase.from('social_bloqueos').insert({
      bloqueador_id: bloqueadorId,
      bloqueado_id: bloqueadoId,
    });
  } catch (err) {
    console.warn('Inserción en social_bloqueos falló:', err);
  }

  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(LOCAL_BLOQUEOS_KEY(bloqueadorId));
      const ids: string[] = cached ? JSON.parse(cached) : [];
      if (!ids.includes(bloqueadoId)) {
        ids.push(bloqueadoId);
        localStorage.setItem(LOCAL_BLOQUEOS_KEY(bloqueadorId), JSON.stringify(ids));
      }
    } catch {
      // Ignorar
    }
  }

  return true;
}

export async function desbloquearUsuario(bloqueadorId: string, bloqueadoId: string): Promise<boolean> {
  if (!bloqueadorId || !bloqueadoId) return false;

  try {
    await supabase
      .from('social_bloqueos')
      .delete()
      .eq('bloqueador_id', bloqueadorId)
      .eq('bloqueado_id', bloqueadoId);
  } catch (err) {
    console.warn('Eliminación en social_bloqueos falló:', err);
  }

  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(LOCAL_BLOQUEOS_KEY(bloqueadorId));
      if (cached) {
        const ids: string[] = JSON.parse(cached);
        const filtrados = ids.filter(id => id !== bloqueadoId);
        localStorage.setItem(LOCAL_BLOQUEOS_KEY(bloqueadorId), JSON.stringify(filtrados));
      }
    } catch {
      // Ignorar
    }
  }

  return true;
}

// ------------------------------------------------------------------------------
// MODERACIÓN: REPORTES DE CONTENIDO
// ------------------------------------------------------------------------------

export async function reportarContenido(reporte: ReporteContenido): Promise<boolean> {
  const payload = {
    reportador_id: reporte.reportador_id,
    tipo: reporte.tipo,
    reportado_usuario_id: reporte.reportado_usuario_id,
    rutina_id: reporte.rutina_id || null,
    motivo: reporte.motivo,
    descripcion: reporte.descripcion?.trim() || null,
    estado: 'pendiente',
  };

  try {
    const { error } = await supabase.from('social_reportes').insert(payload);
    if (error) {
      guardarReporteLocalmente(payload);
    }
  } catch {
    guardarReporteLocalmente(payload);
  }

  return true;
}

function guardarReporteLocalmente(payload: any) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(LOCAL_REPORTES_KEY);
    const lista = raw ? JSON.parse(raw) : [];
    lista.push({ ...payload, created_at: new Date().toISOString() });
    localStorage.setItem(LOCAL_REPORTES_KEY, JSON.stringify(lista));
  } catch {
    // Ignorar
  }
}

// ------------------------------------------------------------------------------
// HELPERS DE CONTEO
// ------------------------------------------------------------------------------

async function getContadoresSeguidores(userIds: string[]): Promise<Record<string, number>> {
  if (!userIds || userIds.length === 0) return {};
  try {
    const { data } = await supabase
      .from('follows')
      .select('following_id')
      .in('following_id', userIds);

    const map: Record<string, number> = {};
    (data || []).forEach((row: any) => {
      map[row.following_id] = (map[row.following_id] || 0) + 1;
    });
    return map;
  } catch {
    return {};
  }
}

async function getContadoresRutinas(userIds: string[]): Promise<Record<string, number>> {
  if (!userIds || userIds.length === 0) return {};
  try {
    const { data } = await supabase
      .from('rutinas')
      .select('usuario_id')
      .in('usuario_id', userIds)
      .eq('is_public', true);

    const map: Record<string, number> = {};
    (data || []).forEach((row: any) => {
      map[row.usuario_id] = (map[row.usuario_id] || 0) + 1;
    });
    return map;
  } catch {
    return {};
  }
}
