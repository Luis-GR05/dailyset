// src/context/SocialContext.tsx
// Estado global y acciones para la sección Social de DailySet con soporte de bloqueos y sugerencias

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import type { RutinaPublica, PerfilPublico, FeedFilterType, ReporteContenido } from '../types/social';
import {
  getFeedPublico,
  buscarUsuarios as apiBuscarUsuarios,
  getUsuariosSugeridos,
  getIdsSeguidos,
  seguirUsuario as apiSeguirUsuario,
  dejarDeSeguir as apiDejarDeSeguir,
  clonarRutina as apiClonarRutina,
  toggleVisibilidadRutina as apiToggleVisibilidad,
  getUsuariosBloqueadosIds,
  bloquearUsuario as apiBloquearUsuario,
  desbloquearUsuario as apiDesbloquearUsuario,
  reportarContenido as apiReportarContenido,
  toggleReaccionRutina,
} from '../lib/socialService';

interface SocialContextType {
  feed: RutinaPublica[];
  cargandoFeed: boolean;
  errorFeed: string | null;
  filtroFeed: FeedFilterType;
  setFiltroFeed: (filtro: FeedFilterType) => void;
  seguidosIds: string[];
  estaSiguiendo: (userId: string) => boolean;
  toggleSeguir: (userId: string) => Promise<boolean>;
  busquedaQuery: string;
  setBusquedaQuery: (query: string) => void;
  usuariosEncontrados: PerfilPublico[];
  buscandoUsuarios: boolean;
  sugerencias: PerfilPublico[];
  cargandoSugerencias: boolean;
  refrescarFeed: () => Promise<void>;
  clonarRutinaSocial: (rutinaId: number) => Promise<number | null>;
  togglePrivacidadRutina: (rutinaId: number, estadoActual: boolean) => Promise<boolean>;
  reaccionarRutina: (rutinaId: number, autorRutinaId: string, nombreRutina: string) => Promise<boolean>;
  bloqueadosIds: string[];
  estaBloqueado: (userId: string) => boolean;
  bloquearAtleta: (userId: string) => Promise<boolean>;
  desbloquearAtleta: (userId: string) => Promise<boolean>;
  reportarContenidoSocial: (reporte: Omit<ReporteContenido, 'reportador_id'>) => Promise<boolean>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export function SocialProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [feed, setFeed] = useState<RutinaPublica[]>([]);
  const [cargandoFeed, setCargandoFeed] = useState(false);
  const [errorFeed, setErrorFeed] = useState<string | null>(null);
  const [filtroFeed, setFiltroFeed] = useState<FeedFilterType>('todos');

  const [seguidosIds, setSeguidosIds] = useState<string[]>([]);
  const [bloqueadosIds, setBloqueadosIds] = useState<string[]>([]);

  const [busquedaQuery, setBusquedaQuery] = useState('');
  const [usuariosEncontrados, setUsuariosEncontrados] = useState<PerfilPublico[]>([]);
  const [buscandoUsuarios, setBuscandoUsuarios] = useState(false);

  const [sugerencias, setSugerencias] = useState<PerfilPublico[]>([]);
  const [cargandoSugerencias, setCargandoSugerencias] = useState(false);

  // 1. Cargar lista de seguidos y bloqueados cuando el usuario está autenticado
  const cargarSeguidosYBloqueados = useCallback(async () => {
    if (!user) {
      setSeguidosIds([]);
      setBloqueadosIds([]);
      return;
    }
    try {
      const [fIds, bIds] = await Promise.all([
        getIdsSeguidos(user.id),
        getUsuariosBloqueadosIds(user.id),
      ]);
      setSeguidosIds(fIds);
      setBloqueadosIds(bIds);
    } catch (err) {
      console.error('Error al cargar seguidos y bloqueados:', err);
    }
  }, [user]);

  useEffect(() => {
    cargarSeguidosYBloqueados();
  }, [cargarSeguidosYBloqueados]);

  // 2. Cargar sugerencias de atletas
  const cargarSugerencias = useCallback(async () => {
    setCargandoSugerencias(true);
    try {
      const data = await getUsuariosSugeridos(user?.id, 12, bloqueadosIds);
      setSugerencias(data);
    } catch (err) {
      console.error('Error cargando sugerencias:', err);
    } finally {
      setCargandoSugerencias(false);
    }
  }, [user?.id, bloqueadosIds]);

