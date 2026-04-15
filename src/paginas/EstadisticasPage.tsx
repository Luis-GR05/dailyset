import { useMemo } from 'react';
import { AppLayout, TituloPagina, CardEstadistica } from "../componentes";
import ColumnChart from "../componentes/charts/columnChart";
import LineChartElement from "../componentes/charts/LineChartElement";
import { useI18n } from '../context/I18nContext';
import { useHistorial } from "../context/HistorialContext";

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
  const year = now.getFullYear();

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
    const totalEntrenos = sesiones.length;
    const totalMin = sesiones.reduce((t, s) => t + (s.duracionMin ?? 0), 0);

    // Estimación sencilla para fuerza general: ~5 kcal/min.
    const kcal = Math.round(totalMin * 5);

    const mesesVolumen = Array.from({ length: 12 }, (_, m) => {
      const d = new Date(year, m, 1);
      const name = d.toLocaleString(localeStr, { month: 'short' });
      const volumen = sesiones
        .filter(s => {
          const dt = new Date(s.fecha + 'T12:00:00');
          return dt.getFullYear() === year && dt.getMonth() === m;
        })
        .reduce((t, s) => t + calcularVolumenSesion(s.ejercicios), 0);
      return { name, value: Math.round(volumen) };
    });

    const mesesEntrenos = Array.from({ length: 12 }, (_, m) => {
      const d = new Date(year, m, 1);
      const name = d.toLocaleString(localeStr, { month: 'short' });
      const entrenos = sesiones.filter(s => {
        const dt = new Date(s.fecha + 'T12:00:00');
        return dt.getFullYear() === year && dt.getMonth() === m;
      }).length;
      return { name, entrenos };
    });

    const hayDatos = totalEntrenos > 0;

    // Intensidad media (de HistorialContext) + etiquetas para UI.
    const intensidadMediaLabel = metricas.intensidad;

    // Frecuencia semanal: media de entrenos en últimas 4 semanas.
    const msNow = Date.now();
    const last28 = sesiones.filter(s => {
      const ms = startOfDayMs(s.fecha);
      return msNow - ms <= 28 * 24 * 60 * 60 * 1000;
    }).length;
    const freq = (last28 / 4);
    const frecuenciaSemanalLabel = `${freq.toFixed(1)}`;

    // Mejor racha (días consecutivos con >=1 sesión)
    const uniqueDays = Array.from(new Set(sesiones.map(s => startOfDayMs(s.fecha)))).sort((a, b) => a - b);
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
  }, [sesiones, year, localeStr, metricas.intensidad]);

  const estadisticas = useMemo(() => ([
    { titulo: t.statistics.totalWorkouts, valor: String(totalEntrenos) },
    { titulo: t.statistics.totalTime, valor: `${totalMin} min` },
    { titulo: t.statistics.caloriesBurned, valor: `${kcal}` },
  ]), [t.statistics, totalEntrenos, totalMin, kcal]);

  return (
    <AppLayout>
      <div className="space-y-4 pb-10 max-w-5xl mx-auto">
        <TituloPagina titulo={locale === 'es' ? `Progreso anual (${year})` : `Yearly progress (${year})`} />

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
                <span className="text-neutral-500 text-[10px] font-black uppercase tracking-widest italic">
                  {item.label}
                </span>
                <span className="text-neutral-600 font-black italic text-lg tracking-tighter">
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
