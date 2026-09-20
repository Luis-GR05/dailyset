// context/RutinasContext.tsx
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

export interface Rutina {
  id: number;
  nombre: string;
  categoria: string;
  duracion: number;
  ejerciciosIds: number[];
  imageUrl?: string;
  is_public?: boolean;
}

interface RutinasContextType {
  rutinas: Rutina[];
  cargando: boolean;
  error: string | null;
  carga: {
    startedAtMs: number | null;
    endedAtMs: number | null;
    durationMs: number | null;
  };
  refrescar: () => Promise<void>;
  agregarRutina: (r: Omit<Rutina, 'id'>) => Promise<void>;
  editarRutina: (r: Rutina) => Promise<void>;
  eliminarRutina: (id: number) => Promise<void>;
  actualizarEjerciciosRutina: (rutinaId: number, ejerciciosIds: number[]) => Promise<void>;
  togglePrivacidad: (rutinaId: number) => Promise<void>;
}

const RutinasContext = createContext<RutinasContextType | undefined>(undefined);

export function RutinasProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [rutinas, setRutinas] = useState<Rutina[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [carga, setCarga] = useState<RutinasContextType['carga']>({
    startedAtMs: null,
    endedAtMs: null,
    durationMs: null,
  });
  const requestSeq = useRef(0);
  const cacheKey = user?.id ? `dailyset:rutinas:${user.id}` : null;

  // Pintar cache inmediatamente (stale-while-revalidate)
  useEffect(() => {
    if (!cacheKey) return;
    try {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { rutinas: Rutina[]; savedAt: number };
      if (Array.isArray(parsed?.rutinas) && parsed.rutinas.length >= 0) {
        setRutinas(parsed.rutinas);
      }
    } catch {
      // ignorar cache corrupta
    }
  }, [cacheKey]);

  const cargarRutinas = async () => {
    const myReq = ++requestSeq.current;
    if (!user) {
      setRutinas([]);
      setError(null);
      setCargando(false);
      setCarga({ startedAtMs: null, endedAtMs: null, durationMs: null });
      return;
    }
    const startedAtMs = performance.now();
    setCargando(true);
    setError(null);
    setCarga(prev => ({ ...prev, startedAtMs, endedAtMs: null, durationMs: null }));
    try {
      const { data, error } = await supabase
        .from('rutinas')
        .select('id, nombre, duracion_estimada_minutos, categoria, etiquetas, is_public')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        // Si la columna is_public todavía no se ha migrado en Supabase, reintentar sin ella
        if (error.message?.includes('is_public')) {
          const { data: fallbackData, error: fallbackErr } = await supabase
            .from('rutinas')
            .select('id, nombre, duracion_estimada_minutos, categoria, etiquetas')
            .eq('usuario_id', user.id)
            .order('created_at', { ascending: false });
          if (fallbackErr) throw fallbackErr;
          procesarDatosRutinas(fallbackData || [], myReq);
          return;
        }
        throw error;
      }

      procesarDatosRutinas(data || [], myReq);
    } catch (e: any) {
      console.error('Error cargando rutinas', e);
      const isFetchErr = e?.message?.includes('fetch') || e?.name === 'TypeError';
      const msg = isFetchErr
        ? 'No se pudo conectar con el servidor (posible corte de red o conexión temporal). Se muestran datos guardados.'
        : (e.message ?? 'Error cargando rutinas');
      setError(msg);
    } finally {
      const endedAtMs = performance.now();
      if (myReq === requestSeq.current) {
        setCarga(prev => ({
          ...prev,
          endedAtMs,
          durationMs: prev.startedAtMs ? Math.max(0, endedAtMs - prev.startedAtMs) : null,
        }));
        setCargando(false);
      }
    }
  };

  const procesarDatosRutinas = async (data: any[], myReq: number) => {
    const rutinaIds = data?.map(r => r.id) ?? [];

    let ejerciciosPorRutina: Record<number, number[]> = {};
    if (rutinaIds.length > 0) {
      const { data: ejerciciosData, error: ejerciciosError } = await supabase
        .from('ejercicios_rutina')
        .select('rutina_id, ejercicio_id')
        .in('rutina_id', rutinaIds)
        .order('indice_orden', { ascending: true });

      if (ejerciciosError) throw ejerciciosError;

      ejerciciosPorRutina = (ejerciciosData ?? []).reduce((acc, fila) => {
        const rid = fila.rutina_id;
        const eid = fila.ejercicio_id;
        if (!acc[rid]) acc[rid] = [];
        acc[rid].push(eid);
        return acc;
      }, {} as Record<number, number[]>);
    }

    const normalizadas: Rutina[] = (data ?? []).map(r => {
      let categoria = r.categoria;
      if (!categoria && Array.isArray(r.etiquetas) && r.etiquetas.length > 0) {
        categoria = r.etiquetas[0];
      }
      return {
        id: r.id,
        nombre: r.nombre,
        categoria: categoria || 'General',
        duracion: r.duracion_estimada_minutos ?? 45,
        ejerciciosIds: ejerciciosPorRutina[r.id] ?? [],
        imageUrl: undefined,
        is_public: r.is_public ?? false,
      };
    });

    if (myReq === requestSeq.current) {
      setRutinas(normalizadas);
      try {
        if (user) {
          localStorage.setItem(
            `dailyset:rutinas:${user.id}`,
            JSON.stringify({ rutinas: normalizadas, savedAt: Date.now() })
          );
        }
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    cargarRutinas();
  }, [user?.id]);

  const agregarRutina = async (r: Omit<Rutina, 'id'>) => {
    if (!user) throw new Error('Debes iniciar sesión');

    const insertPayload: Record<string, any> = {
      usuario_id: user.id,
      nombre: r.nombre,
      categoria: r.categoria,
      etiquetas: [r.categoria],
      duracion_estimada_minutos: r.duracion,
      es_plantilla: false,
      esta_activa: true,
      is_public: r.is_public ?? false, // Por defecto privada
    };

    let dataRes: any = null;
    const { data, error } = await supabase
      .from('rutinas')
      .insert(insertPayload)
      .select('id, nombre, duracion_estimada_minutos, categoria, is_public')
      .single();

    if (error) {
      // Fallback si la columna is_public aún no está en la base de datos
      if (error.message?.includes('is_public')) {
        delete insertPayload.is_public;
        const { data: retryData, error: retryError } = await supabase
          .from('rutinas')
          .insert(insertPayload)
          .select('id, nombre, duracion_estimada_minutos, categoria')
          .single();
        if (retryError) throw retryError;
        dataRes = retryData;
      } else {
        throw error;
      }
    } else {
      dataRes = data;
    }

    const ejerciciosIniciales = [...new Set(r.ejerciciosIds || [])];
    if (ejerciciosIniciales.length > 0) {
      const inserciones = ejerciciosIniciales.map((ejercicioId, indice) => ({
        rutina_id: dataRes.id,
        ejercicio_id: ejercicioId,
        indice_orden: indice,
      }));
      const { error: insertError } = await supabase.from('ejercicios_rutina').insert(inserciones);
      if (insertError) console.error('Error insertando ejercicios iniciales de rutina:', insertError);
    }

    const nueva: Rutina = {
      id: dataRes.id,
      nombre: dataRes.nombre,
      categoria: dataRes.categoria || r.categoria,
      duracion: dataRes.duracion_estimada_minutos ?? r.duracion,
      ejerciciosIds: ejerciciosIniciales,
      imageUrl: r.imageUrl,
      is_public: r.is_public ?? false,
    };

    setRutinas(prev => [nueva, ...prev]);
  };

  const editarRutina = async (r: Rutina) => {
    if (!user) throw new Error('Debes iniciar sesión');

    const updatePayload: Record<string, any> = {
      nombre: r.nombre,
      categoria: r.categoria,
      etiquetas: [r.categoria],
      duracion_estimada_minutos: r.duracion,
      is_public: r.is_public ?? false,
    };

    const { error } = await supabase
      .from('rutinas')
      .update(updatePayload)
      .eq('id', r.id)
      .eq('usuario_id', user.id);

    if (error) {
      if (error.message?.includes('is_public')) {
        delete updatePayload.is_public;
        const { error: retryError } = await supabase
          .from('rutinas')
          .update(updatePayload)
          .eq('id', r.id)
          .eq('usuario_id', user.id);
        if (retryError) throw retryError;
      } else {
        throw error;
      }
    }

    setRutinas(prev => prev.map(ru => (ru.id === r.id ? r : ru)));
  };

  const togglePrivacidad = async (rutinaId: number) => {
    const rutina = rutinas.find(r => r.id === rutinaId);
    if (!rutina) return;
    const nuevoEstado = !rutina.is_public;
    await editarRutina({ ...rutina, is_public: nuevoEstado });
  };

  const eliminarRutina = async (id: number) => {
    if (!user) throw new Error('Debes iniciar sesión');

    // Primero eliminar relaciones en ejercicios_rutina (por cascada manual)
    await supabase.from('ejercicios_rutina').delete().eq('rutina_id', id);

    const { error } = await supabase
      .from('rutinas')
      .delete()
      .eq('id', id)
      .eq('usuario_id', user.id);

    if (error) throw error;

    setRutinas(prev => prev.filter(ru => ru.id !== id));
  };

  const actualizarEjerciciosRutina = async (rutinaId: number, ejerciciosIds: number[]) => {
    if (!user) throw new Error('Debes iniciar sesión');

    // Usar una transacción simulada: eliminar e insertar en serie
    const { error: deleteError } = await supabase
      .from('ejercicios_rutina')
      .delete()
      .eq('rutina_id', rutinaId);

    if (deleteError) throw deleteError;

    const idsUnicos = [...new Set(ejerciciosIds || [])];
    if (idsUnicos.length > 0) {
      const inserciones = idsUnicos.map((ejercicioId, indice) => ({
        rutina_id: rutinaId,
        ejercicio_id: ejercicioId,
        indice_orden: indice,
      }));

      const { error: insertError } = await supabase
        .from('ejercicios_rutina')
        .insert(inserciones);

      if (insertError) throw insertError;
    }

    setRutinas(prev =>
      prev.map(r => (r.id === rutinaId ? { ...r, ejerciciosIds: idsUnicos } : r))
    );
  };

  return (
    <RutinasContext.Provider
      value={{
        rutinas,
        cargando,
        error,
        carga,
        refrescar: cargarRutinas,
        agregarRutina,
        editarRutina,
        eliminarRutina,
        actualizarEjerciciosRutina,
        togglePrivacidad,
      }}
    >
      {children}
    </RutinasContext.Provider>
  );
}

export function useRutinas() {
  const ctx = useContext(RutinasContext);
  if (!ctx) throw new Error('useRutinas debe usarse dentro de RutinasProvider');
  return ctx;
}