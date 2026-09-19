import { useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from "../componentes";
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { useHistorial } from '../context/HistorialContext';
import {
  Flame,
  Zap,
  Trophy,
  Crown,
  ShieldCheck,
  Award,
  Sparkles,
  Lock,
  Target,
  Camera,
  TrendingUp,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface NivelConfig {
  nivel: number;
  nombreEs: string;
  nombreEn: string;
  rangoEs: string;
  rangoEn: string;
  minSesiones: number;
  maxSesiones: number;
  descEs: string;
  descEn: string;
  beneficioEs: string;
  beneficioEn: string;
}

// Progresión de niveles basada exclusivamente en asistencia y días de entrenamiento cumplidos
const NIVELES: NivelConfig[] = [
  {
    nivel: 1,
    nombreEs: 'Chispa Inicial',
    nombreEn: 'Initial Spark',
    rangoEs: 'RECLUTA',
    rangoEn: 'ROOKIE',
    minSesiones: 0,
    maxSesiones: 3,
    descEs: 'Iniciando el hábito del entrenamiento diario.',
    descEn: 'Starting the daily training habit.',
    beneficioEs: 'Seguimiento de racha activado',
    beneficioEn: 'Streak tracking activated',
  },
  {
    nivel: 2,
    nombreEs: 'Constancia Bronce',
    nombreEn: 'Bronze Consistency',
    rangoEs: 'ATLETA BRONCE',
    rangoEn: 'BRONZE ATHLETE',
    minSesiones: 3,
    maxSesiones: 7,
    descEs: 'Constancia demostrada asistiendo a cada sesión programada.',
    descEn: 'Demonstrated consistency attending every scheduled workout.',
    beneficioEs: 'Insignia Bronce de Disciplina',
    beneficioEn: 'Bronze Discipline Badge',
  },
  {
    nivel: 3,
    nombreEs: 'Racha de Hierro',
    nombreEn: 'Iron Streak',
    rangoEs: 'ATLETA PLATA',
    rangoEn: 'SILVER ATHLETE',
    minSesiones: 7,
    maxSesiones: 15,
    descEs: 'Disciplina forjada. Cumpliendo con cada día de rutina.',
    descEn: 'Forged discipline. Fulfilling every routine day.',
    beneficioEs: 'Multiplicador de consistencia semanal',
    beneficioEn: 'Weekly consistency multiplier',
  },
  {
    nivel: 4,
    nombreEs: 'Constancia de Oro',
    nombreEn: 'Gold Consistency',
    rangoEs: 'ATLETA ORO',
    rangoEn: 'GOLD ATHLETE',
    minSesiones: 15,
    maxSesiones: 30,
    descEs: 'Dedicación total al entrenamiento. El hábito ya es parte de ti.',
    descEn: 'Total commitment to training. The habit is second nature.',
    beneficioEs: 'Rango de Oro en estadísticas',
    beneficioEn: 'Gold rank on statistics',
  },
  {
    nivel: 5,
    nombreEs: 'Disciplina Platino',
    nombreEn: 'Platinum Discipline',
    rangoEs: 'ÉLITE PLATINO',
    rangoEn: 'PLATINUM ELITE',
    minSesiones: 30,
    maxSesiones: 60,
    descEs: 'Asistencia impecable. Formas parte del 5% más disciplinado.',
    descEn: 'Impeccable attendance. Part of the top 5% most disciplined.',
    beneficioEs: 'Insignia Platino exclusiva',
    beneficioEn: 'Exclusive Platinum badge',
  },
  {
    nivel: 6,
    nombreEs: 'Diamante de la Constancia',
    nombreEn: 'Diamond Habit',
    rangoEs: 'TITÁN DIAMANTE',
    rangoEn: 'DIAMOND TITAN',
    minSesiones: 60,
    maxSesiones: 100,
    descEs: 'Disciplina inquebrantable y dedicación intachable.',
    descEn: 'Unbreakable discipline and impeccable dedication.',
    beneficioEs: 'Aura de Diamante en perfil',
    beneficioEn: 'Diamond aura on profile',
  },
  {
    nivel: 7,
    nombreEs: 'Corona de la Disciplina',
    nombreEn: 'Crown of Discipline',
    rangoEs: 'LEYENDA DAILYSET',
    rangoEn: 'DAILYSET LEGEND',
    minSesiones: 100,
    maxSesiones: 100,
    descEs: 'Maestría total del hábito y constancia absoluta.',
    descEn: 'Total habit mastery and absolute consistency.',
    beneficioEs: 'Rango Máximo Honorífico',
    beneficioEn: 'Honorary Maximum Rank',
  },
];

export default function PerfilPage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const { locale, t } = useI18n();
  const { sesiones, metricas } = useHistorial();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [seccionGamificacion, setSeccionGamificacion] = useState<'racha' | 'camino' | 'insignias'>('racha');
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  // Avatar local para cambio instantáneo
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string>(() => {
    return localStorage.getItem('dailyset_avatar') || '';
  });

  const displayAvatar = localAvatarUrl || user?.avatar_url;

  // Iniciales del nombre
  const iniciales = (user?.nombre ?? 'U')
    .split(' ')
    .map((p: string) => p[0])
    .slice(0, 2)
    .join('');

  // Estadísticas globales calculadas (basadas en asistencia y sesiones)
  const totalSesiones = sesiones.length;

  // Cálculo preciso de racha de asistencia y días de entrenamiento
  const streakData = useMemo(() => {
    const parseLocalDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const today = new Date();
    const todayStr = parseLocalDate(today);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = parseLocalDate(yesterday);

    const uniqueDates = Array.from(new Set(sesiones.map(s => s.fecha.split('T')[0]))).sort();

    const trainedToday = uniqueDates.includes(todayStr);
    const trainedYesterday = uniqueDates.includes(yesterdayStr);

    // Racha histórica máxima de asistencia
    let bestStreak = 0;
    let currentRun = 0;
    for (let i = 0; i < uniqueDates.length; i++) {
      if (i === 0) {
        currentRun = 1;
      } else {
        const dPrev = new Date(uniqueDates[i - 1] + 'T00:00:00');
        const dCurr = new Date(uniqueDates[i] + 'T00:00:00');
        const diffDays = Math.round((dCurr.getTime() - dPrev.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentRun++;
        } else if (diffDays > 1) {
          currentRun = 1;
        }
      }
      if (currentRun > bestStreak) bestStreak = currentRun;
    }

    // Racha activa actual
    let rachaActual = 0;
    if (trainedToday || trainedYesterday) {
      rachaActual = 1;
      const lastTrainedDateStr = trainedToday ? todayStr : yesterdayStr;
      const lastIdx = uniqueDates.lastIndexOf(lastTrainedDateStr);
      for (let i = lastIdx; i > 0; i--) {
        const dCurr = new Date(uniqueDates[i] + 'T00:00:00');
        const dPrev = new Date(uniqueDates[i - 1] + 'T00:00:00');
        const diffDays = Math.round((dCurr.getTime() - dPrev.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          rachaActual++;
        } else {
          break;
        }
      }
    }

    if (rachaActual > bestStreak) bestStreak = rachaActual;

    // Tracker visual de los últimos 7 días
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = parseLocalDate(d);
      const isToday = i === 0;
      const dayName = d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', { weekday: 'narrow' }).toUpperCase();
      const dayNum = d.getDate();
      const hasTrained = uniqueDates.includes(dateStr);
      last7Days.push({ dateStr, dayName, dayNum, hasTrained, isToday });
    }

    return {
      trainedToday,
      trainedYesterday,
      rachaActual,
      bestStreak,
      uniqueDaysCount: uniqueDates.length,
      last7Days,
    };
  }, [sesiones, locale]);

  // Nivel y progreso según entrenamientos completados
  const nivelActualIndex = useMemo(() => {
    const idx = NIVELES.findIndex((n, i) => {
      if (i === NIVELES.length - 1) return true;
      return totalSesiones >= n.minSesiones && totalSesiones < n.maxSesiones;
    });
    return idx === -1 ? 0 : idx;
  }, [totalSesiones]);

  const nivelActual = NIVELES[nivelActualIndex];
  const siguienteNivel = nivelActualIndex < NIVELES.length - 1 ? NIVELES[nivelActualIndex + 1] : null;

  const { progresoNivel, entrenamientosFaltantes } = useMemo(() => {
    if (!siguienteNivel) {
      return { progresoNivel: 100, entrenamientosFaltantes: 0 };
    }
    const span = siguienteNivel.minSesiones - nivelActual.minSesiones;
    const done = totalSesiones - nivelActual.minSesiones;
    const pct = Math.min(100, Math.max(0, Math.round((done / span) * 100)));
    const faltan = Math.max(0, siguienteNivel.minSesiones - totalSesiones);
    return { progresoNivel: pct, entrenamientosFaltantes: faltan };
  }, [totalSesiones, nivelActual, siguienteNivel]);

  // Insignias y logros desbloqueables: enfocadas 100% en constancia y asistencia a rutinas
  const badges = useMemo(() => [
    {
      id: 'first_workout',
      icon: <Flame size={20} className="text-amber-400" />,
      titulo: locale === 'es' ? 'Primer Entrenamiento' : 'First Workout',
      desc: locale === 'es' ? 'Completa tu primer día de rutina' : 'Complete your first workout day',
      unlocked: totalSesiones >= 1,
      progresoActual: Math.min(totalSesiones, 1),
      progresoMeta: 1,
      unidad: '',
    },
    {
      id: 'streak_3',
      icon: <Zap size={20} className="text-[var(--color-primary)]" />,
      titulo: locale === 'es' ? 'Racha 3 Días' : '3-Day Streak',
      desc: locale === 'es' ? '3 días seguidos asistiendo a entrenar' : '3 consecutive days attending training',
      unlocked: streakData.bestStreak >= 3,
      progresoActual: Math.min(streakData.bestStreak, 3),
      progresoMeta: 3,
      unidad: locale === 'es' ? 'días' : 'days',
    },
    {
      id: 'streak_7',
      icon: <ShieldCheck size={20} className="text-amber-400" />,
      titulo: locale === 'es' ? 'Semana Imparable' : 'Unstoppable Week',
      desc: locale === 'es' ? '7 días consecutivos de asistencia a tus rutinas' : '7 consecutive days attending your routines',
      unlocked: streakData.bestStreak >= 7,
      progresoActual: Math.min(streakData.bestStreak, 7),
      progresoMeta: 7,
      unidad: locale === 'es' ? 'días' : 'days',
    },
    {
      id: 'streak_14',
      icon: <Sparkles size={20} className="text-sky-400" />,
      titulo: locale === 'es' ? 'Quincena Perfecta' : 'Perfect Fortnight',
      desc: locale === 'es' ? '14 días manteniendo tu racha diaria activa' : '14 days keeping your daily streak active',
      unlocked: streakData.bestStreak >= 14,
      progresoActual: Math.min(streakData.bestStreak, 14),
      progresoMeta: 14,
      unidad: locale === 'es' ? 'días' : 'days',
    },
    {
      id: 'streak_30',
      icon: <Crown size={20} className="text-amber-400" />,
      titulo: locale === 'es' ? 'Mes de Disciplina' : 'Discipline Month',
      desc: locale === 'es' ? '30 días de racha de asistencia inquebrantable' : '30 days of unbreakable attendance streak',
      unlocked: streakData.bestStreak >= 30,
      progresoActual: Math.min(streakData.bestStreak, 30),
      progresoMeta: 30,
      unidad: locale === 'es' ? 'días' : 'days',
    },
    {
      id: 'sessions_10',
      icon: <CheckCircle2 size={20} className="text-[var(--color-primary)]" />,
      titulo: locale === 'es' ? 'Hábito Creado' : 'Habit Formed',
      desc: locale === 'es' ? '10 entrenamientos completados en tus rutinas' : '10 workouts completed in your routines',
      unlocked: totalSesiones >= 10,
      progresoActual: Math.min(totalSesiones, 10),
      progresoMeta: 10,
      unidad: locale === 'es' ? 'entrenos' : 'sessions',
    },
    {
      id: 'sessions_25',
      icon: <Trophy size={20} className="text-amber-400" />,
      titulo: locale === 'es' ? 'Atleta Constante' : 'Consistent Athlete',
      desc: locale === 'es' ? '25 entrenamientos completados con éxito' : '25 workouts completed successfully',
      unlocked: totalSesiones >= 25,
      progresoActual: Math.min(totalSesiones, 25),
      progresoMeta: 25,
      unidad: locale === 'es' ? 'entrenos' : 'sessions',
    },
    {
      id: 'sessions_50',
      icon: <Award size={20} className="text-emerald-400" />,
      titulo: locale === 'es' ? 'Maestro de la Rutina' : 'Routine Master',
      desc: locale === 'es' ? '50 entrenamientos registrados en el sistema' : '50 workouts recorded in the system',
      unlocked: totalSesiones >= 50,
      progresoActual: Math.min(totalSesiones, 50),
      progresoMeta: 50,
      unidad: locale === 'es' ? 'entrenos' : 'sessions',
    },
  ], [totalSesiones, streakData.bestStreak, locale]);

  // Stats para la tarjeta superior (enfocadas en asistencia y disciplina, sin métricas de fuerza)
  const stats = useMemo(() => [
    {
      etiqueta: locale === 'es' ? 'ENTRENAMIENTOS' : 'WORKOUTS',
      valor: totalSesiones ? String(totalSesiones) : '0',
      icono: <Calendar size={15} className="text-neutral-400" />,
      destacado: false,
    },
    {
      etiqueta: locale === 'es' ? 'RACHA DE CONSTANCIA' : 'CONSISTENCY STREAK',
      valor: streakData.rachaActual ? `${streakData.rachaActual} ${locale === 'es' ? 'DÍAS' : 'DAYS'}` : '0 DÍAS',
      icono: <Flame size={15} className="text-amber-400 animate-pulse" />,
      destacado: streakData.rachaActual > 0,
    },
    {
      etiqueta: locale === 'es' ? 'DISCIPLINA' : 'DISCIPLINE',
      valor: `${metricas.disciplinaPct}%`,
      icono: <Target size={15} className="text-[var(--color-primary)]" />,
      destacado: metricas.disciplinaPct >= 50,
    },
  ], [totalSesiones, streakData.rachaActual, metricas.disciplinaPct, locale]);

  // Manejador de subida y cambio de foto de perfil
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Comprobar tamaño (máx 3MB)
    if (file.size > 3 * 1024 * 1024) {
      alert(locale === 'es' ? 'La imagen debe ser menor a 3MB' : 'Image must be under 3MB');
      return;
    }

    setSubiendoFoto(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        setLocalAvatarUrl(base64);
        localStorage.setItem('dailyset_avatar', base64);
        await updateUser({ avatar_url: base64 });
      } catch (err) {
        console.error('Error al guardar foto:', err);
      } finally {
        setSubiendoFoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const opciones = [
    {
      nombre: (locale === 'es' ? 'Configuración de cuenta' : 'Account Settings').toUpperCase(),
      ruta: '/perfil/configuracion',
      flecha: true,
      esRojo: false,
    },
    {
      nombre: (locale === 'es' ? 'Datos personales' : 'Personal Data').toUpperCase(),
      ruta: '/perfil/datos',
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
      <div className="space-y-6 pb-12 max-w-4xl mx-auto w-full">

        {/* Input invisible para subida de foto de perfil */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />

        {/* ── Tarjeta de perfil principal con estética de cristal ──────────────── */}
        <div className="relative overflow-hidden card p-6 md:p-8 backdrop-blur-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">

            {/* Avatar interactivo: Clic en cualquier parte del círculo para cambiar foto */}
            <div className="relative group/avatar">
              <div
                onClick={() => fileInputRef.current?.click()}
                title={locale === 'es' ? 'Haz clic para cambiar tu foto de perfil' : 'Click to change profile photo'}
                className="w-28 h-28 rounded-full border-2 border-white/15 p-1 bg-black/40 shadow-xl overflow-hidden flex items-center justify-center cursor-pointer relative group transition-all duration-300 hover:border-[var(--color-primary)] active:scale-95"
              >
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={user?.nombre ?? 'Avatar'}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full bg-neutral-900 rounded-full flex items-center justify-center"
                    style={{ border: '1px solid var(--color-primary)' }}
                  >
                    <span className="text-3xl font-black text-white italic tracking-tighter uppercase">
                      {iniciales || 'U'}
                    </span>
                  </div>
                )}

                {/* Overlay hover completo en el círculo con cámara y texto */}
                <div className="absolute inset-0 bg-black/65 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Camera size={22} className="text-white drop-shadow-md" />
                  <span className="text-[9px] font-black uppercase text-white mt-1 tracking-wider text-center px-2">
                    {locale === 'es' ? 'Cambiar Foto' : 'Change Photo'}
                  </span>
                </div>
              </div>

              {/* Botón flotante accesible */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                disabled={subiendoFoto}
                title={locale === 'es' ? 'Cambiar foto de perfil' : 'Change profile photo'}
                className="absolute bottom-1 right-1 p-2 rounded-full bg-neutral-900 border border-white/20 text-white hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer z-10"
              >
                <Camera size={14} />
              </button>
            </div>

            {/* Información del usuario y nivel actual */}
            <div className="text-center md:text-left flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1.5">
                <span className="font-black text-[10px] tracking-[0.3em] uppercase italic text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2.5 py-0.5 rounded-full border border-[var(--color-primary)]/20">
                  {locale === 'es' ? `NIVEL ${nivelActual.nivel} · ${nivelActual.rangoEs}` : `LEVEL ${nivelActual.nivel} · ${nivelActual.rangoEn}`}
                </span>
                {streakData.rachaActual >= 3 && (
                  <span className="font-bold text-[10px] tracking-wider uppercase bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                    <Flame size={12} /> {streakData.rachaActual} {locale === 'es' ? 'DÍAS RACHA' : 'DAYS STREAK'}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase mb-3 leading-tight truncate">
                {user?.nombre ?? (locale === 'es' ? 'Atleta DailySet' : 'DailySet Athlete')}
              </h1>

              {/* Barra de progreso de nivel */}
              <div className="w-full max-w-md">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-neutral-400 font-semibold tracking-wide">
                    {locale === 'es' ? nivelActual.nombreEs : nivelActual.nombreEn}
                  </span>
                  <span className="text-[var(--color-primary)] font-mono font-bold">
                    {progresoNivel}%
                  </span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                  <div
                    className="h-full rounded-full transition-all duration-700 shadow-[0_0_10px_var(--color-primary-glow)]"
                    style={{
                      width: `${progresoNivel}%`,
                      backgroundColor: 'var(--color-primary)',
                    }}
                  />
                </div>
                <p className="text-[11px] text-neutral-400 mt-1.5 font-medium flex items-center gap-1">
                  {siguienteNivel ? (
                    locale === 'es'
                      ? `Entrena ${entrenamientosFaltantes} ${entrenamientosFaltantes === 1 ? 'día más' : 'días más'} para alcanzar Nivel ${siguienteNivel.nivel}`
                      : `Train ${entrenamientosFaltantes} more ${entrenamientosFaltantes === 1 ? 'day' : 'days'} to reach Level ${siguienteNivel.nivel}`
                  ) : (
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Crown size={13} />
                      {locale === 'es' ? '¡Has alcanzado el Nivel Máximo de Leyenda!' : 'You reached the Maximum Legend Level!'}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Stats resumidos de perfil */}
          <div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t border-white/10">
            {stats.map((stat, i) => (
              <div key={i} className="text-center border-r border-white/5 last:border-r-0 px-2">
                <div className={`font-black text-base sm:text-lg md:text-xl italic leading-none flex items-center justify-center gap-1.5 ${stat.destacado ? 'text-[var(--color-primary)]' : 'text-white'}`}>
                  {stat.icono}
                  <span>{stat.valor}</span>
                </div>
                <p className="text-neutral-500 text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] mt-2 italic">
                  {stat.etiqueta}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── APARTADO DE GAMIFICACIÓN: SISTEMA DE RACHA & SUBIDA DE NIVEL ── */}
        <div className="space-y-4">
          
          {/* Cabecera de la sección con tabs de navegación */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Flame size={16} />
                </span>
                <h2 className="text-lg font-black text-white uppercase italic tracking-wide">
                  {locale === 'es' ? 'Gamificación & Racha de Constancia' : 'Gamification & Consistency Streak'}
                </h2>
              </div>
              <p className="text-neutral-400 text-xs mt-0.5">
                {locale === 'es'
                  ? 'Sube de nivel cumpliendo con los días programados en tus rutinas.'
                  : 'Level up by sticking to your scheduled routine days.'}
              </p>
            </div>

            {/* Selector de pestañas */}
            <div className="flex p-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-bold self-start sm:self-auto">
              <button
                onClick={() => setSeccionGamificacion('racha')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  seccionGamificacion === 'racha'
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Flame size={13} className={seccionGamificacion === 'racha' ? 'text-amber-400' : ''} />
                <span>{locale === 'es' ? 'Racha' : 'Streak'}</span>
              </button>
              <button
                onClick={() => setSeccionGamificacion('camino')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  seccionGamificacion === 'camino'
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <TrendingUp size={13} className={seccionGamificacion === 'camino' ? 'text-[var(--color-primary)]' : ''} />
                <span>{locale === 'es' ? 'Niveles' : 'Levels'}</span>
              </button>
              <button
                onClick={() => setSeccionGamificacion('insignias')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  seccionGamificacion === 'insignias'
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Award size={13} className={seccionGamificacion === 'insignias' ? 'text-sky-400' : ''} />
                <span>{locale === 'es' ? 'Insignias' : 'Badges'}</span>
              </button>
            </div>
          </div>

          {/* 1. PESTAÑA RACHA */}
          {seccionGamificacion === 'racha' && (
            <div className="space-y-4">
              
              {/* Tarjeta Hero de Racha */}
              <div className="card p-6 md:p-8 backdrop-blur-xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  
                  {/* Fuego con contador */}
                  <div className="flex items-center gap-5 text-center md:text-left">
                    <div className="relative">
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${
                        streakData.rachaActual > 0
                          ? 'bg-amber-500/10 border-2 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.25)]'
                          : 'bg-white/5 border border-white/10 text-neutral-500'
                      }`}>
                        <Flame
                          size={44}
                          className={`${
                            streakData.rachaActual > 0
                              ? 'text-amber-400 animate-pulse drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                              : 'text-neutral-600'
                          }`}
                        />
                      </div>
                      {streakData.rachaActual > 0 && (
                        <span className="absolute -bottom-2 -right-2 bg-amber-400 text-black font-black text-[11px] px-2 py-0.5 rounded-full shadow-md font-mono">
                          {streakData.rachaActual}
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 justify-center md:justify-start">
                        <span className="font-mono text-3xl md:text-4xl font-black text-white italic tracking-tight">
                          {streakData.rachaActual} {locale === 'es' ? 'DÍAS' : 'DAYS'}
                        </span>
                      </div>
                      <p className="text-xs uppercase font-bold tracking-widest text-neutral-400 mt-0.5">
                        {locale === 'es' ? 'Racha de Asistencia Activa' : 'Active Attendance Streak'}
                      </p>
                    </div>
                  </div>

                  {/* Estado y Call To Action según si entrenó hoy */}
                  <div className="w-full md:w-auto md:max-w-xs text-center md:text-right">
                    {streakData.trainedToday ? (
                      <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 text-[var(--color-primary)] text-xs font-bold">
                        <CheckCircle2 size={14} />
                        <span>{locale === 'es' ? '¡Racha protegida hoy!' : 'Streak protected today!'}</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                          <Flame size={14} />
                          <span>{locale === 'es' ? 'Entrena hoy para mantenerla' : 'Train today to keep it'}</span>
                        </div>
                        <div>
                          <button
                            onClick={() => navigate('/mis-rutinas')}
                            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-[var(--color-primary)] text-black hover:opacity-90 transition-all cursor-pointer shadow-md"
                          >
                            {locale === 'es' ? 'Iniciar Entrenamiento' : 'Start Workout'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tracker de los últimos 7 días */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      {locale === 'es' ? 'Últimos 7 días' : 'Last 7 days'}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">
                      {locale === 'es'
                        ? `Récord de racha: ${streakData.bestStreak} días`
                        : `Best streak: ${streakData.bestStreak} days`}
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {streakData.last7Days.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                          item.hasTrained
                            ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/40 shadow-sm'
                            : item.isToday
                            ? 'bg-white/5 border-white/30'
                            : 'bg-white/[0.02] border-white/5'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-neutral-400 mb-1">
                          {item.dayName}
                        </span>
                        <div className="my-1 flex items-center justify-center h-5">
                          {item.hasTrained ? (
                            <Flame size={16} className="text-amber-400" />
                          ) : (
                            <div className={`w-2 h-2 rounded-full ${item.isToday ? 'bg-amber-400 animate-ping' : 'bg-neutral-700'}`} />
                          )}
                        </div>
                        <span className={`text-[10px] font-mono mt-1 ${item.isToday ? 'font-bold text-white' : 'text-neutral-400'}`}>
                          {item.dayNum}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Métricas clave de asistencia */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                      <Flame size={14} className="text-amber-400" />
                      <span>{locale === 'es' ? 'Racha Actual' : 'Current Streak'}</span>
                    </div>
                    <p className="text-lg font-black text-white font-mono">
                      {streakData.rachaActual} {locale === 'es' ? 'días' : 'days'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                      <Trophy size={14} className="text-[var(--color-primary)]" />
                      <span>{locale === 'es' ? 'Mejor Racha' : 'Best Streak'}</span>
                    </div>
                    <p className="text-lg font-black text-white font-mono">
                      {streakData.bestStreak} {locale === 'es' ? 'días' : 'days'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                      <Calendar size={14} className="text-sky-400" />
                      <span>{locale === 'es' ? 'Días Entrenados' : 'Days Trained'}</span>
                    </div>
                    <p className="text-lg font-black text-white font-mono">
                      {streakData.uniqueDaysCount} {locale === 'es' ? 'días' : 'days'}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 2. PESTAÑA NIVELES (Camino de progresión por asistencia) */}
          {seccionGamificacion === 'camino' && (
            <div className="space-y-4">
              
              {/* Tarjeta de Nivel Actual */}
              <div className="card p-6 backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-primary)]">
                      {locale === 'es' ? 'TU RANGO ACTUAL' : 'YOUR CURRENT RANK'}
                    </span>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tight mt-0.5">
                      NIVEL {nivelActual.nivel} · {locale === 'es' ? nivelActual.nombreEs : nivelActual.nombreEn}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 max-w-lg">
                      {locale === 'es' ? nivelActual.descEs : nivelActual.descEn}
                    </p>
                  </div>

                  <div className="px-4 py-2.5 rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 text-[var(--color-primary)] text-center self-stretch sm:self-auto">
                    <span className="text-xs uppercase font-bold tracking-widest block">
                      {locale === 'es' ? 'Progreso' : 'Progress'}
                    </span>
                    <span className="text-2xl font-black font-mono">
                      {totalSesiones} {siguienteNivel ? `/ ${siguienteNivel.minSesiones}` : 'MAX'}
                    </span>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="mt-5">
                  <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-700 shadow-[0_0_12px_var(--color-primary-glow)]"
                      style={{
                        width: `${progresoNivel}%`,
                        backgroundColor: 'var(--color-primary)',
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-neutral-400 mt-2 font-mono">
                    <span>{nivelActual.minSesiones} {locale === 'es' ? 'entrenos' : 'sessions'}</span>
                    <span>
                      {siguienteNivel
                        ? (locale === 'es' ? `Faltan ${entrenamientosFaltantes} para Nivel ${siguienteNivel.nivel}` : `${entrenamientosFaltantes} left to Level ${siguienteNivel.nivel}`)
                        : (locale === 'es' ? '¡Nivel Máximo!' : 'Max Level!')}
                    </span>
                    <span>{siguienteNivel ? `${siguienteNivel.minSesiones} entrenos` : '100+'}</span>
                  </div>
                </div>
              </div>

              {/* Lista secuencial de todos los niveles */}
              <div className="space-y-2.5">
                {NIVELES.map((lvl) => {
                  const superado = totalSesiones >= lvl.maxSesiones && lvl.nivel < NIVELES.length;
                  const enCurso = lvl.nivel === nivelActual.nivel;
                  const bloqueado = totalSesiones < lvl.minSesiones;

                  return (
                    <div
                      key={lvl.nivel}
                      className={`card p-4 backdrop-blur-xl transition-all flex items-center justify-between gap-4 ${
                        enCurso
                          ? 'border-[var(--color-primary)]/50 bg-[var(--color-primary)]/[0.04] shadow-[0_0_20px_rgba(212,251,52,0.06)]'
                          : bloqueado
                          ? 'opacity-60 bg-white/[0.01]'
                          : 'bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-sm ${
                          superado
                            ? 'bg-[var(--color-primary)] text-black'
                            : enCurso
                            ? 'bg-[var(--color-primary)]/20 border border-[var(--color-primary)] text-[var(--color-primary)]'
                            : 'bg-white/5 border border-white/10 text-neutral-400'
                        }`}>
                          {superado ? '✓' : `L${lvl.nivel}`}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-white italic tracking-tight uppercase text-sm truncate">
                              {locale === 'es' ? lvl.nombreEs : lvl.nombreEn}
                            </span>
                            {enCurso && (
                              <span className="text-[9px] font-black uppercase tracking-wider bg-[var(--color-primary)] text-black px-2 py-0.5 rounded-full">
                                {locale === 'es' ? 'ACTUAL' : 'CURRENT'}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                            {locale === 'es' ? lvl.beneficioEs : lvl.beneficioEn}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono text-xs text-neutral-400 block font-bold">
                          {lvl.minSesiones}{lvl.nivel === NIVELES.length ? '+' : ` - ${lvl.maxSesiones}`} {locale === 'es' ? 'sesiones' : 'sessions'}
                        </span>
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mt-0.5 block">
                          {superado ? (
                            <span className="text-[var(--color-primary)] font-bold">{locale === 'es' ? 'Superado' : 'Completed'}</span>
                          ) : enCurso ? (
                            <span className="text-[var(--color-primary)]">{progresoNivel}% {locale === 'es' ? 'completado' : 'done'}</span>
                          ) : (
                            <span><Lock size={10} className="inline mr-1" />{locale === 'es' ? 'Bloqueado' : 'Locked'}</span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* 3. PESTAÑA INSIGNIAS */}
          {seccionGamificacion === 'insignias' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {badges.map((b) => {
                const pct = Math.min(100, Math.round((b.progresoActual / b.progresoMeta) * 100));

                return (
                  <div
                    key={b.id}
                    className={`card p-4.5 backdrop-blur-xl transition-all flex flex-col justify-between gap-3 ${
                      b.unlocked
                        ? 'border-[var(--color-primary)]/30 bg-[var(--color-primary)]/[0.02]'
                        : 'opacity-70 bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        b.unlocked
                          ? 'bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/40 shadow-sm'
                          : 'bg-white/5 border-white/10 text-neutral-600'
                      }`}>
                        {b.icon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-white text-sm truncate">
                            {b.titulo}
                          </h4>
                          {b.unlocked ? (
                            <span className="shrink-0 text-[10px] font-black uppercase tracking-wider text-[var(--color-primary)] bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 px-2 py-0.5 rounded-full">
                              {locale === 'es' ? 'Conseguida' : 'Unlocked'}
                            </span>
                          ) : (
                            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-neutral-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Lock size={9} /> {pct}%
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">
                          {b.desc}
                        </p>
                      </div>
                    </div>

                    {/* Barra de progreso de la insignia */}
                    <div className="space-y-1 pt-1">
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: b.unlocked ? 'var(--color-primary)' : 'rgba(255,255,255,0.3)',
                          }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono">
                        <span>{locale === 'es' ? 'Progreso' : 'Progress'}</span>
                        <span>{b.progresoActual.toLocaleString()} / {b.progresoMeta.toLocaleString()} {b.unidad}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* ── Menú de opciones de perfil ────────────────────────────────────── */}
        <div className="card p-2 backdrop-blur-xl">
          <div className="space-y-1">
            {opciones.map((opcion, index) => (
              <button
                key={index}
                onClick={() => handleAction(opcion)}
                className="w-full group block"
              >
                <div className={`
                  flex items-center justify-between px-6 py-4.5 rounded-xl transition-all duration-200
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
