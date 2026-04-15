import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

export interface Ejercicio {
  id: number;
  externalId?: string;
  nombre: string;
  grupo: string;               // primaryMuscles[0] / grupo_muscular
  musculosPrimarios: string[];
  musculosSecundarios: string[];
  categoriaEjercicio: string;  // strength | stretching | plyometrics | etc.
  dificultad: string;          // principiante | intermedio | avanzado
  equipamiento?: string;
  descripcion: string;
  instruccionesPasos: string[];
  imagenInicio?: string;       // /exercises/ID/0.jpg
  imagenFinal?: string;        // /exercises/ID/1.jpg
  videoUrl?: string;
  esPublico: boolean;
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
        .select(`
          id, nombre, descripcion, dificultad,
          url_video, url_imagen,
          external_id, grupo_muscular,
          musculos_primarios, musculos_secundarios,
          equipamiento, categoria_ejercicio,
          instrucciones_pasos, imagen_inicio, imagen_final,
          es_publico
        `)
        .order('nombre', { ascending: true });

      if (error) throw error;

      const normalizados: Ejercicio[] = (data ?? []).map((e: any) => ({
        id:                   e.id as number,
        externalId:           e.external_id ?? undefined,
        nombre:               e.nombre as string,
        grupo:                e.grupo_muscular ?? (e.musculos_primarios?.[0] ?? ''),
        musculosPrimarios:    e.musculos_primarios ?? [],
        musculosSecundarios:  e.musculos_secundarios ?? [],
        categoriaEjercicio:   e.categoria_ejercicio ?? 'general',
        dificultad:           e.dificultad ?? 'principiante',
        equipamiento:         e.equipamiento ?? undefined,
        descripcion:          e.descripcion ?? '',
        instruccionesPasos:   e.instrucciones_pasos ?? [],
        imagenInicio:         e.imagen_inicio ?? e.url_imagen ?? undefined,
        imagenFinal:          e.imagen_final ?? undefined,
        videoUrl:             e.url_video ?? undefined,
        esPublico:            e.es_publico ?? false,
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
        nombre:                e.nombre,
        descripcion:           e.descripcion,
        instrucciones:         e.instruccionesPasos.join('\n'),
        instrucciones_pasos:   e.instruccionesPasos,
        dificultad:            e.dificultad,
        grupo_muscular:        e.grupo,
        musculos_primarios:    e.musculosPrimarios,
        musculos_secundarios:  e.musculosSecundarios,
        equipamiento:          e.equipamiento,
        categoria_ejercicio:   e.categoriaEjercicio,
        imagen_inicio:         e.imagenInicio,
        imagen_final:          e.imagenFinal,
        url_imagen:            e.imagenInicio,
        url_video:             e.videoUrl,
        es_publico:            false,
        creado_por:            user.id,
      })
      .select(`
        id, nombre, descripcion, dificultad, url_video, url_imagen,
        external_id, grupo_muscular, musculos_primarios, musculos_secundarios,
        equipamiento, categoria_ejercicio, instrucciones_pasos,
        imagen_inicio, imagen_final, es_publico
      `)
      .single();

    if (error) throw error;

    const nuevo: Ejercicio = {
      id:                   data.id as number,
      externalId:           data.external_id ?? undefined,
      nombre:               data.nombre as string,
      grupo:                data.grupo_muscular ?? e.grupo,
      musculosPrimarios:    data.musculos_primarios ?? e.musculosPrimarios,
      musculosSecundarios:  data.musculos_secundarios ?? e.musculosSecundarios,
      categoriaEjercicio:   data.categoria_ejercicio ?? e.categoriaEjercicio,
      dificultad:           data.dificultad ?? e.dificultad,
      equipamiento:         data.equipamiento ?? e.equipamiento,
      descripcion:          data.descripcion ?? '',
      instruccionesPasos:   data.instrucciones_pasos ?? [],
      imagenInicio:         data.imagen_inicio ?? e.imagenInicio,
      imagenFinal:          data.imagen_final ?? e.imagenFinal,
      videoUrl:             data.url_video ?? undefined,
      esPublico:            data.es_publico ?? false,
    };

    setEjercicios(prev => [nuevo, ...prev]);
  };

  const editarEjercicio = async (e: Ejercicio) => {
    if (!user) throw new Error('Debes iniciar sesión para editar ejercicios');

    const { error } = await supabase
      .from('ejercicios')
      .update({
        nombre:              e.nombre,
        descripcion:         e.descripcion,
        instrucciones:       e.instruccionesPasos.join('\n'),
        instrucciones_pasos: e.instruccionesPasos,
        dificultad:          e.dificultad,
        grupo_muscular:      e.grupo,
        equipamiento:        e.equipamiento,
        categoria_ejercicio: e.categoriaEjercicio,
        imagen_inicio:       e.imagenInicio,
        imagen_final:        e.imagenFinal,
        url_imagen:          e.imagenInicio,
        url_video:           e.videoUrl,
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