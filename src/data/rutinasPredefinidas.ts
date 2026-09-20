export interface EjercicioTemplateInfo {
  id: number;
  nombre: string;
}

export interface RutinaTemplate {
  id: string;
  nombre: string;
  nombreEn: string;
  categoria: string;
  duracion: number;
  nivel: 'Principiante' | 'Intermedio' | 'Avanzado';
  descripcion: string;
  descripcionEn: string;
  color: string;
  ejerciciosIds: number[];
  ejercicios: EjercicioTemplateInfo[];
}

export const NIVEL_COLOR: Record<string, string> = {
  Principiante: '#34d399',
  Intermedio: '#f59e0b',
  Avanzado: '#ef4444',
};

export const CATEGORIA_CONFIG: Record<string, { bg: string; text: string }> = {
  fuerza:       { bg: '#DBF059', text: '#000000' }, // Lime DailySet
  cardio:       { bg: '#EF4444', text: '#FFFFFF' }, // Rojo vibrante
  empuje:       { bg: '#3B82F6', text: '#FFFFFF' }, // Azul royal
  tirón:        { bg: '#8B5CF6', text: '#FFFFFF' }, // Violeta
  tiron:        { bg: '#8B5CF6', text: '#FFFFFF' },
  pierna:       { bg: '#F59E0B', text: '#000000' }, // Ámbar
  piernas:      { bg: '#F59E0B', text: '#000000' },
  calistenia:   { bg: '#06B6D4', text: '#000000' }, // Cian brillante
  core:         { bg: '#EC4899', text: '#FFFFFF' }, // Rosa intenso
  movilidad:    { bg: '#10B981', text: '#000000' }, // Esmeralda
  flexibilidad: { bg: '#10B981', text: '#000000' },
  hipertrofia:  { bg: '#F97316', text: '#FFFFFF' }, // Naranja
  funcional:    { bg: '#14B8A6', text: '#000000' }, // Teal
};

export function getCategoriaColor(categoria?: string): { bg: string; text: string } {
  if (!categoria) return { bg: '#DBF059', text: '#000000' };
  const key = categoria.trim().toLowerCase();
  return CATEGORIA_CONFIG[key] || { bg: '#DBF059', text: '#000000' };
}

