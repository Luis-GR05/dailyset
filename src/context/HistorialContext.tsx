import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

export interface Serie {
  numero: number;
  kg: number;
  reps: number;
  completada: boolean;
}

export interface EjercicioSesion {
  id: number;
  nombre: string;
  series: Serie[];
}

export interface Sesion {
  id: number;
  fecha: string; // 'YYYY-MM-DD'
  rutina: string;
  duracionMin: number;
  puntuacion: number;
  ejercicios: EjercicioSesion[];
}

interface Metricas {
  volumenTotalKg: number;
  intensidad: 'Alta' | 'Media' | 'Baja';
  disciplinaPct: number;
}

interface HistorialContextType {
  sesiones: Sesion[];
  cargando: boolean;
  error: string | null;
  getSesionesPorMes: (mes: number, anio: number) => number[];
  getSesionPorFecha: (fecha: string) => Sesion | undefined;
  getMetricasPorMes: (mes: number, anio: number) => { volumenKg: number; intensidad: string };
  metricas: Metricas;
  refrescar: () => Promise<void>;
  crearSesion: (args: {
    fecha: string; // YYYY-MM-DD
    duracionMin: number;
    puntuacion?: number | null;
    rutinaId?: number | null;
    ejercicios: {
      ejercicioId: number;
      series: { kg: number; reps: number; completada: boolean }[];
    }[];
  }) => Promise<number>;
}

const HistorialContext = createContext<HistorialContextType | null>(null);

interface RutinaRelacion {
  nombre?: string | null;
}

interface SesionDbRow {
  id: number;
  fecha: string;
  duracion_minutos: number;
  puntuacion: number | null;
  rutina_id: number | null;
  rutinas?: RutinaRelacion | RutinaRelacion[] | null;
}

interface SerieDbRow {
  id: number;
  sesion_id: number;
  ejercicio_id: number;
  orden: number;
  kg: number;
  reps: number;
  completada: boolean;
  ejercicios?: { id: number; nombre: string } | { id: number; nombre: string }[] | null;
}

function calcularVolumen(sesiones: Sesion[]): number {
  return sesiones.reduce((total, sesion) =>
    total + sesion.ejercicios.reduce((t, ej) =>
      t + ej.series.reduce((s, serie) => s + serie.kg * serie.reps, 0), 0), 0);
}

function calcularIntensidad(volumenPromedioPorSesion: number): 'Alta' | 'Media' | 'Baja' {
  if (volumenPromedioPorSesion >= 800) return 'Alta';
  if (volumenPromedioPorSesion >= 400) return 'Media';
  return 'Baja';
}

function getRutinaNombre(rutinas: SesionDbRow['rutinas']): string {
  if (Array.isArray(rutinas)) {
    return rutinas[0]?.nombre || 'Entrenamiento libre';
  }
  return rutinas?.nombre || 'Entrenamiento libre';
}

function getEjercicioNombre(ejercicios: SerieDbRow['ejercicios']): string {
  if (Array.isArray(ejercicios)) {
    return ejercicios[0]?.nombre || 'Ejercicio';
  }
  return ejercicios?.nombre || 'Ejercicio';
}

