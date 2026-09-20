// src/lib/socialService.ts
// Servicio de datos para el módulo Social (Supabase Client) con soporte de moderación, bloqueos, invitaciones y sugerencias

import { supabase } from './supabaseClient';
import type { PerfilPublico, RutinaPublica, EjercicioSimple, ReporteContenido } from '../types/social';

const LOCAL_BLOQUEOS_KEY = (userId: string) => `dailyset_bloqueos_${userId}`;
const LOCAL_REPORTES_KEY = 'dailyset_reportes_locales';

/**
 * Obtiene el feed de rutinas públicas.
 * Puede filtrar opcionalmente por una lista de IDs de usuarios seguidos y excluye bloqueados.
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

    // Si el usuario quiere ver solo de las personas a las que sigue
    if (soloSeguidos) {
      if (!seguidosIds || seguidosIds.length === 0) {
        return [];
      }
      query = query.in('usuario_id', seguidosIds);
    }

    const { data, error } = await query;

    // Si la relación foránea automática falla por nomenclatura del schema, intentamos consulta fallback
    if (error) {
      return await getFeedPublicoFallback({ currentUserId, soloSeguidos, seguidosIds, bloqueadosIds, limite });
    }

    if (!data || data.length === 0) return [];

    // Excluir publicaciones de usuarios bloqueados
    const rutinasFiltradas = data.filter((r: any) => !bloqueadosIds.includes(r.usuario_id));
    const rutinaIds = rutinasFiltradas.map((r: any) => r.id);

    // Obtenemos los ejercicios asociados a estas rutinas públicas y los seguidos por el usuario
    const [ejerciciosPorRutina, seguidosPorMi] = await Promise.all([
      getEjerciciosDeRutinas(rutinaIds),
      currentUserId ? getIdsSeguidos(currentUserId) : Promise.resolve([]),
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

  const [perfilesMap, ejerciciosPorRutina, seguidosPorMi] = await Promise.all([
    getPerfilesMap(userIds as string[]),
    getEjerciciosDeRutinas(rutinaIds),
    currentUserId ? getIdsSeguidos(currentUserId) : Promise.resolve([]),
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
 * Insensible a mayúsculas/minúsculas.
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
      console.warn('Error comprobando disponibilidad de nombre_usuario:', error.message);
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

    // Filtrar si es_publico es false, si es el usuario actual, o si está bloqueado
    const perfilesFiltrados = data.filter((p: any) => {
      if (p.es_publico === false) return false;
      if (currentUserId && p.id === currentUserId) return false;
      if (bloqueadosIds.includes(p.id)) return false;
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
 * Obtiene atletas registrados sugeridos para explorar con categorización inteligente (popular, activo, nuevo, recomendado)
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

      // Determinación de etiqueta de sugerencia
      let tipoSugerencia: PerfilPublico['tipoSugerencia'] = 'recomendado';
      if (rutCount >= 3) {
        tipoSugerencia = 'creador_activo';
      } else if (segCount >= 2) {
        tipoSugerencia = 'popular';
      } else if (p.created_at && (Date.now() - new Date(p.created_at).getTime()) < 1000 * 60 * 60 * 24 * 7) {
        tipoSugerencia = 'nuevo';
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

    // Ordenar: primero los que tienen rutinas o seguidores, luego el resto
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
export async function getRutinasPublicasDeUsuario(usuarioId: string): Promise<RutinaPublica[]> {
  try {
    const { data, error } = await supabase
      .from('rutinas')
      .select('id, usuario_id, nombre, categoria, duracion_estimada_minutos, is_public, created_at')
      .eq('usuario_id', usuarioId)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    const rutinaIds = data.map((r: any) => r.id);
    const ejerciciosPorRutina = await getEjerciciosDeRutinas(rutinaIds);

    return data.map((r: any) => {
      const ejercicios = ejerciciosPorRutina[r.id] || [];
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
 * Acción de seguir a un usuario
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
 * Clona una rutina pública al perfil del usuario actual (por defecto la copia es privada)
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

    return nuevaRutina.id;
  } catch (err) {
    console.error('Error al clonar rutina:', err);
    throw err;
  }
}

// ------------------------------------------------------------------------------
// MODERACIÓN: BLOQUEO DE USUARIOS
// ------------------------------------------------------------------------------

/**
 * Obtiene los IDs de los usuarios bloqueados por el usuario actual
 */
export async function getUsuariosBloqueadosIds(userId: string): Promise<string[]> {
  if (!userId) return [];

  // 1. Intentar desde Supabase
  try {
    const { data, error } = await supabase
      .from('social_bloqueos')
      .select('bloqueado_id')
      .eq('bloqueador_id', userId);

    if (!error && data) {
      const ids = data.map((b: any) => b.bloqueado_id);
      // Sincronizar con almacenamiento local
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_BLOQUEOS_KEY(userId), JSON.stringify(ids));
      }
      return ids;
    }
  } catch {
    // Si la tabla no existe aún en Supabase, recurrir a localStorage
  }

  // 2. Fallback a almacenamiento local
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

/**
 * Obtiene los perfiles completos de todos los usuarios bloqueados
 */
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

/**
 * Bloquea a un usuario: rompe relaciones de follow y guarda el bloqueo en BD y local
 */
export async function bloquearUsuario(bloqueadorId: string, bloqueadoId: string): Promise<boolean> {
  if (!bloqueadorId || !bloqueadoId || bloqueadorId === bloqueadoId) return false;

  // 1. Romper follows en ambas direcciones
  try {
    await Promise.allSettled([
      supabase.from('follows').delete().eq('follower_id', bloqueadorId).eq('following_id', bloqueadoId),
      supabase.from('follows').delete().eq('follower_id', bloqueadoId).eq('following_id', bloqueadorId),
    ]);
  } catch {
    // Continuar
  }

  // 2. Insertar en tabla de bloqueos en Supabase
  try {
    await supabase.from('social_bloqueos').insert({
      bloqueador_id: bloqueadorId,
      bloqueado_id: bloqueadoId,
    });
  } catch (err) {
    console.warn('Inserción en social_bloqueos falló (usando respaldo local):', err);
  }

  // 3. Guardar en almacenamiento local
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

/**
 * Desbloquea a un usuario previamente bloqueado
 */
export async function desbloquearUsuario(bloqueadorId: string, bloqueadoId: string): Promise<boolean> {
  if (!bloqueadorId || !bloqueadoId) return false;

  // 1. Eliminar de Supabase
  try {
    await supabase
      .from('social_bloqueos')
      .delete()
      .eq('bloqueador_id', bloqueadorId)
      .eq('bloqueado_id', bloqueadoId);
  } catch (err) {
    console.warn('Eliminación en social_bloqueos falló:', err);
  }

  // 2. Eliminar de almacenamiento local
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

/**
 * Envía un reporte sobre un usuario o rutina
 */
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
      console.warn('Inserción en social_reportes falló, guardando en registro local:', error.message);
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
