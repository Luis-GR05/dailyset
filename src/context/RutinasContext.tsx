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
        .select('id, nombre, duracion_estimada_minutos, categoria, etiquetas')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

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
        // Priorizar campo 'categoria' si existe, sino usar primer elemento de etiquetas
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
        };
      });

      // Si hay otra petición más reciente, ignorar esta respuesta para evitar flicker/race.
      if (myReq === requestSeq.current) {
        setRutinas(normalizadas);
      }
    } catch (e: any) {
      console.error('Error cargando rutinas', e);
      setError(e.message ?? 'Error cargando rutinas');
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

  useEffect(() => {
    cargarRutinas();
  }, [user?.id]);

  const agregarRutina = async (r: Omit<Rutina, 'id'>) => {
    if (!user) throw new Error('Debes iniciar sesión');

    const { data, error } = await supabase
      .from('rutinas')
      .insert({
        usuario_id: user.id,
        nombre: r.nombre,
        categoria: r.categoria,
        etiquetas: [r.categoria], // Mantenemos por compatibilidad
        duracion_estimada_minutos: r.duracion,
        es_plantilla: false,
        esta_activa: true,
      })
      .select('id, nombre, duracion_estimada_minutos, categoria')
      .single();

    if (error) throw error;

    const nueva: Rutina = {
      id: data.id,
      nombre: data.nombre,
      categoria: data.categoria || r.categoria,
      duracion: data.duracion_estimada_minutos ?? r.duracion,
      ejerciciosIds: [],
      imageUrl: r.imageUrl,
    };

    setRutinas(prev => [nueva, ...prev]);
  };

  const editarRutina = async (r: Rutina) => {
    if (!user) throw new Error('Debes iniciar sesión');

    const { error } = await supabase
      .from('rutinas')
      .update({
        nombre: r.nombre,
        categoria: r.categoria,
        etiquetas: [r.categoria],
        duracion_estimada_minutos: r.duracion,
      })
      .eq('id', r.id)
      .eq('usuario_id', user.id);

    if (error) throw error;

    setRutinas(prev => prev.map(ru => (ru.id === r.id ? r : ru)));
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

    if (ejerciciosIds.length > 0) {
      const inserciones = ejerciciosIds.map((ejercicioId, indice) => ({
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
      prev.map(r => (r.id === rutinaId ? { ...r, ejerciciosIds } : r))
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