export function HistorialProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarSesiones = async () => {
    if (!user) {
      setSesiones([]);
      return;
    }
    setCargando(true);
    setError(null);
    try {
      // Obtener sesiones del usuario
      const { data: sesionesData, error: sesionesError } = await supabase
        .from('sesiones_entrenamiento')
        .select(`
          id,
          fecha,
          duracion_minutos,
          puntuacion,
          rutina_id,
          rutinas ( nombre )
        `)
        .eq('usuario_id', user.id)
        .order('fecha', { ascending: false });

      if (sesionesError) throw sesionesError;

      const sesiones = (sesionesData ?? []) as SesionDbRow[];
      const sesionesIds = sesiones.map(s => s.id);
      let seriesPorSesion: Record<number, SerieDbRow[]> = {};

      if (sesionesIds.length > 0) {
        const { data: seriesData, error: seriesError } = await supabase
          .from('series')
          .select(`
            id,
            sesion_id,
            ejercicio_id,
            orden,
            kg,
            reps,
            completada,
            ejercicios ( id, nombre )
          `)
          .in('sesion_id', sesionesIds)
          .order('orden', { ascending: true });

        if (seriesError) throw seriesError;

        const series = (seriesData ?? []) as SerieDbRow[];
        seriesPorSesion = series.reduce((acc, serie) => {
          const sid = serie.sesion_id;
          if (!acc[sid]) acc[sid] = [];
          acc[sid].push(serie);
          return acc;
        }, {} as Record<number, SerieDbRow[]>);
      }

      const sesionesMapeadas: Sesion[] = sesiones.map(s => {
        const seriesDeSesion = seriesPorSesion[s.id] ?? [];
        // Agrupar series por ejercicio
        const ejerciciosMap = new Map<number, { id: number; nombre: string; series: Serie[] }>();
        seriesDeSesion.forEach(serie => {
          const ejId = serie.ejercicio_id;
          const ejNombre = getEjercicioNombre(serie.ejercicios);
          if (!ejerciciosMap.has(ejId)) {
            ejerciciosMap.set(ejId, { id: ejId, nombre: ejNombre, series: [] });
          }
          ejerciciosMap.get(ejId)!.series.push({
            numero: ejerciciosMap.get(ejId)!.series.length + 1,
            kg: serie.kg,
            reps: serie.reps,
            completada: serie.completada,
          });
        });

        const ejercicios = Array.from(ejerciciosMap.values());

        return {
          id: s.id,
          fecha: s.fecha,
          rutina: getRutinaNombre(s.rutinas),
          duracionMin: s.duracion_minutos,
          puntuacion: s.puntuacion ?? 0,
          ejercicios,
        };
      });

      setSesiones(sesionesMapeadas);
    } catch (e: any) {
      console.error('Error cargando historial', e);
      setError(e.message ?? 'Error cargando historial');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarSesiones();
  }, [user?.id]);

  const crearSesion: HistorialContextType['crearSesion'] = async (args) => {
    if (!user) throw new Error('Debes iniciar sesión');

    const { data: sesionInsertada, error: sesionError } = await supabase
      .from('sesiones_entrenamiento')
      .insert({
        usuario_id: user.id,
        fecha: args.fecha,
        duracion_minutos: args.duracionMin,
        // Si no se proporciona puntuación, guardarla como NULL para respetar constraints (p.ej. 1-10).
        puntuacion: args.puntuacion ?? null,
        rutina_id: args.rutinaId ?? null,
      })
      .select('id')
      .single();

    if (sesionError) throw sesionError;

    const sesionId = sesionInsertada.id as number;

    const filasSeries: {
      sesion_id: number;
      ejercicio_id: number;
      orden: number;
      kg: number;
      reps: number;
      completada: boolean;
    }[] = [];

    let orden = 0;
    for (const ej of args.ejercicios) {
      for (const s of ej.series) {
        filasSeries.push({
          sesion_id: sesionId,
          ejercicio_id: ej.ejercicioId,
          orden,
          kg: Number.isFinite(s.kg) ? s.kg : 0,
          reps: Number.isFinite(s.reps) ? s.reps : 0,
          completada: !!s.completada,
        });
        orden += 1;
      }
    }

    if (filasSeries.length > 0) {
      const { error: seriesError } = await supabase.from('series').insert(filasSeries);
      if (seriesError) throw seriesError;
    }

    await cargarSesiones();
    return sesionId;
  };

  const getSesionesPorMes = (mes: number, anio: number): number[] => {
    return sesiones
      .filter(s => {
        const d = new Date(s.fecha + 'T12:00:00');
        return d.getMonth() === mes && d.getFullYear() === anio;
      })
      .map(s => new Date(s.fecha + 'T12:00:00').getDate());
  };

  const getSesionPorFecha = (fecha: string): Sesion | undefined => {
    return sesiones.find(s => s.fecha === fecha);
  };

  const getMetricasPorMes = (mes: number, anio: number) => {
    const sesionesDelMes = sesiones.filter(s => {
      const d = new Date(s.fecha + 'T12:00:00');
      return d.getMonth() === mes && d.getFullYear() === anio;
    });
    const volumenKg = calcularVolumen(sesionesDelMes);
    const promedio = sesionesDelMes.length > 0 ? volumenKg / sesionesDelMes.length : 0;
    return { volumenKg, intensidad: calcularIntensidad(promedio) };
  };

  // Calcular métricas globales
  const volumenTotalKg = calcularVolumen(sesiones);
  const promedioVolumenSesion = sesiones.length > 0 ? volumenTotalKg / sesiones.length : 0;

  const semanasObj: Record<string, number> = {};
  sesiones.forEach(s => {
    const d = new Date(s.fecha + 'T12:00:00');
    const semana = Math.floor(d.getTime() / (7 * 24 * 60 * 60 * 1000));
    semanasObj[semana] = (semanasObj[semana] ?? 0) + 1;
  });

  const fechasOrdenadas = sesiones.map(s => new Date(s.fecha + 'T12:00:00').getTime()).sort((a, b) => a - b);
  const totalSemanas = fechasOrdenadas.length >= 2
    ? Math.max(1, Math.round((fechasOrdenadas[fechasOrdenadas.length - 1] - fechasOrdenadas[0]) / (7 * 24 * 60 * 60 * 1000)))
    : 1;

  const semanasConEntrenamiento = Object.values(semanasObj).filter(n => n >= 2).length;
  const disciplinaPct = Math.min(100, Math.round((semanasConEntrenamiento / totalSemanas) * 100));

  const metricas: Metricas = {
    volumenTotalKg,
    intensidad: calcularIntensidad(promedioVolumenSesion),
    disciplinaPct,
  };

  return (
    <HistorialContext.Provider
      value={{
        sesiones,
        cargando,
        error,
        getSesionesPorMes,
        getSesionPorFecha,
        getMetricasPorMes,
        metricas,
        refrescar: cargarSesiones,
        crearSesion,
      }}
    >
      {children}
    </HistorialContext.Provider>
  );
}

export function useHistorial() {
  const ctx = useContext(HistorialContext);
  if (!ctx) throw new Error('useHistorial must be used within HistorialProvider');
  return ctx;
}