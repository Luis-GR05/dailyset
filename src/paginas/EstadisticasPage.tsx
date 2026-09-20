import { useState, useMemo } from 'react';
import { AppLayout, TituloPagina, CardEstadistica } from "../componentes";
import ColumnChart from "../componentes/charts/columnChart";
import LineChartElement from "../componentes/charts/LineChartElement";
import { useI18n } from '../context/I18nContext';
import { useHistorial } from "../context/HistorialContext";
import { ChevronLeft, ChevronRight } from 'lucide-react';

function startOfDayMs(yyyyMmDd: string) {
  return new Date(`${yyyyMmDd}T12:00:00`).setHours(0, 0, 0, 0);
}

function calcularVolumenSesion(ejercicios: { series: { kg: number; reps: number }[] }[]) {
  return ejercicios.reduce((t, ej) => t + ej.series.reduce((s, serie) => s + serie.kg * serie.reps, 0), 0);
}

export default function EstadisticasPage() {
  const { t, locale } = useI18n();
  const { sesiones, metricas } = useHistorial();

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

  const irAnioAnterior = () => setAnioSeleccionado(a => {
    const idx = aniosDisponibles.indexOf(a);
    return idx < aniosDisponibles.length - 1 ? aniosDisponibles[idx + 1] : a;
  });
  const irAnioSiguiente = () => setAnioSeleccionado(a => {
    const idx = aniosDisponibles.indexOf(a);
    return idx > 0 ? aniosDisponibles[idx - 1] : a;
  });

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

  const canGoPrev = aniosDisponibles.indexOf(anioSeleccionado) < aniosDisponibles.length - 1;
  const canGoNext = aniosDisponibles.indexOf(anioSeleccionado) > 0;

  return (
    <AppLayout>
      <div className="space-y-4 pb-10 max-w-5xl mx-auto">
        {/* Cabecera: título + año clickable */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-neutral-800 pb-5">
          <div>
            <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">
              {locale === 'es' ? 'Progreso' : 'Progress'}
            </p>
            <TituloPagina titulo={locale === 'es' ? 'Estadísticas' : 'Statistics'} />
          </div>

          {/* Año clickable: flechas + número grande que abre select nativo */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={irAnioAnterior}
              disabled={!canGoPrev}
              className="p-2 rounded-xl text-neutral-500 hover:text-white hover:bg-white/8 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
              title={locale === 'es' ? 'Año anterior' : 'Previous year'}
            >
              <ChevronLeft size={20} />
            </button>

            {/* El año es un número grande con un <select> invisible encima */}
            <div className="relative group cursor-pointer" title={locale === 'es' ? 'Seleccionar año' : 'Select year'}>
              {/* Texto visual del año */}
              <span className="text-5xl font-black text-white tracking-tighter leading-none select-none group-hover:text-[var(--color-primary)] transition-colors">
                {anioSeleccionado}
              </span>
              {/* Icono pequeño que indica que es clickable */}
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
              {/* Select nativo invisible superpuesto — al hacer click abre el desplegable */}
              <select
                value={anioSeleccionado}
                onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label={locale === 'es' ? 'Seleccionar año' : 'Select year'}
              >
                {aniosDisponibles.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button
              onClick={irAnioSiguiente}
              disabled={!canGoNext}
              className="p-2 rounded-xl text-neutral-500 hover:text-white hover:bg-white/8 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
              title={locale === 'es' ? 'Año siguiente' : 'Next year'}
            >
              <ChevronRight size={20} />
            </button>
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
      </div>
    </AppLayout>
  );
}
