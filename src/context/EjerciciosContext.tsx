import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

export interface Ejercicio {
  id: number;
  nombre: string;
  grupo: string;
  categoria: string;
  descripcion: string;
  videoUrl?: string;
  imageUrl?: string;
}

interface EjerciciosContextType {
  ejercicios: Ejercicio[];
  cargando: boolean;
  error: string | null;
  refrescar: () => Promise<void>;
  agregarEjercicio: (e: Omit<Ejercicio, 'id'>) => Promise<void>;
  editarEjercicio: (e: Ejercicio) => Promise<void>;
  eliminarEjercicio: (id: number) => Promise<void>;
}

const EjerciciosContext = createContext<EjerciciosContextType | undefined>(undefined);

export function EjerciciosProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarEjercicios = async () => {
    setCargando(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('ejercicios')
        .select('id, nombre, descripcion, dificultad, url_video, url_imagen')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const normalizados: Ejercicio[] = (data ?? []).map((e: any) => ({
        id: e.id as number,
        nombre: e.nombre as string,
        grupo: '', // el grupo muscular se puede mapear luego usando grupo_muscular_id si lo necesitas
        categoria: e.dificultad ?? 'General',
        descripcion: e.descripcion ?? '',
        videoUrl: e.url_video ?? undefined,
        imageUrl: e.url_imagen ?? undefined,
      }));

      setEjercicios(normalizados);
    } catch (e: any) {
      console.error('Error cargando ejercicios', e);
      setError(e.message ?? 'Error cargando ejercicios');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEjercicios();
  }, [user?.id]);

  const agregarEjercicio = async (e: Omit<Ejercicio, 'id'>) => {
    if (!user) throw new Error('Debes iniciar sesión para crear ejercicios');

    const { data, error } = await supabase
      .from('ejercicios')
      .insert({
        nombre: e.nombre,
        descripcion: e.descripcion,
        instrucciones: e.descripcion,
        dificultad: e.categoria,
        url_video: e.videoUrl,
        url_imagen: e.imageUrl,
        es_publico: false,
        creado_por: user.id,
      })
      .select('id, nombre, descripcion, dificultad, url_video, url_imagen')
      .single();

    if (error) throw error;

    const nuevo: Ejercicio = {
      id: data.id as number,
      nombre: data.nombre as string,
      grupo: e.grupo,
      categoria: data.dificultad ?? e.categoria,
      descripcion: data.descripcion ?? '',
      videoUrl: data.url_video ?? undefined,
      imageUrl: data.url_imagen ?? undefined,
    };

    setEjercicios(prev => [nuevo, ...prev]);
  };

  const editarEjercicio = async (e: Ejercicio) => {
    if (!user) throw new Error('Debes iniciar sesión para editar ejercicios');

    const { error } = await supabase
      .from('ejercicios')
      .update({
        nombre: e.nombre,
        descripcion: e.descripcion,
        instrucciones: e.descripcion,
        dificultad: e.categoria,
        url_video: e.videoUrl,
        url_imagen: e.imageUrl,
      })
      .eq('id', e.id);

    if (error) throw error;

    setEjercicios(prev => prev.map(ej => (ej.id === e.id ? e : ej)));
  };

  const eliminarEjercicio = async (id: number) => {
    if (!user) throw new Error('Debes iniciar sesión para eliminar ejercicios');

    const { error } = await supabase
      .from('ejercicios')
      .delete()
      .eq('id', id);

    if (error) throw error;

    setEjercicios(prev => prev.filter(ej => ej.id !== id));
  };

  return (
    <EjerciciosContext.Provider
      value={{
        ejercicios,
        cargando,
        error,
        refrescar: cargarEjercicios,
        agregarEjercicio,
        editarEjercicio,
        eliminarEjercicio,
      }}
    >
      {children}
    </EjerciciosContext.Provider>
  );
}

export function useEjercicios() {
    const ctx = useContext(EjerciciosContext);
    if (!ctx) throw new Error('useEjercicios debe usarse dentro de EjerciciosProvider');
    return ctx;
}
