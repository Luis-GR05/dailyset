// Lógica COMPARTIDA web/app (se copia a dailyset-app con scripts/sincronizar-web.mjs).
// Cálculo del resumen "Tu semana / mes en cifras".
import type { Sesion } from '../context/HistorialContext';

export type PeriodoTipo = 'semana' | 'mes';

const pad2 = (n: number) => String(n).padStart(2, '0');
const toYYYYMMDD = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

/** Rango de fechas y etiquetas del período (offset 0 = actual, -1 = anterior…). */
export function calcularRangoPeriodo(periodoTipo: PeriodoTipo, offsetPeriodo: number, locale: string) {
  const ahora = new Date();

  if (periodoTipo === 'semana') {
    // Determinar lunes de la semana actual + offset
    const diaActual = (ahora.getDay() + 6) % 7; // 0 = Lunes, 6 = Domingo
    const inicio = new Date(ahora);
    inicio.setDate(ahora.getDate() - diaActual + offsetPeriodo * 7);
    inicio.setHours(0, 0, 0, 0);

    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);
    fin.setHours(23, 59, 59, 999);

    const formatOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    const inicioTxt = inicio.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', formatOptions);
    const finTxt = fin.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', { ...formatOptions, year: 'numeric' });

    const etiqueta = offsetPeriodo === 0
      ? (locale === 'es' ? 'Esta semana' : 'This week')
      : offsetPeriodo === -1
      ? (locale === 'es' ? 'Semana pasada' : 'Last week')
      : `${inicioTxt} - ${finTxt}`;

    return {
      fechaInicioStr: toYYYYMMDD(inicio),
      fechaFinStr: toYYYYMMDD(fin),
      etiquetaPeriodo: etiqueta,
      subtituloPeriodo: `${inicioTxt} — ${finTxt}`,
    };
  } else {
    // Mes actual + offset
    const d = new Date(ahora.getFullYear(), ahora.getMonth() + offsetPeriodo, 1);
    const inicio = new Date(d.getFullYear(), d.getMonth(), 1);
    const fin = new Date(d.getFullYear(), d.getMonth() + 1, 0);

    const nombreMes = d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' });
    const etiqueta = offsetPeriodo === 0
      ? (locale === 'es' ? 'Este mes' : 'This month')
      : offsetPeriodo === -1
      ? (locale === 'es' ? 'Mes pasado' : 'Last month')
      : nombreMes;

    return {
      fechaInicioStr: toYYYYMMDD(inicio),
      fechaFinStr: toYYYYMMDD(fin),
      etiquetaPeriodo: etiqueta,
      subtituloPeriodo: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1),
    };
  }
}

/** Sesiones dentro del rango [inicio, fin] (fechas YYYY-MM-DD). */
export function filtrarSesionesPeriodo<T extends { fecha: string }>(sesiones: T[], fechaInicioStr: string, fechaFinStr: string) {
  return sesiones.filter((s) => s.fecha >= fechaInicioStr && s.fecha <= fechaFinStr);
}

