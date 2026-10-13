// src/lib/calculadoraMacros.ts
// Lógica compartida de la Calculadora de Calorías y Macros (web y app). Se sincroniza a dailyset-app.
// BMR (Mifflin-St Jeor / Katch-McArdle), TDEE, objetivo calórico, reparto de macros y por comida,
// texto para copiar y HTML imprimible del plan.

export type NivelActividad = 'sedentario' | 'ligero' | 'moderado' | 'activo' | 'muy_activo';
export type TipoObjetivo = 'deficit_moderado' | 'deficit_agresivo' | 'mantenimiento' | 'volumen_limpio' | 'volumen_agresivo';

export interface EntradaMacros {
  locale: string;
  genero: 'masculino' | 'femenino';
  edad: number;
  peso: number;
  altura: number;
  unidadPeso: 'kg' | 'lbs';
  grasaCorporal: number | '';
  nivelActividad: NivelActividad;
  objetivo: TipoObjetivo;
  ratioProteina: number;
  numComidas: number;
}

export function calcularPlanMacros(entrada: EntradaMacros) {
  const { locale, genero, edad, peso, altura, unidadPeso, grasaCorporal, nivelActividad, objetivo, ratioProteina, numComidas } = entrada;
  const pesoKg = unidadPeso === 'lbs' ? (peso || 75) * 0.453592 : (peso || 75);
  const edadVal = Math.max(12, Math.min(100, edad || 26));
  const alturaVal = Math.max(120, Math.min(240, altura || 178));

  // 1. Metabolismo Basal (BMR)
  const calcularBMR = (): number => {
    if (grasaCorporal !== '' && Number(grasaCorporal) > 0) {
      const masaMagra = pesoKg * (1 - Number(grasaCorporal) / 100);
      return Math.round(370 + 21.6 * masaMagra);
    }
    const base = 10 * pesoKg + 6.25 * alturaVal - 5 * edadVal;
    return Math.round(genero === 'masculino' ? base + 5 : base - 161);
  };
  const bmr = calcularBMR();

  // 2. Factores de Actividad
  const factoresActividad: Record<NivelActividad, { factor: number; nombre: string; entreno: string; desc: string }> = {
    sedentario: {
      factor: 1.2,
      nombre: locale === 'es' ? 'Sedentario' : 'Sedentary',
      entreno: locale === 'es' ? '0 días / semana' : '0 days / week',
      desc: locale === 'es' ? 'Trabajo sentado, mínimo o nulo ejercicio físico.' : 'Desk job, little to no deliberate exercise.',
    },
    ligero: {
      factor: 1.375,
      nombre: locale === 'es' ? 'Ligero' : 'Light',
      entreno: locale === 'es' ? '1 a 2 días / semana' : '1 to 2 days / week',
      desc: locale === 'es' ? 'Caminatas diarias, deporte recreativo o entrenos suaves.' : 'Daily walking, recreational sports, or gentle training.',
    },
    moderado: {
      factor: 1.55,
      nombre: locale === 'es' ? 'Moderado' : 'Moderate',
      entreno: locale === 'es' ? '3 a 5 días / semana' : '3 to 5 days / week',
      desc: locale === 'es' ? 'Gimnasio o entrenamiento constante. (Más común)' : 'Regular gym, lifting or sports 3-5 days/wk. (Most common)',
    },
    activo: {
      factor: 1.725,
      nombre: locale === 'es' ? 'Activo' : 'Active',
      entreno: locale === 'es' ? '6 a 7 días / semana' : '6 to 7 days / week',
      desc: locale === 'es' ? 'Entrenamientos diarios intensos o trabajo físico exigente.' : 'Heavy daily workouts or physically demanding work.',
    },
    muy_activo: {
      factor: 1.9,
      nombre: locale === 'es' ? 'Muy Activo' : 'Very Active',
      entreno: locale === 'es' ? 'Doble sesión diaria' : '2x daily training',
      desc: locale === 'es' ? 'Atleta de alta competición o trabajo físico extremo.' : 'Competitive athlete or intense double-day training.',
    },
  };

  const factorSeleccionado = factoresActividad[nivelActividad].factor;
  const tdee = Math.round(bmr * factorSeleccionado);
  const caloriasActividad = tdee - bmr;

  // 3. Objetivos
  const objetivosConfig: Record<TipoObjetivo, { pct: number; nombre: string; tipo: 'cut' | 'maint' | 'bulk'; ritmo: string; desc: string }> = {
    deficit_moderado: {
      pct: -0.15,
      nombre: locale === 'es' ? 'Déficit Moderado (-15%)' : 'Moderate Cut (-15%)',
      tipo: 'cut',
      ritmo: '-0.35 kg / sem',
      desc: locale === 'es' ? 'Recomendado para perder grasa protegiendo el 100% del músculo.' : 'Optimal fat loss while retaining maximum lean muscle.',
    },
    deficit_agresivo: {
      pct: -0.25,
      nombre: locale === 'es' ? 'Déficit Rápido (-25%)' : 'Aggressive Cut (-25%)',
      tipo: 'cut',
      ritmo: '-0.60 kg / sem',
      desc: locale === 'es' ? 'Pérdida acelerada de peso. Exige alta proteína y disciplina.' : 'Faster fat loss. Demands disciplined high protein.',
    },
    mantenimiento: {
      pct: 0,
      nombre: locale === 'es' ? 'Mantenimiento (0%)' : 'Maintenance (0%)',
      tipo: 'maint',
      ritmo: '0.00 kg / sem',
      desc: locale === 'es' ? 'Recomposición corporal, fuerza y estabilidad de peso.' : 'Body recomposition, athletic recovery, and stable weight.',
    },
    volumen_limpio: {
      pct: 0.10,
      nombre: locale === 'es' ? 'Superávit Limpio (+10%)' : 'Lean Bulk (+10%)',
      tipo: 'bulk',
      ritmo: '+0.25 kg / sem',
      desc: locale === 'es' ? 'Ganancia muscular progresiva limitando la acumulación de grasa.' : 'Steady lean muscle hypertrophy with minimal fat gain.',
    },
    volumen_agresivo: {
      pct: 0.18,
      nombre: locale === 'es' ? 'Superávit Intenso (+18%)' : 'Aggressive Bulk (+18%)',
      tipo: 'bulk',
      ritmo: '+0.45 kg / sem',
      desc: locale === 'es' ? 'Enfocado en masa muscular rápida y récords de fuerza.' : 'Maximum muscle size focus and heavy lifting progression.',
    },
  };

  const objetivoActual = objetivosConfig[objetivo];
  const caloriasObjetivo = Math.round(tdee * (1 + objetivoActual.pct));
  const diferenciaCalorica = caloriasObjetivo - tdee;
  const cambioSemanalKg = Math.round(((diferenciaCalorica * 7) / 7700) * 100) / 100;

  // 4. Macronutrientes correlacionados con el peso
  const gramosProteina = Math.round(pesoKg * ratioProteina);
  const kcalProteina = gramosProteina * 4;

  // Grasas (25% de las calorías totales)
  const kcalGrasas = Math.round(caloriasObjetivo * 0.25);
  const gramosGrasas = Math.round(kcalGrasas / 9);

  // Carbohidratos (el resto calórico para energía de entreno)
  const kcalCarbos = Math.max(0, caloriasObjetivo - kcalProteina - kcalGrasas);
  const gramosCarbos = Math.round(kcalCarbos / 4);

  // Ratios por kilogramo de peso corporal
  const protPorKg = (gramosProteina / (pesoKg || 1)).toFixed(1);
  const carbPorKg = (gramosCarbos / (pesoKg || 1)).toFixed(1);
  const grasPorKg = (gramosGrasas / (pesoKg || 1)).toFixed(1);

  // Porcentajes reales de calorías
  const pctRealProt = Math.round((kcalProteina / (caloriasObjetivo || 1)) * 100);
  const pctRealGras = Math.round((kcalGrasas / (caloriasObjetivo || 1)) * 100);
  const pctRealCarb = Math.max(0, 100 - pctRealProt - pctRealGras);

  // Reparto por comida
  const kcalPorComida = Math.round(caloriasObjetivo / (numComidas || 1));
  const protPorComida = Math.round(gramosProteina / (numComidas || 1));
  const carbPorComida = Math.round(gramosCarbos / (numComidas || 1));
  const grasPorComida = Math.round(gramosGrasas / (numComidas || 1));

  return { pesoKg, edadVal, alturaVal, bmr, factoresActividad, factorSeleccionado, tdee, caloriasActividad, objetivosConfig, objetivoActual, caloriasObjetivo, diferenciaCalorica, cambioSemanalKg, gramosProteina, kcalProteina, kcalGrasas, gramosGrasas, kcalCarbos, gramosCarbos, protPorKg, carbPorKg, grasPorKg, pctRealProt, pctRealGras, pctRealCarb, kcalPorComida, protPorComida, carbPorComida, grasPorComida };
}

