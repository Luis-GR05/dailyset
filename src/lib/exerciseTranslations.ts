function normalizeRawText(input: string): string {
  return input
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function toSentenceCase(input: string): string {
  const lowered = input.toLocaleLowerCase("es-ES");
  return lowered.replace(/(^|[.!?]\s+)(\p{L})/gu, (_match, sep, letter) =>
    `${sep}${letter.toLocaleUpperCase("es-ES")}`
  );
}

function translateDatasetTextEs(input: string): string {
  const text = normalizeRawText(input);
  if (!text) return text;

  // ─────────────────────────────────────────────────────────────────────────
  // FASE 1 — FRASES LARGAS (van antes que palabras sueltas)
  // ─────────────────────────────────────────────────────────────────────────
  const phraseRules: Array<[RegExp, string]> = [
    // Partes del cuerpo compuestas
    [/\bupper back\b/gi, "espalda alta"],
    [/\blower back\b/gi, "espalda baja"],
    [/\bmiddle back\b/gi, "espalda media"],
    [/\bfull body\b/gi, "cuerpo completo"],
    [/\bbody only\b/gi, "peso corporal"],
    [/\bupper arm\b/gi, "brazo"],
    [/\bfoam roll(?:er)?\b/gi, "rodillo de espuma"],
    [/\bmedicine ball\b/gi, "balón medicinal"],
    [/\bexercise ball\b/gi, "fitball"],
    [/\bez curl bar\b/gi, "barra Z"],
    [/\bhip adductor\b/gi, "aductor de cadera"],
    [/\badductor\/groin\b/gi, "aductores/ingle"],
    [/\baddductor\/groin\b/gi, "aductores/ingle"],

    // Artículos "the" + sustantivos en plural/femenino (antes de mapear "the" → "el")
    [/\bthe palms?\b/gi, "las palmas"],
    [/\bthe hands?\b/gi, "las manos"],
    [/\bthe arms?\b/gi, "los brazos"],
    [/\bthe legs?\b/gi, "las piernas"],
    [/\bthe feet\b/gi, "los pies"],
    [/\bthe foot\b/gi, "el pie"],
    [/\bthe knees?\b/gi, "las rodillas"],
    [/\bthe elbows?\b/gi, "los codos"],
    [/\bthe shoulders?\b/gi, "los hombros"],
    [/\bthe hips?\b/gi, "las caderas"],
    [/\bthe muscles?\b/gi, "los músculos"],
    [/\bthe dumbbells?\b/gi, "las mancuernas"],
    [/\bthe weights?\b/gi, "los pesos"],
    [/\bthe kettlebells?\b/gi, "las pesas rusas"],
    [/\bthe wrists?\b/gi, "las muñecas"],
    [/\bthe ankles?\b/gi, "los tobillos"],
    [/\bthe toes?\b/gi, "los dedos del pie"],
    [/\bthe fingers?\b/gi, "los dedos"],
    [/\bthe heels?\b/gi, "los talones"],
    [/\bthe glutes?\b/gi, "los glúteos"],

    // Respiración
    [/\bas you breathe out\b/gi, "mientras exhalas"],
    [/\bas you breathe in\b/gi, "mientras inhalas"],
    [/\bas you exhale\b/gi, "mientras exhalas"],
    [/\bas you inhale\b/gi, "mientras inhalas"],
    [/\bbreathe out\b/gi, "exhala"],
    [/\bbreathe in\b/gi, "inhala"],
    [/\bbreath out\b/gi, "exhala"],
    [/\bbreath in\b/gi, "inhala"],
    // post-traducción: corregir "respira out" / "respira en"
    [/\brespira out\b/gi, "exhala"],
    [/\brespira en\b/gi, "inhala"],

    // Dirección izquierda / derecha (antes de reglas genéricas)
    [/\bright (arm|hand|leg|foot|side|knee|elbow|shoulder|hip|wrist|ankle)\b/gi, "$1 derecho"],
    [/\bleft (arm|hand|leg|foot|side|knee|elbow|shoulder|hip|wrist|ankle)\b/gi, "$1 izquierdo"],
    [/\bright side\b/gi, "lado derecho"],
    [/\bleft side\b/gi, "lado izquierdo"],

    // Nivel / altura
    [/\bat shoulder level\b/gi, "a la altura del hombro"],
    [/\bat chest level\b/gi, "a la altura del pecho"],
    [/\bat hip level\b/gi, "a la altura de la cadera"],
    [/\bat waist level\b/gi, "a la altura de la cintura"],
    [/\bat (\w+) level\b/gi, "a la altura del $1"],

    // Back to (dirección "de vuelta") — ANTES del word rule back→espalda
    [/\bbring(?:ing)? (?:\w+ )?back to(?: the| your)?\b/gi, "lleva de vuelta a"],
    [/\bback to starting position\b/gi, "de vuelta a la posición inicial"],
    [/\bback to (the |your )?(start|beginning|initial position|starting position)\b/gi, "de vuelta a la posición inicial"],
    [/\bback to\b/gi, "de vuelta a"],
    [/\bcome back\b/gi, "vuelve"],
    [/\bgo back\b/gi, "vuelve"],

    // Hammer curl / exercise names con "curl"
    [/\bhammer curl\b/gi, "curl de martillo"],
    [/\bbicep(?:s)? curl\b/gi, "curl de bíceps"],
    [/\bpreacher curl\b/gi, "curl en predicador"],
    [/\bconcentration curl\b/gi, "curl de concentración"],
    [/\bincline curl\b/gi, "curl inclinado"],

    // Instrucciones completas muy frecuentes
    [/\bthis will be your starting position\b/gi, "esta será tu posición inicial"],
    [/\bthis is your starting position\b/gi, "esta es tu posición inicial"],
    [/\brepeat for the recommended (?:number|amount) of repetitions\b/gi, "repite el número recomendado de repeticiones"],
    [/\bthe recommended amount of repetitions\b/gi, "el número recomendado de repeticiones"],
    [/\bthe recommended number of repetitions\b/gi, "el número recomendado de repeticiones"],
    [/\byou will begin with your back on the ground\b/gi, "comenzarás con la espalda en el suelo"],
    [/\bplace your hands behind or to the side of your head\b/gi, "coloca las manos detrás o al lado de la cabeza"],
    [/\byou may brace your leg with your hands if necessary\b/gi, "si es necesario, puedes sujetar la pierna con las manos"],
    [/\bkeep your head up at all times\b/gi, "mantén la cabeza arriba en todo momento"],
    [/\bmaintain a straight back\b/gi, "mantén la espalda recta"],
    [/\bfirst set the bar on a rack that best matches your height\b/gi, "primero coloca la barra en un soporte a la altura adecuada"],
    [/\bonce the correct height is chosen and the bar is loaded\b/gi, "una vez elegida la altura correcta y cargada la barra"],
    [/\bif you are holding the bar properly\b/gi, "si sujetas la barra correctamente"],
    [/\bstep away from the rack\b/gi, "aléjate del soporte"],
    [/\block your hands together\b/gi, "junta las manos"],
    [/\bon top of your arms\b/gi, "encima de tus brazos"],
    [/\bin between the forearm and upper arm\b/gi, "entre el antebrazo y el brazo"],
    [/\bextend your leg straight into the air\b/gi, "extiende la pierna hacia arriba"],
    [/\breverse the motion\b/gi, "invierte el movimiento"],
    [/\bgoing only\b/gi, "bajando solo"],
    [/\binside a squat rack\b/gi, "dentro de una jaula de sentadillas"],
    [/\bfor safety purposes\b/gi, "por seguridad"],
    [/\bat the top of the contraction\b/gi, "al máximo de la contracción"],
    [/\bswitch to the other (?:leg|side|arm)\b/gi, "cambia al otro lado"],
    [/\bonly the forearms? should move\b/gi, "solo los antebrazos deben moverse"],
    [/\bthe forearms? should? be? the only (?:part )?(?:that )?move[ds]?\b/gi, "solo los antebrazos deben moverse"],
    [/\bkeep(?:ing)? (?:the |your )?upper arm(?:s)? stationary\b/gi, "mantén los brazos inmóviles"],

    // Being held
    [/\bbeing held\b/gi, "sostenido"],
    [/\bbeing (\w+ed)\b/gi, "estando $1"],
    [/\barm(?:'s)? length\b/gi, "largo del brazo"],
    [/\bat arm(?:'s)? length\b/gi, "con los brazos extendidos"],

    // Partner / compañero
    [/\bhave your partner\b/gi, "pide a tu compañero que"],
    [/\bwhile your partner\b/gi, "mientras tu compañero"],
    [/\blet your partner know\b/gi, "avisa a tu compañero"],
    [/\byour partner\b/gi, "tu compañero"],
    [/\bpartner\b/gi, "compañero"],

    // As far as
    [/\bas far as you can\b/gi, "todo lo que puedas"],
    [/\bas far as possible\b/gi, "lo máximo posible"],
    [/\bas far as\b/gi, "todo lo que"],

    // Or more
    [/\bor more seconds\b/gi, "o más segundos"],
    [/\bor more (?:reps?|repetitions?)\b/gi, "o más repeticiones"],
    [/\bor more\b/gi, "o más"],
    [/\bor injury\b/gi, "o lesión"],

    // Be sure / make sure
    [/\bbe sure to\b/gi, "asegúrate de"],
    [/\bbe sure\b/gi, "asegúrate"],
    [/\bmake sure(?: to)?\b/gi, "asegúrate de"],

    // Doing so / doing this
    [/\bdoing so\b/gi, "hacerlo"],
    [/\bdoing this\b/gi, "hacer esto"],
    [/\bdoing\b/gi, "haciendo"],

    // continue / continuing
    [/\bcontinue to\b/gi, "continúa"],
    [/\bcontinue\b/gi, "continúa"],
    [/\bcontinuing\b/gi, "continuando"],

    // Overstretching
    [/\boverstretching\b/gi, "estiramiento excesivo"],
    [/\boverextending\b/gi, "extensión excesiva"],

    // Raised towards ceiling
    [/\braised towards? (?:the )?(?:ceiling|sky)\b/gi, "elevados hacia el techo"],
    [/\braised towards?\b/gi, "levantados hacia"],

    // Pausing briefly
    [/\bpausing briefly(?: at the top)?\b/gi, "haciendo una breve pausa"],
    [/\bbriefly\b/gi, "brevemente"],

    // Lie down
    [/\blie down on your back\b/gi, "túmbate boca arriba"],
    [/\blie on the floor\b/gi, "túmbate en el suelo"],
    [/\blie on your back\b/gi, "túmbate boca arriba"],
    [/\blie flat on your back\b/gi, "túmbate boca arriba"],
    [/\blie flat\b/gi, "túmbate"],
    [/\blie face down\b/gi, "túmbate boca abajo"],
    [/\blie\b/gi, "túmbate"],

    // On your / On the
    [/\bon your back\b/gi, "boca arriba"],
    [/\bon your stomach\b/gi, "boca abajo"],
    [/\bon the floor\b/gi, "en el suelo"],
    [/\bon the ground\b/gi, "en el suelo"],

    // Starting position
    [/\byour starting position\b/gi, "tu posición inicial"],
    [/\bstarting position\b/gi, "posición inicial"],

    // Degrees
    [/\bto 90 degrees\b/gi, "a 90 grados"],
    [/\b(\d+) degrees\b/gi, "$1 grados"],

    // Close to
    [/\bclose to the\b/gi, "pegado al"],
    [/\bclose to your\b/gi, "pegado a tu"],
    [/\bclose to\b/gi, "pegado a"],
    [/\bclose\b/gi, "pegados"],

    // In this manner / in this way
    [/\bin this manner\b/gi, "de esta manera"],
    [/\bin this way\b/gi, "de esta manera"],
    [/\bin an alternating manner\b/gi, "de manera alterna"],
    [/\balternating manner\b/gi, "de manera alterna"],

    // Equals one rep
    [/\bequals one repetition\b/gi, "equivale a una repetición"],
    [/\bequals one rep\b/gi, "equivale a una repetición"],
    [/\bequals\b/gi, "equivale a"],

    // For N repetitions / seconds
    [/\bfor \d+ to \d+ (?:repetitions?|reps?)\b/gi, (m) => m.replace(/for (\d+) to (\d+) (?:repetitions?|reps?)/i, "durante $1 a $2 repeticiones")],
    [/\bfor \d+ (?:or more) (?:repetitions?|reps?|seconds?)\b/gi, (m) => m.replace(/for (\d+) or more (\w+)/i, "durante $1 o más $2")],
    [/\bfor \d+ seconds?\b/gi, (m) => m.replace(/for (\d+) seconds?/i, "durante $1 segundos")],

    // Straight
    [/\bstraight out\b/gi, "estirada"],
    [/\bstraight up\b/gi, "hacia arriba"],
    [/\bstraight\b/gi, "recto"],

    // At the top / bottom
    [/\bat the top\b/gi, "arriba del todo"],
    [/\bat the bottom\b/gi, "abajo del todo"],

    // Feet
    [/\bfeet flat\b/gi, "pies planos"],
    [/\bfeet shoulder[- ]width apart\b/gi, "pies al ancho de los hombros"],
    [/\bshoulder[- ]width apart\b/gi, "al ancho de los hombros"],
    [/\bhip[- ]width apart\b/gi, "al ancho de las caderas"],
    [/\bsecure your feet\b/gi, "asegura tus pies"],

    // Should be
    [/\bshould be bent\b/gi, "deben estar dobladas"],
    [/\byour legs should be\b/gi, "tus piernas deben estar"],
    [/\bshould be\b/gi, "debe estar"],
    [/\bshould\b/gi, "debe"],

    // Bent
    [/\bknees bent\b/gi, "rodillas dobladas"],
    [/\belbows bent\b/gi, "codos doblados"],
    [/\bbent at the\b/gi, "doblado en las"],
    [/\bbent at\b/gi, "doblado en"],

    // This is your
    [/\bthis is your\b/gi, "esta es tu"],

    // Verbo + your
    [/\bflex your\b/gi, "flexiona tu"],
    [/\braise your\b/gi, "eleva tu"],
    [/\blower your\b/gi, "baja tu"],
    [/\bextend your\b/gi, "extiende tu"],
    [/\bhold your\b/gi, "mantén tu"],
    [/\bplace your\b/gi, "coloca tu"],
    [/\bkeep your\b/gi, "mantén tu"],
    [/\bmove your\b/gi, "mueve tu"],
    [/\blift your\b/gi, "levanta tu"],
    [/\bpush your\b/gi, "empuja tu"],
    [/\bpull your\b/gi, "jala tu"],
    [/\bbend your\b/gi, "dobla tu"],
    [/\brotate your\b/gi, "rota tu"],
    [/\bopen your\b/gi, "abre tu"],
    [/\bclose your\b/gi, "cierra tu"],
    [/\bsqueeze your\b/gi, "aprieta tu"],
    [/\bcontract your\b/gi, "contrae tu"],
    [/\bcurl your\b/gi, "flexiona tu"],
    [/\bbring your\b/gi, "lleva tu"],
    [/\bgrip your\b/gi, "agarra tu"],
    [/\bcross your\b/gi, "cruza tu"],
    [/\bwrap your\b/gi, "rodea tu"],

    // Toward/towards
    [/\btoward(?:s)? your\b/gi, "hacia tu"],
    [/\btoward(?:s)? the\b/gi, "hacia el"],
    [/\btoward(?:s)?\b/gi, "hacia"],

    // With/on/of/in/at your
    [/\bwith your\b/gi, "con tu"],
    [/\bon your\b/gi, "en tu"],
    [/\bof your\b/gi, "de tu"],
    [/\bof the\b/gi, "de la"],
    [/\bin the\b/gi, "en el"],
    [/\bat the\b/gi, "en el"],
    [/\bby the\b/gi, "por el"],
    [/\bto the\b/gi, "hacia el"],

    // The + noun
    [/\bthe floor\b/gi, "el suelo"],
    [/\bthe ground\b/gi, "el suelo"],
    [/\bthe bar\b/gi, "la barra"],
    [/\bthe ceiling\b/gi, "el techo"],
    [/\bthe way\b/gi, "el recorrido"],
    [/\bthe weight\b/gi, "el peso"],

    // Step forward/back
    [/\bstep forward\b/gi, "da un paso adelante"],
    [/\bstep back(?:ward)?\b/gi, "da un paso atrás"],

    // Palms
    [/\bpalms facing\b/gi, "palmas hacia"],
    [/\bpalms down\b/gi, "palmas hacia abajo"],
    [/\bpalms up\b/gi, "palmas hacia arriba"],
    [/\barms extended\b/gi, "brazos extendidos"],
    [/\barms at your sides\b/gi, "brazos a los lados"],

    // Bend the
    [/\bbend the\b/gi, "dobla la"],

    // Perpendicular
    [/\bperpendicular to the\b/gi, "perpendicular al"],

    // 3/4 of the way
    [/\b3\/4 of the way\b/gi, "¾ del recorrido"],
    [/\bof the way\b/gi, "del recorrido"],

    // "a the" → al
    [/\ba the\b/gi, "al"],

    // Attempt / abduct
    [/\battempt to\b/gi, "intenta"],
    [/\battempt\b/gi, "intenta"],
    [/\babduct\b/gi, "separa"],

    // Now relax
    [/\bnow,?\s*relax\b/gi, "ahora, relaja"],

    // As tu/tú fix (post-traducción)
    [/\bas (?:tu|tú)\b/gi, "mientras tú"],
    [/\bwhile (?:tu|tú)\b/gi, "mientras tú"],

    // Or more (extra)
    [/\bor more\b/gi, "o más"],

    // Facing (antes del word rule)
    [/\bfacing your\b/gi, "mirando hacia tu"],
    [/\bfacing the\b/gi, "mirando hacia el"],
    [/\bfacing\b/gi, "mirando hacia"],
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // FASE 2 — PALABRAS SUELTAS
  // ─────────────────────────────────────────────────────────────────────────
  const wordRules: Array<[RegExp, string]> = [
    // Músculos
    [/\babdominals\b/gi, "abdominales"],
    [/\babdominal\b/gi, "abdominal"],
    [/\badductors\b/gi, "aductores"],
    [/\badductor\b/gi, "aductor"],
    [/\bgroin\b/gi, "ingle"],
    [/\bcalves\b/gi, "gemelos"],
    [/\bcalf\b/gi, "gemelo"],
    [/\bhamstrings\b/gi, "isquiotibiales"],
    [/\bhamstring\b/gi, "isquiotibial"],
    [/\bquadriceps\b/gi, "cuádriceps"],
    [/\bquads\b/gi, "cuádriceps"],
    [/\btraps\b/gi, "trapecio"],
    [/\blats\b/gi, "dorsales"],
    [/\bforearms\b/gi, "antebrazos"],
    [/\bforearm\b/gi, "antebrazo"],
    [/\bglutes\b/gi, "glúteos"],
    [/\bglute\b/gi, "glúteo"],
    [/\bneck\b/gi, "cuello"],
    [/\bchest\b/gi, "pecho"],
    [/\bshoulders\b/gi, "hombros"],
    [/\bshoulder\b/gi, "hombro"],
    [/\bbiceps\b/gi, "bíceps"],
    [/\btriceps\b/gi, "tríceps"],
    [/\belbows\b/gi, "codos"],
    [/\belbow\b/gi, "codo"],
    [/\bwrists\b/gi, "muñecas"],
    [/\bwrist\b/gi, "muñeca"],
    [/\bpalms\b/gi, "palmas"],
    [/\bpalm\b/gi, "palma"],
    [/\bfingers\b/gi, "dedos"],
    [/\bfinger\b/gi, "dedo"],
    [/\barms\b/gi, "brazos"],
    [/\barm\b/gi, "brazo"],
    [/\bback\b/gi, "espalda"],
    [/\bdeltoid\b/gi, "deltoide"],
    [/\bspine\b/gi, "columna"],
    [/\btorso\b/gi, "torso"],
    [/\bcore\b/gi, "abdomen"],
    [/\babs\b/gi, "abdominales"],
    [/\bmuscles\b/gi, "músculos"],
    [/\bmuscle\b/gi, "músculo"],
    [/\bceiling\b/gi, "techo"],
    [/\bankles\b/gi, "tobillos"],
    [/\bankle\b/gi, "tobillo"],
    [/\bshins\b/gi, "espinillas"],
    [/\bshin\b/gi, "espinilla"],
    [/\bheels\b/gi, "talones"],
    [/\bheel\b/gi, "talón"],
    [/\bwaist\b/gi, "cintura"],
    [/\bribcage\b/gi, "caja torácica"],

    // Equipamiento
    [/\bbarbell\b/gi, "barra"],
    [/\bdumbbells\b/gi, "mancuernas"],
    [/\bdumbbell\b/gi, "mancuerna"],
    [/\bkettlebells\b/gi, "pesas rusas"],
    [/\bkettlebell\b/gi, "pesa rusa"],
    [/\bcable\b/gi, "polea"],
    [/\bmachine\b/gi, "máquina"],
    [/\bband\b/gi, "banda"],
    [/\bbench\b/gi, "banco"],
    [/\bpull-up bar\b/gi, "barra de dominadas"],
    [/\bbar\b/gi, "barra"],
    [/\brack\b/gi, "soporte"],
    [/\bmat\b/gi, "esterilla"],
    [/\bweight\b/gi, "peso"],
    [/\bweights\b/gi, "pesos"],
    [/\bhammer\b/gi, "martillo"],

    // Tipos de ejercicio
    [/\bcardio\b/gi, "cardio"],
    [/\bstrength\b/gi, "fuerza"],
    [/\bplyometrics\b/gi, "pliométrico"],
    [/\bstretching\b/gi, "estiramiento"],
    [/\bsquat\b/gi, "sentadilla"],
    [/\bdeadlift\b/gi, "peso muerto"],
    [/\blunges\b/gi, "zancadas"],
    [/\blunge\b/gi, "zancada"],
    [/\bpull-ups\b/gi, "dominadas"],
    [/\bpull-up\b/gi, "dominada"],
    [/\bchin-ups\b/gi, "dominadas supinas"],
    [/\bchin-up\b/gi, "dominada supina"],
    [/\bpush-ups\b/gi, "flexiones"],
    [/\bpush-up\b/gi, "flexión"],
    [/\bsit-ups\b/gi, "abdominales"],
    [/\bsit-up\b/gi, "abdominal"],
    [/\bcrunch\b/gi, "crunch"],
    [/\bplank\b/gi, "plancha"],
    [/\browse\b/gi, "remo"],
    [/\brow\b/gi, "remo"],
    [/\bcurl\b/gi, "curl"],
    [/\bpress\b/gi, "press"],
    [/\bbound\b/gi, "salto largo"],
    [/\bsprint\b/gi, "sprint"],

    // Posiciones / modificadores
    [/\bincline\b/gi, "inclinado"],
    [/\bdecline\b/gi, "declinado"],
    [/\bseated\b/gi, "sentado"],
    [/\bstanding\b/gi, "de pie"],
    [/\blying\b/gi, "tumbado"],
    [/\boverhead\b/gi, "sobre la cabeza"],
    [/\breverse\b/gi, "invertido"],
    [/\bfront\b/gi, "frontal"],
    [/\blateral\b/gi, "lateral"],
    [/\brear\b/gi, "posterior"],
    [/\balternating\b/gi, "alterno"],
    [/\balternate\b/gi, "alterno"],
    [/\bdiagonal\b/gi, "diagonal"],
    [/\bother\b/gi, "otro"],
    [/\bextended\b/gi, "extendido"],
    [/\bcontracted\b/gi, "contraído"],
    [/\bbent\b/gi, "doblado"],
    [/\bflat\b/gi, "plano"],
    [/\bupright\b/gi, "erguido"],
    [/\bneutral\b/gi, "neutral"],
    [/\bparallel\b/gi, "paralelo"],
    [/\bstationary\b/gi, "inmóvil"],
    [/\bforward\b/gi, "hacia adelante"],
    [/\bupward\b/gi, "hacia arriba"],
    [/\bdownward\b/gi, "hacia abajo"],
    [/\boutward\b/gi, "hacia afuera"],
    [/\binward\b/gi, "hacia adentro"],
    [/\bright\b/gi, "derecho"],
    [/\bleft\b/gi, "izquierdo"],

    // Partes del cuerpo
    [/\bfeet\b/gi, "pies"],
    [/\bfoot\b/gi, "pie"],
    [/\blegs\b/gi, "piernas"],
    [/\bleg\b/gi, "pierna"],
    [/\bknees\b/gi, "rodillas"],
    [/\bknee\b/gi, "rodilla"],
    [/\bhips\b/gi, "caderas"],
    [/\bhip\b/gi, "cadera"],
    [/\bhead\b/gi, "cabeza"],
    [/\bhands\b/gi, "manos"],
    [/\bhand\b/gi, "mano"],
    [/\bground\b/gi, "suelo"],
    [/\bfloor\b/gi, "suelo"],
    [/\bside\b/gi, "lado"],
    [/\bsides\b/gi, "lados"],
    [/\btoes\b/gi, "dedos del pie"],
    [/\btoe\b/gi, "dedo del pie"],
    [/\blength\b/gi, "largo"],
    [/\blevel\b/gi, "altura"],

    // Verbos de acción
    [/\babduct\b/gi, "separa"],
    [/\battempt\b/gi, "intenta"],
    [/\brepeat\b/gi, "repite"],
    [/\brepetitions\b/gi, "repeticiones"],
    [/\brepetition\b/gi, "repetición"],
    [/\breps\b/gi, "repeticiones"],
    [/\brep\b/gi, "repetición"],
    [/\bsecure\b/gi, "asegura"],
    [/\bbegin\b/gi, "comienza"],
    [/\bstart\b/gi, "comienza"],
    [/\bcontinue\b/gi, "continúa"],
    [/\bwill\b/gi, ""],
    [/\bbe\b/gi, ""],
    [/\bbeing\b/gi, ""],
    [/\bperformed\b/gi, "realizado"],
    [/\btighten\b/gi, "aprieta"],
    [/\bsqueeze\b/gi, "aprieta"],
    [/\bcontract\b/gi, "contrae"],
    [/\bcontracting\b/gi, "contrayendo"],
    [/\bcontracted\b/gi, "contraído"],
    [/\bholding\b/gi, "manteniendo"],
    [/\bheld\b/gi, "sostenido"],
    [/\bstretch\b/gi, "estira"],
    [/\binhale\b/gi, "inhala"],
    [/\bexhale\b/gi, "exhala"],
    [/\bbreathe\b/gi, "respira"],
    [/\bpause\b/gi, "haz una pausa"],
    [/\bslowly\b/gi, "lentamente"],
    [/\bcontrolled\b/gi, "controlado"],
    [/\bcontrolling\b/gi, "controlando"],
    [/\bsmoothly\b/gi, "suavemente"],
    [/\bfirmly\b/gi, "firmemente"],
    [/\bgently\b/gi, "suavemente"],
    [/\blift\b/gi, "levanta"],
    [/\bresting\b/gi, "apoyado"],
    [/\bproperly\b/gi, "correctamente"],
    [/\bcrossed\b/gi, "cruzados"],
    [/\baway\b/gi, "lejos"],
    [/\bwidth\b/gi, "ancho"],
    [/\bmedium\b/gi, "medio"],
    [/\bstance\b/gi, "postura"],
    [/\bslightly\b/gi, "ligeramente"],
    [/\bmaintain\b/gi, "mantén"],
    [/\bplace\b/gi, "coloca"],
    [/\bextend\b/gi, "extiende"],
    [/\bflex\b/gi, "flexiona"],
    [/\breturn\b/gi, "vuelve"],
    [/\braise\b/gi, "eleva"],
    [/\bhold\b/gi, "mantén"],
    [/\bnow\b/gi, "ahora"],
    [/\brelax\b/gi, "relaja"],
    [/\bpush\b/gi, "empuja"],
    [/\bpull\b/gi, "jala"],
    [/\bprevents\b/gi, "impide"],
    [/\bprevent\b/gi, "evita"],
    [/\bpushes\b/gi, "empuja"],
    [/\bapart\b/gi, "separados"],
    [/\bgrip\b/gi, "agarra"],
    [/\bgrasp\b/gi, "agarra"],
    [/\bdrive\b/gi, "empuja"],
    [/\bstep\b/gi, "da un paso"],
    [/\bsit\b/gi, "siéntate"],
    [/\bstand\b/gi, "ponte de pie"],
    [/\block\b/gi, "bloquea"],
    [/\bkeep\b/gi, "mantén"],
    [/\btuck\b/gi, "mete"],
    [/\barch\b/gi, "arquea"],
    [/\bengage\b/gi, "activa"],
    [/\bactivate\b/gi, "activa"],
    [/\bbring\b/gi, "lleva"],
    [/\bmove\b/gi, "mueve"],
    [/\bequals\b/gi, "equivale a"],
    [/\bprevents\b/gi, "impide"],

    // Adjetivos y adverbios
    [/\bcomfortable\b/gi, "cómodo"],
    [/\badequate\b/gi, "adecuado"],
    [/\bappropriate\b/gi, "apropiado"],
    [/\bproper\b/gi, "correcto"],
    [/\bcorrect\b/gi, "correcto"],
    [/\bsafe\b/gi, "seguro"],
    [/\bsafety\b/gi, "seguridad"],
    [/\binjury\b/gi, "lesión"],
    [/\binjured\b/gi, "lesionado"],
    [/\bpain\b/gi, "dolor"],
    [/\bnatural\b/gi, "natural"],
    [/\bstiff\b/gi, "rígido"],
    [/\btight\b/gi, "tenso"],
    [/\bloose\b/gi, "suelto"],
    [/\bfirm\b/gi, "firme"],
    [/\bsure\b/gi, "seguro"],
    [/\bmore\b/gi, "más"],
    [/\bless\b/gi, "menos"],
    [/\bonly\b/gi, "solo"],
    [/\bbrief\b/gi, "breve"],
    [/\bgradually\b/gi, "gradualmente"],
    [/\bfully\b/gi, "completamente"],
    [/\bcompletely\b/gi, "completamente"],

    // Sustantivos
    [/\bseconds\b/gi, "segundos"],
    [/\bsecond\b/gi, "segundo"],
    [/\bminutes\b/gi, "minutos"],
    [/\bminute\b/gi, "minuto"],
    [/\bsets\b/gi, "series"],
    [/\bset\b/gi, "serie"],
    [/\brange\b/gi, "rango"],
    [/\bmotion\b/gi, "movimiento"],
    [/\bmovement\b/gi, "movimiento"],
    [/\bposition\b/gi, "posición"],
    [/\bposture\b/gi, "postura"],
    [/\bform\b/gi, "forma"],
    [/\btechnique\b/gi, "técnica"],
    [/\bexercise\b/gi, "ejercicio"],
    [/\bworkout\b/gi, "entrenamiento"],
    [/\bcontraction\b/gi, "contracción"],
    [/\bextension\b/gi, "extensión"],
    [/\bflexion\b/gi, "flexión"],
    [/\bangle\b/gi, "ángulo"],
    [/\bpath\b/gi, "recorrido"],
    [/\bpurposes\b/gi, "motivos"],
    [/\bheight\b/gi, "altura"],
    [/\bchosen\b/gi, "elegida"],
    [/\bloaded\b/gi, "cargada"],
    [/\btogether\b/gi, "juntos"],
    [/\bacross\b/gi, "a través de"],
    [/\binside\b/gi, "dentro de"],
    [/\boutside\b/gi, "fuera de"],
    [/\bbest\b/gi, "mejor"],
    [/\bonce\b/gi, "una vez"],
    [/\btip\b/gi, "consejo"],
    [/\bnote\b/gi, "nota"],
    [/\bamount\b/gi, "número"],
    [/\bmanner\b/gi, "manera"],
    [/\blength\b/gi, "largo"],

    // Conjunciones/pronombres que no aparecen en español
    [/\beach\b/gi, "cada"],
    [/\byour\b/gi, "tu"],
    [/\byou\b/gi, "tú"],
    [/\bthis\b/gi, "esto"],
    [/\bthat\b/gi, "eso"],
    [/\bthese\b/gi, "estos"],
    [/\bthose\b/gi, "esos"],
    [/\bwithout\b/gi, "sin"],
    [/\bbetween\b/gi, "entre"],
    [/\bthrough\b/gi, "a través de"],
    [/\bafter\b/gi, "después de"],
    [/\bbefore\b/gi, "antes de"],
    [/\bduring\b/gi, "durante"],
    [/\buntil\b/gi, "hasta"],
    [/\babove\b/gi, "encima de"],
    [/\bbelow\b/gi, "debajo de"],
    [/\bwithout\b/gi, "sin"],
    [/\bwhile\b/gi, "mientras"],
    [/\bwhen\b/gi, "cuando"],
    [/\bfrom\b/gi, "desde"],
    [/\bnear\b/gi, "cerca de"],
  ];

  let output = text;
  for (const [regex, replacement] of phraseRules) output = output.replace(regex, replacement as string);
  for (const [regex, replacement] of wordRules) output = output.replace(regex, replacement as string);

  const cleaned = output
    .replace(/\s{2,}/g, " ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s+\/\s+/g, "/")
    .replace(/\s+([,.!?;:])/g, "$1")
    .trim();

  return toSentenceCase(cleaned);
}

export function translateExerciseTitleEs(title: string): string {
  return translateDatasetTextEs(title);
}

export function translateMuscleEs(muscle: string): string {
  return translateDatasetTextEs(muscle);
}

export function translateEquipmentEs(equipment: string): string {
  return translateDatasetTextEs(equipment);
}

export function translateInstructionEs(instruction: string): string {
  return translateDatasetTextEs(instruction);
}
