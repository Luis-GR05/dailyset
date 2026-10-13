// Datos COMPARTIDOS web/app (se copian a dailyset-app con scripts/sincronizar-web.mjs).
// Etiquetas y traducciones del catálogo de ejercicios.

export const CATEGORY_LABELS: Record<string, string> = {
  strength: 'Fuerza',
  stretching: 'Estiramiento',
  plyometrics: 'Pliométrico',
  strongman: 'Strongman',
  powerlifting: 'Powerlifting',
  olympic_weightlifting: 'Halterofilia',
  cardio: 'Cardio',
  general: 'General',
};

export const MUSCLE_TRANSLATIONS: Record<string, { es: string; en: string }> = {
  abductors: { es: 'Abductores', en: 'Abductors' },
  abs: { es: 'Abdominales', en: 'Abs' },
  adductors: { es: 'Aductores', en: 'Adductors' },
  biceps: { es: 'Bíceps', en: 'Biceps' },
  calves: { es: 'Gemelos', en: 'Calves' },
  cardio: { es: 'Cardio', en: 'Cardio' },
  delts: { es: 'Deltoides (Hombros)', en: 'Deltoids' },
  forearms: { es: 'Antebrazos', en: 'Forearms' },
  glutes: { es: 'Glúteos', en: 'Glutes' },
  hamstrings: { es: 'Isquiotibiales', en: 'Hamstrings' },
  lats: { es: 'Dorsales', en: 'Lats' },
  'levator-scapulae': { es: 'Elevador de la escápula', en: 'Levator Scapulae' },
  pectorals: { es: 'Pectorales', en: 'Pectorals' },
  quads: { es: 'Cuádriceps', en: 'Quads' },
  'serratus-anterior': { es: 'Serrato anterior', en: 'Serratus Anterior' },
  spine: { es: 'Espina / Lumbar', en: 'Spine / Lower Back' },
  traps: { es: 'Trapecios', en: 'Traps' },
  triceps: { es: 'Tríceps', en: 'Triceps' },
  'upper-back': { es: 'Espalda superior', en: 'Upper Back' },
};

export const EQUIPMENT_TRANSLATIONS: Record<string, { es: string; en: string }> = {
  barbell: { es: 'Barra', en: 'Barbell' },
  dumbbell: { es: 'Mancuerna', en: 'Dumbbell' },
  cable: { es: 'Polea', en: 'Cable' },
  machine: { es: 'Máquina', en: 'Machine' },
  bodyweight: { es: 'Peso corporal', en: 'Bodyweight' },
  band: { es: 'Banda elástica', en: 'Band' },
  kettlebell: { es: 'Pesa rusa (Kettlebell)', en: 'Kettlebell' },
  smith: { es: 'Máquina Smith', en: 'Smith' },
  'ez-bar': { es: 'Barra Z', en: 'EZ Bar' },
  lever: { es: 'Palanca', en: 'Lever' },
  other: { es: 'Otro', en: 'Other' },
};

export const LEVEL_COLORS: Record<string, string> = {
  principiante: '#34d399',
  intermedio:   '#f59e0b',
  avanzado:     '#ef4444',
};

export function getMuscleTextHelper(m: string, locale: string) {
  const item = MUSCLE_TRANSLATIONS[m.toLowerCase()];
  return item ? (locale === 'es' ? item.es : item.en) : m;
}

export function getEquipmentTextHelper(eq: string, locale: string) {
  const item = EQUIPMENT_TRANSLATIONS[eq.toLowerCase()];
  return item ? (locale === 'es' ? item.es : item.en) : eq;
}
