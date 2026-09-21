import { useMemo, useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
  Target,
  Camera,
  Calendar,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import GamificacionRacha from '../componentes/perfil/GamificacionRacha';
import MarcoAvatarNivel from '../componentes/perfil/MarcoAvatarNivel';

export interface NivelConfig {
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
  marcoDescEs: string;
  marcoDescEn: string;
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
    marcoDescEs: 'Marco Amarillo Eléctrico con Chispas y Rayos',
    marcoDescEn: 'Electric Yellow Frame with Sparks & Lightning',
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
    marcoDescEs: 'Marco de Bronce Forjado con Remaches',
    marcoDescEn: 'Forged Bronze Frame with Rivets',
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
    marcoDescEs: 'Marco de Acero & Plata Templada con Destellos',
    marcoDescEn: 'Tempered Steel & Chrome Silver Frame',
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
    marcoDescEs: 'Marco de Oro 24K con Laureles de Victoria',
    marcoDescEn: '24K Gold Frame with Victory Laurels',
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
    marcoDescEs: 'Marco Platino Holográfico con Alas Cósmicas',
    marcoDescEn: 'Holographic Platinum Frame with Cosmic Wings',
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
    marcoDescEs: 'Marco Diamante Cristalino con Prismas',
    marcoDescEn: 'Crystalline Diamond Frame with Prisms',
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
    marcoDescEs: 'Marco Imperial con Corona Real de Oro y Rubíes',
    marcoDescEn: 'Imperial Frame with Golden Royal Crown & Rubies',
  },
];

