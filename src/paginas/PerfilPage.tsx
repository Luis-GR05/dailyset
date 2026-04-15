import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from "../componentes";
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { useHistorial } from '../context/HistorialContext';

export default function PerfilPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { locale, t } = useI18n();
  const { sesiones } = useHistorial();

  const iniciales = (user?.nombre ?? 'U')
    .split(' ')
    .map((p: string) => p[0])
    .slice(0, 2)
    .join('');

  const stats = useMemo(() => {
    const totalSets = sesiones.reduce((t, s) => t + s.ejercicios.reduce((tt, ej) => tt + ej.series.length, 0), 0);
    const totalWeight = Math.round(
      sesiones.reduce((t, s) =>
        t + s.ejercicios.reduce((tt, ej) =>
          tt + ej.series.reduce((x, serie) => x + (serie.kg * serie.reps), 0)
          , 0)
        , 0)
    );

    const uniqueDays = Array.from(new Set(sesiones.map(s => new Date(s.fecha + 'T12:00:00').setHours(0, 0, 0, 0)))).sort((a, b) => a - b);
    let streak = 0;
    for (let i = uniqueDays.length - 1; i >= 0; i--) {
      if (i === uniqueDays.length - 1) streak = 1;
      else {
        const diff = uniqueDays[i + 1] - uniqueDays[i];
        if (diff === 24 * 60 * 60 * 1000) streak += 1;
        else break;
      }
    }

    return [
      { etiqueta: t.profile.totalSets.toUpperCase(), valor: totalSets ? String(totalSets) : '—' },
      {
        etiqueta: t.profile.streak.toUpperCase(),
        valor: streak ? `${streak} ${t.profile.days.toUpperCase()}` : '—'
      },
      { etiqueta: t.profile.totalWeight.toUpperCase(), valor: totalWeight ? `${totalWeight} kg` : '—' },
    ];
  }, [sesiones, t.profile.totalSets, t.profile.streak, t.profile.totalWeight, t.profile.days]);

  const opciones = [
    {
      nombre: t.profile.accountSettings.toUpperCase(),
      ruta: '/perfil/configuracion',
      flecha: true,
      esRojo: false,
    },
    {
      nombre: t.profile.logout.toUpperCase(),
      ruta: null,
      flecha: false,
      esRojo: true,
    },
  ];

  const handleAction = async (opcion: typeof opciones[0]) => {
    if (opcion.esRojo) {
      if (confirm(locale === 'es' ? '¿Cerrar sesión en DailySet Elite?' : 'Sign out of DailySet Elite?')) {
        await logout();
        navigate('/login');
      }
      return;
    }
    if (opcion.ruta) {
      navigate(opcion.ruta);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 pb-10 max-w-4xl mx-auto">

        {/* Tarjeta de perfil */}
        <div className="relative overflow-hidden bg-neutral-900/40 border border-white/5 rounded-2xl p-8 backdrop-blur-xl">
          <div
            className="absolute -top-24 -right-24 w-64 h-64 blur-[100px] rounded-full"
            style={{ backgroundColor: 'var(--color-primary-muted)' }}
          ></div>

          <div className="relative z-10 flex flex-col items-center md:flex-row md:items-end gap-8">

            {/* Avatar con iniciales reales */}
            <div className="w-28 h-28 rounded-full border-2 border-white/5 p-1">
              <div
                className="w-full h-full bg-neutral-800 rounded-full flex items-center justify-center"
                style={{ border: '1px solid var(--color-primary)' }}
              >
                <span className="text-3xl font-black text-white italic tracking-tighter uppercase">
                  {iniciales || 'U'}
                </span>
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              {/* Rango — podrías calcularlo desde user.totalSets o nivel */}
              <p
                className="font-black text-[10px] tracking-[0.4em] uppercase mb-1 italic"
                style={{ color: 'var(--color-primary)' }}
              >
                {user?.rango ?? 'ATLETA'}
              </p>

              <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-4 leading-none">
                {user?.nombre ?? (locale === 'es' ? 'Usuario' : 'User')}
              </h1>

              {/* Barra de progreso hacia siguiente nivel */}
              <div className="w-full max-w-sm h-1 bg-white/5 overflow-hidden">
                <div
                  className="h-full shadow-[0_0_15px_rgba(67,97,238,0.3)] transition-all duration-700"
                  style={{
                    width: `${user?.progreso ?? 0}%`,
                    backgroundColor: 'var(--color-accent)',
                  }}
                ></div>
              </div>
              <p className="text-neutral-600 text-[9px] uppercase tracking-widest mt-1">
                {locale === 'es'
                  ? `${user?.progreso ?? 0}% al siguiente nivel`
                  : `${user?.progreso ?? 0}% to next level`
                }
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-10 pt-8 border-t border-white/10">
            {stats.map((stat, i) => (
              <div key={i} className="text-center border-r border-white/5 last:border-r-0">
                <p className="text-white font-black text-xl italic leading-none">{stat.valor}</p>
                <p className="text-neutral-500 text-[8px] font-bold uppercase tracking-[0.2em] mt-2 italic">
                  {stat.etiqueta}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Menú de opciones */}
        <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-2 backdrop-blur-xl">
          <div className="space-y-1">
            {opciones.map((opcion, index) => (
              <button
                key={index}
                onClick={() => handleAction(opcion)}
                className="w-full group block"
              >
                <div className={`
                  flex items-center justify-between px-6 py-5 rounded-xl transition-all duration-200
                  ${opcion.esRojo
                    ? 'bg-red-500/5 hover:bg-red-500/10'
                    : 'hover:bg-white/5'
                  }
                `}>
                  <span className={`font-black text-[11px] italic tracking-[0.15em] uppercase ${opcion.esRojo ? 'text-red-500' : 'text-zinc-300'}`}>
                    {opcion.nombre}
                  </span>
                  {opcion.flecha && (
                    <span
                      className="text-sm font-black opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      →
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
