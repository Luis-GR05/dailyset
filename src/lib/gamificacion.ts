// Lógica COMPARTIDA web/app (se copia a dailyset-app con scripts/sincronizar-web.mjs).
// Gamificación del perfil: niveles por asistencia y rachas de entrenamiento.
import type { Sesion } from '../context/HistorialContext';

export interface NivelConfig {
  nivel: number;
  nombreEs: string;
  nombreEn: string;
  rangoEs: string;
  rangoEn: string;
  minSesiones: number;
  maxSesiones: number;
  descEs: string;
  descEn: string;
  beneficioEs: string;
  beneficioEn: string;
}

// Progresión de niveles basada exclusivamente en asistencia y días de entrenamiento cumplidos
export const NIVELES: NivelConfig[] = [
  {
    nivel: 1,
    nombreEs: 'Chispa Inicial',
    nombreEn: 'Initial Spark',
    rangoEs: 'RECLUTA',
    rangoEn: 'ROOKIE',
    minSesiones: 0,
    maxSesiones: 3,
    descEs: 'Iniciando el hábito del entrenamiento diario.',
    descEn: 'Starting the daily training habit.',
    beneficioEs: 'Seguimiento de racha activado',
    beneficioEn: 'Streak tracking activated',
  },
  {
    nivel: 2,
    nombreEs: 'Constancia Bronce',
    nombreEn: 'Bronze Consistency',
    rangoEs: 'ATLETA BRONCE',
    rangoEn: 'BRONZE ATHLETE',
    minSesiones: 3,
    maxSesiones: 7,
    descEs: 'Constancia demostrada asistiendo a cada sesión programada.',
    descEn: 'Demonstrated consistency attending every scheduled workout.',
    beneficioEs: 'Insignia Bronce de Disciplina',
    beneficioEn: 'Bronze Discipline Badge',
  },
  {
    nivel: 3,
    nombreEs: 'Racha de Hierro',
    nombreEn: 'Iron Streak',
    rangoEs: 'ATLETA PLATA',
    rangoEn: 'SILVER ATHLETE',
    minSesiones: 7,
    maxSesiones: 15,
    descEs: 'Disciplina forjada. Cumpliendo con cada día de rutina.',
    descEn: 'Forged discipline. Fulfilling every routine day.',
    beneficioEs: 'Multiplicador de consistencia semanal',
    beneficioEn: 'Weekly consistency multiplier',
  },
  {
    nivel: 4,
    nombreEs: 'Constancia de Oro',
    nombreEn: 'Gold Consistency',
    rangoEs: 'ATLETA ORO',
    rangoEn: 'GOLD ATHLETE',
    minSesiones: 15,
    maxSesiones: 30,
    descEs: 'Dedicación total al entrenamiento. El hábito ya es parte de ti.',
    descEn: 'Total commitment to training. The habit is second nature.',
    beneficioEs: 'Rango de Oro en estadísticas',
    beneficioEn: 'Gold rank on statistics',
  },
  {
    nivel: 5,
    nombreEs: 'Disciplina Platino',
    nombreEn: 'Platinum Discipline',
    rangoEs: 'ÉLITE PLATINO',
    rangoEn: 'PLATINUM ELITE',
    minSesiones: 30,
    maxSesiones: 60,
    descEs: 'Asistencia impecable. Formas parte del 5% más disciplinado.',
    descEn: 'Impeccable attendance. Part of the top 5% most disciplined.',
    beneficioEs: 'Insignia Platino exclusiva',
    beneficioEn: 'Exclusive Platinum badge',
  },
  {
    nivel: 6,
    nombreEs: 'Diamante de la Constancia',
    nombreEn: 'Diamond Habit',
    rangoEs: 'TITÁN DIAMANTE',
    rangoEn: 'DIAMOND TITAN',
    minSesiones: 60,
    maxSesiones: 100,
    descEs: 'Disciplina inquebrantable y dedicación intachable.',
    descEn: 'Unbreakable discipline and impeccable dedication.',
    beneficioEs: 'Aura de Diamante en perfil',
    beneficioEn: 'Diamond aura on profile',
  },
  {
    nivel: 7,
    nombreEs: 'Corona de la Disciplina',
    nombreEn: 'Crown of Discipline',
    rangoEs: 'LEYENDA DAILYSET',
    rangoEn: 'DAILYSET LEGEND',
    minSesiones: 100,
    maxSesiones: 100,
    descEs: 'Maestría total del hábito y constancia absoluta.',
    descEn: 'Total habit mastery and absolute consistency.',
    beneficioEs: 'Rango Máximo Honorífico',
    beneficioEn: 'Honorary Maximum Rank',
  },
];

/** Racha actual, mejor racha, días únicos y tracker de los últimos 7 días. */
export function calcularRachas(sesiones: Pick<Sesion, 'fecha'>[], locale: string) {
  const parseLocalDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const today = new Date();
  const todayStr = parseLocalDate(today);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = parseLocalDate(yesterday);

  const uniqueDates = Array.from(new Set(sesiones.map(s => s.fecha.split('T')[0]))).sort();

  const trainedToday = uniqueDates.includes(todayStr);
  const trainedYesterday = uniqueDates.includes(yesterdayStr);

  // Racha histórica máxima de asistencia
  let bestStreak = 0;
  let currentRun = 0;
  for (let i = 0; i < uniqueDates.length; i++) {
    if (i === 0) {
      currentRun = 1;
    } else {
      const dPrev = new Date(uniqueDates[i - 1] + 'T00:00:00');
      const dCurr = new Date(uniqueDates[i] + 'T00:00:00');
      const diffDays = Math.round((dCurr.getTime() - dPrev.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentRun++;
      } else if (diffDays > 1) {
        currentRun = 1;
      }
    }
    if (currentRun > bestStreak) bestStreak = currentRun;
  }

  // Racha activa actual
  let rachaActual = 0;
  if (trainedToday || trainedYesterday) {
    rachaActual = 1;
    const lastTrainedDateStr = trainedToday ? todayStr : yesterdayStr;
    const lastIdx = uniqueDates.lastIndexOf(lastTrainedDateStr);
    for (let i = lastIdx; i > 0; i--) {
      const dCurr = new Date(uniqueDates[i] + 'T00:00:00');
      const dPrev = new Date(uniqueDates[i - 1] + 'T00:00:00');
      const diffDays = Math.round((dCurr.getTime() - dPrev.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        rachaActual++;
      } else {
        break;
      }
    }
  }

  if (rachaActual > bestStreak) bestStreak = rachaActual;

  // Tracker visual de los últimos 7 días
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = parseLocalDate(d);
    const isToday = i === 0;
    const dayName = d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', { weekday: 'narrow' }).toUpperCase();
    const dayNum = d.getDate();
    const hasTrained = uniqueDates.includes(dateStr);
    last7Days.push({ dateStr, dayName, dayNum, hasTrained, isToday });
  }

  return {
    trainedToday,
    trainedYesterday,
    rachaActual,
    bestStreak,
    uniqueDaysCount: uniqueDates.length,
    last7Days,
  };
}