export default function PerfilPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, updateUser } = useAuth();
  const { locale, t } = useI18n();
  const { sesiones, metricas } = useHistorial();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const esVistaRacha = location.pathname.includes('/racha');

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
      nombre: (locale === 'es' ? 'Racha de constancia' : 'Consistency Streak').toUpperCase(),
      ruta: '/perfil/racha',
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

  if (esVistaRacha) {
    return (
      <AppLayout>
        <div className="space-y-6 pb-12 max-w-4xl mx-auto w-full">
          {/* Volver al perfil */}
          <div>
            <Link
              to="/perfil"
              className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider cursor-pointer group py-2 px-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1 text-[var(--color-primary)]" />
              <span>{locale === 'es' ? 'Volver al Perfil' : 'Back to Profile'}</span>
            </Link>
          </div>

          {/* Tarjeta resumen rápida de Racha/Nivel en la subpágina */}
          <div className="card p-6 md:p-7 backdrop-blur-2xl flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-5">
              <MarcoAvatarNivel
                nivel={nivelActual.nivel}
                size="md"
                avatarUrl={displayAvatar}
                iniciales={iniciales || 'U'}
                nombre={user?.nombre ?? 'Avatar'}
                className="shrink-0"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-black text-[10px] tracking-[0.25em] uppercase italic text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2.5 py-0.5 rounded-full border border-[var(--color-primary)]/20">
                    {locale === 'es' ? `NIVEL ${nivelActual.nivel} · ${nivelActual.rangoEs}` : `LEVEL ${nivelActual.nivel} · ${nivelActual.rangoEn}`}
                  </span>
                  <span className="font-bold text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 flex items-center gap-1">
                    <Sparkles size={10} />
                    {locale === 'es' ? nivelActual.marcoDescEs : nivelActual.marcoDescEn}
                  </span>
                </div>
                <h1 className="text-2xl font-black text-white italic uppercase tracking-tight">
                  {user?.nombre ?? (locale === 'es' ? 'Atleta DailySet' : 'DailySet Athlete')}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
              <div className="flex-1 sm:flex-initial bg-white/5 border border-white/10 rounded-2xl px-5 py-2.5 text-center min-w-[110px]">
                <span className="text-[9px] text-neutral-400 uppercase font-black tracking-widest block mb-0.5">
                  {locale === 'es' ? 'Racha Actual' : 'Current Streak'}
                </span>
                <span className="font-black text-xl text-amber-400 flex items-center justify-center gap-1.5 font-mono">
                  <Flame size={18} className="animate-pulse" /> {streakData.rachaActual} <span className="text-xs font-sans font-bold text-neutral-400">{locale === 'es' ? 'días' : 'days'}</span>
                </span>
              </div>
              <div className="flex-1 sm:flex-initial bg-white/5 border border-white/10 rounded-2xl px-5 py-2.5 text-center min-w-[110px]">
                <span className="text-[9px] text-neutral-400 uppercase font-black tracking-widest block mb-0.5">
                  {locale === 'es' ? 'Récord Histórico' : 'Best Streak'}
                </span>
                <span className="font-black text-xl text-white font-mono">
                  {streakData.bestStreak} <span className="text-xs font-sans font-bold text-neutral-400">{locale === 'es' ? 'días' : 'days'}</span>
                </span>
              </div>
            </div>
          </div>

          <GamificacionRacha
            locale={locale}
            streakData={streakData}
            nivelActual={nivelActual}
            siguienteNivel={siguienteNivel}
            progresoNivel={progresoNivel}
            entrenamientosFaltantes={entrenamientosFaltantes}
            totalSesiones={totalSesiones}
            badges={badges}
            niveles={NIVELES}
            onIniciarEntrenamiento={() => navigate('/mis-rutinas')}
          />
        </div>
      </AppLayout>
    );
  }

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

            {/* Avatar interactivo con marco de nivel */}
            <div className="flex flex-col items-center shrink-0">
              <div className="relative group/avatar">
                <MarcoAvatarNivel
                  nivel={nivelActual.nivel}
                  size="lg"
                  avatarUrl={displayAvatar}
                  iniciales={iniciales || 'U'}
                  nombre={user?.nombre ?? 'Avatar'}
                  onClick={() => fileInputRef.current?.click()}
                  title={locale === 'es' ? 'Haz clic para cambiar tu foto de perfil' : 'Click to change profile photo'}
                  className="cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95"
                >
                  {/* Overlay hover completo en el círculo con cámara y texto */}
                  <div className="absolute inset-0 bg-black/65 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                    <Camera size={20} className="text-white drop-shadow-md" />
                    <span className="text-[9px] font-black uppercase text-white mt-1 tracking-wider text-center px-1">
                      {locale === 'es' ? 'Cambiar Foto' : 'Change Photo'}
                    </span>
                  </div>
                </MarcoAvatarNivel>
              </div>

              {/* Botón sutil para cambiar foto sin estorbar el marco */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={subiendoFoto}
                title={locale === 'es' ? 'Cambiar foto de perfil' : 'Change profile photo'}
                className="mt-1 text-[10px] font-bold text-neutral-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer py-0.5 px-2 rounded-md hover:bg-white/5"
              >
                <Camera size={11} className="text-amber-400" />
                <span>{locale === 'es' ? 'Cambiar Foto' : 'Change Photo'}</span>
              </button>
            </div>

            {/* Información del usuario y nivel actual */}
            <div className="text-center md:text-left flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1.5">
                <button
                  type="button"
                  onClick={() => navigate('/perfil/racha')}
                  className="font-black text-[10px] tracking-[0.3em] uppercase italic text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2.5 py-0.5 rounded-full border border-[var(--color-primary)]/20 cursor-pointer hover:bg-[var(--color-primary)]/20 transition-colors"
                  title={locale === 'es' ? 'Ver detalles de racha y niveles' : 'View streak and levels details'}
                >
                  {locale === 'es' ? `NIVEL ${nivelActual.nivel} · ${nivelActual.rangoEs}` : `LEVEL ${nivelActual.nivel} · ${nivelActual.rangoEn}`}
                </button>
                <span className="font-bold text-[10px] text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20 flex items-center gap-1.5 shadow-sm">
                  <Sparkles size={11} className="animate-spin" style={{ animationDuration: '4s' }} />
                  {locale === 'es' ? nivelActual.marcoDescEs : nivelActual.marcoDescEn}
                </span>
                {streakData.rachaActual >= 3 && (
                  <button
                    type="button"
                    onClick={() => navigate('/perfil/racha')}
                    className="font-bold text-[10px] tracking-wider uppercase bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1 cursor-pointer hover:bg-amber-500/20 transition-colors"
                    title={locale === 'es' ? 'Ver detalles de racha' : 'View streak details'}
                  >
                    <Flame size={12} /> {streakData.rachaActual} {locale === 'es' ? 'DÍAS RACHA' : 'DAYS STREAK'}
                  </button>
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
              <div
                key={i}
                onClick={stat.etiqueta.includes('RACHA') ? () => navigate('/perfil/racha') : undefined}
                className={`text-center border-r border-white/5 last:border-r-0 px-2 ${stat.etiqueta.includes('RACHA') ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                title={stat.etiqueta.includes('RACHA') ? (locale === 'es' ? 'Ver detalles de racha' : 'View streak details') : undefined}
              >
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
