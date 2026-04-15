import { AppLayout, TituloPagina, CardEstadistica } from "../componentes";
import LineChartElement from "../componentes/charts/LineChartElement";
import { useI18n } from '../context/I18nContext';

// Gráfica vacía: todos los meses en 0
const dataGraficoVacio = [
  { name: "Ene", value: 0 }, { name: "Feb", value: 0 }, { name: "Mar", value: 0 },
  { name: "Abr", value: 0 }, { name: "May", value: 0 }, { name: "Jun", value: 0 },
  { name: "Jul", value: 0 }, { name: "Ago", value: 0 }, { name: "Sep", value: 0 },
  { name: "Oct", value: 0 }, { name: "Nov", value: 0 }, { name: "Dic", value: 0 },
];

export default function EstadisticasPage() {
  const { t, locale } = useI18n();
  // TODO: cargar estadísticas reales desde Supabase (sesiones_entrenamiento, resumen_progreso_usuario)
  const dataGrafico = dataGraficoVacio;
  const hayDatos = false; // Cambiar a true cuando haya datos reales
  const estadisticas = [
    { titulo: t.statistics.totalWorkouts, valor: "—" },
    { titulo: t.statistics.totalTime, valor: "—" },
    { titulo: t.statistics.caloriesBurned, valor: "—" },
  ];

  return (
    <AppLayout>
      <div className="space-y-4 pb-10 max-w-5xl mx-auto">
        <TituloPagina titulo={locale === 'es' ? "Progreso general anual" : "Overall yearly progress"} />

        <div className="p-8 bg-neutral-900/40 border border-white/5 rounded-2xl backdrop-blur-xl">
          <div className="mb-8">
            <span className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] italic">
              {locale === 'es' ? 'Volumen de entrenamiento' : 'Training volume'}
            </span>
          </div>
          {hayDatos ? (
            <LineChartElement items={dataGrafico} title={""} />
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

        <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-8 backdrop-blur-xl">
          <h3 className="text-white font-black italic text-sm uppercase mb-6 tracking-widest pl-4"
            style={{ borderLeft: '2px solid var(--color-primary)' }}>
            {locale === 'es' ? 'Análisis de rendimiento' : 'Performance analysis'}
          </h3>
          <div className="space-y-4">
            {[
              { label: locale === 'es' ? "Intensidad media" : "Average intensity", value: "—" },
              { label: locale === 'es' ? "Frecuencia semanal" : "Weekly frequency", value: "—" },
              { label: locale === 'es' ? "Mejor racha" : "Best streak", value: "—" },
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
