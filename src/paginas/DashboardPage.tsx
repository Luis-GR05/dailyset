import { useMemo, useState } from 'react';
import { AppLayout } from "../componentes";
import { Link } from 'react-router-dom';
import { useI18n } from '../context/I18nContext';
import { useAuth } from '../context/AuthContext';
import { useRutinas } from '../context/RutinasContext';
import { useHistorial } from '../context/HistorialContext';
import {
  ChevronRight,
  Flame,
  Clock,
  Footprints,
  Dumbbell,
  Trophy,
  Flame as FireIcon
} from 'lucide-react';
import { RUTINAS_PREDEFINIDAS } from '../data/rutinasPredefinidas';

// Imágenes atléticas de alta calidad para las tarjetas de planes
const PLAN_IMAGES: Record<string, string> = {
  'fuerza-full-body': '/exercises/Advanced_Kettlebell_Windmill/0.jpg',
  'fuerza-push-empuje': '/exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg',
  'fuerza-pull-tiron': '/exercises/Bent_Over_Barbell_Row/0.jpg',
  'fuerza-pierna-gluteo': '/exercises/Barbell_Squat/0.jpg',
  'core-abdomen-acero': '/exercises/Plank/0.jpg',
  'cardio-hiit-quema-grasa': '/exercises/Burpee/0.jpg',
};

