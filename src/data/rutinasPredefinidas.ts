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
    color: '#4361EE',
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
    color: '#f59e0b',
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
    color: '#10b981',
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
    color: '#f97316',
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
    color: '#06b6d4',
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
    color: '#8b5cf6',
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
    color: '#ec4899',
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
    color: '#14b8a6',
    ejerciciosIds: [898, 1055, 1228],
    ejercicios: [
      { id: 898, nombre: 'Estiramiento tumbado boca abajo, asistido, rectus femoris' },
      { id: 1055, nombre: 'Estiramiento de aductores asistido, tumbado de lado' },
      { id: 1228, nombre: 'Estiramiento, con manos en la pared, gemelo' }
    ]
  }
];