export type PlanMacros = ReturnType<typeof calcularPlanMacros>;

/** Texto plano del plan (para copiar al portapapeles). */
export function generarTextoPlanMacros(entrada: EntradaMacros): string {
  const { genero, edad, peso, altura, unidadPeso, nivelActividad, numComidas } = entrada;
  const { bmr, factoresActividad, factorSeleccionado, tdee, objetivoActual, caloriasObjetivo, cambioSemanalKg, gramosProteina, gramosGrasas, gramosCarbos, protPorKg, carbPorKg, grasPorKg, pctRealProt, pctRealGras, pctRealCarb, kcalPorComida, protPorComida, carbPorComida, grasPorComida } = calcularPlanMacros(entrada);
  return `⚡ PLAN NUTRICIONAL - DAILYSET
---------------------------------------------
1. GASTO ENERGÉTICO:
• Biotipo: ${peso} ${unidadPeso}, ${altura} cm, ${edad} años (${genero})
• Metabolismo Basal (BMR): ${bmr} kcal/día
• Actividad: ${factoresActividad[nivelActividad].nombre} (factor ${factorSeleccionado}x)
• Gasto Diario de Mantenimiento (TDEE): ${tdee} kcal/día

2. OBJETIVO:
• Meta: ${objetivoActual.nombre}
• Calorías Diarias Objetivo: ${caloriasObjetivo} kcal/día
• Ritmo proyectado: ${cambioSemanalKg > 0 ? `+${cambioSemanalKg}` : cambioSemanalKg} kg / semana

3. MACRONUTRIENTES:
• Proteínas: ${gramosProteina}g (${protPorKg} g/kg | ${pctRealProt}%)
• Carbohidratos: ${gramosCarbos}g (${carbPorKg} g/kg | ${pctRealCarb}%)
• Grasas: ${gramosGrasas}g (${grasPorKg} g/kg | ${pctRealGras}%)

4. DISTRIBUCIÓN (${numComidas} COMIDAS/DÍA):
• Por comida: ~${kcalPorComida} kcal (${protPorComida}g P | ${carbPorComida}g C | ${grasPorComida}g G)
---------------------------------------------`;
}

