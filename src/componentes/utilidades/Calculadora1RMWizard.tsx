import { useState } from 'react';
import Card from '../ui/Card';
import { useI18n } from '../../context/I18nContext';
import {
  Dumbbell,
  Target,
  Sparkles,
  Printer,
  Copy,
  Check,
  RotateCcw,
  Pencil,
  ArrowRight,
  ArrowLeft,
  Award,
  Layers,
} from 'lucide-react';

type Paso1RM = 1 | 2 | 3 | 'resumen';
type Formula1RM = 'promedio' | 'epley' | 'brzycki' | 'lander' | 'lombardi';

export default function Calculadora1RMWizard() {
  const { locale } = useI18n();

  // ── ESTADO DEL PROCESO ──
  const [paso, setPaso] = useState<Paso1RM>(1);
  const [copiado, setCopiado] = useState(false);

  // ── PASO 1: EJERCICIO Y UNIDAD ──
  const [ejercicio, setEjercicio] = useState<string>('Press de Banca');
  const [ejercicioCustom, setEjercicioCustom] = useState<string>('');
  const [unidad, setUnidad] = useState<'kg' | 'lbs'>('kg');

  // ── PASO 2: CARGA Y REPETICIONES ──
  const [peso, setPeso] = useState<number>(80);
  const [reps, setReps] = useState<number>(5);

  // ── PASO 3: FÓRMULA CIENTÍFICA ──
  const [formula, setFormula] = useState<Formula1RM>('promedio');

  const nombreEjercicioFinal = ejercicio === 'otro'
    ? (ejercicioCustom.trim() || (locale === 'es' ? 'Ejercicio Personalizado' : 'Custom Exercise'))
    : ejercicio;

  // ── CÁLCULOS CIENTÍFICOS 1RM ──
  const calcularRM = (p: number, r: number, f: Formula1RM): number => {
    if (!p || p <= 0 || !r || r <= 0) return 0;
    if (r === 1) return p;

    const epley = p * (1 + r / 30);
    const brzycki = p * (36 / (37 - r));
    const lander = (100 * p) / (101.3 - 2.67123 * r);
    const lombardi = p * Math.pow(r, 0.10);

    let val = 0;
    switch (f) {
      case 'epley':
        val = epley;
        break;
      case 'brzycki':
        val = brzycki;
        break;
      case 'lander':
        val = lander;
        break;
      case 'lombardi':
        val = lombardi;
        break;
      case 'promedio':
      default:
        val = (epley + brzycki + lander + lombardi) / 4;
        break;
    }
    return Math.round(val * 10) / 10;
  };

  const rmCalculado = calcularRM(peso, reps, formula);
  const rmEpley = calcularRM(peso, reps, 'epley');
  const rmBrzycki = calcularRM(peso, reps, 'brzycki');
  const rmLander = calcularRM(peso, reps, 'lander');
  const rmLombardi = calcularRM(peso, reps, 'lombardi');

  // Tabla completa de zonas de carga
  const tablaZonas = [
    { pct: 100, reps: '1 rep', desc: locale === 'es' ? 'Fuerza Máxima (Récord Personal)' : 'Max Strength (Personal Record)', zona: 'max' },
    { pct: 95, reps: '2 reps', desc: locale === 'es' ? 'Fuerza Pura / Potencia Neural' : 'Pure Strength / Neural Power', zona: 'max' },
    { pct: 90, reps: '3 - 4 reps', desc: locale === 'es' ? 'Fuerza Pesada de Competición' : 'Heavy Competition Strength', zona: 'max' },
    { pct: 85, reps: '5 - 6 reps', desc: locale === 'es' ? 'Fuerza e Hipertrofia Miofibrilar' : 'Strength & Myofibrillar Size', zona: 'hiper' },
    { pct: 80, reps: '7 - 8 reps', desc: locale === 'es' ? 'Hipertrofia Óptima (Estándar)' : 'Optimal Hypertrophy (Standard)', zona: 'hiper' },
    { pct: 75, reps: '9 - 10 reps', desc: locale === 'es' ? 'Hipertrofia y Acumulación de Volumen' : 'Hypertrophy & Volume Accumulation', zona: 'hiper' },
    { pct: 70, reps: '11 - 12 reps', desc: locale === 'es' ? 'Capacidad de Trabajo y Tensión Continua' : 'Work Capacity & Continuous Tension', zona: 'resist' },
    { pct: 65, reps: '13 - 15 reps', desc: locale === 'es' ? 'Resistencia Muscular y Fatiga Metabólica' : 'Muscular Endurance & Metabolic Burn', zona: 'resist' },
    { pct: 60, reps: '16 - 20 reps', desc: locale === 'es' ? 'Bombeo, Congestión y Descarga' : 'Pump, Bloodflow & Deload', zona: 'resist' },
    { pct: 50, reps: '20+ reps', desc: locale === 'es' ? 'Calentamiento y Activación Motora' : 'Warm-up & Motor Activation', zona: 'resist' },
  ];

  // Copiar resumen de fuerza al portapapeles
  const copiarResumen = () => {
    const texto = `⚡ FICHA DE FUERZA Y 1RM - DAILYSET
---------------------------------------------
• Ejercicio: ${nombreEjercicioFinal}
• Serie de Referencia: ${peso} ${unidad} × ${reps} reps
• Fórmula elegida: ${formula.toUpperCase()}
• 1RM ESTIMADO: ${rmCalculado} ${unidad}

TABLA DE CARGAS Y ZONAS:
${tablaZonas.map((z) => `• ${z.pct}%: ${(Math.round(rmCalculado * (z.pct / 100) * 10) / 10)} ${unidad} (${z.reps}) - ${z.desc}`).join('\n')}
---------------------------------------------`;

    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  };

  // ════════════════════════════════════════════════════════════
  // ── EXPORTAR FICHA 1RM A PDF PARA IMPRIMIR                ──
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
        <title>DailySet - Ficha 1RM (${nombreEjercicioFinal})</title>
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

          /* Hero 1RM Display */
          .hero {
            background: #0f172a;
            color: #ffffff;
            border-radius: 14px;
            padding: 16px 20px;
            margin-bottom: 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .hero-main h2 {
            font-size: 10.5px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #94a3b8;
            margin-bottom: 2px;
          }
          .hero-exercise {
            font-size: 18px;
            font-weight: 900;
            color: #ffffff;
            margin-bottom: 6px;
          }
          .hero-rm-display {
            display: flex;
            align-items: baseline;
            gap: 8px;
          }
          .hero-rm-num {
            font-family: 'JetBrains Mono', monospace;
            font-size: 42px;
            font-weight: 900;
            color: #dbf059;
            letter-spacing: -1px;
            line-height: 1;
          }
          .hero-rm-unit {
            font-size: 14px;
            color: #cbd5e1;
            font-weight: 700;
          }
          .hero-box-right {
            background: #1e293b;
            border: 1px solid #334155;
            padding: 10px 16px;
            border-radius: 12px;
            text-align: right;
          }
          .hero-box-right .label {
            font-size: 9.5px;
            color: #94a3b8;
            text-transform: uppercase;
            font-weight: 700;
            display: block;
          }
          .hero-box-right .val {
            font-family: 'JetBrains Mono', monospace;
            font-size: 15px;
            font-weight: 800;
            color: #38bdf8;
            display: block;
            margin-top: 2px;
          }
          .hero-box-right .sub {
            font-size: 9.5px;
            color: #cbd5e1;
            margin-top: 2px;
            display: block;
          }

          /* Formulas Comparison */
          .formulas-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin-bottom: 14px;
          }
          .formula-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 8px 10px;
          }
          .formula-name {
            font-size: 9.5px;
            text-transform: uppercase;
            font-weight: 800;
            color: #64748b;
          }
          .formula-val {
            font-family: 'JetBrains Mono', monospace;
            font-size: 14px;
            font-weight: 800;
            color: #0f172a;
            margin-top: 2px;
          }

          /* Percentages Table */
          .section-heading {
            font-size: 11px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #0f172a;
            margin-bottom: 8px;
          }
          .table-wrap {
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 14px;
          }
          .load-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }
          .load-table th {
            background: #f8fafc;
            padding: 7px 10px;
            font-weight: 800;
            color: #475569;
            text-transform: uppercase;
            font-size: 9.5px;
            border-bottom: 1px solid #e2e8f0;
            text-align: left;
          }
          .load-table td {
            padding: 6.5px 10px;
            border-bottom: 1px solid #f1f5f9;
            font-family: 'JetBrains Mono', monospace;
            font-weight: 600;
            color: #1e293b;
          }
          .load-table tr:last-child td {
            border-bottom: none;
          }
          .badge-zone {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 9.5px;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: 5px;
            display: inline-block;
          }
          .zone-max { background: #fee2e2; color: #b91c1c; }
          .zone-hiper { background: #e0f2fe; color: #0369a1; }
          .zone-resist { background: #f3f4f6; color: #4b5563; }

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
              <h1>Ficha de Cargas y Récord 1RM</h1>
              <div class="doc-date">${fechaHoy}</div>
            </div>
          </div>

          <!-- Hero Display -->
          <div class="hero">
            <div>
              <h2>Récord Estimado de Carga</h2>
              <div class="hero-exercise">${nombreEjercicioFinal}</div>
              <div class="hero-rm-display">
                <span class="hero-rm-num">${rmCalculado}</span>
                <span class="hero-rm-unit">${unidad} (1RM)</span>
              </div>
            </div>

            <div class="hero-box-right">
              <span class="label">Serie Evaluada</span>
              <span class="val">${peso} ${unidad} × ${reps} reps</span>
              <span class="sub">Fórmula: ${formula.toUpperCase()}</span>
            </div>
          </div>

          <!-- Comparison Grid -->
          <div class="formulas-grid">
            <div class="formula-box">
              <div class="formula-name">Epley</div>
              <div class="formula-val">${rmEpley} ${unidad}</div>
            </div>
            <div class="formula-box">
              <div class="formula-name">Brzycki</div>
              <div class="formula-val">${rmBrzycki} ${unidad}</div>
            </div>
            <div class="formula-box">
              <div class="formula-name">Lander</div>
              <div class="formula-val">${rmLander} ${unidad}</div>
            </div>
            <div class="formula-box">
              <div class="formula-name">Lombardi</div>
              <div class="formula-val">${rmLombardi} ${unidad}</div>
            </div>
          </div>

          <!-- Training Percentages Table -->
          <div class="section-heading">Tabla de Porcentajes de Carga y Repeticiones Óptimas</div>
          <div class="table-wrap">
            <table class="load-table">
              <thead>
                <tr>
                  <th>% 1RM</th>
                  <th>Carga de Trabajo</th>
                  <th>Repeticiones Meta</th>
                  <th>Objetivo Neuromuscular</th>
                  <th>Zona</th>
                </tr>
              </thead>
              <tbody>
                ${tablaZonas.map((z) => {
                  const pesoZona = Math.round(rmCalculado * (z.pct / 100) * 10) / 10;
                  const zoneClass = z.zona === 'max' ? 'zone-max' : z.zona === 'hiper' ? 'zone-hiper' : 'zone-resist';
                  const zoneLabel = z.zona === 'max' ? 'Fuerza Máx' : z.zona === 'hiper' ? 'Hipertrofia' : 'Resistencia';
                  return `
                    <tr>
                      <td style="font-weight: 800; color: #0f172a;">${z.pct}%</td>
                      <td style="font-size: 13px; font-weight: 800; color: #0f172a;">${pesoZona} ${unidad}</td>
                      <td>${z.reps}</td>
                      <td style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 10px; color: #475569;">${z.desc}</td>
                      <td><span class="badge-zone ${zoneClass}">${zoneLabel}</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Guidelines -->
          <div class="guidelines">
            <div class="guidelines-title">Recomendaciones de Calentamiento y Cargas</div>
            <div class="guidelines-list">
              <div class="guidelines-item">
                <strong>Calentamiento progresivo:</strong> Haz series de aproximación con barra vacía, 50% (8 reps), 70% (3 reps) y 85% (1 rep) antes de series efectivas pesadas.
              </div>
              <div class="guidelines-item">
                <strong>Descansos completos:</strong> Para series al 85-100% de 1RM, descansa entre 3 y 5 minutos para recuperar las reservas de fosfocreatina muscular.
              </div>
              <div class="guidelines-item">
                <strong>Seguridad ante todo:</strong> Utiliza barras de seguridad o la asistencia de un compañero (spotter) en levantamientos de alta intensidad.
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
    setEjercicio('Press de Banca');
    setEjercicioCustom('');
    setUnidad('kg');
    setPeso(80);
    setReps(5);
    setFormula('promedio');
    setPaso(1);
  };

  // ════════════════════════════════════════════════════════════
  // ── PANTALLA: RESUMEN FINAL COMPLETO                      ──
  // ════════════════════════════════════════════════════════════
  if (paso === 'resumen') {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-6 animate-fadeIn pb-8">
        {/* Cabecera del resumen */}
        <Card className="p-6 sm:p-8 relative overflow-hidden" hoverable={false}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3.5">
              <div className="p-3.5 rounded-2xl bg-black text-white border border-white/15">
                <Sparkles size={26} />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[var(--color-primary)] block">
                  {locale === 'es' ? 'Cálculo de Fuerza Completado' : 'Strength Blueprint Calculated'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {nombreEjercicioFinal}
                </h2>
              </div>
            </div>

            {/* Acciones superiores del resumen */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <button
                type="button"
                onClick={exportarPDF}
                className="px-4 py-2.5 rounded-xl bg-black/60 hover:bg-white/10 border border-white/15 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow active:scale-95"
                title={locale === 'es' ? 'Exportar Ficha a PDF o Imprimir' : 'Export Card to PDF or Print'}
              >
                <Printer size={15} className="text-white" />
                <span>{locale === 'es' ? 'Imprimir / PDF' : 'Print / PDF'}</span>
              </button>

              <button
                type="button"
                onClick={copiarResumen}
                className="px-4 py-2.5 rounded-xl bg-black text-white border border-white/15 hover:bg-white/10 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
              >
                {copiado ? <Check size={15} /> : <Copy size={15} />}
                <span>{copiado ? (locale === 'es' ? '¡Copiado!' : 'Copied!') : (locale === 'es' ? 'Copiar Ficha' : 'Copy Card')}</span>
              </button>
            </div>
          </div>

          {/* Hero 1RM Display */}
          <div className="mt-6 p-6 rounded-2xl bg-black/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                {locale === 'es' ? 'Tu 1RM Estimado' : 'Your Estimated 1RM'}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
                  {rmCalculado}
                </span>
                <span className="text-sm font-bold text-neutral-400">{unidad} (100%)</span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                {locale === 'es'
                  ? `Calculado a partir de ${peso} ${unidad} × ${reps} repeticiones usando ${formula.toUpperCase()}.`
                  : `Calculated from ${peso} ${unidad} × ${reps} reps using ${formula.toUpperCase()}.`}
              </p>
            </div>

            <div className="sm:text-right flex sm:flex-col justify-between sm:justify-center items-start sm:items-end border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
              <span className="text-xs text-neutral-400 block">
                {locale === 'es' ? 'Fórmula aplicada:' : 'Formula used:'}
              </span>
              <span className="font-mono font-bold text-sm text-white px-3 py-1.5 rounded-full bg-black/70 border border-white/10 mt-1 uppercase">
                {formula}
              </span>
            </div>
          </div>

          {/* Comparativa entre Fórmulas Científicas */}
          <div className="mt-4 p-4 rounded-2xl bg-black/40 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2.5">
              {locale === 'es' ? 'Comparativa de Fórmulas Científicas:' : 'Scientific Formulas Comparison:'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
              <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-center">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Epley</span>
                <span className="text-base font-black text-white mt-0.5 block">{rmEpley} {unidad}</span>
              </div>
              <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-center">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Brzycki</span>
                <span className="text-base font-black text-white mt-0.5 block">{rmBrzycki} {unidad}</span>
              </div>
              <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-center">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Lander</span>
                <span className="text-base font-black text-white mt-0.5 block">{rmLander} {unidad}</span>
              </div>
              <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-center">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Lombardi</span>
                <span className="text-base font-black text-white mt-0.5 block">{rmLombardi} {unidad}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabla Completa de Porcentajes de Carga */}
        <Card className="p-6 space-y-4" hoverable={false}>
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-[var(--color-primary)]" />
              <h3 className="text-sm font-extrabold text-white">
                {locale === 'es' ? 'Tabla de Cargas de Entrenamiento' : 'Training Load Percentages'}
              </h3>
            </div>
            <span className="text-xs font-mono text-neutral-400 font-bold">
              100% ➔ 50%
            </span>
          </div>

          <div className="divide-y divide-neutral-800/80">
            {tablaZonas.map((item) => {
              const pesoCarga = Math.round(rmCalculado * (item.pct / 100) * 10) / 10;
              const esMax = item.zona === 'max';
              const esHiper = item.zona === 'hiper';

              return (
                <div
                  key={item.pct}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-12 font-mono font-black text-sm ${
                      item.pct === 100
                        ? 'text-[var(--color-primary)]'
                        : esMax
                        ? 'text-rose-400'
                        : esHiper
                        ? 'text-blue-400'
                        : 'text-neutral-400'
                    }`}>
                      {item.pct}%
                    </span>
                    <div>
                      <span className="font-bold text-white block">
                        {item.reps}
                      </span>
                      <span className="text-[11px] text-neutral-400 hidden sm:block">
                        {item.desc}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-black text-base text-white">
                      {pesoCarga}
                    </span>
                    <span className="text-xs font-bold text-neutral-400 ml-1">
                      {unidad}
                    </span>
                  </div>
                </div>
              );
            })}
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
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-black/60 hover:bg-white/10 border border-white/15 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow active:scale-95"
          >
            <RotateCcw size={16} />
            <span>{locale === 'es' ? 'Hacerlo de nuevo (Reiniciar)' : 'Calculate Again (Reset)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setPaso(1)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-black/60 hover:bg-white/10 border border-white/15 text-neutral-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
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
      <Card className="p-4 sm:p-5" hoverable={false}>
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-neutral-950 font-mono font-black text-xs flex items-center justify-center">
              {paso}
            </span>
            <span className="font-extrabold text-white uppercase tracking-wider">
              {paso === 1 && (locale === 'es' ? 'Paso 1 de 3: Ejercicio y Unidad' : 'Step 1 of 3: Exercise & Unit')}
              {paso === 2 && (locale === 'es' ? 'Paso 2 de 3: Carga y Repeticiones' : 'Step 2 of 3: Weight & Reps')}
              {paso === 3 && (locale === 'es' ? 'Paso 3 de 3: Fórmula Científica' : 'Step 3 of 3: Formula')}
            </span>
          </div>
          <span className="font-mono text-neutral-400 text-xs">
            {paso === 1 ? '33%' : paso === 2 ? '66%' : '100%'}
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="w-full h-2 rounded-full bg-black/60 border border-white/10 overflow-hidden">
          <div
            className="h-full bg-[var(--color-primary)] transition-all duration-300 rounded-full"
            style={{
              width: paso === 1 ? '33%' : paso === 2 ? '66%' : '100%',
            }}
          />
        </div>
      </Card>

      {/* ──────────────────────────────────────────────────────── */}
      {/* ── PASO 1: EJERCICIO Y UNIDAD                         ── */}
      {/* ──────────────────────────────────────────────────────── */}
      {paso === 1 && (
        <Card className="p-6 sm:p-8 space-y-6" hoverable={false}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-black text-white border border-white/15">
                <Dumbbell size={22} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {locale === 'es' ? '1. ¿Qué ejercicio vas a evaluar?' : '1. Which exercise are you testing?'}
                </h3>
                <p className="text-xs text-neutral-400">
                  {locale === 'es'
                    ? 'Selecciona un movimiento clásico o introduce uno personalizado.'
                    : 'Select a standard compound lift or name a custom exercise.'}
                </p>
              </div>
            </div>

            {/* Selector de Unidad */}
            <div className="flex bg-black/60 p-1 rounded-2xl border border-white/10 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setUnidad('kg')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  unidad === 'kg'
                    ? 'bg-[var(--color-primary)] text-neutral-950 shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                kg
              </button>
              <button
                type="button"
                onClick={() => setUnidad('lbs')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  unidad === 'lbs'
                    ? 'bg-[var(--color-primary)] text-neutral-950 shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                lbs
              </button>
            </div>
          </div>

          {/* Grid de Ejercicios Predefinidos */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-neutral-300 block">
              {locale === 'es' ? 'Movimientos Populares:' : 'Popular Movements:'}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: 'Press de Banca', desc: locale === 'es' ? 'Pecho y tríceps' : 'Chest & triceps' },
                { id: 'Sentadilla', desc: locale === 'es' ? 'Cuádriceps y glúteo' : 'Quads & glutes' },
                { id: 'Peso Muerto', desc: locale === 'es' ? 'Cadena posterior y espalda' : 'Posterior chain & back' },
                { id: 'Press Militar', desc: locale === 'es' ? 'Hombros y empuje vertical' : 'Shoulders & vertical press' },
                { id: 'Dominadas con Lastre', desc: locale === 'es' ? 'Dorsales y bíceps' : 'Lats & biceps pull' },
                { id: 'otro', desc: locale === 'es' ? 'Escribe tu propio ejercicio' : 'Custom named exercise' },
              ].map((item) => {
                const activo = ejercicio === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setEjercicio(item.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      activo
                        ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-white shadow-md ring-1 ring-[var(--color-primary)]/40'
                        : 'bg-black/60 border-white/10 text-neutral-400 hover:text-white hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <div>
                      <span className={`text-xs font-extrabold block ${activo ? 'text-[var(--color-primary)]' : 'text-neutral-200'}`}>
                        {item.id === 'otro' ? (locale === 'es' ? 'Otro ejercicio...' : 'Other exercise...') : item.id}
                      </span>
                      <span className="text-[11px] text-neutral-500 block mt-0.5">
                        {item.desc}
                      </span>
                    </div>
                    {activo && (
                      <span className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-neutral-950 flex items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Input para ejercicio personalizado si elige "otro" */}
            {ejercicio === 'otro' && (
              <div className="pt-2 animate-fadeIn">
                <input
                  type="text"
                  value={ejercicioCustom}
                  onChange={(e) => setEjercicioCustom(e.target.value)}
                  placeholder={locale === 'es' ? 'Ej: Fondos en paralelas, Prensa 45°...' : 'e.g. Dips, Leg Press...'}
                  className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-white/10 text-white font-bold text-sm focus:border-[var(--color-primary)] focus:outline-none"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Botón Siguiente */}
          <div className="pt-4 border-t border-neutral-800 flex justify-end">
            <button
              type="button"
              onClick={() => setPaso(2)}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[var(--color-primary)] text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(219,240,89,0.3)] active:scale-95"
            >
              <span>{locale === 'es' ? 'Siguiente: Carga y Reps' : 'Next: Weight & Reps'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </Card>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* ── PASO 2: CARGA Y REPETICIONES                       ── */}
      {/* ──────────────────────────────────────────────────────── */}
      {paso === 2 && (
        <Card className="p-6 sm:p-8 space-y-6" hoverable={false}>
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="p-3 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
              <Target size={22} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {locale === 'es' ? '2. ¿Qué carga y repeticiones completaste?' : '2. What weight and reps did you hit?'}
              </h3>
              <p className="text-xs text-neutral-400">
                {locale === 'es'
                  ? `Para ${nombreEjercicioFinal}, introduce una serie pesada con técnica sólida.`
                  : `For ${nombreEjercicioFinal}, enter a heavy set completed with solid form.`}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Peso levantado */}
            <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-300">
                  {locale === 'es' ? 'Peso levantado en la serie' : 'Weight lifted'}
                </label>
                <span className="text-xs font-mono font-bold text-[var(--color-primary)]">
                  {peso} {unidad}
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min={1}
                  max={600}
                  value={peso || ''}
                  onChange={(e) => setPeso(Math.max(1, Number(e.target.value)))}
                  className="w-full px-4 py-3 rounded-xl bg-black/80 border border-white/10 text-white font-mono font-black text-2xl focus:border-[var(--color-primary)] focus:outline-none"
                  placeholder="80"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-mono font-bold text-neutral-500">
                  {unidad}
                </span>
              </div>

              {/* Botones de incremento rápido */}
              <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                {[-10, -5, -2.5, +2.5, +5, +10].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => setPeso((prev) => Math.max(1, prev + delta))}
                    className="flex-1 py-1.5 px-2 rounded-xl text-xs font-mono font-bold bg-black/60 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-colors cursor-pointer text-center"
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </button>
                ))}
              </div>
            </div>

            {/* Repeticiones completadas */}
            <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-300">
                  {locale === 'es' ? 'Repeticiones completadas (con buena técnica)' : 'Completed reps (good form)'}
                </label>
                <span className="text-xs font-mono font-bold text-[var(--color-primary)]">
                  {reps} {reps === 1 ? 'rep' : 'reps'}
                </span>
              </div>

              {/* Slider táctil de repeticiones */}
              <input
                type="range"
                min={1}
                max={15}
                step={1}
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                className="w-full accent-[var(--color-primary)] cursor-pointer h-2 bg-neutral-800 rounded-lg"
              />

              {/* Botones de selección rápida */}
              <div className="grid grid-cols-6 gap-1.5 pt-1">
                {[1, 3, 5, 8, 10, 12].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReps(r)}
                    className={`py-2 text-xs font-mono font-bold rounded-xl border transition-all cursor-pointer ${
                      reps === r
                        ? 'bg-[var(--color-primary)] text-neutral-950 border-[var(--color-primary)] shadow-sm'
                        : 'bg-black/60 text-neutral-400 border-white/10 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Navegación Paso 2 */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPaso(1)}
              className="px-5 py-3 rounded-2xl bg-black/60 border border-white/10 hover:border-white/20 text-neutral-400 hover:text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>{locale === 'es' ? 'Anterior' : 'Back'}</span>
            </button>
            <button
              type="button"
              onClick={() => setPaso(3)}
              className="px-7 py-3.5 rounded-2xl bg-[var(--color-primary)] text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(219,240,89,0.3)] active:scale-95"
            >
              <span>{locale === 'es' ? 'Siguiente: Fórmula' : 'Next: Formula'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </Card>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* ── PASO 3: FÓRMULA CIENTÍFICA                         ── */}
      {/* ──────────────────────────────────────────────────────── */}
      {paso === 3 && (
        <Card className="p-6 sm:p-8 space-y-6" hoverable={false}>
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="p-3 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
              <Award size={22} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {locale === 'es' ? '3. Selecciona la Fórmula de Cálculo' : '3. Choose Calculation Formula'}
              </h3>
              <p className="text-xs text-neutral-400">
                {locale === 'es'
                  ? 'El promedio de fórmulas ofrece la máxima precisión matemática recomendada.'
                  : 'Average combination provides the highest evidence-based accuracy.'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'promedio' as Formula1RM,
                nombre: locale === 'es' ? 'Promedio Científico (Recomendado)' : 'Scientific Average (Recommended)',
                sub: locale === 'es' ? 'Combina las 4 ecuaciones para eliminar sesgos y dar la máxima fiabilidad.' : 'Combines all 4 equations to eliminate individual formula bias.',
                badge: locale === 'es' ? 'Más Preciso' : 'Most Accurate',
              },
              {
                id: 'epley' as Formula1RM,
                nombre: 'Fórmula Epley',
                sub: locale === 'es' ? 'El estándar universal en powerlifting y deportes de fuerza.' : 'Universal standard in powerlifting and strength athletics.',
                badge: 'Estándar',
              },
              {
                id: 'brzycki' as Formula1RM,
                nombre: 'Fórmula Brzycki',
                sub: locale === 'es' ? 'Muy exacta para series de 1 a 10 repeticiones.' : 'Highly accurate for sets between 1 and 10 reps.',
                badge: '1-10 reps',
              },
              {
                id: 'lander' as Formula1RM,
                nombre: 'Fórmula Lander',
                sub: locale === 'es' ? 'Ecuación lineal contrastada para cargas intermedias.' : 'Proven linear formula for intermediate load testing.',
                badge: 'Equilibrada',
              },
              {
                id: 'lombardi' as Formula1RM,
                nombre: 'Fórmula Lombardi',
                sub: locale === 'es' ? 'Modelo no lineal basado en fatiga acumulada.' : 'Non-linear curve accounting for neuromuscular fatigue.',
                badge: 'No Lineal',
              },
            ].map((f) => {
              const activo = formula === f.id;
              const rmEst = calcularRM(peso, reps, f.id);

              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormula(f.id)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    activo
                      ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-white shadow-lg ring-1 ring-[var(--color-primary)]/40'
                      : 'bg-black/60 border-white/10 text-neutral-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-extrabold ${activo ? 'text-[var(--color-primary)]' : 'text-neutral-200'}`}>
                        {f.nombre}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/60 text-neutral-400 border border-white/10">
                        {f.badge}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      {f.sub}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-black text-sm text-white">
                      ~{rmEst} {unidad}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navegación Paso 3 -> GENERAR RESUMEN */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPaso(2)}
              className="px-5 py-3 rounded-2xl bg-black/60 border border-white/10 hover:border-white/20 text-neutral-400 hover:text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>{locale === 'es' ? 'Anterior' : 'Back'}</span>
            </button>
            <button
              type="button"
              onClick={() => setPaso('resumen')}
              className="px-7 py-3.5 rounded-2xl bg-[var(--color-primary)] text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_25px_rgba(219,240,89,0.35)] active:scale-95"
            >
              <span>{locale === 'es' ? 'Ver Ficha de Fuerza Completa' : 'View Full Strength Card'}</span>
              <Sparkles size={16} />
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
