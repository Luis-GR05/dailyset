import { useMemo } from 'react';
import { useHistorial } from '../context/HistorialContext';
import { useAuth } from '../context/AuthContext';

function startOfDayMs(yyyyMmDd: string) {
  return new Date(`${yyyyMmDd}T12:00:00`).setHours(0, 0, 0, 0);
}

export function calcularVolumenSesion(
  ejercicios: { series: { kg: number; reps: number }[] }[]
): number {
  return ejercicios.reduce(
    (t, ej) => t + ej.series.reduce((s, serie) => s + serie.kg * serie.reps, 0),
    0
  );
}

/**
 * Calcula la racha actual (días consecutivos con ≥1 sesión, contando desde hoy hacia atrás).
 */
export function calcularRachaActual(fechas: number[]): number {
  const sorted = [...fechas].sort((a, b) => a - b);
  let streak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (i === sorted.length - 1) {
      streak = 1;
    } else {
      const diff = sorted[i + 1] - sorted[i];
      if (diff === 24 * 60 * 60 * 1000) streak += 1;
      else break;
    }
  }
  return streak;
}

/**
 * Calcula la mejor racha histórica de días consecutivos.
 */
export function calcularMejorRacha(fechas: number[]): number {
  const sorted = [...fechas].sort((a, b) => a - b);
  let best = 0;
  let cur = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) {
      cur = 1;
    } else {
      const diff = sorted[i] - sorted[i - 1];
      if (diff === 24 * 60 * 60 * 1000) cur += 1;
      else cur = 1;
    }
    best = Math.max(best, cur);
  }
  return best;
}

/**
 * Hook que centraliza el cálculo de estadísticas derivadas de sesiones y usuario.
 * Evita duplicar lógica entre DashboardPage, EstadisticasPage y PerfilPage.
 */
export function useEstadisticas() {
  const { sesiones, metricas } = useHistorial();
  const { user } = useAuth();

  return useMemo(() => {
    const totalEntrenos = sesiones.length;
    const totalMin = sesiones.reduce((t, s) => t + (s.duracionMin ?? 0), 0);
    const kcal = Math.round(totalMin * 5);

    const volumenTotal = sesiones.reduce(
      (t, s) => t + calcularVolumenSesion(s.ejercicios),
      0
    );

    // Días únicos con entrenamiento
    const uniqueDayMs = Array.from(
      new Set(sesiones.map(s => startOfDayMs(s.fecha)))
    );

    const rachaActual = calcularRachaActual(uniqueDayMs);
    const mejorRacha = calcularMejorRacha(uniqueDayMs);

    // Mejor peso registrado en cualquier serie
    let maxKg = 0;
    sesiones.forEach(s =>
      s.ejercicios.forEach(ej =>
        ej.series.forEach(serie => {
          if (serie.kg > maxKg) maxKg = serie.kg;
        })
      )
    );

    // Semanas activas (semanas con ≥2 sesiones)
    const semanasObj: Record<string, number> = {};
    sesiones.forEach(s => {
      const d = new Date(s.fecha + 'T12:00:00');
      const semana = Math.floor(d.getTime() / (7 * 24 * 60 * 60 * 1000));
      semanasObj[semana] = (semanasObj[semana] ?? 0) + 1;
    });
    const semanasActivas = Object.values(semanasObj).filter(n => n >= 2).length;

    // Frecuencia últimas 4 semanas (usar fecha estable para mantener pureza)
    const nowMs = new Date().getTime();
    const last28 = sesiones.filter(s => {
      const ms = startOfDayMs(s.fecha);
      return nowMs - ms <= 28 * 24 * 60 * 60 * 1000;
    }).length;
    const frecuenciaSemanal = last28 / 4;

    // IMC y objetivo de peso
    const pesoKg = user?.pesoKg;
    const alturaCm = user?.alturaCm;
    const objetivoPesoKg = user?.objetivoPesoKg;

    const datosFisicosCompletos = Boolean(
      typeof pesoKg === 'number' && Number.isFinite(pesoKg) &&
      typeof alturaCm === 'number' && Number.isFinite(alturaCm) && alturaCm > 0
    );

    const imc = datosFisicosCompletos ? pesoKg! / ((alturaCm! / 100) ** 2) : undefined;

    const progresoPeso = (() => {
      if (
        typeof pesoKg !== 'number' || !Number.isFinite(pesoKg) ||
        typeof objetivoPesoKg !== 'number' || !Number.isFinite(objetivoPesoKg)
      ) return null;
      return Math.abs(pesoKg - objetivoPesoKg);
    })();

    return {
      totalEntrenos,
      totalMin,
      kcal,
      volumenTotal,
      rachaActual,
      mejorRacha,
      maxKg,
      semanasActivas,
      frecuenciaSemanal,
      datosFisicosCompletos,
      imc,
      progresoPeso,
      metricas,
      hayDatos: totalEntrenos > 0,
    };
  }, [sesiones, user, metricas]);
}