/** Documento HTML A4 del plan (web: iframe + print; app: expo-print). */
export function generarHTMLPlanMacros(entrada: EntradaMacros): string {
  const { locale, genero, edad, peso, altura, unidadPeso, nivelActividad, numComidas } = entrada;
  const { pesoKg, bmr, factoresActividad, factorSeleccionado, tdee, caloriasActividad, objetivoActual, caloriasObjetivo, cambioSemanalKg, gramosProteina, gramosGrasas, gramosCarbos, protPorKg, carbPorKg, grasPorKg, pctRealProt, pctRealGras, pctRealCarb, kcalPorComida, protPorComida, carbPorComida, grasPorComida } = calcularPlanMacros(entrada);
  const fechaHoy = new Date().toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return `
      <!DOCTYPE html>
      <html lang="${locale}">
      <head>
        <meta charset="utf-8">
        <title>DailySet - Plan Nutricional (${fechaHoy})</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@600;700;800&display=swap');
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 10mm 12mm;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #0f172a;
            background: #ffffff;
            line-height: 1.35;
            font-size: 11.5px;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .container {
            max-width: 100%;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 12px;
            border-bottom: 2.5px solid #0f172a;
            margin-bottom: 14px;
          }
          .logo-wrap {
            display: flex;
            align-items: center;
            gap: 9px;
          }
          .logo-icon {
            width: 34px;
            height: 34px;
            background: #0f172a;
            color: #dbf059;
            border-radius: 9px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 18px;
          }
          .logo-text {
            font-size: 20px;
            font-weight: 900;
            letter-spacing: -0.5px;
            color: #0f172a;
            line-height: 1.1;
          }
          .logo-sub {
            font-size: 9.5px;
            color: #64748b;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.6px;
          }
          .doc-title {
            text-align: right;
          }
          .doc-title h1 {
            font-size: 13px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #0f172a;
          }
          .doc-date {
            font-size: 10.5px;
            color: #64748b;
            font-weight: 600;
            margin-top: 1px;
          }

          /* Hero Banner */
          .hero {
            background: #0f172a;
            color: #ffffff;
            border-radius: 14px;
            padding: 14px 18px;
            margin-bottom: 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .hero-main h2 {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #94a3b8;
            margin-bottom: 2px;
          }
          .hero-cals {
            display: flex;
            align-items: baseline;
            gap: 6px;
          }
          .hero-cals .num {
            font-family: 'JetBrains Mono', monospace;
            font-size: 34px;
            font-weight: 900;
            color: #dbf059;
            letter-spacing: -1px;
            line-height: 1;
          }
          .hero-cals .unit {
            font-size: 12px;
            color: #cbd5e1;
            font-weight: 700;
          }
          .hero-desc {
            font-size: 10.5px;
            color: #cbd5e1;
            margin-top: 3px;
          }
          .hero-badge {
            background: #1e293b;
            border: 1px solid #334155;
            padding: 8px 14px;
            border-radius: 10px;
            text-align: right;
          }
          .hero-badge .label {
            font-size: 9px;
            color: #94a3b8;
            text-transform: uppercase;
            font-weight: 700;
            display: block;
          }
          .hero-badge .val {
            font-family: 'JetBrains Mono', monospace;
            font-size: 14px;
            font-weight: 800;
            color: #38bdf8;
            display: block;
            margin-top: 2px;
          }

          /* Biometrics strip */
          .bio-strip {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
            margin-bottom: 14px;
          }
          .bio-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 9px;
            padding: 7px 10px;
          }
          .bio-label {
            font-size: 8.5px;
            text-transform: uppercase;
            font-weight: 700;
            color: #64748b;
            letter-spacing: 0.5px;
            display: block;
          }
          .bio-val {
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
            font-weight: 800;
            color: #0f172a;
            margin-top: 1px;
            display: block;
          }

          /* Energy breakdown */
          .energy-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            margin-bottom: 14px;
          }
          .energy-box {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 8px 12px;
            background: #ffffff;
          }
          .energy-title {
            font-size: 9.5px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            margin-bottom: 2px;
          }
          .energy-num {
            font-family: 'JetBrains Mono', monospace;
            font-size: 15px;
            font-weight: 800;
            color: #0f172a;
          }
          .energy-note {
            font-size: 9px;
            color: #94a3b8;
            margin-top: 1px;
          }

          /* Macros Cards */
          .section-heading {
            font-size: 10.5px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #0f172a;
            margin-bottom: 7px;
          }
          .macros-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            margin-bottom: 14px;
          }
          .macro-card {
            border-radius: 10px;
            padding: 10px 12px;
            border: 1px solid #e2e8f0;
          }
          .macro-card.prot { background: #f0f9ff; border-color: #bae6fd; }
          .macro-card.carb { background: #fffbeb; border-color: #fde68a; }
          .macro-card.gras { background: #fff1f2; border-color: #fecdd3; }
          .macro-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 3px;
          }
          .macro-name {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
          }
          .macro-card.prot .macro-name { color: #0284c7; }
          .macro-card.carb .macro-name { color: #d97706; }
          .macro-card.gras .macro-name { color: #e11d48; }
          .macro-badge {
            font-family: 'JetBrains Mono', monospace;
            font-size: 9.5px;
            font-weight: 700;
            padding: 2px 5px;
            border-radius: 5px;
          }
          .macro-card.prot .macro-badge { background: #e0f2fe; color: #0369a1; }
          .macro-card.carb .macro-badge { background: #fef3c7; color: #b45309; }
          .macro-card.gras .macro-badge { background: #ffe4e6; color: #be123c; }
          .macro-grams {
            font-family: 'JetBrains Mono', monospace;
            font-size: 22px;
            font-weight: 900;
            color: #0f172a;
            margin: 2px 0;
          }
          .macro-ratio {
            font-family: 'JetBrains Mono', monospace;
            font-size: 10.5px;
            font-weight: 700;
            color: #475569;
          }

          /* Meals Table */
          .meals-wrap {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 14px;
          }
          .meals-table {
            width: 100%;
            border-collapse: collapse;
            text-align: center;
            font-size: 10.5px;
          }
          .meals-table th {
            background: #f8fafc;
            padding: 6px 10px;
            font-weight: 800;
            color: #475569;
            text-transform: uppercase;
            font-size: 9px;
            border-bottom: 1px solid #e2e8f0;
          }
          .meals-table td {
            padding: 7px 10px;
            border-bottom: 1px solid #f1f5f9;
            font-family: 'JetBrains Mono', monospace;
            font-weight: 600;
            color: #1e293b;
          }
          .meals-table tr:last-child td {
            border-bottom: none;
          }

          /* Guidelines */
          .guidelines {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 10px 12px;
            margin-bottom: 14px;
          }
          .guidelines-title {
            font-size: 10px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 5px;
            text-transform: uppercase;
          }
          .guidelines-list {
            list-style: none;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }
          .guidelines-item {
            font-size: 10px;
            color: #475569;
            line-height: 1.35;
          }
          .guidelines-item strong {
            color: #0f172a;
          }

          /* Footer */
          .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
            font-size: 9.5px;
            color: #94a3b8;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="logo-wrap">
              <div class="logo-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="#000" stroke="#000" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></div>
              <div>
                <div class="logo-text">DAILYSET</div>
                <div class="logo-sub">Domina tu progreso</div>
              </div>
            </div>
            <div class="doc-title">
              <h1>Plan Nutricional Personalizado</h1>
              <div class="doc-date">${fechaHoy}</div>
            </div>
          </div>

          <!-- Hero Card: Target Calories -->
          <div class="hero">
            <div class="hero-main">
              <h2>Objetivo Nutricional Diario</h2>
              <div class="hero-cals">
                <span class="num">${caloriasObjetivo.toLocaleString()}</span>
                <span class="unit">kcal / día</span>
              </div>
              <div class="hero-desc">${objetivoActual.nombre} • ${objetivoActual.desc}</div>
            </div>
            <div class="hero-badge">
              <span class="label">Ritmo Proyectado</span>
              <span class="val">${cambioSemanalKg > 0 ? `+${cambioSemanalKg}` : cambioSemanalKg} kg / semana</span>
            </div>
          </div>

          <!-- Biometrics Strip -->
          <div class="bio-strip">
            <div class="bio-box">
              <span class="bio-label">Sexo</span>
              <span class="bio-val">${genero === 'masculino' ? 'Hombre' : 'Mujer'}</span>
            </div>
            <div class="bio-box">
              <span class="bio-label">Peso</span>
              <span class="bio-val">${peso} ${unidadPeso}</span>
            </div>
            <div class="bio-box">
              <span class="bio-label">Estatura</span>
              <span class="bio-val">${altura} cm</span>
            </div>
            <div class="bio-box">
              <span class="bio-label">Edad</span>
              <span class="bio-val">${edad} años</span>
            </div>
            <div class="bio-box">
              <span class="bio-label">Actividad</span>
              <span class="bio-val">${factoresActividad[nivelActividad].nombre} (${factorSeleccionado}x)</span>
            </div>
          </div>

          <!-- Energy Correlated Breakdown -->
          <div class="energy-grid">
            <div class="energy-box">
              <div class="energy-title">Metabolismo Basal (BMR)</div>
              <div class="energy-num">${bmr} kcal</div>
              <div class="energy-note">Gasto en reposo vital absoluto</div>
            </div>
            <div class="energy-box">
              <div class="energy-title">Gasto por Actividad</div>
              <div class="energy-num">+${caloriasActividad} kcal</div>
              <div class="energy-note">${factoresActividad[nivelActividad].entreno}</div>
            </div>
            <div class="energy-box">
              <div class="energy-title">Mantenimiento (TDEE)</div>
              <div class="energy-num">${tdee} kcal</div>
              <div class="energy-note">Punto de equilibrio calórico</div>
            </div>
          </div>

          <!-- Macronutrients -->
          <div class="section-heading">Distribución Óptima de Macronutrientes</div>
          <div class="macros-grid">
            <div class="macro-card prot">
              <div class="macro-top">
                <span class="macro-name">Proteínas</span>
                <span class="macro-badge">${pctRealProt}% kcal</span>
              </div>
              <div class="macro-grams">${gramosProteina} g</div>
              <div class="macro-ratio">${protPorKg} g / kg peso corporal</div>
            </div>

            <div class="macro-card carb">
              <div class="macro-top">
                <span class="macro-name">Carbohidratos</span>
                <span class="macro-badge">${pctRealCarb}% kcal</span>
              </div>
              <div class="macro-grams">${gramosCarbos} g</div>
              <div class="macro-ratio">${carbPorKg} g / kg peso corporal</div>
            </div>

            <div class="macro-card gras">
              <div class="macro-top">
                <span class="macro-name">Grasas Saludables</span>
                <span class="macro-badge">${pctRealGras}% kcal</span>
              </div>
              <div class="macro-grams">${gramosGrasas} g</div>
              <div class="macro-ratio">${grasPorKg} g / kg peso corporal</div>
            </div>
          </div>

          <!-- Meals Breakdown -->
          <div class="section-heading">Distribución por Ingestas (${numComidas} Comidas / Día)</div>
          <div class="meals-wrap">
            <table class="meals-table">
              <thead>
                <tr>
                  <th style="text-align: left;">Toma</th>
                  <th>Calorías</th>
                  <th>Proteína</th>
                  <th>Carbohidratos</th>
                  <th>Grasas</th>
                </tr>
              </thead>
              <tbody>
                ${Array.from({ length: numComidas }).map((_, idx) => `
                  <tr>
                    <td style="text-align: left; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700;">Comida ${idx + 1}</td>
                    <td>~${kcalPorComida} kcal</td>
                    <td style="color: #0284c7;">${protPorComida}g</td>
                    <td style="color: #d97706;">${carbPorComida}g</td>
                    <td style="color: #e11d48;">${grasPorComida}g</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Guidelines -->
          <div class="guidelines">
            <div class="guidelines-title">Recomendaciones Clave para Adherencia</div>
            <div class="guidelines-list">
              <div class="guidelines-item">
                <strong>Hidratación:</strong> Bebe entre 35 y 40 ml de agua por kg de peso corporal al día (${Math.round((pesoKg * 37) / 10) / 100}L aprox).
              </div>
              <div class="guidelines-item">
                <strong>Síntesis Proteica:</strong> Distribuye las tomas cada 3-4 horas para mantener activo el estímulo anabólico (MPS).
              </div>
              <div class="guidelines-item">
                <strong>Monitoreo de Peso:</strong> Regístrate en ayunas 3 veces por semana y ajusta ±100 kcal según la tendencia de la media quincenal.
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div>DAILYSET • Plataforma de Registro, Rutinas y Nutrición Científica</div>
            <div>dailyset.app</div>
          </div>
        </div>
      </body>
      </html>
`;
}
