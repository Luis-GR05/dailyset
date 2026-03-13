import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
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

  const cargarRutinas = async () => {
    if (!user) {
      setRutinas([]);
      return;
    }
    setCargando(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('rutinas')
        .select('id, nombre, duracion_estimada_minutos, etiquetas')
        .eq('usuario_id', user.id)
        .order('creado_en', { ascending: false });

      if (error) throw error;

      const rutinaIds = data?.map(r => r.id) ?? [];

      let ejerciciosPorRutina: Record<number, number[]> = {};
      if (rutinaIds.length > 0) {
        const { data: ejerciciosData, error: ejerciciosError } = await supabase
          .from('ejercicios_rutina')
          .select('rutina_id, ejercicio_id')
          .in('rutina_id', rutinaIds);

        if (ejerciciosError) throw ejerciciosError;

        ejerciciosPorRutina = (ejerciciosData ?? []).reduce((acc, fila) => {
          const rid = fila.rutina_id as number;
          const eid = fila.ejercicio_id as number;
          if (!acc[rid]) acc[rid] = [];
          acc[rid].push(eid);
          return acc;
        }, {} as Record<number, number[]>);
      }

      const normalizadas: Rutina[] = (data ?? []).map(r => ({
        id: r.id as number,
        nombre: r.nombre as string,
        categoria: Array.isArray(r.etiquetas) && r.etiquetas.length > 0 ? String(r.etiquetas[0]) : 'General',
        duracion: (r.duracion_estimada_minutos as number | null) ?? 45,
        ejerciciosIds: ejerciciosPorRutina[r.id as number] ?? [],
        imageUrl: undefined,
      }));

      setRutinas(normalizadas);
    } catch (e: any) {
      console.error('Error cargando rutinas', e);
      setError(e.message ?? 'Error cargando rutinas');
    } finally {
      setCargando(false);
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
        descripcion: '',
        dias_semana: null,
        etiquetas: [r.categoria],
        es_plantilla: false,
        esta_activa: true,
        duracion_estimada_minutos: r.duracion,
      })
      .select('id, nombre, duracion_estimada_minutos, etiquetas')
      .single();

    if (error) throw error;

    const nueva: Rutina = {
      id: data.id as number,
      nombre: data.nombre as string,
      categoria: r.categoria,
      duracion: (data.duracion_estimada_minutos as number | null) ?? r.duracion,
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
      prev.map(r => (r.id === rutinaId ? { ...r, ejerciciosIds } : r)),
    );
  };

  return (
    <RutinasContext.Provider
      value={{
        rutinas,
        cargando,
        error,
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