export const RUTINAS_PREDEFINIDAS: RutinaTemplate[] = [
  {
    id: 'fuerza-full-body',
    nombre: 'Full Body Esencial',
    nombreEn: 'Essential Full Body',
    categoria: 'Fuerza',
    duracion: 50,
    nivel: 'Principiante',
    descripcion: 'Entrenamiento de cuerpo completo que activa los grupos musculares principales para ganar fuerza y tono general.',
    descripcionEn: 'Full-body workout activating all major muscle groups for overall strength and tone.',
    color: '#DBF059',
    ejerciciosIds: [1596, 1311, 1080, 961],
    ejercicios: [
      { id: 1596, nombre: 'Press en trineo, a una pierna' },
      { id: 1311, nombre: 'Press militar con barra, sentado, tras la nuca' },
      { id: 1080, nombre: 'Dominadas, estrecho, bíceps' },
      { id: 961, nombre: 'Plancha frontal con giro' }
    ]
  },
  {
    id: 'fuerza-push-empuje',
    nombre: 'Push Day (Pecho, Hombro, Tríceps)',
    nombreEn: 'Push Day (Chest, Shoulders, Triceps)',
    categoria: 'Fuerza',
    duracion: 60,
    nivel: 'Intermedio',
    descripcion: 'Enfocada en el patrón de empuje superior con press de pecho, militar, extensiones de tríceps y fondos.',
    descripcionEn: 'Focused on upper push pattern with chest press, overhead press, triceps and dips.',
    color: '#DBF059',
    ejerciciosIds: [1881, 1311, 2082, 923, 1300],
    ejercicios: [
      { id: 1881, nombre: 'Press inclinado en máquina Smith, con agarre invertido' },
      { id: 1311, nombre: 'Press militar con barra, sentado, tras la nuca' },
      { id: 2082, nombre: 'Extensión de tríceps con barra Z, sentado' },
      { id: 923, nombre: 'Fondo up' },
      { id: 1300, nombre: 'Elevación lateral y frontal con banda' }
    ]
  },
  {
    id: 'fuerza-pull-tiron',
    nombre: 'Pull Day (Espalda y Bíceps)',
    nombreEn: 'Pull Day (Back and Biceps)',
    categoria: 'Fuerza',
    duracion: 55,
    nivel: 'Intermedio',
    descripcion: 'Entrenamiento completo de tracción para desarrollar una espalda densa y bíceps fuertes.',
    descripcionEn: 'Complete pull workout to build a dense back and strong biceps.',
    color: '#DBF059',
    ejerciciosIds: [1310, 1080, 1061, 1320],
    ejercicios: [
      { id: 1310, nombre: 'Remo de deltoides posterior con barra' },
      { id: 1080, nombre: 'Dominadas, estrecho, bíceps' },
      { id: 1061, nombre: 'Curl de bíceps con banda, alternado' },
      { id: 1320, nombre: 'Remo al mentón con barra' }
    ]
  },
  {
    id: 'fuerza-pierna-gluteo',
    nombre: 'Piernas y Glúteos Power',
    nombreEn: 'Legs & Glutes Power',
    categoria: 'Fuerza',
    duracion: 55,
    nivel: 'Intermedio',
    descripcion: 'Desarrollo potente del tren inferior: cuádriceps, cadena posterior, glúteos y gemelos.',
    descripcionEn: 'Powerful lower body development: quads, posterior chain, glutes and calves.',
    color: '#DBF059',
    ejerciciosIds: [1008, 1256, 1632, 997],
    ejercicios: [
      { id: 1008, nombre: 'Sentadilla potty' },
      { id: 1256, nombre: 'Press de gemelo a 45° con trineo' },
      { id: 1632, nombre: 'Curl femoral nórdico con apoyo de banco' },
      { id: 997, nombre: 'Zancada con giro' }
    ]
  },
  {
    id: 'cardio-hiit-quema-grasa',
    nombre: 'HIIT Quema Grasa Exprés',
    nombreEn: 'Express Fat-Burn HIIT',
    categoria: 'Cardio',
    duracion: 25,
    nivel: 'Intermedio',
    descripcion: 'Intervalos intensos para acelerar el metabolismo, quemar calorías y potenciar la resistencia cardiovascular.',
    descripcionEn: 'Intense intervals to rev up metabolism, burn calories and boost cardiovascular stamina.',
    color: '#EF4444',
    ejerciciosIds: [1276, 1289, 1290, 1287],
    ejercicios: [
      { id: 1276, nombre: 'Burpee con mancuerna' },
      { id: 1289, nombre: 'Saltos de patinador' },
      { id: 1290, nombre: 'Paso de esquí' },
      { id: 1287, nombre: 'Sentadilla, semi jump' }
    ]
  },
  {
    id: 'cardio-resistencia-aerobica',
    nombre: 'Cardio Resistencia y Ritmo',
    nombreEn: 'Cardio Endurance & Rhythm',
    categoria: 'Cardio',
    duracion: 40,
    nivel: 'Principiante',
    descripcion: 'Sesión aeróbica continuada para mejorar la salud cardiovascular, capacidad pulmonar y fondo físico.',
    descripcionEn: 'Steady aerobic session to enhance cardiovascular health, lung capacity and stamina.',
    color: '#EF4444',
    ejerciciosIds: [1275, 1291, 1276, 1290],
    ejercicios: [
      { id: 1275, nombre: 'Bicicleta elíptica' },
      { id: 1291, nombre: 'Salto, star' },
      { id: 1276, nombre: 'Burpee con mancuerna' },
      { id: 1290, nombre: 'Paso de esquí' }
    ]
  },
  {
    id: 'calistenia-cuerpo-libre',
    nombre: 'Calistenia Peso Corporal',
    nombreEn: 'Bodyweight Calisthenics',
    categoria: 'Calistenia',
    duracion: 45,
    nivel: 'Principiante',
    descripcion: 'Entrena con tu propio cuerpo. Dominadas, fondos, planchas y control corporal funcional sin máquinas complejas.',
    descripcionEn: 'Train with your own bodyweight. Pull-ups, dips, planks and functional control without complex equipment.',
    color: '#06B6D4',
    ejerciciosIds: [1080, 923, 922, 1008],
    ejercicios: [
      { id: 1080, nombre: 'Dominadas, estrecho, bíceps' },
      { id: 923, nombre: 'Fondo up' },
      { id: 922, nombre: 'Plancha lateral inclinado con peso corporal' },
      { id: 1008, nombre: 'Sentadilla potty' }
    ]
  },
  {
    id: 'core-abdomen-acero',
    nombre: 'Abdomen de Acero y Core',
    nombreEn: 'Steel Core & Abs',
    categoria: 'Core',
    duracion: 20,
    nivel: 'Principiante',
    descripcion: 'Rutina focalizada en la estabilidad central, transverso, recto abdominal y oblicuos.',
    descripcionEn: 'Focused routine on core stability, transverse, rectus abdominis and obliques.',
    color: '#EC4899',
    ejerciciosIds: [961, 886, 969, 901],
    ejercicios: [
      { id: 961, nombre: 'Plancha frontal con giro' },
      { id: 886, nombre: 'Abdominal' },
      { id: 969, nombre: 'Elevación de rodillas, colgado, oblicuo' },
      { id: 901, nombre: 'Con banda, asistido rueda abdominal' }
    ]
  },
  {
    id: 'movilidad-recuperacion-activa',
    nombre: 'Movilidad y Recuperación Activa',
    nombreEn: 'Mobility & Active Recovery',
    categoria: 'Movilidad',
    duracion: 30,
    nivel: 'Principiante',
    descripcion: 'Estiramientos y movilidad articular para descargar tensiones, prevenir lesiones y acelerar la recuperación.',
    descripcionEn: 'Stretches and joint mobility to release tension, prevent injury and speed up recovery.',
    color: '#10B981',
    ejerciciosIds: [898, 1055, 1228],
    ejercicios: [
      { id: 898, nombre: 'Estiramiento tumbado boca abajo, asistido, rectus femoris' },
      { id: 1055, nombre: 'Estiramiento de aductores asistido, tumbado de lado' },
      { id: 1228, nombre: 'Estiramiento, con manos en la pared, gemelo' }
    ]
  },
  {
    id: 'movilidad-cadera-inferior',
    nombre: 'Movilidad de Cadera y Tren Inferior',
    nombreEn: 'Hip & Lower Body Mobility',
    categoria: 'Movilidad',
    duracion: 25,
    nivel: 'Intermedio',
    descripcion: 'Desbloquea la pelvis, alivia caderas rígidas y gana rango articular en glúteos, aductores e isquios.',
    descripcionEn: 'Unlock the pelvis, relieve tight hips and expand joint range of motion in glutes, adductors and hamstrings.',
    color: '#10B981',
    ejerciciosIds: [1591, 1593, 1055, 1631, 1549],
    ejercicios: [
      { id: 1591, nombre: 'Estiramiento, roller cadera' },
      { id: 1593, nombre: 'Estiramiento del piriforme, sentado' },
      { id: 1055, nombre: 'Estiramiento de aductores asistido, tumbado de lado' },
      { id: 1631, nombre: 'Estiramiento, isquiotibial' },
      { id: 1549, nombre: 'Estiramiento en fitball, cadera flexor' }
    ]
  },
  {
    id: 'movilidad-columna-espalda',
    nombre: 'Movilidad de Columna y Postura',
    nombreEn: 'Spine Mobility & Posture',
    categoria: 'Movilidad',
    duracion: 20,
    nivel: 'Principiante',
    descripcion: 'Alivia la tensión acumulada en la espalda, mejora la postura y descomprime la columna lumbar y dorsal.',
    descripcionEn: 'Relieve accumulated back tension, improve posture and decompress lumbar and thoracic spine.',
    color: '#10B981',
    ejerciciosIds: [1956, 1700, 1720, 1724],
    ejercicios: [
      { id: 1956, nombre: 'Estiramiento, columna' },
      { id: 1700, nombre: 'Estiramiento, de rodillas, dorsal' },
      { id: 1720, nombre: 'Estiramiento, sentado, inferior espalda' },
      { id: 1724, nombre: 'Estiramiento, de pie, lateral' }
    ]
  },
  {
    id: 'movilidad-hombro-pecho',
    nombre: 'Apertura Torácica y Hombros',
    nombreEn: 'Thoracic Opening & Shoulders',
    categoria: 'Movilidad',
    duracion: 20,
    nivel: 'Intermedio',
    descripcion: 'Apertura de pecho y rotación escapular para liberar los hombros y contrarrestar la postura sentada.',
    descripcionEn: 'Chest opening and scapular rotation to free up shoulders and counter prolonged sitting.',
    color: '#10B981',
    ejerciciosIds: [1828, 1430, 1776, 1752],
    ejercicios: [
      { id: 1828, nombre: 'Estiramiento dinámico de pecho' },
      { id: 1430, nombre: 'Estiramiento de deltoides posterior' },
      { id: 1776, nombre: 'Estiramiento, frontal, pecho hombro' },
      { id: 1752, nombre: 'Estiramiento, tras la nuca, pecho' }
    ]
  },
  {
    id: 'cardio-tabata-salto',
    nombre: 'Cardio Tabata & Salto Intenso',
    nombreEn: 'Cardio Tabata & Explosive Jumps',
    categoria: 'Cardio',
    duracion: 20,
    nivel: 'Avanzado',
    descripcion: 'Ráfagas cortas a máxima frecuencia cardíaca con comba y saltos pliométricos para disparar la potencia.',
    descripcionEn: 'Short maximum-effort bursts with jump rope and plyometric jumps to spike explosive power.',
    color: '#EF4444',
    ejerciciosIds: [1281, 1280, 1282, 1576, 1279],
    ejercicios: [
      { id: 1281, nombre: 'Comba' },
      { id: 1280, nombre: 'Salto, jack' },
      { id: 1282, nombre: 'Escalador' },
      { id: 1576, nombre: 'Zancada, jump' },
      { id: 1279, nombre: 'Burpee, jack' }
    ]
  },
  {
    id: 'cardio-bajo-impacto',
    nombre: 'Cardio Aeróbico Sin Impacto',
    nombreEn: 'Low-Impact Aerobic Cardio',
    categoria: 'Cardio',
    duracion: 35,
    nivel: 'Principiante',
    descripcion: 'Cardio continuo protegiendo rodillas y articulaciones con elíptica, stepmill y ritmo moderado.',
    descripcionEn: 'Continuous cardio protecting knees and joints with elliptical, stepmill and steady moderate pace.',
    color: '#EF4444',
    ejerciciosIds: [1275, 1298, 1292, 1288],
    ejercicios: [
      { id: 1275, nombre: 'Bicicleta elíptica' },
      { id: 1298, nombre: 'Andando en stepmill' },
      { id: 1292, nombre: 'Bicicleta estática, correr' },
      { id: 1288, nombre: 'Carrera a zancada corta' }
    ]
  },
  {
    id: 'cardio-burn-funcional',
    nombre: 'Cardio Burn Funcional & Core',
    nombreEn: 'Functional Cardio Burn & Core',
    categoria: 'Cardio',
    duracion: 30,
    nivel: 'Intermedio',
    descripcion: 'Agilidad de pies, saltos dinámicos y picos de pulso combinados con estabilizadores de core.',
    descripcionEn: 'Foot agility, dynamic jumps and heart rate peaks combined with core stabilizers.',
    color: '#EF4444',
    ejerciciosIds: [1282, 1286, 1278, 1287, 1291],
    ejercicios: [
      { id: 1282, nombre: 'Escalador' },
      { id: 1286, nombre: 'Saltos, scissor' },
      { id: 1278, nombre: 'Rodilla contra pared, alto' },
      { id: 1287, nombre: 'Sentadilla, semi jump' },
      { id: 1291, nombre: 'Salto, star' }
    ]
  }
];