/** Métricas de la tarjeta (entrenos, duración, volumen, ejercicio estrella, arquetipo). */
export function calcularMetricasPeriodo(sesionesPeriodo: Sesion[], periodoTipo: PeriodoTipo, locale: string) {
  const totalEntrenos = sesionesPeriodo.length;

  let minutosTotal = 0;
  let volumenTotal = 0;
  let seriesTotal = 0;
  let repsTotal = 0;

  // Conteo por ejercicio para detectar el destacado
  const ejerciciosMap = new Map<string, { veces: number; volumen: number }>();

  for (const sesion of sesionesPeriodo) {
    minutosTotal += sesion.duracionMin || ((sesion as any).duracionSegundos ? Math.round((sesion as any).duracionSegundos / 60) : 0);
    volumenTotal += Number((sesion as any).volumenTotalKg) || 0;

    const ejerciciosLista = sesion.ejercicios || (sesion as any).ejerciciosRealizados || [];
    for (const ej of ejerciciosLista) {
      const nombre = ej.nombre || 'Ejercicio';
      const prev = ejerciciosMap.get(nombre) || { veces: 0, volumen: 0 };
      const setsCount = ej.series ? ej.series.length : 0;
      seriesTotal += setsCount;

      let volEj = 0;
      if (ej.series) {
        for (const s of ej.series as any[]) {
          const reps = s.reps ?? s.repeticiones ?? 0;
          const peso = s.kg ?? s.peso ?? 0;
          repsTotal += reps;
          volEj += peso * reps;
        }
      }
      if (!((sesion as any).volumenTotalKg)) {
        volumenTotal += volEj;
      }

      ejerciciosMap.set(nombre, {
        veces: prev.veces + 1,
        volumen: prev.volumen + volEj,
      });
    }
  }

  // Identificar ejercicio con mayor volumen o frecuencia
  let ejercicioEstrella = { nombre: '—', volumen: 0, veces: 0 };
  for (const [nombre, data] of ejerciciosMap.entries()) {
    if (data.volumen > ejercicioEstrella.volumen) {
      ejercicioEstrella = { nombre, volumen: Math.round(data.volumen), veces: data.veces };
    }
  }

  // Formatear duración
  const horas = Math.floor(minutosTotal / 60);
  const mins = minutosTotal % 60;
  const duracionStr = horas > 0
    ? `${horas}h ${mins > 0 ? `${mins}m` : ''}`
    : `${minutosTotal} min`;

  // Equivalencia de volumen para impacto visual
  let equivalenciaVolumen = '';
  if (volumenTotal >= 20000) {
    equivalenciaVolumen = locale === 'es' ? 'Equivale al peso de 4 camiones compactos' : 'Equivalent to 4 compact trucks';
  } else if (volumenTotal >= 10000) {
    equivalenciaVolumen = locale === 'es' ? 'Equivale al peso de 2 elefantes adultos' : 'Equivalent to 2 adult elephants';
  } else if (volumenTotal >= 5000) {
    equivalenciaVolumen = locale === 'es' ? 'Equivale al peso de un rinoceronte blanco' : 'Equivalent to a white rhino';
  } else if (volumenTotal >= 2000) {
    equivalenciaVolumen = locale === 'es' ? 'Equivale al peso de un todoterreno' : 'Equivalent to an SUV vehicle';
  } else if (volumenTotal >= 800) {
    equivalenciaVolumen = locale === 'es' ? 'Equivale al peso de un caballo purasangre' : 'Equivalent to a thoroughbred horse';
  } else if (volumenTotal > 0) {
    equivalenciaVolumen = locale === 'es' ? 'Cada kilogramo suma a tu récord personal' : 'Every kilo builds towards your personal record';
  } else {
    equivalenciaVolumen = locale === 'es' ? 'Listo para iniciar el próximo desafío' : 'Ready for the next workout';
  }

  // Arquetipo / Rango según consistencia y volumen
  let arquetipo = {
    titulo: locale === 'es' ? 'Atleta en Enfoque' : 'Focused Athlete',
    desc: locale === 'es' ? 'Preparando el terreno para romper récords' : 'Setting the stage for breaking records',
    nivel: 'BRONCE',
    colorGlow: 'rgba(219, 240, 89, 0.4)',
  };

  if (periodoTipo === 'semana') {
    if (totalEntrenos >= 5) {
      arquetipo = {
        titulo: locale === 'es' ? 'Titán del Gimnasio' : 'Gym Titan',
        desc: locale === 'es' ? 'Volumen demoledor y disciplina de acero' : 'Crushing volume & iron discipline',
        nivel: 'LEGENDARIO',
        colorGlow: 'rgba(212, 251, 52, 0.9)',
      };
    } else if (totalEntrenos >= 3) {
      arquetipo = {
        titulo: locale === 'es' ? 'Bestia Imparable' : 'Unstoppable Beast',
        desc: locale === 'es' ? 'Constancia pura y avance implacable' : 'Pure consistency & relentless progress',
        nivel: 'ORO',
        colorGlow: 'rgba(56, 189, 248, 0.8)',
      };
    } else if (totalEntrenos >= 1) {
      arquetipo = {
        titulo: locale === 'es' ? 'Guerrero Constante' : 'Steady Warrior',
        desc: locale === 'es' ? 'Cumpliendo cada repetición programada' : 'Delivering on every programmed rep',
        nivel: 'PLATA',
        colorGlow: 'rgba(255, 100, 34, 0.8)',
      };
    }
  } else {
    if (totalEntrenos >= 18) {
      arquetipo = {
        titulo: locale === 'es' ? 'Máquina de Rendimiento' : 'Performance Machine',
        desc: locale === 'es' ? 'Un mes de dedicación fuera de serie' : 'An extraordinary month of dedication',
        nivel: 'LEGENDARIO',
        colorGlow: 'rgba(212, 251, 52, 0.9)',
      };
    } else if (totalEntrenos >= 12) {
      arquetipo = {
        titulo: locale === 'es' ? 'Atleta Implacable' : 'Relentless Athlete',
        desc: locale === 'es' ? 'Consistencia de campeonato en cada semana' : 'Championship consistency each week',
        nivel: 'ORO',
        colorGlow: 'rgba(56, 189, 248, 0.8)',
      };
    } else if (totalEntrenos >= 4) {
      arquetipo = {
        titulo: locale === 'es' ? 'Constructor de Hábito' : 'Habit Builder',
        desc: locale === 'es' ? 'Sumando volumen paso a paso' : 'Stacking volume step by step',
        nivel: 'PLATA',
        colorGlow: 'rgba(255, 100, 34, 0.8)',
      };
    }
  }

  return {
    totalEntrenos,
    minutosTotal,
    duracionStr,
    volumenTotal,
    seriesTotal,
    repsTotal,
    ejercicioEstrella,
    equivalenciaVolumen,
    arquetipo,
  };
}
