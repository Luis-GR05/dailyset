// src/lib/socialService.ts
// Servicio de datos para el módulo Social (Supabase Client)

import { supabase } from './supabaseClient';
import type { PerfilPublico, RutinaPublica, EjercicioSimple } from '../types/social';

/**
 * Obtiene el feed de rutinas públicas.
 * Puede filtrar opcionalmente por una lista de IDs de usuarios seguidos.
 */
export async function getFeedPublico({
  currentUserId,
  soloSeguidos = false,
  seguidosIds = [],
  limite = 20,
}: {
  currentUserId?: string;
  soloSeguidos?: boolean;
  seguidosIds?: string[];
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
      .limit(limite);

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
      console.warn('Query con JOIN directo en rutinas falló, usando consulta fallback:', error.message);
      return await getFeedPublicoFallback({ currentUserId, soloSeguidos, seguidosIds, limite });
    }

    if (!data || data.length === 0) return [];

    const rutinaIds = data.map((r: any) => r.id);

    // Obtenemos los ejercicios asociados a estas rutinas públicas y los seguidos por el usuario
    const [ejerciciosPorRutina, seguidosPorMi] = await Promise.all([
      getEjerciciosDeRutinas(rutinaIds),
      currentUserId ? getIdsSeguidos(currentUserId) : Promise.resolve([]),
    ]);

    return data.map((r: any) => {
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
  limite = 20,
}: {
  currentUserId?: string;
  soloSeguidos?: boolean;
  seguidosIds?: string[];
  limite?: number;
}): Promise<RutinaPublica[]> {
  let query = supabase
    .from('rutinas')
    .select('id, usuario_id, nombre, categoria, duracion_estimada_minutos, is_public, created_at')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limite);

  if (soloSeguidos && seguidosIds && seguidosIds.length > 0) {
    query = query.in('usuario_id', seguidosIds);
  }

  const { data: rutinasData, error: rutinasError } = await query;
  if (rutinasError || !rutinasData) return [];

  const userIds = [...new Set(rutinasData.map((r: any) => r.usuario_id).filter(Boolean))];
  const rutinaIds = rutinasData.map((r: any) => r.id);

  const [perfilesMap, ejerciciosPorRutina, seguidosPorMi] = await Promise.all([
    getPerfilesMap(userIds),
    getEjerciciosDeRutinas(rutinaIds),
    currentUserId ? getIdsSeguidos(currentUserId) : Promise.resolve([]),
  ]);

  return rutinasData.map((r: any) => {
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
      // Intento sin join de ejercicio
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
 * Busca perfiles públicos por nombre o nombre de usuario
 */
export async function buscarUsuarios(termino: string, currentUserId?: string): Promise<PerfilPublico[]> {
  const cleanTerm = termino.trim();
  if (!cleanTerm) return [];

  try {
    let query = supabase
      .from('perfiles')
      .select('id, nombre_usuario, nombre_completo, avatar_url, bio, nivel_entrenamiento, es_publico')
      .or(`nombre_usuario.ilike.%${cleanTerm}%,nombre_completo.ilike.%${cleanTerm}%`)
      .limit(15);

    const { data, error } = await query;
    if (error || !data) return [];

    // Filtrar si es_publico es false (si la columna existe) y excluir usuario actual
    const perfilesFiltrados = data.filter((p: any) => {
      if (p.es_publico === false) return false;
      return true;
    });

    // Obtener estadísticas de cada perfil (cuántos seguidores tiene y cuántas rutinas)
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
    }));
  } catch (err) {
    console.error('Error en buscarUsuarios:', err);
    return [];
  }
}

/**
 * Obtiene el detalle de un perfil público con estadísticas
 */
export async function getPerfilPublico(perfilId: string, currentUserId?: string): Promise<PerfilPublico | null> {
  try {
    const { data, error } = await supabase
      .from('perfiles')
      .select('id, nombre_usuario, nombre_completo, avatar_url, bio, nivel_entrenamiento, es_publico')
      .eq('id', perfilId)
      .single();

    if (error || !data) return null;

    // Obtener recuentos
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

    if (error && error.code !== '23505') { // 23505 = already exists
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
    // 1. Obtener la rutina original
    const { data: rutinaOriginal, error: getError } = await supabase
      .from('rutinas')
      .select('*')
      .eq('id', rutinaOriginalId)
      .single();

    if (getError || !rutinaOriginal) throw new Error('No se pudo encontrar la rutina original');

    // 2. Obtener los ejercicios de la rutina original
    const { data: ejerciciosOriginales } = await supabase
      .from('ejercicios_rutina')
      .select('ejercicio_id, indice_orden')
      .eq('rutina_id', rutinaOriginalId)
      .order('indice_orden', { ascending: true });

    // 3. Crear la nueva rutina para el usuario actual (privada por defecto)
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
        is_public: false, // ¡Control de privacidad por defecto: privada!
      })
      .select('id')
      .single();

    if (insertRutinaError || !nuevaRutina) throw insertRutinaError;

    // 4. Copiar los ejercicios vinculados
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

// Helpers de conteo
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
