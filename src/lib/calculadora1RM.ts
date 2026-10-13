// src/lib/calculadora1RM.ts
// Lógica compartida de la Calculadora 1RM (web y app). Se sincroniza a dailyset-app.
// Fórmulas científicas, tabla de zonas de carga, texto para copiar y HTML imprimible de la ficha.

export type Formula1RM = 'promedio' | 'epley' | 'brzycki' | 'lander' | 'lombardi';

export interface ZonaCarga {
  pct: number;
  reps: string;
  desc: string;
  zona: 'max' | 'hiper' | 'resist';
}

export function calcularRM(p: number, r: number, f: Formula1RM): number {
  if (!p || p <= 0 || !r || r <= 0) return 0;
  if (r === 1) return p;
  const epley = p * (1 + r / 30);
  const brzycki = p * (36 / (37 - r));
  const lander = (100 * p) / (101.3 - 2.67123 * r);
  const lombardi = p * Math.pow(r, 0.1);
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
}

/** Carga (redondeada a 0,1) correspondiente a un porcentaje del 1RM. */
export function cargaPorcentaje(rm: number, pct: number): number {
  return Math.round(rm * (pct / 100) * 10) / 10;
}

export function getTablaZonas(locale: string): ZonaCarga[] {
  return [
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
}

export interface DatosFicha1RM {
  locale: string;
  nombreEjercicioFinal: string;
  unidad: 'kg' | 'lbs';
  peso: number;
  reps: number;
  formula: Formula1RM;
}

function derivados(d: DatosFicha1RM) {
  return {
    rmCalculado: calcularRM(d.peso, d.reps, d.formula),
    rmEpley: calcularRM(d.peso, d.reps, 'epley'),
    rmBrzycki: calcularRM(d.peso, d.reps, 'brzycki'),
    rmLander: calcularRM(d.peso, d.reps, 'lander'),
    rmLombardi: calcularRM(d.peso, d.reps, 'lombardi'),
    tablaZonas: getTablaZonas(d.locale),
  };
}

/** Texto plano de la ficha (para copiar al portapapeles). */
export function generarTextoFicha1RM(d: DatosFicha1RM): string {
  const { nombreEjercicioFinal, unidad, peso, reps, formula } = d;
  const { rmCalculado, tablaZonas } = derivados(d);
  return `⚡ FICHA DE FUERZA Y 1RM - DAILYSET
---------------------------------------------
• Ejercicio: ${nombreEjercicioFinal}
• Serie de Referencia: ${peso} ${unidad} × ${reps} reps
• Fórmula elegida: ${formula.toUpperCase()}
• 1RM ESTIMADO: ${rmCalculado} ${unidad}

TABLA DE CARGAS Y ZONAS:
${tablaZonas.map((z) => `• ${z.pct}%: ${(Math.round(rmCalculado * (z.pct / 100) * 10) / 10)} ${unidad} (${z.reps}) - ${z.desc}`).join('\n')}
---------------------------------------------`;
}

/** Documento HTML A4 de la ficha (web: iframe + print; app: expo-print). */
export function generarHTMLFicha1RM(d: DatosFicha1RM): string {
  const { locale, nombreEjercicioFinal, unidad, peso, reps, formula } = d;
  const { rmCalculado, rmEpley, rmBrzycki, rmLander, rmLombardi, tablaZonas } = derivados(d);
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
}
