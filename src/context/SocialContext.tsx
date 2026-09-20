// src/context/SocialContext.tsx
// Estado global y acciones para la sección Social de DailySet

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import type { RutinaPublica, PerfilPublico, FeedFilterType } from '../types/social';
import {
  getFeedPublico,
  buscarUsuarios as apiBuscarUsuarios,
  getIdsSeguidos,
  seguirUsuario as apiSeguirUsuario,
  dejarDeSeguir as apiDejarDeSeguir,
  clonarRutina as apiClonarRutina,
  toggleVisibilidadRutina as apiToggleVisibilidad,
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
  refrescarFeed: () => Promise<void>;
  clonarRutinaSocial: (rutinaId: number) => Promise<number | null>;
  togglePrivacidadRutina: (rutinaId: number, estadoActual: boolean) => Promise<boolean>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export function SocialProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [feed, setFeed] = useState<RutinaPublica[]>([]);
  const [cargandoFeed, setCargandoFeed] = useState(false);
  const [errorFeed, setErrorFeed] = useState<string | null>(null);
  const [filtroFeed, setFiltroFeed] = useState<FeedFilterType>('todos');

  const [seguidosIds, setSeguidosIds] = useState<string[]>([]);

  const [busquedaQuery, setBusquedaQuery] = useState('');
  const [usuariosEncontrados, setUsuariosEncontrados] = useState<PerfilPublico[]>([]);
  const [buscandoUsuarios, setBuscandoUsuarios] = useState(false);

  // 1. Cargar lista de seguidos cuando el usuario está autenticado
  const cargarSeguidos = useCallback(async () => {
    if (!user) {
      setSeguidosIds([]);
      return;
    }
    try {
      const ids = await getIdsSeguidos(user.id);
      setSeguidosIds(ids);
    } catch (err) {
      console.error('Error al cargar seguidos:', err);
    }
  }, [user]);

  useEffect(() => {
    cargarSeguidos();
  }, [cargarSeguidos]);

  // 2. Cargar feed según el filtro activo (todos o solo seguidos)
  const cargarFeed = useCallback(async () => {
    setCargandoFeed(true);
    setErrorFeed(null);
    try {
      const data = await getFeedPublico({
        currentUserId: user?.id,
        soloSeguidos: filtroFeed === 'siguiendo',
        seguidosIds,
        limite: 30,
      });
      setFeed(data);
    } catch (err: any) {
      setErrorFeed(err?.message || 'Error al cargar el feed social');
    } finally {
      setCargandoFeed(false);
    }
  }, [user?.id, filtroFeed, seguidosIds]);

  useEffect(() => {
    cargarFeed();
  }, [cargarFeed]);

  // 3. Buscar usuarios con debounce
  useEffect(() => {
    if (!busquedaQuery.trim()) {
      setUsuariosEncontrados([]);
      setBuscandoUsuarios(false);
      return;
    }

    setBuscandoUsuarios(true);
    const timer = setTimeout(async () => {
      try {
        const resultados = await apiBuscarUsuarios(busquedaQuery, user?.id);
        setUsuariosEncontrados(resultados);
      } catch (err) {
        console.error('Error buscando usuarios:', err);
      } finally {
        setBuscandoUsuarios(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [busquedaQuery, user?.id]);

  // 4. Comprobar si el usuario actual sigue a un ID dado
  const estaSiguiendo = useCallback(
    (targetUserId: string) => {
      return seguidosIds.includes(targetUserId);
    },
    [seguidosIds]
  );

  // 5. Toggle seguir/dejar de seguir con actualización optimista
  const toggleSeguir = async (targetUserId: string): Promise<boolean> => {
    if (!user) throw new Error('Debes iniciar sesión para seguir usuarios');
    if (user.id === targetUserId) return false;

    const actualmenteSiguiendo = seguidosIds.includes(targetUserId);

    // Actualización optimista
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
      // Revertir optimismo en caso de error
      setSeguidosIds(prev =>
        actualmenteSiguiendo ? [...prev, targetUserId] : prev.filter(id => id !== targetUserId)
      );
      throw err;
    }
  };

  // 6. Clonar rutina pública
  const clonarRutinaSocial = async (rutinaId: number): Promise<number | null> => {
    if (!user) throw new Error('Debes iniciar sesión para clonar rutinas');
    return await apiClonarRutina(rutinaId, user.id);
  };

  // 7. Toggle privacidad de una rutina
  const togglePrivacidadRutina = async (rutinaId: number, estadoActual: boolean): Promise<boolean> => {
    if (!user) throw new Error('Debes iniciar sesión');
    const nuevoEstado = !estadoActual;
    const ok = await apiToggleVisibilidad(rutinaId, nuevoEstado, user.id);
    if (ok) {
      // Actualizar localmente si está en el feed
      setFeed(prev =>
        nuevoEstado
          ? prev
          : prev.filter(r => r.id !== rutinaId)
      );
    }
    return nuevoEstado;
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
        refrescarFeed: cargarFeed,
        clonarRutinaSocial,
        togglePrivacidadRutina,
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
