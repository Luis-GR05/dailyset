import { createContext, useContext, type ReactNode } from 'react';
import { SESIONES, type Sesion } from '../data/historial';

interface Metricas {
    volumenTotalKg: number;
    intensidad: 'Alta' | 'Media' | 'Baja';
    disciplinaPct: number;
}

interface HistorialContextType {
    sesiones: Sesion[];
    getSesionesPorMes: (mes: number, anio: number) => number[];
    getSesionPorFecha: (fecha: string) => Sesion | undefined;
    getMetricasPorMes: (mes: number, anio: number) => { volumenKg: number; intensidad: string };
    metricas: Metricas;
}

const HistorialContext = createContext<HistorialContextType | null>(null);

function calcularVolumen(sesiones: Sesion[]): number {
    return sesiones.reduce((total, sesion) =>
        total + sesion.ejercicios.reduce((t, ej) =>
            t + ej.series.reduce((s, serie) => s + serie.kg * serie.reps, 0), 0), 0);
}

// Alta >= 800 kg/sesión media, Media >= 400, Baja el resto
function calcularIntensidad(volumenPromedioPorSesion: number): 'Alta' | 'Media' | 'Baja' {
    if (volumenPromedioPorSesion >= 800) return 'Alta';
    if (volumenPromedioPorSesion >= 400) return 'Media';
    return 'Baja';
}

export function HistorialProvider({ children }: { children: ReactNode }) {
    const sesiones = SESIONES;

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

    const volumenTotalKg = calcularVolumen(sesiones);
    const promedioVolumenSesion = sesiones.length > 0 ? volumenTotalKg / sesiones.length : 0;

    // Disciplina: % de semanas en el rango de datos que tienen >= 3 sesiones
    const semanasObj: Record<string, number> = {};
    sesiones.forEach(s => {
        const d = new Date(s.fecha + 'T12:00:00');
        const semana = Math.floor(d.getTime() / (7 * 24 * 60 * 60 * 1000));
        semanasObj[semana] = (semanasObj[semana] ?? 0) + 1;
    });

    // Calcular el rango total de semanas entre la primera y la última sesión
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
        <HistorialContext.Provider value={{ sesiones, getSesionesPorMes, getSesionPorFecha, getMetricasPorMes, metricas }}>
            {children}
        </HistorialContext.Provider>
    );
}

export function useHistorial() {
    const ctx = useContext(HistorialContext);
    if (!ctx) throw new Error('useHistorial must be used within HistorialProvider');
    return ctx;
}