  useEffect(() => {
    cargarSugerencias();
  }, [cargarSugerencias]);

  // 3. Cargar feed según el filtro activo (todos o solo seguidos), excluyendo bloqueados
  const cargarFeed = useCallback(async () => {
    setCargandoFeed(true);
    setErrorFeed(null);
    try {
      const data = await getFeedPublico({
        currentUserId: user?.id,
        soloSeguidos: filtroFeed === 'siguiendo',
        seguidosIds,
        bloqueadosIds,
        limite: 30,
      });
      setFeed(data);
    } catch (err: any) {
      setErrorFeed(err?.message || 'Error al cargar el feed social');
    } finally {
      setCargandoFeed(false);
    }
  }, [user?.id, filtroFeed, seguidosIds, bloqueadosIds]);

  useEffect(() => {
    cargarFeed();
  }, [cargarFeed]);

  // 4. Buscar usuarios con debounce y cargar sugeridos si no hay término
  useEffect(() => {
    let cancelado = false;

    if (!busquedaQuery.trim()) {
      setBuscandoUsuarios(true);
      getUsuariosSugeridos(user?.id, 12, bloqueadosIds)
        .then(res => {
          if (!cancelado) {
            setUsuariosEncontrados(res);
            setBuscandoUsuarios(false);
          }
        })
        .catch(() => {
          if (!cancelado) setBuscandoUsuarios(false);
        });
      return () => {
        cancelado = true;
      };
    }

    setBuscandoUsuarios(true);
    const timer = setTimeout(async () => {
      try {
        const resultados = await apiBuscarUsuarios(busquedaQuery, user?.id, bloqueadosIds);
        if (!cancelado) setUsuariosEncontrados(resultados);
      } catch (err) {
        console.error('Error buscando usuarios:', err);
      } finally {
        if (!cancelado) setBuscandoUsuarios(false);
      }
    }, 300);

    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [busquedaQuery, user?.id, bloqueadosIds]);

  // 5. Helpers de estado
  const estaSiguiendo = useCallback(
    (targetUserId: string) => {
      return seguidosIds.includes(targetUserId);
    },
    [seguidosIds]
  );

  const estaBloqueado = useCallback(
    (targetUserId: string) => {
      return bloqueadosIds.includes(targetUserId);
    },
    [bloqueadosIds]
  );

  // 6. Toggle seguir/dejar de seguir con actualización optimista
  const toggleSeguir = async (targetUserId: string): Promise<boolean> => {
    if (!user) throw new Error('Debes iniciar sesión para seguir usuarios');
    if (user.id === targetUserId) return false;

    const actualmenteSiguiendo = seguidosIds.includes(targetUserId);

    // Límite de seguidos según plan (Free: 20 max, Pro/Ultra: ilimitado)
    const plan = user.plan || 'free';
    const esPro = plan === 'pro' || plan === 'ultra';
    if (!actualmenteSiguiendo && !esPro && seguidosIds.length >= 20) {
      throw new Error('LIMIT_SEGUIDOS_FREE');
    }

    setSeguidosIds(prev =>
      actualmenteSiguiendo ? prev.filter(id => id !== targetUserId) : [...prev, targetUserId]
    );

    try {
      if (actualmenteSiguiendo) {
        await apiDejarDeSeguir(user.id, targetUserId);
      } else {
        await apiSeguirUsuario(user.id, targetUserId);
      }
      return !actualmenteSiguiendo;
    } catch (err) {
      setSeguidosIds(prev =>
        actualmenteSiguiendo ? [...prev, targetUserId] : prev.filter(id => id !== targetUserId)
      );
      throw err;
    }
  };

  // 7. Bloquear y Desbloquear usuarios
  const bloquearAtleta = async (targetUserId: string): Promise<boolean> => {
    if (!user) throw new Error('Debes iniciar sesión');
    if (user.id === targetUserId) return false;

    // Actualización de estado local inmediata
    setBloqueadosIds(prev => (prev.includes(targetUserId) ? prev : [...prev, targetUserId]));
    setSeguidosIds(prev => prev.filter(id => id !== targetUserId));
    setFeed(prev => prev.filter(r => r.usuario_id !== targetUserId));
    setUsuariosEncontrados(prev => prev.filter(u => u.id !== targetUserId));
    setSugerencias(prev => prev.filter(u => u.id !== targetUserId));

    const ok = await apiBloquearUsuario(user.id, targetUserId);
    return ok;
  };

  const desbloquearAtleta = async (targetUserId: string): Promise<boolean> => {
    if (!user) throw new Error('Debes iniciar sesión');

    setBloqueadosIds(prev => prev.filter(id => id !== targetUserId));
    const ok = await apiDesbloquearUsuario(user.id, targetUserId);
    if (ok) {
      cargarFeed();
      cargarSugerencias();
    }
    return ok;
  };

  // 8. Reportar contenido social
  const reportarContenidoSocial = async (
    reporte: Omit<ReporteContenido, 'reportador_id'>
  ): Promise<boolean> => {
    if (!user) throw new Error('Debes iniciar sesión para reportar contenido');
    return await apiReportarContenido({
      ...reporte,
      reportador_id: user.id,
    });
  };

  // 9. Clonar rutina pública
  const clonarRutinaSocial = async (rutinaId: number): Promise<number | null> => {
    if (!user) throw new Error('Debes iniciar sesión para clonar rutinas');
    return await apiClonarRutina(rutinaId, user.id);
  };

  // 10. Toggle privacidad de una rutina
  const togglePrivacidadRutina = async (rutinaId: number, estadoActual: boolean): Promise<boolean> => {
    if (!user) throw new Error('Debes iniciar sesión');
    const nuevoEstado = !estadoActual;
    const ok = await apiToggleVisibilidad(rutinaId, nuevoEstado, user.id);
    if (ok) {
      setFeed(prev =>
        nuevoEstado
          ? prev
          : prev.filter(r => r.id !== rutinaId)
      );
    }
    return nuevoEstado;
  };

  // 11. Reaccionar a una rutina pública
  const reaccionarRutina = async (
    rutinaId: number,
    autorRutinaId: string,
    nombreRutina: string
  ): Promise<boolean> => {
    if (!user) throw new Error('Debes iniciar sesión para reaccionar');

    // Optimistic UI update
    setFeed(prev =>
      prev.map(r => {
        if (r.id === rutinaId) {
          const yaLikeada = Boolean(r.esLikeada);
          const currentCount = r.likesCount || 0;
          return {
            ...r,
            esLikeada: !yaLikeada,
            likesCount: yaLikeada ? Math.max(0, currentCount - 1) : currentCount + 1,
          };
        }
        return r;
      })
    );

    try {
      const res = await toggleReaccionRutina({
        rutinaId,
        usuarioId: user.id,
        autorRutinaId,
        nombreRutina,
      });
      return res.liked;
    } catch (err) {
      // Revertir si hay error
      setFeed(prev =>
        prev.map(r => {
          if (r.id === rutinaId) {
            const yaLikeada = Boolean(r.esLikeada);
            const currentCount = r.likesCount || 0;
            return {
              ...r,
              esLikeada: !yaLikeada,
              likesCount: yaLikeada ? Math.max(0, currentCount - 1) : currentCount + 1,
            };
          }
          return r;
        })
      );
      throw err;
    }
  };

  return (
    <SocialContext.Provider
      value={{
        feed,
        cargandoFeed,
        errorFeed,
        filtroFeed,
        setFiltroFeed,
        seguidosIds,
        estaSiguiendo,
        toggleSeguir,
        busquedaQuery,
        setBusquedaQuery,
        usuariosEncontrados,
        buscandoUsuarios,
        sugerencias,
        cargandoSugerencias,
        refrescarFeed: cargarFeed,
        clonarRutinaSocial,
        togglePrivacidadRutina,
        reaccionarRutina,
        bloqueadosIds,
        estaBloqueado,
        bloquearAtleta,
        desbloquearAtleta,
        reportarContenidoSocial,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error('useSocial debe usarse dentro de un SocialProvider');
  return ctx;
}
