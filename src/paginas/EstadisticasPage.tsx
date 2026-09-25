import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout, TituloPagina, CardEstadistica, TuSemanaEnCifrasModal } from "../componentes";
import ColumnChart from "../componentes/charts/columnChart";
import LineChartElement from "../componentes/charts/LineChartElement";
import { useI18n } from '../context/I18nContext';
import { useHistorial } from "../context/HistorialContext";
import { useAuth } from '../context/AuthContext';
import { Sparkles, Crown, Zap } from 'lucide-react';
import YearPicker from '../componentes/ui/YearPicker';
import ProgresionEjercicioCard from '../componentes/estadisticas/ProgresionEjercicioCard';
import BalanceMuscularCard from '../componentes/estadisticas/BalanceMuscularCard';
import ComparativaRendimientoCard from '../componentes/estadisticas/ComparativaRendimientoCard';

function startOfDayMs(yyyyMmDd: string) {
  return new Date(`${yyyyMmDd}T12:00:00`).setHours(0, 0, 0, 0);
}

function calcularVolumenSesion(ejercicios: { series: { kg: number; reps: number }[] }[]) {
  return ejercicios.reduce((t, ej) => t + ej.series.reduce((s, serie) => s + serie.kg * serie.reps, 0), 0);
}

export default function EstadisticasPage() {
  const { t, locale } = useI18n();
  const { sesiones, metricas } = useHistorial();
  const { user } = useAuth();
  const navigate = useNavigate();

  const planActual = user?.plan || 'free';
  const esPro = planActual === 'pro' || planActual === 'ultra';
  const esUltra = planActual === 'ultra';

  const irASuscripciones = () => navigate('/suscripciones?tab=planes');

  const localeStr = locale === 'es' ? 'es-ES' : 'en-US';
  const now = new Date();
  const currentYear = now.getFullYear();
  const nowMs = now.getTime();

  // Años disponibles (desde el historial + año actual)
  const aniosDisponibles = useMemo(() => {
    const years = new Set<number>();
    years.add(currentYear);
    sesiones.forEach(s => {
      const y = parseInt(s.fecha.split('-')[0], 10);
      if (!isNaN(y)) years.add(y);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [sesiones, currentYear]);

  const [anioSeleccionado, setAnioSeleccionado] = useState(currentYear);
  const [modalCifrasAbierto, setModalCifrasAbierto] = useState(false);

  const sesionesDelAnio = useMemo(() => {
    return sesiones.filter(s => parseInt(s.fecha.split('-')[0], 10) === anioSeleccionado);
  }, [sesiones, anioSeleccionado]);

  const {
    totalEntrenos,
    totalMin,
    kcal,
    mesesVolumen,
    mesesEntrenos,
    hayDatos,
    intensidadMediaLabel,
    frecuenciaSemanalLabel,
    mejorRachaLabel,
  } = useMemo(() => {
    const totalEntrenos = sesionesDelAnio.length;
    const totalMin = sesionesDelAnio.reduce((t, s) => t + (s.duracionMin ?? 0), 0);

    // Estimación sencilla para fuerza general: ~5 kcal/min.
    const kcal = Math.round(totalMin * 5);

    const mesesVolumen = Array.from({ length: 12 }, (_, m) => {
      const d = new Date(anioSeleccionado, m, 1);
      const name = d.toLocaleString(localeStr, { month: 'short' });
      const volumen = sesionesDelAnio
        .filter(s => {
          const dt = new Date(s.fecha + 'T12:00:00');
          return dt.getMonth() === m;
        })
        .reduce((t, s) => t + calcularVolumenSesion(s.ejercicios), 0);
      return { name, value: Math.round(volumen) };
    });

    const mesesEntrenos = Array.from({ length: 12 }, (_, m) => {
      const d = new Date(anioSeleccionado, m, 1);
      const name = d.toLocaleString(localeStr, { month: 'short' });
      const entrenos = sesionesDelAnio.filter(s => {
        const dt = new Date(s.fecha + 'T12:00:00');
        return dt.getMonth() === m;
      }).length;
      return { name, entrenos };
    });

    const hayDatos = totalEntrenos > 0;

    // Intensidad media (de HistorialContext) + etiquetas para UI.
    const intensidadMediaLabel = metricas.intensidad;

    // Frecuencia semanal: media de entrenos en últimas 4 semanas (global, no filtrado por año).
    const last28 = sesiones.filter(s => {
      const ms = startOfDayMs(s.fecha);
      return nowMs - ms <= 28 * 24 * 60 * 60 * 1000;
    }).length;
    const freq = (last28 / 4);
    const frecuenciaSemanalLabel = `${freq.toFixed(1)}`;

    // Mejor racha del año seleccionado (días consecutivos con >=1 sesión)
    const uniqueDays = Array.from(new Set(sesionesDelAnio.map(s => startOfDayMs(s.fecha)))).sort((a, b) => a - b);
    let best = 0;
    let cur = 0;
    for (let i = 0; i < uniqueDays.length; i++) {
      if (i === 0) {
        cur = 1;
      } else {
        const diff = uniqueDays[i] - uniqueDays[i - 1];
        if (diff === 24 * 60 * 60 * 1000) cur += 1;
        else cur = 1;
      }
      best = Math.max(best, cur);
    }
    const mejorRachaLabel = String(best);

    return {
      totalEntrenos,
      totalMin,
      kcal,
      mesesVolumen,
      mesesEntrenos,
      hayDatos,
      intensidadMediaLabel,
      frecuenciaSemanalLabel,
      mejorRachaLabel,
    };
  }, [sesionesDelAnio, sesiones, anioSeleccionado, localeStr, metricas.intensidad, nowMs]);

  const estadisticas = useMemo(() => ([
    { titulo: t.statistics.totalWorkouts, valor: String(totalEntrenos) },
    { titulo: t.statistics.totalTime, valor: `${totalMin} min` },
    { titulo: t.statistics.caloriesBurned, valor: `${kcal}` },
  ]), [t.statistics, totalEntrenos, totalMin, kcal]);

  return (
    <AppLayout>
      <div className="space-y-4 pb-10 max-w-5xl mx-auto">
        {/* Cabecera: título + selector de año tipo calendario */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-neutral-800 pb-5 relative z-30">
          <div>
            <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">
              {locale === 'es' ? 'Progreso' : 'Progress'}
            </p>
            <TituloPagina titulo={locale === 'es' ? 'Estadísticas' : 'Statistics'} />
          </div>

          {/* Controles de cabecera: Plan Badge + Botón Tu semana en cifras + selector de año */}
          <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
            {planActual === 'ultra' ? (
              <span className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/30 flex items-center gap-1.5 shadow-sm font-mono">
                <Crown size={13} />
                <span>Plan Ultra</span>
              </span>
            ) : planActual === 'pro' ? (
              <span className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/30 flex items-center gap-1.5 shadow-sm font-mono">
                <Zap size={13} />
                <span>Plan Pro</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={irASuscripciones}
                className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-white/5 text-neutral-300 border border-white/10 hover:border-white/20 transition-all flex items-center gap-1.5 cursor-pointer font-mono"
              >
                <Zap size={13} className="text-[var(--color-primary)]" />
                <span>{locale === 'es' ? 'Plan Free · Mejorar' : 'Free Plan · Upgrade'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setModalCifrasAbierto(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-[var(--color-primary)] text-black hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer mr-1"
            >
              <Sparkles size={14} />
              <span>{locale === 'es' ? 'Tu semana en cifras' : 'Week wrapped'}</span>
            </button>
            <YearPicker
              anio={anioSeleccionado}
              aniosDisponibles={aniosDisponibles}
              locale={locale}
              sublabel={`${totalEntrenos} ${locale === 'es' ? 'sesiones' : 'sessions'}`}
              onChange={setAnioSeleccionado}
            />
          </div>
        </div>

        <div className="p-6 md:p-8 bg-neutral-900/40 border border-white/5 rounded-2xl backdrop-blur-xl">
          <div className="mb-6 md:mb-8">
            <span className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] italic">
              {locale === 'es' ? 'Volumen de entrenamiento' : 'Training volume'}
            </span>
          </div>
          {hayDatos ? (
            <LineChartElement
              items={mesesVolumen}
              title={locale === 'es' ? 'Volumen por mes (kg)' : 'Monthly volume (kg)'}
              height={220}
              showGrid={false}
              lineColor="var(--color-primary)"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <p className="text-neutral-600 text-[10px] font-black uppercase tracking-widest italic">
                {locale === 'es' ? 'Sin datos aún' : 'No data yet'}
              </p>
              <p className="text-neutral-700 text-xs mt-2">
                {locale === 'es'
                  ? 'Completa tu primer entrenamiento para empezar a ver tu progreso'
                  : 'Complete your first workout to start seeing your progress'}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {estadisticas.map((stat, index) => (
            <div key={index}>
              <CardEstadistica titulo={stat.titulo} valor={stat.valor} />
            </div>
          ))}
        </div>

        <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-xl">
          <div className="mb-6">
            <span className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] italic">
              {locale === 'es' ? 'Entrenos por mes' : 'Workouts per month'}
            </span>
          </div>
          {hayDatos ? (
            <ColumnChart
              data={mesesEntrenos}
              xAxisKey="name"
              bars={[{ key: 'entrenos', color: 'var(--color-primary)', name: t.statistics.totalWorkouts }]}
              height={240}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <p className="text-neutral-700 text-xs">
                {locale === 'es' ? 'Aún no hay entrenos registrados.' : 'No workouts recorded yet.'}
              </p>
            </div>
          )}
        </div>

        <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-xl">
          <h3 className="text-white font-black italic text-sm uppercase mb-6 tracking-widest pl-4"
            style={{ borderLeft: '2px solid var(--color-primary)' }}>
            {locale === 'es' ? 'Análisis de rendimiento' : 'Performance analysis'}
          </h3>
          <div className="space-y-4">
            {[
              { label: locale === 'es' ? "Intensidad media" : "Average intensity", value: hayDatos ? intensidadMediaLabel : "—" },
              { label: locale === 'es' ? "Frecuencia semanal" : "Weekly frequency", value: hayDatos ? frecuenciaSemanalLabel : "—" },
              { label: locale === 'es' ? "Mejor racha (días)" : "Best streak (days)", value: hayDatos ? mejorRachaLabel : "—" },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                <span className="text-neutral-300 text-[10px] font-black uppercase tracking-widest italic">
                  {item.label}
                </span>
                <span className="text-white font-black italic text-lg tracking-tighter">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── MÓDULOS DE ANALÍTICA AVANZADA (PLANES PRO & ULTRA) ── */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em] mb-0.5">
                {locale === 'es' ? 'Métricas de Élite' : 'Elite Metrics'}
              </p>
              <h2 className="text-xl font-black text-white">
                {locale === 'es' ? 'Progresión y Biomecánica Avanzada' : 'Advanced Progression & Biomechanics'}
              </h2>
            </div>
            {!esUltra && (
              <button
                type="button"
                onClick={irASuscripciones}
                className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <span>{locale === 'es' ? 'Ver ventajas de PRO y ULTRA' : 'View PRO & ULTRA benefits'}</span>
              </button>
            )}
          </div>

          {/* Gráfica de Progresión por Ejercicio (PRO & ULTRA) */}
          <ProgresionEjercicioCard
            sesiones={sesiones}
            esPro={esPro}
            onDesbloquear={irASuscripciones}
          />

          {/* Gráficas Avanzadas (ULTRA): Balance Muscular y Comparativas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BalanceMuscularCard
              sesiones={sesiones}
              esUltra={esUltra}
              onDesbloquear={irASuscripciones}
            />

            <ComparativaRendimientoCard
              sesiones={sesiones}
              esUltra={esUltra}
              onDesbloquear={irASuscripciones}
            />
          </div>
        </div>
      </div>

      {/* Modal Tu semana y mes en cifras */}
      <TuSemanaEnCifrasModal
        abierto={modalCifrasAbierto}
        onCerrar={() => setModalCifrasAbierto(false)}
      />
    </AppLayout>
  );
}
