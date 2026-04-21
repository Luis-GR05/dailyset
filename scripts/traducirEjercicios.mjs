/**
 * Script de traducción masiva: lee todos los ejercicios de Supabase,
 * traduce nombre, instrucciones y descripción al español,
 * y actualiza cada fila directamente en la BD.
 *
 * Uso:  node scripts/traducirEjercicios.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zqegxqxmbxbbhpdiwyas.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxZWd4cXhtYnhiYmhwZGl3eWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMDQ4MzUsImV4cCI6MjA5MTc4MDgzNX0.LKuwZ59FULyRQFGi4Sd6JGXYLjs_WRy2Nny_cnPTfVg';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Utilidades ────────────────────────────────────────────────────────────────

function normalizeRawText(input) {
  return input.replaceAll('_', ' ').replaceAll('-', ' ').replace(/\s{2,}/g, ' ').trim();
}

function toSentenceCase(input) {
  const lowered = input.toLocaleLowerCase('es-ES');
  return lowered.replace(/(^|[.!?]\s+)(\p{L})/gu, (_m, sep, letter) =>
    `${sep}${letter.toLocaleUpperCase('es-ES')}`
  );
}

// ─── Motor de traducción ───────────────────────────────────────────────────────
// IMPORTANTE: phraseRules PRIMERO (frases compuestas, de más larga a más corta).
//             wordRules DESPUÉS (palabras sueltas, de más específica a más genérica).
//             Las preposiciones/artículos genéricos van AL FINAL de wordRules.

function translate(input) {
  if (!input) return input;
  const text = normalizeRawText(input);
  if (!text) return text;

  const phraseRules = [
    // ── Equipamiento especial ─────────────────────────────────────────────────
    [/\bab roller\b/gi, 'rueda abdominal'],
    [/\bab wheel\b/gi, 'rueda abdominal'],
    [/\bfoam roll(?:er)?\b/gi, 'rodillo de espuma'],
    [/\bmedicine ball\b/gi, 'balón medicinal'],
    [/\bexercise ball\b/gi, 'fitball'],
    [/\bez curl bar\b/gi, 'barra Z'],
    [/\bpull-up bar\b/gi, 'barra de dominadas'],
    [/\bfree weights\b/gi, 'pesas libres'],
    [/\bbody weight\b/gi, 'peso corporal'],
    [/\bbodyweight\b/gi, 'peso corporal'],
    [/\bsmith machine\b/gi, 'máquina Smith'],
    [/\bcable machine\b/gi, 'máquina de poleas'],
    [/\bleg press\b/gi, 'prensa de piernas'],
    [/\bleg curl\b/gi, 'curl de pierna'],
    [/\bleg extension\b/gi, 'extensión de pierna'],
    [/\bchest press\b/gi, 'press de pecho'],
    [/\bshoulder press\b/gi, 'press de hombros'],
    [/\bbench press\b/gi, 'press en banco'],
    [/\bincline press\b/gi, 'press inclinado'],
    [/\bdecline press\b/gi, 'press declinado'],
    [/\bhip adductor\b/gi, 'aductor de cadera'],
    [/\badductor\/groin\b/gi, 'aductores/ingle'],

    // ── Nombres de ejercicios compuestos ──────────────────────────────────────
    [/\bclean and press\b/gi, 'levanta y presiona'],
    [/\bpower clean\b/gi, 'cargada de potencia'],
    [/\bhang clean\b/gi, 'cargada suspendida'],
    [/\bclean and jerk\b/gi, 'arrancada y envión'],
    [/\bhammer curl\b/gi, 'curl de martillo'],
    [/\bbicep(?:s)? curl\b/gi, 'curl de bíceps'],
    [/\bpreacher curl\b/gi, 'curl en predicador'],
    [/\bconcentration curl\b/gi, 'curl de concentración'],
    [/\bincline curl\b/gi, 'curl inclinado'],
    [/\bcable curl\b/gi, 'curl en polea'],
    [/\bbarbell curl\b/gi, 'curl con barra'],
    [/\bdumbbell curl\b/gi, 'curl con mancuerna'],
    [/\bchest fly(?:es)?\b/gi, 'aperturas de pecho'],
    [/\bband hip adductions\b/gi, 'aducciones de cadera con banda'],
    [/\bband hip abductions\b/gi, 'abducciones de cadera con banda'],
    [/\bhip adductions\b/gi, 'aducciones de cadera'],
    [/\bhip abductions\b/gi, 'abducciones de cadera'],
    [/\bflyes\b/gi, 'aperturas'],
    [/\bfly\b/gi, 'apertura'],
    [/\bpull-ups\b/gi, 'dominadas'],
    [/\bpull-up\b/gi, 'dominada'],
    [/\bchin-ups\b/gi, 'dominadas supinas'],
    [/\bchin-up\b/gi, 'dominada supina'],
    [/\bpush-ups\b/gi, 'flexiones'],
    [/\bpush-up\b/gi, 'flexión'],
    [/\bsit-ups\b/gi, 'abdominales'],
    [/\bsit-up\b/gi, 'abdominal'],
    [/\bdeadlift\b/gi, 'peso muerto'],
    [/\blunges\b/gi, 'zancadas'],
    [/\blunge\b/gi, 'zancada'],

    // ── Partes del cuerpo compuestas ──────────────────────────────────────────
    [/\bupper back\b/gi, 'espalda alta'],
    [/\blower back\b/gi, 'espalda baja'],
    [/\bmiddle back\b/gi, 'espalda media'],
    [/\bfull body\b/gi, 'cuerpo completo'],
    [/\bbody only\b/gi, 'peso corporal'],
    [/\bupper arm\b/gi, 'brazo'],
    [/\blower arm\b/gi, 'antebrazo'],
    [/\bupper leg\b/gi, 'muslo'],
    [/\blower leg\b/gi, 'pantorrilla'],
    [/\bhip flexors?\b/gi, 'flexores de cadera'],
    [/\bcalf(?:ves)? muscles?\b/gi, 'gemelos'],
    [/\bquadricep(?:s)?\b/gi, 'cuádriceps'],
    [/\bhamstrings?\b/gi, 'isquiotibiales'],
    [/\bglute(?:al)? muscles?\b/gi, 'músculos glúteos'],
    [/\bcore muscles?\b/gi, 'músculos del abdomen'],
    [/\bbig toe\b/gi, 'dedo gordo del pie'],

    // ── Artículos + sustantivo (género correcto) — ANTES de the→el ────────────
    [/\bthe palms?\b/gi, 'las palmas'],
    [/\bthe hands?\b/gi, 'las manos'],
    [/\bthe arms?\b/gi, 'los brazos'],
    [/\bthe legs?\b/gi, 'las piernas'],
    [/\bthe feet\b/gi, 'los pies'],
    [/\bthe foot\b/gi, 'el pie'],
    [/\bthe knees?\b/gi, 'las rodillas'],
    [/\bthe elbows?\b/gi, 'los codos'],
    [/\bthe shoulders?\b/gi, 'los hombros'],
    [/\bthe hips?\b/gi, 'las caderas'],
    [/\bthe muscles?\b/gi, 'los músculos'],
    [/\bthe dumbbells?\b/gi, 'las mancuernas'],
    [/\bthe weights?\b/gi, 'los pesos'],
    [/\bthe kettlebells?\b/gi, 'las pesas rusas'],
    [/\bthe wrists?\b/gi, 'las muñecas'],
    [/\bthe ankles?\b/gi, 'los tobillos'],
    [/\bthe toes?\b/gi, 'los dedos del pie'],
    [/\bthe fingers?\b/gi, 'los dedos'],
    [/\bthe heels?\b/gi, 'los talones'],
    [/\bthe glutes?\b/gi, 'los glúteos'],
    [/\bthe weight\b/gi, 'el peso'],
    [/\bthe bar\b/gi, 'la barra'],
    [/\bthe floor\b/gi, 'el suelo'],
    [/\bthe ground\b/gi, 'el suelo'],
    [/\bthe ceiling\b/gi, 'el techo'],
    [/\bthe way\b/gi, 'el recorrido'],
    [/\bthe body\b/gi, 'el cuerpo'],
    [/\bthe back\b/gi, 'la espalda'],
    [/\bthe torso\b/gi, 'el torso'],
    [/\bthe core\b/gi, 'el abdomen'],
    [/\bthe chest\b/gi, 'el pecho'],
    [/\bthe head\b/gi, 'la cabeza'],
    [/\bthe neck\b/gi, 'el cuello'],
    [/\bthe spine\b/gi, 'la columna'],
    [/\bthe thumb\b/gi, 'el pulgar'],
    [/\bthe bench\b/gi, 'el banco'],
    [/\bthe rack\b/gi, 'el soporte'],
    [/\bthe cable\b/gi, 'la polea'],
    [/\bthe band\b/gi, 'la banda'],
    [/\ba band\b/gi, 'una banda'],
    [/\bthe side\b/gi, 'el lado'],
    [/\bthe sides\b/gi, 'los lados'],
    [/\bthe post\b/gi, 'el poste'],
    [/\bthe posts\b/gi, 'los postes'],
    [/\bthe apparatus\b/gi, 'el aparato'],

    // ── Respiración ───────────────────────────────────────────────────────────
    [/\bas you breathe out\b/gi, 'mientras exhalas'],
    [/\bas you breathe in\b/gi, 'mientras inhalas'],
    [/\bas you exhale\b/gi, 'mientras exhalas'],
    [/\bas you inhale\b/gi, 'mientras inhalas'],
    [/\bbreathe out\b/gi, 'exhala'],
    [/\bbreathe in\b/gi, 'inhala'],
    [/\bbreath out\b/gi, 'exhala'],
    [/\bbreath in\b/gi, 'inhala'],

    // ── Izquierda / derecha ───────────────────────────────────────────────────
    [/\bright (arm|hand|leg|foot|side|knee|elbow|shoulder|hip|wrist|ankle)\b/gi, '$1 derecho'],
    [/\bleft (arm|hand|leg|foot|side|knee|elbow|shoulder|hip|wrist|ankle)\b/gi, '$1 izquierdo'],
    [/\bright side\b/gi, 'lado derecho'],
    [/\bleft side\b/gi, 'lado izquierdo'],

    // ── Nivel / altura ────────────────────────────────────────────────────────
    [/\bat shoulder level\b/gi, 'a la altura del hombro'],
    [/\bat chest level\b/gi, 'a la altura del pecho'],
    [/\bat hip level\b/gi, 'a la altura de la cadera'],
    [/\bat waist level\b/gi, 'a la altura de la cintura'],
    [/\bat (\w+) level\b/gi, 'a la altura del $1'],

    // ── Back to / come back / go back ─────────────────────────────────────────
    [/\bbring(?:ing)? (?:\w+ )?back to(?: the| your)?\b/gi, 'lleva de vuelta a'],
    [/\bback to starting position\b/gi, 'de vuelta a la posición inicial'],
    [/\bback to (the |your )?(start|beginning|initial position|starting position)\b/gi, 'de vuelta a la posición inicial'],
    [/\bback to\b/gi, 'de vuelta a'],
    [/\bcome back\b/gi, 'vuelve'],
    [/\bgo back\b/gi, 'vuelve'],

    // ── Frases de instrucción completas ───────────────────────────────────────
    [/\bthis will be your starting position\b/gi, 'esta será tu posición inicial'],
    [/\bthis is your starting position\b/gi, 'esta es tu posición inicial'],
    [/\brepeat for the recommended (?:number|amount) of repetitions\b/gi, 'repite el número recomendado de repeticiones'],
    [/\bthe recommended (number|amount) of repetitions\b/gi, 'el número recomendado de repeticiones'],
    [/\bkeep(?:ing)? (?:the |your )?upper arm(?:s)? stationary\b/gi, 'mantén los brazos inmóviles'],
    [/\bonly the forearms? should move\b/gi, 'solo los antebrazos deben moverse'],
    [/\bat the top of the contraction\b/gi, 'al máximo de la contracción'],
    [/\bswitch to the other (?:leg|side|arm)\b/gi, 'cambia al otro lado'],
    [/\bstep away from the rack\b/gi, 'aléjate del soporte'],
    [/\bfor safety purposes\b/gi, 'por seguridad'],
    [/\breverse the motion\b/gi, 'invierte el movimiento'],
    [/\bat all times\b/gi, 'en todo momento'],
    [/\bin front of\b/gi, 'delante de'],
    [/\bon top of\b/gi, 'encima de'],
    [/\bas fast as possible\b/gi, 'lo más rápido posible'],
    [/\bas quickly as possible\b/gi, 'lo más rápido posible'],
    [/\bas far as you can\b/gi, 'todo lo que puedas'],
    [/\bas far as possible\b/gi, 'lo máximo posible'],
    [/\bas far as\b/gi, 'todo lo que'],
    [/\bas low as possible\b/gi, 'todo lo que puedas'],
    [/\bas high as possible\b/gi, 'todo lo que puedas hacia arriba'],

    // ── On all fours / position ───────────────────────────────────────────────
    [/\bon all fours\b/gi, 'en cuatro apoyos'],
    [/\ball fours\b/gi, 'cuatro apoyos'],
    [/\bin a kneeling position\b/gi, 'en posición de rodillas'],
    [/\bkneeling position\b/gi, 'posición de rodillas'],
    [/\ba kneeling\b/gi, 'de rodillas'],
    [/\bin a kneeling\b/gi, 'de rodillas en'],
    [/\bpush(?:-| )?up position\b/gi, 'posición de flexiones'],

    // ── Yourself compounds ────────────────────────────────────────────────────
    [/\bpull(?:ing)? yourself\b/gi, 'jálate a ti mismo'],
    [/\bpush(?:ing)? yourself\b/gi, 'empújate a ti mismo'],
    [/\blower(?:ing)? yourself\b/gi, 'bájate'],
    [/\blift(?:ing)? yourself\b/gi, 'levántate'],

    // ── Go compounds ──────────────────────────────────────────────────────────
    [/\bgo down\b/gi, 'baja'],
    [/\bgo up\b/gi, 'sube'],
    [/\bgo as far\b/gi, 've todo lo que'],
    [/\bgo as low\b/gi, 'baja todo lo que'],
    [/\bgo slowly\b/gi, 've lentamente'],
    [/\bgo lentamente\b/gi, 've lentamente'],

    // ── Clean (levantamiento) ─────────────────────────────────────────────────
    [/\bclean (the |your |two |one |both |each |\d+ )/gi, 'levanta $1'],

    // ── Do so / do this ───────────────────────────────────────────────────────
    [/\bdo so\b/gi, 'hacerlo'],
    [/\bdo this\b/gi, 'hacer esto'],
    [/\bdoing so\b/gi, 'hacerlo'],
    [/\bdoing this\b/gi, 'hacer esto'],
    [/\bdoing\b/gi, 'haciendo'],

    // ── Turning it so ─────────────────────────────────────────────────────────
    [/\bturning it so\b/gi, 'girando de manera que'],
    [/\bturning so\b/gi, 'girando de manera que'],
    [/\bso that\b/gi, 'de manera que'],

    // ── Getting it ───────────────────────────────────────────────────────────
    [/\bgetting it around\b/gi, 'rodeando'],
    [/\bgetting it\b/gi, 'colocándolo'],

    // ── Switch ────────────────────────────────────────────────────────────────
    [/\bswitch (sides?|legs?|arms?)\b/gi, 'cambia al otro lado'],
    [/\bswitch lados\b/gi, 'cambia de lado'],
    [/\bswitch\b/gi, 'cambia'],

    // ── Anchor / If needed ───────────────────────────────────────────────────
    [/\banchor (the |your |un |a )?band\b/gi, 'fija la banda'],
    [/\banchor\b/gi, 'fija'],
    [/\bif needed\b/gi, 'si es necesario'],

    // ── Around ───────────────────────────────────────────────────────────────
    [/\baround (the |your |un |el |la )/gi, 'alrededor de $1'],
    [/\baround\b/gi, 'alrededor de'],

    // ── Desired repetition count ──────────────────────────────────────────────
    [/\bdesired rep(?:etition)? count\b/gi, 'número de repeticiones deseado'],
    [/\brep count\b/gi, 'número de repeticiones'],
    [/\brepetici[oó]n count\b/gi, 'número de repeticiones'],

    // ── Onto / into ───────────────────────────────────────────────────────────
    [/\bonto the\b/gi, 'sobre el'],
    [/\bonto your\b/gi, 'sobre tu'],
    [/\bonto\b/gi, 'sobre'],
    [/\binto the\b/gi, 'hacia el'],
    [/\binto your\b/gi, 'hacia tu'],
    [/\binto\b/gi, 'hacia'],

    // ── Faces (verb) ──────────────────────────────────────────────────────────
    [/\bfaces your\b/gi, 'mira hacia tu'],
    [/\bfaces the\b/gi, 'mira hacia el'],
    [/\bfaces\b/gi, 'mira hacia'],
    [/\bfacing your\b/gi, 'mirando hacia tu'],
    [/\bfacing the\b/gi, 'mirando hacia el'],
    [/\bfacing\b/gi, 'mirando hacia'],

    // ── Be sure / Make sure ───────────────────────────────────────────────────
    [/\bbe sure to\b/gi, 'asegúrate de'],
    [/\bbe sure\b/gi, 'asegúrate'],
    [/\bmake sure(?: to)?\b/gi, 'asegúrate de'],

    // ── Continue ──────────────────────────────────────────────────────────────
    [/\bcontinue to\b/gi, 'continúa'],
    [/\bcontinue\b/gi, 'continúa'],
    [/\bcontinuing\b/gi, 'continuando'],
    [/\bcontinúa for\b/gi, 'continúa durante'],

    // ── Lie / Lying ───────────────────────────────────────────────────────────
    [/\blie down on your back\b/gi, 'túmbate boca arriba'],
    [/\blie on the floor\b/gi, 'túmbate en el suelo'],
    [/\blie on your back\b/gi, 'túmbate boca arriba'],
    [/\blie flat on your back\b/gi, 'túmbate boca arriba'],
    [/\blie flat\b/gi, 'túmbate'],
    [/\blie face down\b/gi, 'túmbate boca abajo'],
    [/\blie\b/gi, 'túmbate'],

    // ── Step ─────────────────────────────────────────────────────────────────
    [/\bstep forward\b/gi, 'da un paso adelante'],
    [/\bstep back(?:ward)?\b/gi, 'da un paso atrás'],

    // ── Palms ────────────────────────────────────────────────────────────────
    [/\bpalms facing\b/gi, 'palmas hacia'],
    [/\bpalms down\b/gi, 'palmas hacia abajo'],
    [/\bpalms up\b/gi, 'palmas hacia arriba'],
    [/\barms extended\b/gi, 'brazos extendidos'],
    [/\barms at your sides\b/gi, 'brazos a los lados'],

    // ── With your (verbo + posesivo) ──────────────────────────────────────────
    [/\bwith both\b/gi, 'con ambas'],
    [/\bwith your\b/gi, 'con tu'],
    [/\bon your back\b/gi, 'boca arriba'],
    [/\bon your stomach\b/gi, 'boca abajo'],
    [/\bon your\b/gi, 'en tu'],
    [/\bof your\b/gi, 'de tu'],
    [/\bof the\b/gi, 'de la'],
    [/\bin the\b/gi, 'en el'],
    [/\bat the\b/gi, 'en el'],
    [/\bby the\b/gi, 'por el'],
    [/\bto the\b/gi, 'hacia el'],

    // ── Toward/towards ────────────────────────────────────────────────────────
    [/\btoward(?:s)? your\b/gi, 'hacia tu'],
    [/\btoward(?:s)? the\b/gi, 'hacia el'],
    [/\btoward(?:s)?\b/gi, 'hacia'],

    // ── Verbo + your (phraseRules para contexto) ──────────────────────────────
    [/\bflex your\b/gi, 'flexiona tu'],
    [/\braise your\b/gi, 'eleva tu'],
    [/\blower your\b/gi, 'baja tu'],
    [/\bextend your\b/gi, 'extiende tu'],
    [/\bhold your\b/gi, 'mantén tu'],
    [/\bplace your\b/gi, 'coloca tu'],
    [/\bkeep your\b/gi, 'mantén tu'],
    [/\bmove your\b/gi, 'mueve tu'],
    [/\blift your\b/gi, 'levanta tu'],
    [/\bpush your\b/gi, 'empuja tu'],
    [/\bpull your\b/gi, 'jala tu'],
    [/\bbend your\b/gi, 'dobla tu'],
    [/\brotate your\b/gi, 'rota tu'],
    [/\bopen your\b/gi, 'abre tu'],
    [/\bclose your\b/gi, 'cierra tu'],
    [/\bsqueeze your\b/gi, 'aprieta tu'],
    [/\bcontract your\b/gi, 'contrae tu'],
    [/\bcurl your\b/gi, 'flexiona tu'],
    [/\bbring your\b/gi, 'lleva tu'],
    [/\bgrip your\b/gi, 'agarra tu'],
    [/\bcross your\b/gi, 'cruza tu'],
    [/\bwrap your\b/gi, 'rodea tu'],
    [/\bput your\b/gi, 'coloca tu'],
    [/\buse your\b/gi, 'usa tu'],
    [/\bgrab your\b/gi, 'agarra tu'],
    [/\bdrive your\b/gi, 'empuja tu'],

    // ── Perpendicular / nivel ─────────────────────────────────────────────────
    [/\bperpendicular to the\b/gi, 'perpendicular al'],
    [/\bshoulder[- ]width apart\b/gi, 'al ancho de los hombros'],
    [/\bhip[- ]width apart\b/gi, 'al ancho de las caderas'],
    [/\bfeet shoulder[- ]width apart\b/gi, 'pies al ancho de los hombros'],
    [/\bfeet flat\b/gi, 'pies planos'],

    // ── Should / Bent ─────────────────────────────────────────────────────────
    [/\bshould be bent\b/gi, 'deben estar dobladas'],
    [/\byour legs should be\b/gi, 'tus piernas deben estar'],
    [/\bshould be\b/gi, 'debe estar'],
    [/\bshould\b/gi, 'debe'],
    [/\bknees bent\b/gi, 'rodillas dobladas'],
    [/\belbows bent\b/gi, 'codos doblados'],
    [/\bbent at the\b/gi, 'doblado en las'],
    [/\bbent at\b/gi, 'doblado en'],
    [/\bbend the\b/gi, 'dobla la'],

    // ── Degrees ───────────────────────────────────────────────────────────────
    [/\b(\d+) degrees\b/gi, '$1 grados'],

    // ── Close to ─────────────────────────────────────────────────────────────
    [/\bclose to the\b/gi, 'pegado al'],
    [/\bclose to your\b/gi, 'pegado a tu'],
    [/\bclose to\b/gi, 'pegado a'],

    // ── In this manner ────────────────────────────────────────────────────────
    [/\bin this manner\b/gi, 'de esta manera'],
    [/\bin this way\b/gi, 'de esta manera'],
    [/\bin an alternating manner\b/gi, 'de manera alterna'],

    // ── At the top / bottom ───────────────────────────────────────────────────
    [/\bat the top\b/gi, 'arriba del todo'],
    [/\bat the bottom\b/gi, 'abajo del todo'],

    // ── 3/4 of the way ────────────────────────────────────────────────────────
    [/\b3\/4 of the way\b/gi, '¾ del recorrido'],
    [/\bof the way\b/gi, 'del recorrido'],
    [/\bway down\b/gi, 'del recorrido hacia abajo'],
    [/\bway up\b/gi, 'del recorrido hacia arriba'],

    // ── Equals ────────────────────────────────────────────────────────────────
    [/\bequals one repetition\b/gi, 'equivale a una repetición'],
    [/\bequals one rep\b/gi, 'equivale a una repetición'],
    [/\bequals\b/gi, 'equivale a'],

    // ── Straight ─────────────────────────────────────────────────────────────
    [/\bstraight out\b/gi, 'estirada'],
    [/\bstraight up\b/gi, 'hacia arriba'],
    [/\bstraight\b/gi, 'recto'],

    // ── Partner ───────────────────────────────────────────────────────────────
    [/\bhave your partner\b/gi, 'pide a tu compañero que'],
    [/\bwhile your partner\b/gi, 'mientras tu compañero'],
    [/\byour partner\b/gi, 'tu compañero'],
    [/\bpartner\b/gi, 'compañero'],

    // ── As tu/tú (post-traducción residual) ───────────────────────────────────
    [/\bas (?:tu|tú)\b/gi, 'mientras tú'],
    [/\bwhile (?:tu|tú)\b/gi, 'mientras tú'],

    // ── Or more / or injury ───────────────────────────────────────────────────
    [/\bor more seconds\b/gi, 'o más segundos'],
    [/\bor more (?:reps?|repetitions?)\b/gi, 'o más repeticiones'],
    [/\bor more\b/gi, 'o más'],
    [/\bor injury\b/gi, 'o lesión'],

    // ── Now relax ─────────────────────────────────────────────────────────────
    [/\bnow,?\s*relax\b/gi, 'ahora, relaja'],

    // ── Being held / arm length ───────────────────────────────────────────────
    [/\bbeing held\b/gi, 'sostenido'],
    [/\bat arm(?:'s)? length\b/gi, 'con los brazos extendidos'],

    // ── Pausing ───────────────────────────────────────────────────────────────
    [/\bpausing briefly(?: at the top)?\b/gi, 'haciendo una breve pausa'],
    [/\bbriefly\b/gi, 'brevemente'],

    // ── Starting position ─────────────────────────────────────────────────────
    [/\byour starting position\b/gi, 'tu posición inicial'],
    [/\bstarting position\b/gi, 'posición inicial'],
    [/\bthis is your\b/gi, 'esta es tu'],

    // ── Attempt ───────────────────────────────────────────────────────────────
    [/\battempt to\b/gi, 'intenta'],
    [/\battempt\b/gi, 'intenta'],
    [/\bfocus on\b/gi, 'concéntrate en'],
    [/\bfocus\b/gi, 'concéntrate'],

    // ── Raised towards ceiling ────────────────────────────────────────────────
    [/\braised towards? (?:the )?(?:ceiling|sky)\b/gi, 'elevados hacia el techo'],
    [/\braised towards?\b/gi, 'levantados hacia'],
  ];

  // ── wordRules: palabras sueltas ────────────────────────────────────────────
  // Orden: específico → genérico. Las preposiciones/artículos van AL FINAL.

  const wordRules = [
    // Músculos
    [/\babdominals\b/gi, 'abdominales'],
    [/\babdominal\b/gi, 'abdominal'],
    [/\badductions\b/gi, 'aducciones'],
    [/\badduction\b/gi, 'aducción'],
    [/\babductions\b/gi, 'abducciones'],
    [/\babduction\b/gi, 'abducción'],
    [/\badductors\b/gi, 'aductores'],
    [/\badductor\b/gi, 'aductor'],
    [/\bgroin\b/gi, 'ingle'],
    [/\bcalves\b/gi, 'gemelos'],
    [/\bcalf\b/gi, 'gemelo'],
    [/\bhamstrings\b/gi, 'isquiotibiales'],
    [/\bhamstring\b/gi, 'isquiotibial'],
    [/\bquadriceps\b/gi, 'cuádriceps'],
    [/\bquads\b/gi, 'cuádriceps'],
    [/\btraps\b/gi, 'trapecio'],
    [/\blats\b/gi, 'dorsales'],
    [/\bforearms\b/gi, 'antebrazos'],
    [/\bforearm\b/gi, 'antebrazo'],
    [/\bglutes\b/gi, 'glúteos'],
    [/\bglute\b/gi, 'glúteo'],
    [/\bneck\b/gi, 'cuello'],
    [/\bchest\b/gi, 'pecho'],
    [/\bshoulders\b/gi, 'hombros'],
    [/\bshoulder\b/gi, 'hombro'],
    [/\bbiceps\b/gi, 'bíceps'],
    [/\btriceps\b/gi, 'tríceps'],
    [/\belbows\b/gi, 'codos'],
    [/\belbow\b/gi, 'codo'],
    [/\bwrists\b/gi, 'muñecas'],
    [/\bwrist\b/gi, 'muñeca'],
    [/\bpalms\b/gi, 'palmas'],
    [/\bpalm\b/gi, 'palma'],
    [/\bfingers\b/gi, 'dedos'],
    [/\bfinger\b/gi, 'dedo'],
    [/\barms\b/gi, 'brazos'],
    [/\barm\b/gi, 'brazo'],
    [/\bdeltoid\b/gi, 'deltoide'],
    [/\bspine\b/gi, 'columna'],
    [/\btorso\b/gi, 'torso'],
    [/\bcore\b/gi, 'abdomen'],
    [/\babs\b/gi, 'abdominales'],
    [/\bmuscles\b/gi, 'músculos'],
    [/\bmuscle\b/gi, 'músculo'],
    [/\bceiling\b/gi, 'techo'],
    [/\bankles\b/gi, 'tobillos'],
    [/\bankle\b/gi, 'tobillo'],
    [/\bshins\b/gi, 'espinillas'],
    [/\bshin\b/gi, 'espinilla'],
    [/\bheels\b/gi, 'talones'],
    [/\bheel\b/gi, 'talón'],
    [/\bwaist\b/gi, 'cintura'],
    [/\bribcage\b/gi, 'caja torácica'],
    [/\bthumb\b/gi, 'pulgar'],
    [/\bflexors\b/gi, 'flexores'],
    [/\bextensors\b/gi, 'extensores'],

    // Equipamiento
    [/\bbarbell\b/gi, 'barra'],
    [/\bdumbbells\b/gi, 'mancuernas'],
    [/\bdumbbell\b/gi, 'mancuerna'],
    [/\bkettlebells\b/gi, 'pesas rusas'],
    [/\bkettlebell\b/gi, 'pesa rusa'],
    [/\bcable\b/gi, 'polea'],
    [/\bmachine\b/gi, 'máquina'],
    [/\bband\b/gi, 'banda'],
    [/\bbench\b/gi, 'banco'],
    [/\bbar\b/gi, 'barra'],
    [/\brack\b/gi, 'soporte'],
    [/\bmat\b/gi, 'esterilla'],
    [/\bweight\b/gi, 'peso'],
    [/\bweights\b/gi, 'pesos'],
    [/\bhammer\b/gi, 'martillo'],
    [/\bapparatus\b/gi, 'aparato'],
    [/\byoke\b/gi, 'yugo'],
    [/\bpost\b/gi, 'poste'],
    [/\bobject\b/gi, 'objeto'],

    // Tipos de ejercicio / movimientos
    [/\bcardio\b/gi, 'cardio'],
    [/\bstrength\b/gi, 'fuerza'],
    [/\bplyometrics\b/gi, 'pliométrico'],
    [/\bsquat\b/gi, 'sentadilla'],
    [/\bplank\b/gi, 'plancha'],
    [/\brows\b/gi, 'remo'],
    [/\brow\b/gi, 'remo'],
    [/\bcurl\b/gi, 'curl'],
    [/\bbound\b/gi, 'salto largo'],
    [/\bsprint\b/gi, 'sprint'],
    [/\bcleans\b/gi, 'levanta'],
    [/\bclean\b/gi, 'levanta'],
    [/\bflyes\b/gi, 'aperturas'],

    // Posiciones
    [/\bincline\b/gi, 'inclinado'],
    [/\bdecline\b/gi, 'declinado'],
    [/\bseated\b/gi, 'sentado'],
    [/\bstanding\b/gi, 'de pie'],
    [/\blying\b/gi, 'tumbado'],
    [/\boverhead\b/gi, 'sobre la cabeza'],
    [/\breverse\b/gi, 'invertido'],
    [/\bfront\b/gi, 'frontal'],
    [/\blateral\b/gi, 'lateral'],
    [/\brear\b/gi, 'posterior'],
    [/\balternating\b/gi, 'alterno'],
    [/\balternate\b/gi, 'alterno'],
    [/\bdiagonal\b/gi, 'diagonal'],
    [/\bother\b/gi, 'otro'],
    [/\bextended\b/gi, 'extendido'],
    [/\bcontracted\b/gi, 'contraído'],
    [/\bbent\b/gi, 'doblado'],
    [/\bflat\b/gi, 'plano'],
    [/\bupright\b/gi, 'erguido'],
    [/\bneutral\b/gi, 'neutral'],
    [/\bparallel\b/gi, 'paralelo'],
    [/\bstationary\b/gi, 'inmóvil'],
    [/\bforward\b/gi, 'hacia adelante'],
    [/\bupward\b/gi, 'hacia arriba'],
    [/\bdownward\b/gi, 'hacia abajo'],
    [/\boutward\b/gi, 'hacia afuera'],
    [/\binward\b/gi, 'hacia adentro'],
    [/\bstretched\b/gi, 'estirado'],
    [/\bflexed\b/gi, 'flexionado'],
    [/\barched\b/gi, 'arqueada'],
    [/\bpressed\b/gi, 'presionada'],
    [/\bneeded\b/gi, 'necesario'],
    [/\bdesired\b/gi, 'deseado'],
    [/\bsolid\b/gi, 'sólido'],
    [/\bsteady\b/gi, 'estable'],

    // Partes del cuerpo (solo)
    [/\bfeet\b/gi, 'pies'],
    [/\bfoot\b/gi, 'pie'],
    [/\blegs\b/gi, 'piernas'],
    [/\bleg\b/gi, 'pierna'],
    [/\bknees\b/gi, 'rodillas'],
    [/\bknee\b/gi, 'rodilla'],
    [/\bhips\b/gi, 'caderas'],
    [/\bhip\b/gi, 'cadera'],
    [/\bhead\b/gi, 'cabeza'],
    [/\bhands\b/gi, 'manos'],
    [/\bhand\b/gi, 'mano'],
    [/\bground\b/gi, 'suelo'],
    [/\bfloor\b/gi, 'suelo'],
    [/\bsides\b/gi, 'lados'],
    [/\bside\b/gi, 'lado'],
    [/\btoes\b/gi, 'dedos del pie'],
    [/\btoe\b/gi, 'dedo del pie'],
    [/\blength\b/gi, 'largo'],
    [/\blevel\b/gi, 'altura'],
    [/\bback\b/gi, 'espalda'],
    [/\bbody\b/gi, 'cuerpo'],
    [/\bupper\b/gi, 'superior'],
    [/\blower\b/gi, 'inferior'],

    // Verbos
    [/\babduct\b/gi, 'separa'],
    [/\battempt\b/gi, 'intenta'],
    [/\brepeat\b/gi, 'repite'],
    [/\brepetitions\b/gi, 'repeticiones'],
    [/\brepetition\b/gi, 'repetición'],
    [/\breps\b/gi, 'repeticiones'],
    [/\brep\b/gi, 'repetición'],
    [/\bsecure\b/gi, 'asegura'],
    [/\bbegin\b/gi, 'comienza'],
    [/\bstart\b/gi, 'comienza'],
    [/\bperformed\b/gi, 'realizado'],
    [/\btighten\b/gi, 'aprieta'],
    [/\bsqueeze\b/gi, 'aprieta'],
    [/\bcontract\b/gi, 'contrae'],
    [/\bcontracting\b/gi, 'contrayendo'],
    [/\bholding\b/gi, 'manteniendo'],
    [/\bheld\b/gi, 'sostenido'],
    [/\bstretch\b/gi, 'estira'],
    [/\binhale\b/gi, 'inhala'],
    [/\bexhale\b/gi, 'exhala'],
    [/\bbreathe\b/gi, 'respira'],
    [/\bpause\b/gi, 'haz una pausa'],
    [/\bslowly\b/gi, 'lentamente'],
    [/\bcontrolled\b/gi, 'controlado'],
    [/\bcontrolling\b/gi, 'controlando'],
    [/\bsmoothly\b/gi, 'suavemente'],
    [/\bfirmly\b/gi, 'firmemente'],
    [/\bgently\b/gi, 'suavemente'],
    [/\blift\b/gi, 'levanta'],
    [/\bresting\b/gi, 'apoyado'],
    [/\bproperly\b/gi, 'correctamente'],
    [/\bcrossed\b/gi, 'cruzados'],
    [/\bwidth\b/gi, 'ancho'],
    [/\bmedium\b/gi, 'medio'],
    [/\bstance\b/gi, 'postura'],
    [/\bslightly\b/gi, 'ligeramente'],
    [/\bmaintain\b/gi, 'mantén'],
    [/\bplace\b/gi, 'coloca'],
    [/\bextend\b/gi, 'extiende'],
    [/\bflex\b/gi, 'flexiona'],
    [/\breturn\b/gi, 'vuelve'],
    [/\braise\b/gi, 'eleva'],
    [/\bhold\b/gi, 'mantén'],
    [/\brelax\b/gi, 'relaja'],
    [/\bpush\b/gi, 'empuja'],
    [/\bpull\b/gi, 'jala'],
    [/\bprevents\b/gi, 'impide'],
    [/\bprevent\b/gi, 'evita'],
    [/\bapart\b/gi, 'separados'],
    [/\bgrip\b/gi, 'agarra'],
    [/\bgrasp\b/gi, 'agarra'],
    [/\bgrab\b/gi, 'agarra'],
    [/\bdrive\b/gi, 'empuja'],
    [/\bsit\b/gi, 'siéntate'],
    [/\bstand\b/gi, 'ponte de pie'],
    [/\block\b/gi, 'bloquea'],
    [/\bkeep\b/gi, 'mantén'],
    [/\btuck\b/gi, 'mete'],
    [/\barch\b/gi, 'arquea'],
    [/\bengage\b/gi, 'activa'],
    [/\bactivate\b/gi, 'activa'],
    [/\bbring\b/gi, 'lleva'],
    [/\bmove\b/gi, 'mueve'],
    [/\bkneel\b/gi, 'arrodíllate'],
    [/\broll\b/gi, 'rueda'],
    [/\buse\b/gi, 'usa'],
    [/\bgo\b/gi, 've'],
    [/\bracking\b/gi, 'colocando en el soporte'],
    [/\bdriving\b/gi, 'empujando'],
    [/\bthrusting\b/gi, 'empujando'],
    [/\blooking\b/gi, 'mirando'],
    [/\bwalking\b/gi, 'caminando'],

    // Gerundios (-ing)
    [/\bextending\b/gi, 'extendiendo'],
    [/\bkeeping\b/gi, 'manteniendo'],
    [/\bpulling\b/gi, 'jalando'],
    [/\bpushing\b/gi, 'empujando'],
    [/\blifting\b/gi, 'levantando'],
    [/\blowering\b/gi, 'bajando'],
    [/\braising\b/gi, 'elevando'],
    [/\bbending\b/gi, 'doblando'],
    [/\brotating\b/gi, 'rotando'],
    [/\bmoving\b/gi, 'moviendo'],
    [/\bjumping\b/gi, 'saltando'],
    [/\bswinging\b/gi, 'balanceando'],
    [/\bflexing\b/gi, 'flexionando'],
    [/\bsquatting\b/gi, 'haciendo sentadilla'],
    [/\bwrapping\b/gi, 'envolviendo'],
    [/\bgripping\b/gi, 'agarrando'],
    [/\bbracing\b/gi, 'sujetando'],
    [/\bpointing\b/gi, 'apuntando'],
    [/\breturning\b/gi, 'volviendo'],
    [/\btouching\b/gi, 'tocando'],
    [/\bpassing\b/gi, 'pasando'],
    [/\btilting\b/gi, 'inclinando'],
    [/\bpivoting\b/gi, 'girando'],
    [/\bstarting\b/gi, 'comenzando'],
    [/\bturning\b/gi, 'girando'],
    [/\brolling\b/gi, 'rodando'],
    [/\bstretching\b/gi, 'estiramiento'],
    [/\bpressing\b/gi, 'presionando'],
    [/\bkneeling\b/gi, 'de rodillas'],
    [/\bgetting\b/gi, 'consiguiendo'],
    [/\busing\b/gi, 'usando'],

    // Verbos extra
    [/\bswitch\b/gi, 'cambia'],
    [/\banchor\b/gi, 'fija'],
    [/\bput\b/gi, 'coloca'],
    [/\bdo\b/gi, 'haz'],
    [/\bdoes\b/gi, 'hace'],
    [/\bimmediately\b/gi, 'inmediatamente'],
    [/\bdirectly\b/gi, 'directamente'],
    [/\bfaces\b/gi, 'mira hacia'],
    [/\bcount\b/gi, 'número'],
    [/\byourself\b/gi, 'a ti mismo'],
    [/\bthem\b/gi, 'ellos'],
    [/\bsimilar\b/gi, 'similar'],

    // Adjetivos
    [/\bcomfortable\b/gi, 'cómodo'],
    [/\badequate\b/gi, 'adecuado'],
    [/\bappropriate\b/gi, 'apropiado'],
    [/\bproper\b/gi, 'correcto'],
    [/\bcorrect\b/gi, 'correcto'],
    [/\bsafe\b/gi, 'seguro'],
    [/\bsafety\b/gi, 'seguridad'],
    [/\binjury\b/gi, 'lesión'],
    [/\binjured\b/gi, 'lesionado'],
    [/\bpain\b/gi, 'dolor'],
    [/\bstiff\b/gi, 'rígido'],
    [/\btight\b/gi, 'tenso'],
    [/\bloose\b/gi, 'suelto'],
    [/\bfirm\b/gi, 'firme'],
    [/\bquickly\b/gi, 'rápidamente'],
    [/\bquick\b/gi, 'rápido'],
    [/\bfast\b/gi, 'rápido'],
    [/\bslow\b/gi, 'lento'],
    [/\bshort\b/gi, 'corto'],
    [/\blong\b/gi, 'largo'],
    [/\bhigh\b/gi, 'alto'],
    [/\blow\b/gi, 'bajo'],
    [/\bboth\b/gi, 'ambas'],
    [/\ball\b/gi, 'todos'],
    [/\bfull\b/gi, 'completo'],
    [/\bhalf\b/gi, 'medio'],
    [/\bonly\b/gi, 'solo'],
    [/\bbrief\b/gi, 'breve'],
    [/\bgradually\b/gi, 'gradualmente'],
    [/\bfully\b/gi, 'completamente'],
    [/\bcompletely\b/gi, 'completamente'],
    [/\bpossible\b/gi, 'posible'],
    [/\busually\b/gi, 'generalmente'],
    [/\bsometimes\b/gi, 'a veces'],
    [/\bgiven\b/gi, 'determinado'],
    [/\bsmall\b/gi, 'pequeño'],
    [/\bhigher\b/gi, 'más alto'],
    [/\blower\b/gi, 'inferior'],
    [/\bhard\b/gi, 'fuerte'],
    [/\bheavy\b/gi, 'pesado'],
    [/\blight\b/gi, 'ligero'],

    // Sustantivos
    [/\bseconds\b/gi, 'segundos'],
    [/\bsecond\b/gi, 'segundo'],
    [/\bminutes\b/gi, 'minutos'],
    [/\bminute\b/gi, 'minuto'],
    [/\bsets\b/gi, 'series'],
    [/\bset\b/gi, 'serie'],
    [/\brange\b/gi, 'rango'],
    [/\bmotion\b/gi, 'movimiento'],
    [/\bmovement\b/gi, 'movimiento'],
    [/\bposition\b/gi, 'posición'],
    [/\bposture\b/gi, 'postura'],
    [/\bform\b/gi, 'forma'],
    [/\btechnique\b/gi, 'técnica'],
    [/\bexercise\b/gi, 'ejercicio'],
    [/\bworkout\b/gi, 'entrenamiento'],
    [/\bcontraction\b/gi, 'contracción'],
    [/\bextension\b/gi, 'extensión'],
    [/\bflexion\b/gi, 'flexión'],
    [/\bangle\b/gi, 'ángulo'],
    [/\bpath\b/gi, 'recorrido'],
    [/\bheight\b/gi, 'altura'],
    [/\btogether\b/gi, 'juntos'],
    [/\bacross\b/gi, 'a través de'],
    [/\binside\b/gi, 'dentro de'],
    [/\boutside\b/gi, 'fuera de'],
    [/\bbest\b/gi, 'mejor'],
    [/\bamount\b/gi, 'número'],
    [/\bmanner\b/gi, 'manera'],
    [/\bdistance\b/gi, 'distancia'],
    [/\bportion\b/gi, 'parte'],
    [/\bsection\b/gi, 'parte'],
    [/\bphase\b/gi, 'fase'],
    [/\btip\b/gi, 'consejo'],
    [/\bnote\b/gi, 'nota'],
    [/\bsteps\b/gi, 'pasos'],
    [/\bstep\b/gi, 'paso'],
    [/\bsurface\b/gi, 'superficie'],
    [/\bedge\b/gi, 'borde'],
    [/\bversion\b/gi, 'versión'],
    [/\bopen\b/gi, 'abierto'],
    [/\bclosed\b/gi, 'cerrado'],
    [/\bagain\b/gi, 'de nuevo'],
    [/\balso\b/gi, 'también'],
    [/\bjust\b/gi, 'solo'],
    [/\bstill\b/gi, 'quieto'],
    [/\beven\b/gi, 'incluso'],
    [/\bonce\b/gi, 'una vez'],
    [/\bmore\b/gi, 'más'],
    [/\bless\b/gi, 'menos'],
    [/\bnow\b/gi, 'ahora'],
    [/\bthen\b/gi, 'luego'],
    [/\bnext\b/gi, 'siguiente'],
    [/\bfirst\b/gi, 'primero'],
    [/\bsecond\b/gi, 'segundo'],
    [/\bthird\b/gi, 'tercero'],
    [/\bone\b/gi, 'uno'],
    [/\btwo\b/gi, 'dos'],
    [/\bthree\b/gi, 'tres'],
    [/\bfour\b/gi, 'cuatro'],
    [/\bfive\b/gi, 'cinco'],
    [/\bten\b/gi, 'diez'],
    [/\bhundred\b/gi, 'cien'],

    // Conjunciones / pronombres
    [/\beach\b/gi, 'cada'],
    [/\byour\b/gi, 'tu'],
    [/\byou\b/gi, 'tú'],
    [/\bthis\b/gi, 'esto'],
    [/\bthat\b/gi, 'eso'],
    [/\bthese\b/gi, 'estos'],
    [/\bthose\b/gi, 'esos'],
    [/\bwithout\b/gi, 'sin'],
    [/\bbetween\b/gi, 'entre'],
    [/\bthrough\b/gi, 'a través de'],
    [/\bafter\b/gi, 'después de'],
    [/\bbefore\b/gi, 'antes de'],
    [/\bduring\b/gi, 'durante'],
    [/\buntil\b/gi, 'hasta'],
    [/\babove\b/gi, 'encima de'],
    [/\bbelow\b/gi, 'debajo de'],
    [/\bnear\b/gi, 'cerca de'],
    [/\baway\b/gi, 'lejos'],
    [/\bwhile\b/gi, 'mientras'],
    [/\bwhen\b/gi, 'cuando'],
    [/\bnot\b/gi, 'no'],
    [/\bany\b/gi, 'ningún'],
    [/\bno\b/gi, 'ningún'],
    [/\boff\b/gi, 'alejado de'],

    // ── Preposiciones y artículos genéricos — AL FINAL (más peligrosos) ───────
    [/\band\b/gi, 'y'],
    [/\bwith\b/gi, 'con'],
    [/\bdown\b/gi, 'abajo'],
    [/\bup\b/gi, 'arriba'],
    [/\bout\b/gi, 'fuera'],
    [/\bover\b/gi, 'por encima de'],
    [/\bunder\b/gi, 'debajo de'],
    [/\bthe\b/gi, 'el'],
    [/\ban\b/gi, 'un'],
    [/\bto\b/gi, 'a'],
    [/\bat\b/gi, 'en'],
    [/\bof\b/gi, 'de'],
    [/\bin\b/gi, 'en'],
    [/\bon\b/gi, 'sobre'],
    [/\bby\b/gi, 'por'],
    [/\bfor\b/gi, 'durante'],
    [/\bfrom\b/gi, 'desde'],
    [/\bso\b/gi, 'así que'],
    [/\bor\b/gi, 'o'],
    [/\bif\b/gi, 'si'],
    [/\bis\b/gi, 'es'],
    [/\bare\b/gi, 'están'],
    [/\bwas\b/gi, 'era'],
    [/\bwere\b/gi, 'eran'],
    [/\bhas\b/gi, 'tiene'],
    [/\bhave\b/gi, 'tener'],
    [/\bcan\b/gi, 'puedes'],
    [/\bcould\b/gi, 'podrías'],
    [/\bmay\b/gi, 'puedes'],
    [/\bmight\b/gi, 'podrías'],
    [/\bneed\b/gi, 'necesitas'],
    [/\blet\b/gi, 'deja'],
    [/\blook\b/gi, 'mira'],
    [/\bremember\b/gi, 'recuerda'],
    [/\bensure\b/gi, 'asegura'],
    // "a" SOLO como artículo inglés (no al final de palabra española)
    [/(?<=[\s.(]|^)a(?=\s)/gi, 'un'],
  ];

  let output = text;
  // Tres pasadas para capturar residuos progresivos
  for (let pass = 0; pass < 3; pass++) {
    for (const [regex, replacement] of phraseRules) output = output.replace(regex, replacement);
    for (const [regex, replacement] of wordRules) output = output.replace(regex, replacement);
  }

  return toSentenceCase(
    output
      .replace(/\s{2,}/g, ' ')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
      .replace(/\s+\/\s+/g, '/')
      .replace(/\s+([,.!?;:])/g, '$1')
      .trim()
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔄 Leyendo ejercicios de Supabase...');

  let page = 0;
  const PAGE_SIZE = 100;
  let total = 0;
  let actualizados = 0;
  let errores = 0;

  while (true) {
    const { data, error } = await supabase
      .from('ejercicios')
      .select('id, nombre, descripcion, instrucciones_pasos, musculos_primarios, musculos_secundarios, equipamiento')
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) { console.error('❌ Error leyendo:', error.message); break; }
    if (!data || data.length === 0) break;

    total += data.length;
    console.log(`📦 Página ${page + 1}: ${data.length} ejercicios`);

    for (const ej of data) {
      try {
        const nombreEs    = translate(ej.nombre);
        const descEs      = translate(ej.descripcion ?? '');
        const pasosEs     = (ej.instrucciones_pasos ?? []).map(translate);
        const muscPrimEs  = (ej.musculos_primarios ?? []).map(translate);
        const muscSecEs   = (ej.musculos_secundarios ?? []).map(translate);
        const equipEs     = ej.equipamiento ? translate(ej.equipamiento) : ej.equipamiento;

        const { error: upError } = await supabase
          .from('ejercicios')
          .update({
            nombre:               nombreEs,
            descripcion:          descEs,
            instrucciones_pasos:  pasosEs,
            musculos_primarios:   muscPrimEs,
            musculos_secundarios: muscSecEs,
            equipamiento:         equipEs,
          })
          .eq('id', ej.id);

        if (upError) {
          console.error(`  ⚠️  ID ${ej.id} (${ej.nombre}): ${upError.message}`);
          errores++;
        } else {
          actualizados++;
          if (actualizados % 50 === 0) console.log(`  ✅ ${actualizados} actualizados...`);
        }
      } catch (e) {
        console.error(`  ❌ ID ${ej.id}: ${e.message}`);
        errores++;
      }
    }

    if (data.length < PAGE_SIZE) break;
    page++;
  }

  console.log(`\n✅ Completado: ${actualizados}/${total} ejercicios traducidos. Errores: ${errores}`);
}

main();
