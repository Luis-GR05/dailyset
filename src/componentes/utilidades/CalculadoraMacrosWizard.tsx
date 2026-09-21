import { useState, useEffect } from 'react';
import Card from '../ui/Card';
import { useI18n } from '../../context/I18nContext';
import { useAuth } from '../../context/AuthContext';
import {
  Utensils,
  Scale,
  HeartPulse,
  Target,
  ArrowRight,
  ArrowLeft,
  Check,
  Copy,
  RotateCcw,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
  Activity,
  User,
  Pencil,
  Printer,
} from 'lucide-react';

type PasoId = 1 | 2 | 3 | 4 | 'resumen';
type NivelActividad = 'sedentario' | 'ligero' | 'moderado' | 'activo' | 'muy_activo';
type TipoObjetivo = 'deficit_moderado' | 'deficit_agresivo' | 'mantenimiento' | 'volumen_limpio' | 'volumen_agresivo';

export default function CalculadoraMacrosWizard() {
  const { locale } = useI18n();
  const { user } = useAuth();

  // ── ESTADO DEL PROCESO ──
  const [paso, setPaso] = useState<PasoId>(1);
  const [copiado, setCopiado] = useState(false);

  // ── PASO 1: DATOS CORPORALES ──
  const [genero, setGenero] = useState<'masculino' | 'femenino'>(
    user?.genero === 'femenino' ? 'femenino' : 'masculino'
  );
  const [edad, setEdad] = useState<number>(user?.edad || 26);
  const [peso, setPeso] = useState<number>(user?.pesoKg || 75);
  const [altura, setAltura] = useState<number>(user?.alturaCm || 178);
  const [unidadPeso, setUnidadPeso] = useState<'kg' | 'lbs'>('kg');
  const [grasaCorporal, setGrasaCorporal] = useState<number | ''>('');

  // ── PASO 2: ACTIVIDAD ──
  const [nivelActividad, setNivelActividad] = useState<NivelActividad>(
    user?.nivelActividad || 'moderado'
  );

  // ── PASO 3: OBJETIVO ──
  const [objetivo, setObjetivo] = useState<TipoObjetivo>('deficit_moderado');

  // ── PASO 4: ESTRATEGIA DE MACROS Y COMIDAS ──
  const [ratioProteina, setRatioProteina] = useState<number>(2.0); // g/kg
  const [numComidas, setNumComidas] = useState<number>(4);

  // Sincronización inicial con el perfil del usuario si existe
  useEffect(() => {
    if (user?.edad) setEdad(user.edad);
    if (user?.pesoKg) setPeso(user.pesoKg);
    if (user?.alturaCm) setAltura(user.alturaCm);
    if (user?.genero && user.genero !== 'otro') setGenero(user.genero);
    if (user?.nivelActividad) setNivelActividad(user.nivelActividad);
  }, [user]);

  // ── CÁLCULOS MATEMÁTICOS CORRELACIONADOS ──
  const pesoKg = unidadPeso === 'lbs' ? (peso || 75) * 0.453592 : (peso || 75);
  const edadVal = Math.max(12, Math.min(100, edad || 26));
  const alturaVal = Math.max(120, Math.min(240, altura || 178));

  // 1. Metabolismo Basal (BMR)
  const calcularBMR = () => {
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

  // Copiar resumen del plan
  const copiarPlan = () => {
    const texto = `⚡ PLAN NUTRICIONAL - DAILYSET
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

    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  };

  // ════════════════════════════════════════════════════════════
  // ── EXPORTAR A PDF CON DISEÑO PREMIUM PARA IMPRESIÓN      ──
  // ════════════════════════════════════════════════════════════
  const exportarPDF = () => {
    const fechaHoy = new Date().toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const printHtml = `
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
              <div class="logo-icon">⚡</div>
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
                <strong>💧 Hidratación:</strong> Bebe entre 35 y 40 ml de agua por kg de peso corporal al día (${Math.round((pesoKg * 37) / 10) / 100}L aprox).
              </div>
              <div class="guidelines-item">
                <strong>⏱️ Síntesis Proteica:</strong> Distribuye las tomas cada 3-4 horas para mantener activo el estímulo anabólico (MPS).
              </div>
              <div class="guidelines-item">
                <strong>⚖️ Monitoreo:</strong> Regístrate en ayunas 3 veces por semana y ajusta ±100 kcal según la tendencia de la media quincenal.
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

    // Crear iframe invisible para impresión limpia sin bloquear ventana
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(printHtml);
      doc.close();
      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }, 400);
    }
  };

  const reiniciarTodo = () => {
    setGenero('masculino');
    setEdad(26);
    setPeso(75);
    setAltura(178);
    setGrasaCorporal('');
    setNivelActividad('moderado');
    setObjetivo('deficit_moderado');
    setRatioProteina(2.0);
    setNumComidas(4);
    setPaso(1);
  };

  // ════════════════════════════════════════════════════════════
  // ── PANTALLA: RESUMEN FINAL COMPLETO                      ──
  // ════════════════════════════════════════════════════════════
  if (paso === 'resumen') {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-6 animate-fadeIn pb-8">
        {/* Cabecera del resumen */}
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
            <div className="flex items-center gap-3.5">
              <div className="p-3.5 rounded-2xl bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
                <Sparkles size={26} />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[var(--color-primary)] block">
                  {locale === 'es' ? 'Plan Calculado con Éxito' : 'Blueprint Calculated'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {locale === 'es' ? 'Tu Plan Nutricional Personalizado' : 'Your Custom Nutrition Blueprint'}
                </h2>
              </div>
            </div>

            {/* Acciones superiores del resumen */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <button
                type="button"
                onClick={exportarPDF}
                className="px-4 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow active:scale-95"
                title={locale === 'es' ? 'Exportar a PDF o Imprimir' : 'Export to PDF or Print'}
              >
                <Printer size={15} className="text-[var(--color-primary)]" />
                <span>{locale === 'es' ? 'Imprimir / PDF' : 'Print / PDF'}</span>
              </button>

              <button
                type="button"
                onClick={copiarPlan}
                className="px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(219,240,89,0.3)] active:scale-95"
              >
                {copiado ? <Check size={15} /> : <Copy size={15} />}
                <span>{copiado ? (locale === 'es' ? '¡Copiado!' : 'Copied!') : (locale === 'es' ? 'Copiar Plan' : 'Copy Plan')}</span>
              </button>
            </div>
          </div>

          {/* Calorías Objetivo Centrales */}
          <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-neutral-950 border border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                {locale === 'es' ? 'Meta Calórica Diaria' : 'Target Daily Calories'}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl sm:text-5xl font-black font-mono text-[var(--color-primary)] tracking-tight">
                  {caloriasObjetivo.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-neutral-400">kcal / día</span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                {objetivoActual.nombre} • {objetivoActual.desc}
              </p>
            </div>

            <div className="sm:text-right flex sm:flex-col justify-between sm:justify-center items-start sm:items-end border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-800">
              <span className="text-xs text-neutral-400 block">
                {locale === 'es' ? 'Ritmo proyectado:' : 'Projected rate:'}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 font-mono font-black text-sm px-3 py-1.5 rounded-full mt-1 ${
                  cambioSemanalKg < 0
                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                    : cambioSemanalKg > 0
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    : 'bg-neutral-800 text-neutral-300'
                }`}
              >
                {cambioSemanalKg < 0 ? <ArrowDownRight size={16} /> : cambioSemanalKg > 0 ? <ArrowUpRight size={16} /> : null}
                {cambioSemanalKg > 0 ? `+${cambioSemanalKg}` : cambioSemanalKg} kg / sem
              </span>
            </div>
          </div>

          {/* Desglose de Correlación Matemática (BMR -> TDEE -> Meta) */}
          <div className="mt-4 p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2.5">
              {locale === 'es' ? 'Correlación del Gasto Energético:' : 'Energy Expenditure Breakdown:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                  <HeartPulse size={14} className="text-rose-400" />
                  <span>{locale === 'es' ? 'Metabolismo Basal (BMR)' : 'Basal Rate (BMR)'}</span>
                </div>
                <span className="text-base font-black text-white">{bmr} kcal</span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">En reposo absoluto</span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                  <Activity size={14} className="text-amber-400" />
                  <span>{locale === 'es' ? `Actividad (${factorSeleccionado}x)` : `Activity (${factorSeleccionado}x)`}</span>
                </div>
                <span className="text-base font-black text-amber-400">+{caloriasActividad} kcal</span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">{factoresActividad[nivelActividad].nombre}</span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                  <Scale size={14} className="text-blue-400" />
                  <span>{locale === 'es' ? 'Mantenimiento (TDEE)' : 'Maintenance (TDEE)'}</span>
                </div>
                <span className="text-base font-black text-white">{tdee} kcal</span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">Gasto real diario</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas de Macronutrientes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Proteína */}
          <Card className="p-5 rounded-3xl bg-neutral-900/80 border border-blue-500/25 space-y-3" hoverable={false}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                {locale === 'es' ? 'Proteínas' : 'Protein'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                {pctRealProt}% kcal
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-3xl sm:text-4xl font-black text-white">{gramosProteina}</span>
              <span className="text-sm font-bold text-neutral-400">g / día</span>
            </div>
            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>{locale === 'es' ? 'Ratio corporal:' : 'Body ratio:'}</span>
              <strong className="text-blue-400">{protPorKg} g/kg</strong>
            </div>
          </Card>

          {/* Carbohidratos */}
          <Card className="p-5 rounded-3xl bg-neutral-900/80 border border-amber-500/25 space-y-3" hoverable={false}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                {locale === 'es' ? 'Carbohidratos' : 'Carbohydrates'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {pctRealCarb}% kcal
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-3xl sm:text-4xl font-black text-white">{gramosCarbos}</span>
              <span className="text-sm font-bold text-neutral-400">g / día</span>
            </div>
            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>{locale === 'es' ? 'Ratio corporal:' : 'Body ratio:'}</span>
              <strong className="text-amber-400">{carbPorKg} g/kg</strong>
            </div>
          </Card>

          {/* Grasas */}
          <Card className="p-5 rounded-3xl bg-neutral-900/80 border border-rose-500/25 space-y-3" hoverable={false}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-rose-400">
                {locale === 'es' ? 'Grasas Saludables' : 'Healthy Fats'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                {pctRealGras}% kcal
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-3xl sm:text-4xl font-black text-white">{gramosGrasas}</span>
              <span className="text-sm font-bold text-neutral-400">g / día</span>
            </div>
            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>{locale === 'es' ? 'Ratio corporal:' : 'Body ratio:'}</span>
              <strong className="text-rose-400">{grasPorKg} g/kg</strong>
            </div>
          </Card>
        </div>

        {/* Reparto por comidas */}
        <Card className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-4" hoverable={false}>
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Utensils size={18} className="text-[var(--color-primary)]" />
              <h3 className="text-sm font-extrabold text-white">
                {locale === 'es' ? `Reparto en ${numComidas} Comidas Diarias` : `Split across ${numComidas} Daily Meals`}
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--color-primary)]">
              ~{kcalPorComida} kcal / {locale === 'es' ? 'comida' : 'meal'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: numComidas }).map((_, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-center">
                <span className="text-xs font-bold text-white block">
                  {locale === 'es' ? `Comida ${idx + 1}` : `Meal ${idx + 1}`}
                </span>
                <span className="text-xs font-mono text-neutral-400 block font-bold">
                  {kcalPorComida} kcal
                </span>
                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-neutral-900 text-[11px] font-mono font-bold">
                  <span className="text-blue-400">{protPorComida}g P</span>
                  <span className="text-amber-400">{carbPorComida}g C</span>
                  <span className="text-rose-400">{grasPorComida}g G</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Botones de acción finales */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={exportarPDF}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[var(--color-primary)] text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(219,240,89,0.3)] active:scale-95"
          >
            <Printer size={16} />
            <span>{locale === 'es' ? 'Exportar a PDF / Imprimir' : 'Export to PDF / Print'}</span>
          </button>

          <button
            type="button"
            onClick={reiniciarTodo}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow active:scale-95"
          >
            <RotateCcw size={16} />
            <span>{locale === 'es' ? 'Hacerlo de nuevo (Reiniciar)' : 'Calculate Again (Reset)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setPaso(1)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Pencil size={15} />
            <span>{locale === 'es' ? 'Modificar mis datos' : 'Edit my inputs'}</span>
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // ── PROCESO PASO A PASO LIMPIO Y ESPACIOSO                ──
  // ════════════════════════════════════════════════════════════
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fadeIn pb-8">
      {/* ── BARRA DE PROGRESO DEL PROCESO ── */}
      <div className="p-4 sm:p-5 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-xl">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-neutral-950 font-mono font-black text-xs flex items-center justify-center">
              {paso}
            </span>
            <span className="font-extrabold text-white uppercase tracking-wider">
              {paso === 1 && (locale === 'es' ? 'Paso 1 de 4: Tus Datos Corporales' : 'Step 1 of 4: Body Parameters')}
              {paso === 2 && (locale === 'es' ? 'Paso 2 de 4: Nivel de Actividad' : 'Step 2 of 4: Activity Level')}
              {paso === 3 && (locale === 'es' ? 'Paso 3 de 4: Tu Objetivo Calórico' : 'Step 3 of 4: Calorie Goal')}
              {paso === 4 && (locale === 'es' ? 'Paso 4 de 4: Estrategia de Macros' : 'Step 4 of 4: Macro Strategy')}
            </span>
          </div>
          <span className="font-mono text-neutral-400 text-xs">
            {paso === 1 ? '25%' : paso === 2 ? '50%' : paso === 3 ? '75%' : '100%'}
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="w-full h-2 rounded-full bg-neutral-950 overflow-hidden">
          <div
            className="h-full bg-[var(--color-primary)] transition-all duration-300 rounded-full"
            style={{
              width: paso === 1 ? '25%' : paso === 2 ? '50%' : paso === 3 ? '75%' : '100%',
            }}
          />
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* ── PASO 1: TUS DATOS CORPORALES                       ── */}
      {/* ──────────────────────────────────────────────────────── */}
      {paso === 1 && (
        <Card className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-6 shadow-xl" hoverable={false}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
                <User size={22} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {locale === 'es' ? '1. ¿Cuáles son tus medidas?' : '1. What are your body metrics?'}
                </h3>
                <p className="text-xs text-neutral-400">
                  {locale === 'es'
                    ? 'Necesario para calcular con precisión las calorías basales que quema tu cuerpo.'
                    : 'Needed to accurately compute your baseline metabolic rate.'}
                </p>
              </div>
            </div>

            {/* Sexo biológico */}
            <div className="flex bg-neutral-950 p-1 rounded-2xl border border-neutral-800 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setGenero('masculino')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  genero === 'masculino'
                    ? 'bg-[var(--color-primary)] text-neutral-950 shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {locale === 'es' ? 'Hombre' : 'Male'}
              </button>
              <button
                type="button"
                onClick={() => setGenero('femenino')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  genero === 'femenino'
                    ? 'bg-[var(--color-primary)] text-neutral-950 shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {locale === 'es' ? 'Mujer' : 'Female'}
              </button>
            </div>
          </div>

          {/* Grid de Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Peso */}
            <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-300">
                  {locale === 'es' ? 'Peso corporal' : 'Body weight'}
                </label>
                <div className="flex text-[10px] bg-neutral-900 rounded-lg p-0.5 border border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setUnidadPeso('kg')}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                      unidadPeso === 'kg' ? 'bg-[var(--color-primary)] text-neutral-950 font-bold' : 'text-neutral-400'
                    }`}
                  >
                    kg
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnidadPeso('lbs')}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                      unidadPeso === 'lbs' ? 'bg-[var(--color-primary)] text-neutral-950 font-bold' : 'text-neutral-400'
                    }`}
                  >
                    lbs
                  </button>
                </div>
              </div>
              <input
                type="number"
                step="0.5"
                value={peso || ''}
                onChange={(e) => setPeso(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono font-black text-xl focus:border-[var(--color-primary)] focus:outline-none"
                placeholder="75"
              />
              <span className="text-[11px] text-neutral-500 block">
                {locale === 'es' ? 'Tu peso actual en ayunas' : 'Current morning weight'}
              </span>
            </div>

            {/* Estatura */}
            <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-2">
              <label className="text-xs font-bold text-neutral-300 block">
                {locale === 'es' ? 'Estatura (cm)' : 'Height (cm)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={altura || ''}
                  onChange={(e) => setAltura(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono font-black text-xl focus:border-[var(--color-primary)] focus:outline-none"
                  placeholder="178"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-500 font-bold">
                  cm
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 block">
                {locale === 'es' ? 'Altura descalzo' : 'Height without shoes'}
              </span>
            </div>

            {/* Edad */}
            <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-2">
              <label className="text-xs font-bold text-neutral-300 block">
                {locale === 'es' ? 'Edad (años)' : 'Age (years)'}
              </label>
              <input
                type="number"
                value={edad || ''}
                onChange={(e) => setEdad(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono font-black text-xl focus:border-[var(--color-primary)] focus:outline-none"
                placeholder="26"
              />
              <span className="text-[11px] text-neutral-500 block">
                {locale === 'es' ? 'Ajuste del ritmo metabólico' : 'Metabolic rate factor'}
              </span>
            </div>

            {/* % Grasa Corporal (Opcional) */}
            <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-300">
                  {locale === 'es' ? '% Grasa corporal' : 'Body fat %'}
                </label>
                <span className="text-[10px] text-[var(--color-primary)] font-mono">
                  {locale === 'es' ? 'Opcional' : 'Optional'}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  placeholder="15"
                  value={grasaCorporal}
                  onChange={(e) => setGrasaCorporal(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono font-black text-xl focus:border-[var(--color-primary)] focus:outline-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-500 font-bold">
                  %
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 block">
                {locale === 'es' ? 'Si lo conoces, usa fórmula magra' : 'Enables Katch-McArdle formula'}
              </span>
            </div>
          </div>

          {/* Botón Siguiente */}
          <div className="pt-4 border-t border-neutral-800 flex justify-end">
            <button
              type="button"
              onClick={() => setPaso(2)}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[var(--color-primary)] text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(219,240,89,0.3)] active:scale-95"
            >
              <span>{locale === 'es' ? 'Siguiente: Nivel de Actividad' : 'Next: Activity Level'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </Card>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* ── PASO 2: NIVEL DE ACTIVIDAD                         ── */}
      {/* ──────────────────────────────────────────────────────── */}
      {paso === 2 && (
        <Card className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-6 shadow-xl" hoverable={false}>
          <div className="flex items-center gap-3 pb-4 border-b border-neutral-800">
            <div className="p-3 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
              <Activity size={22} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {locale === 'es' ? '2. ¿Cuál es tu nivel de actividad física?' : '2. What is your activity level?'}
              </h3>
              <p className="text-xs text-neutral-400">
                {locale === 'es'
                  ? 'Selecciona la opción que mejor describa tu semana habitual de entrenamiento.'
                  : 'Pick the option that best reflects your weekly workout routine.'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {(Object.keys(factoresActividad) as NivelActividad[]).map((key) => {
              const item = factoresActividad[key];
              const activo = nivelActividad === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setNivelActividad(key)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    activo
                      ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-white shadow-lg ring-1 ring-[var(--color-primary)]/40'
                      : 'bg-neutral-950/70 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-extrabold ${activo ? 'text-[var(--color-primary)]' : 'text-neutral-200'}`}>
                        {item.nombre}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-400 border border-neutral-800">
                        {item.entreno}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-center">
                    <span className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                      activo
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-neutral-950'
                        : 'border-neutral-700 bg-neutral-900'
                    }`}>
                      {activo && <Check size={14} strokeWidth={3} />}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navegación Paso 2 */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPaso(1)}
              className="px-5 py-3 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>{locale === 'es' ? 'Anterior' : 'Back'}</span>
            </button>
            <button
              type="button"
              onClick={() => setPaso(3)}
              className="px-7 py-3.5 rounded-2xl bg-[var(--color-primary)] text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(219,240,89,0.3)] active:scale-95"
            >
              <span>{locale === 'es' ? 'Siguiente: Tu Objetivo' : 'Next: Calorie Goal'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </Card>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* ── PASO 3: OBJETIVO NUTRICIONAL                       ── */}
      {/* ──────────────────────────────────────────────────────── */}
      {paso === 3 && (
        <Card className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-6 shadow-xl" hoverable={false}>
          <div className="flex items-center gap-3 pb-4 border-b border-neutral-800">
            <div className="p-3 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
              <Target size={22} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {locale === 'es' ? '3. ¿Cuál es tu objetivo principal?' : '3. What is your primary fitness goal?'}
              </h3>
              <p className="text-xs text-neutral-400">
                {locale === 'es'
                  ? 'Ajustaremos tu superávit o déficit respecto a tus calorías de mantenimiento.'
                  : 'We will adjust surplus or deficit relative to your maintenance burn.'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {(Object.keys(objetivosConfig) as TipoObjetivo[]).map((key) => {
              const item = objetivosConfig[key];
              const activo = objetivo === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setObjetivo(key)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    activo
                      ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-white shadow-lg ring-1 ring-[var(--color-primary)]/40'
                      : 'bg-neutral-950/70 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-extrabold ${activo ? 'text-[var(--color-primary)]' : 'text-neutral-200'}`}>
                        {item.nombre}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          item.tipo === 'cut'
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                            : item.tipo === 'bulk'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                            : 'bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        {item.ritmo}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-center">
                    <span className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                      activo
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-neutral-950'
                        : 'border-neutral-700 bg-neutral-900'
                    }`}>
                      {activo && <Check size={14} strokeWidth={3} />}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navegación Paso 3 */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPaso(2)}
              className="px-5 py-3 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>{locale === 'es' ? 'Anterior' : 'Back'}</span>
            </button>
            <button
              type="button"
              onClick={() => setPaso(4)}
              className="px-7 py-3.5 rounded-2xl bg-[var(--color-primary)] text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(219,240,89,0.3)] active:scale-95"
            >
              <span>{locale === 'es' ? 'Siguiente: Estrategia de Macros' : 'Next: Macro Strategy'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </Card>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* ── PASO 4: ESTRATEGIA DE MACROS Y COMIDAS             ── */}
      {/* ──────────────────────────────────────────────────────── */}
      {paso === 4 && (
        <Card className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-6 shadow-xl" hoverable={false}>
          <div className="flex items-center gap-3 pb-4 border-b border-neutral-800">
            <div className="p-3 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
              <Utensils size={22} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {locale === 'es' ? '4. Estrategia de Proteína y Comidas' : '4. Protein Strategy & Meals'}
              </h3>
              <p className="text-xs text-neutral-400">
                {locale === 'es'
                  ? 'La proteína se calcula de acuerdo a tu peso corporal, y el resto se equilibra para darte energía.'
                  : 'Protein is calculated from bodyweight, with carbs and fats fueling your workouts.'}
              </p>
            </div>
          </div>

          {/* Selector de Proteína en g/kg */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-neutral-300 block">
              {locale === 'es' ? '¿Cuánta proteína por kilo deseas consumir?' : 'How much protein per kg do you prefer?'}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { ratio: 1.8, label: '1.8 g / kg', desc: locale === 'es' ? 'Mantenimiento y Salud' : 'Health & Balance' },
                { ratio: 2.0, label: '2.0 g / kg', desc: locale === 'es' ? 'Óptima para Gimnasio (Estándar)' : 'Gym Optimal (Standard)' },
                { ratio: 2.2, label: '2.2 g / kg', desc: locale === 'es' ? 'Máxima Retención en Déficit' : 'Maximum Retention in Cut' },
              ].map((p) => {
                const activo = ratioProteina === p.ratio;
                return (
                  <button
                    key={p.ratio}
                    type="button"
                    onClick={() => setRatioProteina(p.ratio)}
                    className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                      activo
                        ? 'bg-blue-500/20 border-blue-500 text-white shadow-md ring-1 ring-blue-500/40'
                        : 'bg-neutral-950/70 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span className="text-sm font-mono font-black block">{p.label}</span>
                    <span className="text-xs text-neutral-400 block mt-1">{p.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selector de Número de Comidas */}
          <div className="space-y-3 pt-4 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-300">
                {locale === 'es' ? '¿En cuántas comidas prefieres repartirlas?' : 'How many daily meals do you prefer?'}
              </label>
              <span className="text-xs font-mono font-bold text-[var(--color-primary)]">
                {numComidas} {locale === 'es' ? 'comidas' : 'meals'}
              </span>
            </div>

            <div className="flex gap-2">
              {[2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNumComidas(n)}
                  className={`flex-1 py-3 rounded-2xl font-mono font-black text-sm border transition-all cursor-pointer ${
                    numComidas === n
                      ? 'bg-[var(--color-primary)] text-neutral-950 border-[var(--color-primary)] shadow-md'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Navegación Paso 4 -> GENERAR RESUMEN */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPaso(3)}
              className="px-5 py-3 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>{locale === 'es' ? 'Anterior' : 'Back'}</span>
            </button>
            <button
              type="button"
              onClick={() => setPaso('resumen')}
              className="px-7 py-3.5 rounded-2xl bg-[var(--color-primary)] text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_25px_rgba(219,240,89,0.35)] active:scale-95"
            >
              <span>{locale === 'es' ? 'Ver Mi Resumen Completo' : 'View Full Blueprint'}</span>
              <Sparkles size={16} />
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
