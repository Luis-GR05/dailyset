import { AppLayout, TituloPagina } from "../componentes";
import ColumnChart from "../componentes/charts/columnChart";
import { Link } from 'react-router-dom';
import { useI18n } from '../context/I18nContext';

export default function DashboardPage() {
  const { t, locale } = useI18n();
  const diasSemanaVacios = locale === 'es'
    ? [
      { dia: "L", valor1: 0 },
      { dia: "M", valor1: 0 },
      { dia: "X", valor1: 0 },
      { dia: "J", valor1: 0 },
      { dia: "V", valor1: 0 },
      { dia: "S", valor1: 0 },
      { dia: "D", valor1: 0 },
    ]
    : [
      { dia: "M", valor1: 0 },
      { dia: "T", valor1: 0 },
      { dia: "W", valor1: 0 },
      { dia: "T", valor1: 0 },
      { dia: "F", valor1: 0 },
      { dia: "S", valor1: 0 },
      { dia: "S", valor1: 0 },
    ];

  // TODO: Cargar rutinas reales desde Supabase cuando se implemente la funcionalidad
  const rutinas: { id: number; nombre: string; descripcion: string }[] = [];

  // TODO: Cargar volumen semanal real desde Supabase
  const diasSemana = diasSemanaVacios;

  // TODO: Cargar estadísticas reales desde Supabase
  const statsVacias = [
    { label: locale === 'es' ? "Semanas activo" : "Active weeks", val: "—" },
    { label: locale === 'es' ? "PR peso muerto" : "Deadlift PR", val: "—" },
    { label: locale === 'es' ? "Racha actual" : "Current streak", val: "—" },
    { label: locale === 'es' ? "Nivel" : "Level", val: "—" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 pb-10">
        <TituloPagina titulo={t.dashboard.title} />

        {/* Rutinas */}
        {rutinas.length === 0 ? (
          <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-10 backdrop-blur-xl text-center">
            <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em] italic mb-3">
              {locale === 'es' ? 'Sin rutinas' : 'No routines'}
            </p>
            <p className="text-neutral-600 text-sm mb-6">
              {locale === 'es' ? 'Aún no has creado ninguna rutina.' : "You haven't created any routines yet."}
            </p>
            <Link
              to="/mis-rutinas"
              className="inline-block text-black font-black text-xs uppercase tracking-widest italic py-3 px-8 rounded-full transition-all active:scale-95"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {locale === 'es' ? 'Crear mi primera rutina' : 'Create my first routine'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rutinas.map((rutina) => (
              <Link key={rutina.id} to="/mis-rutinas/entrenamiento" className="block group">
                <div
                  className="bg-neutral-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-xl transition-all duration-300"
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.05)';
                  }}
                >
                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-primary-muted)', border: '1px solid var(--color-primary-muted)' }}>
                      <span className="font-black italic text-xs" style={{ color: 'var(--color-primary)' }}>GO</span>
                    </div>
                    <div>
                      <h3 className="font-black text-white italic uppercase text-sm tracking-tighter">{rutina.nombre}</h3>
                      <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-widest">{rutina.descripcion}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Gráfica de volumen semanal */}
        <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-8 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 rounded-full border-2 border-white/5 p-1 shrink-0">
              <div className="w-full h-full bg-neutral-800 rounded-full flex items-center justify-center"
                style={{ border: '1px solid var(--color-primary)', boxShadow: '0 0 20px var(--color-primary-glow)' }}>
                <div className="text-center">
                  <p className="font-black italic text-xs leading-tight" style={{ color: 'var(--color-primary)' }}>STATS</p>
                  <p className="text-white font-black italic text-[10px] uppercase opacity-50">
                    {locale === 'es' ? 'Semanal' : 'Weekly'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full min-w-0">
              <div className="mb-4 text-center md:text-left">
                <span className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] italic">
                  {locale === 'es' ? 'Volumen por sesión' : 'Volume per session'}
                </span>
              </div>
              <div className="h-[220px] w-full">
                <ColumnChart
                  data={diasSemana}
                  xAxisKey="dia"
                  bars={[{ key: "valor1", color: "var(--color-primary)", name: t.history.kg }]}
                  height="100%"
                />
              </div>
              <p className="text-center text-neutral-600 text-[10px] uppercase tracking-widest italic mt-2">
                {locale === 'es' ? 'Sin entrenamientos esta semana' : 'No workouts this week'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsVacias.map((item, i) => (
            <div key={i} className="bg-neutral-900/40 border border-white/5 rounded-2xl p-5 backdrop-blur-xl text-center">
              <p className="text-neutral-500 text-[8px] font-black uppercase tracking-widest mb-1 italic">{item.label}</p>
              <p className="text-neutral-600 font-black italic text-lg">{item.val}</p>
            </div>
          ))}
        </div>

      </div>
    </AppLayout>
  );
}