export default function DashboardPage() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const { rutinas } = useRutinas();
  const { sesiones } = useHistorial();

  // Día de la semana seleccionado (0 = Lunes ... 6 = Domingo)
  const hoyFecha = new Date();
  const hoyDiaIndex = (hoyFecha.getDay() + 6) % 7; // Convertir: 0 = Lunes, 6 = Domingo
  const [diaSeleccionado, setDiaSeleccionado] = useState<number>(hoyDiaIndex);

  // Generar los 7 días de la semana actual
  const diasSemanaBar = useMemo(() => {
    const inicioSemana = new Date(hoyFecha);
    const diaActual = (hoyFecha.getDay() + 6) % 7;
    inicioSemana.setDate(hoyFecha.getDate() - diaActual);

    const nombresDiasEs = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const nombresDiasEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(inicioSemana);
      d.setDate(inicioSemana.getDate() + i);
      return {
        indice: i,
        nombre: locale === 'es' ? nombresDiasEs[i] : nombresDiasEn[i],
        letra: (locale === 'es' ? 'LMXJVSD' : 'MTWTFSS')[i],
        numero: d.getDate(),
        esHoy: i === hoyDiaIndex,
      };
    });
  }, [locale, hoyDiaIndex]);

  // Cálculo de volumen por sesión
  const calcularVolumenSesion = (ejercicios: { series: { kg: number; reps: number }[] }[]) => {
    return ejercicios.reduce((t, ej) => t + ej.series.reduce((s, serie) => s + serie.kg * serie.reps, 0), 0);
  };

  const pad2 = (n: number) => String(n).padStart(2, '0');
  const toLocalYYYYMMDD = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

  // Actividad de los 7 días para el histograma de la tarjeta principal
  const actividadSemanal = useMemo(() => {
    const inicioSemana = new Date(hoyFecha);
    const diaActual = (hoyFecha.getDay() + 6) % 7;
    inicioSemana.setDate(hoyFecha.getDate() - diaActual);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(inicioSemana);
      d.setDate(inicioSemana.getDate() + i);
      const key = toLocalYYYYMMDD(d);
      const sesionesDia = sesiones.filter(s => s.fecha === key);
      const vol = sesionesDia.reduce((acc, s) => acc + calcularVolumenSesion(s.ejercicios), 0);
      return {
        letra: (locale === 'es' ? 'LMXJVSD' : 'MTWTFSS')[i],
        volumen: vol,
        alturaPct: vol > 0 ? Math.min(100, Math.max(25, (vol / 4000) * 100)) : (i === hoyDiaIndex ? 65 : 18 + (i * 7) % 35),
      };
    });
  }, [sesiones, hoyDiaIndex, locale]);

  // Estadísticas rápidas calculadas
  const statsCalculadas = useMemo(() => {
    // Total volumen
    const totalVol = sesiones.reduce((acc, s) => acc + calcularVolumenSesion(s.ejercicios), 0);
    // Calorías estimadas: base ~0.08 kcal por kg movido + base activa
    const caloriasTotales = sesiones.length > 0 ? Math.round(sesiones.length * 320 + totalVol * 0.05) : 380;
    // Minutos totales de entrenamiento
    const minutosTotales = sesiones.length > 0 ? sesiones.length * 45 : 60;
    // Racha
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

    // PR máximo peso
    let maxKg = 0;
    sesiones.forEach(s => {
      s.ejercicios.forEach(ej => {
        ej.series.forEach(serie => {
          if (serie.kg > maxKg) maxKg = serie.kg;
        });
      });
    });

    return {
      calorias: caloriasTotales,
      minutos: minutosTotales,
      streak: streak > 0 ? streak : 1,
      maxKg: maxKg || 85,
      sesionesTotal: sesiones.length,
      pasosEstimados: 3246 + (sesiones.length * 450),
      distanciaKm: (2.5 + sesiones.length * 0.4).toFixed(2),
    };
  }, [sesiones]);

  // Nombre del usuario para el saludo
  const primerNombre = user?.nombre ? user.nombre.split(' ')[0] : 'Atleta';

  // Planes destacados (combina rutinas del usuario con plantillas)
  const planesDestacados = useMemo(() => {
    if (rutinas.length > 0) {
      const personalizadas = rutinas.slice(0, 2).map((r) => ({
        id: `custom-${r.id}`,
        rutinaId: r.id,
        nombre: r.nombre,
        nombreEn: r.nombre,
        categoria: r.categoria,
        duracion: r.duracion,
        descripcion: locale === 'es' ? 'Tu rutina personalizada lista para entrenar' : 'Your custom workout routine',
        descripcionEn: 'Your custom workout routine',
        ejerciciosIds: r.ejerciciosIds,
      }));
      const plantillasRestantes = RUTINAS_PREDEFINIDAS.slice(0, 3 - personalizadas.length);
      return [...personalizadas, ...plantillasRestantes];
    }
    return RUTINAS_PREDEFINIDAS.slice(0, 3);
  }, [rutinas, locale]);

  return (
    <AppLayout fullWidth>
      <div className="space-y-6 pb-20 w-full">
        {/* ─── 1. HEADER: AVATAR, SALUDO Y CAMPANA ─── */}
        <header className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3.5">
            {/* Avatar circular */}
            <Link to="/perfil" className="relative group">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-neutral-800 group-hover:border-[var(--color-primary)] transition-all">
                <img
                  src="/avatars/avatar1.jpg"
                  alt={user?.nombre || 'Usuario'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback con inicial
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="w-full h-full bg-neutral-800 flex items-center justify-center font-bold text-white text-sm">
                  {primerNombre.charAt(0).toUpperCase()}
                </div>
              </div>
            </Link>

            {/* Saludo */}
            <div>
              <h1 className="font-bold text-white text-lg leading-tight">
                {locale === 'es' ? `Hola, ${primerNombre}` : `Hi, ${primerNombre}`}
              </h1>
              <p className="text-neutral-400 text-xs font-medium">
                {locale === 'es' ? '¡Bienvenido de nuevo!' : 'Welcome Back!'}
              </p>
            </div>
          </div>

          {/* Badge de Racha TikTok en cabecera */}
          <Link
            to="/perfil"
            title={locale === 'es' ? 'Ver tu nivel y racha en el perfil' : 'View your level and streak in profile'}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 font-black text-xs hover:bg-amber-500/20 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Flame size={15} className="text-amber-400 animate-pulse" />
            <span className="tracking-wider font-mono">
              {statsCalculadas.streak} {locale === 'es' ? 'DÍAS RACHA' : 'DAYS STREAK'}
            </span>
          </Link>
        </header>

        {/* ─── 2. SELECTOR SEMANAL: DÍAS DE LA SEMANA ─── */}
        <section aria-label="Calendario semanal">
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 md:gap-3 w-full">
            {diasSemanaBar.map((dia) => {
              const esActivo = diaSeleccionado === dia.indice;

              return (
                <button
                  key={dia.indice}
                  onClick={() => setDiaSeleccionado(dia.indice)}
                  className={`w-full flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl transition-all duration-200 cursor-pointer ${
                    esActivo
                      ? 'shadow-lg scale-[1.02]'
                      : 'hover:bg-neutral-800/50'
                  }`}
                  style={
                    esActivo
                      ? {
                          background: 'var(--color-primary)',
                          color: '#000000',
                        }
                      : {
                          background: 'transparent',
                          color: 'var(--color-white)',
                        }
                  }
                >
                  <span
                    className={`text-[11px] font-medium leading-none mb-1 ${
                      esActivo ? 'text-black font-extrabold' : 'text-neutral-400'
                    }`}
                  >
                    {dia.nombre}
                  </span>
                  <span
                    className={`text-sm font-extrabold leading-none ${
                      esActivo ? 'text-black font-black' : 'text-white'
                    }`}
                  >
                    {dia.numero}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ─── 3. SECCIÓN: ACTIVIDAD RECIENTE (RECENT ACTIVITY) ─── */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white">
              {locale === 'es' ? 'Actividad Reciente' : 'Recent Activity'}
            </h2>
            <Link
              to="/estadisticas"
              className="text-xs font-semibold text-neutral-400 hover:text-[var(--color-primary)] transition-colors flex items-center gap-0.5"
            >
              <span>{locale === 'es' ? 'Ver detalles' : 'View all'}</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* Grid responsivo ancho completo: Pasos + Calorías/Duración */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Tarjeta Principal: Pasos / Actividad Diaria */}
            <div className="lg:col-span-7 xl:col-span-8 card card-hover p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between">
              {/* Header de la tarjeta */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-neutral-300">
                    <Footprints size={16} />
                  </div>
                  <span className="font-bold text-white text-sm">
                    {locale === 'es' ? 'Pasos y Actividad' : 'Steps & Activity'}
                  </span>
                </div>
                <Link to="/historial" className="text-neutral-400 hover:text-white transition-colors">
                  <ChevronRight size={16} />
                </Link>
              </div>

              {/* Contenido: Número a la izquierda, Histograma limpio a la derecha */}
              <div className="flex items-end justify-between gap-4 mt-2">
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {statsCalculadas.pasosEstimados.toLocaleString()} <span className="text-xs font-normal text-neutral-400">{locale === 'es' ? 'pasos' : 'steps'}</span>
                  </p>
                  <p className="text-xs text-neutral-400 font-medium mt-1">
                    {statsCalculadas.distanciaKm} km · {statsCalculadas.calorias} kcal
                  </p>
                </div>

                {/* Histograma limpio */}
                <div className="flex items-end gap-2 sm:gap-3 h-16 pb-0.5">
                  {actividadSemanal.map((dia, idx) => {
                    const esDiaActual = idx === hoyDiaIndex;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-1.5">
                        <div
                          className="w-3 sm:w-4 rounded-full transition-all duration-300"
                          style={{
                            height: `${dia.alturaPct}%`,
                            minHeight: '8px',
                            background: esDiaActual ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.22)',
                          }}
                        />
                        <span className={`text-[10px] font-bold ${esDiaActual ? 'text-white' : 'text-neutral-500'}`}>
                          {dia.letra}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Dos tarjetas secundarias en grid: Calorías y Duración limpias */}
            <div className="lg:col-span-5 xl:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3.5">
              {/* Tarjeta Calorías */}
              <div className="card card-hover p-4 sm:p-5 flex flex-col justify-between" style={{ minHeight: '115px' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-neutral-300">
                    <Flame size={15} />
                    <span className="font-bold text-white text-xs">
                      {locale === 'es' ? 'Calorías' : 'Calories'}
                    </span>
                  </div>
                  <ChevronRight size={14} className="text-neutral-500" />
                </div>

                <div className="flex items-end justify-between mt-3">
                  <div>
                    <p className="text-xl sm:text-2xl font-black text-white leading-none">
                      {statsCalculadas.calorias}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-medium mt-1">Kcal quemadas</p>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-neutral-300">
                    {locale === 'es' ? 'Diario' : 'Daily'}
                  </span>
                </div>
              </div>

              {/* Tarjeta Duración */}
              <div className="card card-hover p-4 sm:p-5 flex flex-col justify-between" style={{ minHeight: '115px' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-neutral-300">
                    <Clock size={15} />
                    <span className="font-bold text-white text-xs">
                      {locale === 'es' ? 'Duración' : 'Durations'}
                    </span>
                  </div>
                  <ChevronRight size={14} className="text-neutral-500" />
                </div>

                <div className="flex items-end justify-between mt-3">
                  <div>
                    <p className="text-xl sm:text-2xl font-black text-white leading-none">
                      {statsCalculadas.minutos}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-medium mt-1">
                      {locale === 'es' ? 'Minutos sesión' : 'Workout mins'}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-neutral-300">
                    {locale === 'es' ? 'Tiempo' : 'Time'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 4. SECCIÓN: PLANES POPULARES (TRENDING PLANS) ─── */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white">
              {locale === 'es' ? 'Planes Populares' : 'Trending Plans'}
            </h2>
            <Link
              to="/mis-rutinas"
              className="text-xs font-semibold text-neutral-400 hover:text-[var(--color-primary)] transition-colors flex items-center gap-0.5"
            >
              <span>{locale === 'es' ? 'Ver todos' : 'View all'}</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
            {planesDestacados.map((plan) => {
              const bgImg = PLAN_IMAGES[plan.id] || '/exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg';

              return (
                <div
                  key={plan.id}
                  className="card rounded-3xl relative overflow-hidden group shadow-xl transition-all duration-300"
                  style={{
                    height: '220px',
                  }}
                >
                  {/* Foto de fondo con efecto zoom al hover */}
                  <img
                    src={bgImg}
                    alt={plan.nombre}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-55"
                  />

                  {/* Gradiente oscuro para contraste perfecto del texto */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 45%, rgba(10,14,22,0.94) 100%)',
                    }}
                  />

                  {/* Badge superior de categoría y duración con estilo glass-pill */}
                  <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between z-10">
                    <span
                      className="glass-pill text-[10px] font-extrabold uppercase px-3 py-1 text-white"
                      style={{
                        color: 'var(--color-primary)',
                      }}
                    >
                      {plan.categoria}
                    </span>

                    <span
                      className="glass-pill text-[10px] font-bold px-3 py-1 text-white flex items-center gap-1.5"
                    >
                      <Clock size={11} />
                      {plan.duracion} {t.routines.min}
                    </span>
                  </div>

                  {/* Información inferior y botón Join / Empezar */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between gap-3">
                    <div className="max-w-[70%]">
                      <h3 className="font-extrabold text-white text-base sm:text-lg leading-tight mb-1">
                        {locale === 'es' ? plan.nombre : plan.nombreEn}
                      </h3>
                      <p className="text-neutral-300 text-xs line-clamp-1">
                        {locale === 'es' ? plan.descripcion : plan.descripcionEn}
                      </p>
                    </div>

                    {/* Botón Empezar / Join en Neón Lima */}
                    <Link
                      to="/mis-rutinas/entrenamiento"
                      state={{ nombre: plan.nombre, ejerciciosIds: plan.ejerciciosIds }}
                      className="py-2 px-5 rounded-full font-black text-xs transition-all active:scale-95 shadow-lg flex items-center justify-center shrink-0 cursor-pointer"
                      style={{
                        background: 'var(--color-primary)',
                        color: '#000000',
                      }}
                    >
                      {locale === 'es' ? 'Empezar' : 'Join'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── 5. STATS RÁPIDAS DE RENDIMIENTO ─── */}
        <section className="pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="card card-hover p-4 rounded-2xl text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] text-neutral-400 font-semibold mb-1">
                <FireIcon size={14} style={{ color: '#FF6422' }} />
                <span>{locale === 'es' ? 'Racha' : 'Streak'}</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-white">
                {statsCalculadas.streak} <span className="text-xs text-neutral-400 font-normal">{locale === 'es' ? 'días' : 'days'}</span>
              </p>
            </div>

            <div className="card card-hover p-4 rounded-2xl text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] text-neutral-400 font-semibold mb-1">
                <Trophy size={14} style={{ color: 'var(--color-primary)' }} />
                <span>{locale === 'es' ? 'Mejor peso' : 'Best PR'}</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-white">
                {statsCalculadas.maxKg} <span className="text-xs text-neutral-400 font-normal">kg</span>
              </p>
            </div>

            <div className="card card-hover p-4 rounded-2xl text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] text-neutral-400 font-semibold mb-1">
                <Dumbbell size={14} style={{ color: '#38BDF8' }} />
                <span>{locale === 'es' ? 'Sesiones' : 'Workouts'}</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-white">
                {statsCalculadas.sesionesTotal}
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}