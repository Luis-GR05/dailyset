import { useMemo, useState } from 'react';
import { AppLayout, TuSemanaEnCifrasModal } from "../componentes";
import { Link } from 'react-router-dom';
import { useI18n } from '../context/I18nContext';
import { useAuth } from '../context/AuthContext';
import { useHistorial } from '../context/HistorialContext';
import { useRutinas } from '../context/RutinasContext';
import {
  ChevronRight,
  Flame,
  Clock,
  Dumbbell,
  Trophy,
  Flame as FireIcon,
  Play,
  Plus,
  CheckCircle2,
  FolderPlus,
  Sparkles,
  Share2,
} from 'lucide-react';

export default function DashboardPage() {
  const { locale } = useI18n();
  const { user } = useAuth();
  const { sesiones } = useHistorial();
  const { rutinas } = useRutinas();

  // Estado para abrir la pantalla "Tu semana en cifras"
  const [modalCifrasAbierto, setModalCifrasAbierto] = useState(false);

  // Día de la semana seleccionado (0 = Lunes ... 6 = Domingo)
  const hoyFecha = new Date();
  const hoyDiaIndex = (hoyFecha.getDay() + 6) % 7; // Convertir: 0 = Lunes, 6 = Domingo
  const [diaSeleccionado, setDiaSeleccionado] = useState<number>(hoyDiaIndex);

  // Avatar del usuario: sin foto por defecto, solo foto real si existe o la inicial
  const displayAvatar = user?.avatar_url || localStorage.getItem('dailyset_avatar') || null;

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
    return ejercicios.reduce((t, ej) => t + ej.series.reduce((s, serie) => s + (serie.kg || 0) * (serie.reps || 0), 0), 0);
  };

  const pad2 = (n: number) => String(n).padStart(2, '0');
  const toLocalYYYYMMDD = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

  // Actividad real de los 7 días de la semana actual
  const actividadSemanal = useMemo(() => {
    const inicioSemana = new Date(hoyFecha);
    const diaActual = (hoyFecha.getDay() + 6) % 7;
    inicioSemana.setDate(hoyFecha.getDate() - diaActual);

    const dias = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(inicioSemana);
      d.setDate(inicioSemana.getDate() + i);
      const key = toLocalYYYYMMDD(d);
      const sesionesDia = sesiones.filter(s => s.fecha === key);
      const vol = sesionesDia.reduce((acc, s) => acc + calcularVolumenSesion(s.ejercicios), 0);
      return {
        letra: (locale === 'es' ? 'LMXJVSD' : 'MTWTFSS')[i],
        volumen: vol,
        entrenado: sesionesDia.length > 0,
      };
    });

    const maxVol = Math.max(...dias.map(d => d.volumen), 1);

    return dias.map(d => ({
      ...d,
      alturaPct: d.volumen > 0 ? Math.min(100, Math.max(22, Math.round((d.volumen / maxVol) * 100))) : 8,
    }));
  }, [sesiones, locale]);

  // Estadísticas 100% reales calculadas a partir de sesiones
  const statsCalculadas = useMemo(() => {
    // Sesiones de esta semana
    const hoy = new Date();
    const diaActual = (hoy.getDay() + 6) % 7;
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - diaActual);
    inicioSemana.setHours(0, 0, 0, 0);

    const sesionesEstaSemana = sesiones.filter(s => {
      const d = new Date(s.fecha + 'T12:00:00');
      return d >= inicioSemana;
    });

    const volumenSemana = sesionesEstaSemana.reduce((acc, s) => acc + calcularVolumenSesion(s.ejercicios), 0);
    const seriesSemana = sesionesEstaSemana.reduce((acc, s) => acc + s.ejercicios.reduce((sTot, e) => sTot + e.series.length, 0), 0);
    const minutosSemana = sesionesEstaSemana.reduce((acc, s) => acc + (s.duracionMin || 0), 0);

    // Total volumen histórico
    const totalVol = sesiones.reduce((acc, s) => acc + calcularVolumenSesion(s.ejercicios), 0);
    const minutosTotales = sesiones.reduce((acc, s) => acc + (s.duracionMin || 0), 0);

    // Calorías estimadas reales basadas en sesiones reales
    const caloriasSemana = sesionesEstaSemana.length > 0
      ? Math.round(minutosSemana * 6.5 + volumenSemana * 0.03)
      : 0;

    const caloriasTotales = sesiones.length > 0
      ? Math.round(minutosTotales * 6.5 + totalVol * 0.03)
      : 0;

    // Racha histórica real
    const uniqueDays = Array.from(new Set(sesiones.map(s => s.fecha.split('T')[0]))).sort();
    const todayStr = toLocalYYYYMMDD(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = toLocalYYYYMMDD(yesterday);

    let streak = 0;
    if (uniqueDays.includes(todayStr) || uniqueDays.includes(yesterdayStr)) {
      streak = 1;
      const lastTrainedDateStr = uniqueDays.includes(todayStr) ? todayStr : yesterdayStr;
      const lastIdx = uniqueDays.lastIndexOf(lastTrainedDateStr);
      for (let i = lastIdx; i > 0; i--) {
        const dCurr = new Date(uniqueDays[i] + 'T00:00:00');
        const dPrev = new Date(uniqueDays[i - 1] + 'T00:00:00');
        const diffDays = Math.round((dCurr.getTime() - dPrev.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) streak++;
        else break;
      }
    }

    // PR máximo peso real
    let maxKg = 0;
    sesiones.forEach(s => {
      s.ejercicios.forEach(ej => {
        ej.series.forEach(serie => {
          if (serie.kg > maxKg) maxKg = serie.kg;
        });
      });
    });

    return {
      volumenSemana,
      seriesSemana,
      minutosSemana,
      caloriasSemana,
      caloriasTotales,
      minutosTotales,
      streak,
      maxKg,
      sesionesTotal: sesiones.length,
      sesionesSemanaCount: sesionesEstaSemana.length,
    };
  }, [sesiones]);

  // Mapeo de última sesión completada para cada rutina
  const ultimaSesionPorRutina = useMemo(() => {
    const map: Record<string, string> = {};
    const sorted = [...sesiones].sort((a, b) => b.fecha.localeCompare(a.fecha));
    for (const s of sorted) {
      const key = s.rutina?.toLowerCase().trim();
      if (key && !map[key]) {
        map[key] = s.fecha;
      }
    }
    return map;
  }, [sesiones]);

  // Rutinas recientes ordenadas por uso reciente o por orden de creación
  const rutinasRecientes = useMemo(() => {
    if (!rutinas || rutinas.length === 0) return [];
    return [...rutinas]
      .sort((a, b) => {
        const fechaA = ultimaSesionPorRutina[a.nombre.toLowerCase().trim()] || '';
        const fechaB = ultimaSesionPorRutina[b.nombre.toLowerCase().trim()] || '';
        if (fechaA && fechaB) return fechaB.localeCompare(fechaA);
        if (fechaA) return -1;
        if (fechaB) return 1;
        return b.id - a.id;
      })
      .slice(0, 4);
  }, [rutinas, ultimaSesionPorRutina]);

  const formatearFechaRelativa = (fechaStr: string) => {
    if (!fechaStr) return null;
    const [y, m, d] = fechaStr.split('-').map(Number);
    const fecha = new Date(y, m - 1, d);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const diffDias = Math.round((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDias === 0) return locale === 'es' ? 'Hoy' : 'Today';
    if (diffDias === 1) return locale === 'es' ? 'Ayer' : 'Yesterday';
    if (diffDias < 7) return locale === 'es' ? `Hace ${diffDias} d` : `${diffDias}d ago`;
    return fechaStr;
  };

  // Nombre del usuario para el saludo
  const primerNombre = user?.nombre ? user.nombre.split(' ')[0] : 'Atleta';

  return (
    <AppLayout fullWidth>
      <div className="space-y-6 pb-20 w-full">
        {/* ─── 1. HEADER: AVATAR, SALUDO Y CAMPANA ─── */}
        <header className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3.5">
            {/* Avatar circular con foto real o inicial si no hay foto */}
            <Link to="/perfil" className="relative group">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-neutral-800 group-hover:border-[var(--color-primary)] transition-all flex items-center justify-center bg-black/40 shadow-md">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={user?.nombre || 'Usuario'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full bg-neutral-900 flex items-center justify-center font-black text-white text-base italic"
                    style={{ border: '1px solid var(--color-primary)' }}
                  >
                    {primerNombre.charAt(0).toUpperCase()}
                  </div>
                )}
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

          {/* Badge de Racha Diaria en cabecera */}
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

        {/* ─── BANNER INTERACTIVO: TU SEMANA EN CIFRAS ("QUE DÉ GANAS DE COMPARTIR") ─── */}
        <section>
          <div
            onClick={() => setModalCifrasAbierto(true)}
            className="group relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-black border border-white/10 hover:border-white/20 transition-all cursor-pointer shadow-sm hover:shadow-md"
          >
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-white/5 text-white border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Sparkles size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/5 text-white border border-white/10">
                      {locale === 'es' ? 'Tu Semana en Cifras' : 'Your Week in Numbers'}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
                      {statsCalculadas.sesionesSemanaCount} {locale === 'es' ? 'entrenos esta semana' : 'workouts this week'}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white mt-1 group-hover:text-neutral-200 transition-colors truncate">
                    {locale === 'es'
                      ? 'Descubre tus récords semanales y compártelos'
                      : 'Discover your weekly milestones and share them'}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 group-hover:bg-white group-hover:text-black text-white transition-all">
                  <Share2 size={13} />
                  <span>{locale === 'es' ? 'Ver resumen' : 'View wrapped'}</span>
                </span>
                <ChevronRight size={18} className="text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </div>
        </section>

        {/* ─── SECCIÓN: TUS RUTINAS RECIENTES (ACCESO DIRECTO PARA ENTRENAR) ─── */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <Dumbbell size={16} />
              </span>
              <h2 className="text-base font-extrabold text-white">
                {locale === 'es' ? 'Tus Rutinas Recientes' : 'Your Recent Routines'}
              </h2>
            </div>
            <Link
              to="/mis-rutinas"
              className="text-xs font-semibold text-neutral-400 hover:text-[var(--color-primary)] transition-colors flex items-center gap-0.5"
            >
              <span>{locale === 'es' ? 'Ver todas' : 'View all'}</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {rutinasRecientes.length === 0 ? (
            <div className="card p-5 rounded-2xl border border-dashed border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left bg-neutral-900/40">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 shrink-0">
                  <FolderPlus size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {locale === 'es' ? 'Aún no tienes rutinas creadas' : 'No routines created yet'}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {locale === 'es'
                      ? 'Crea tu primera rutina personalizada o explora las plantillas para empezar a entrenar hoy.'
                      : 'Create your first custom routine or explore templates to get started.'}
                  </p>
                </div>
              </div>
              <Link
                to="/mis-rutinas"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 shrink-0"
                style={{
                  background: 'var(--color-primary)',
                  color: '#000000',
                }}
              >
                <Plus size={15} />
                <span>{locale === 'es' ? 'Crear rutina' : 'Create routine'}</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {rutinasRecientes.map((rutina) => {
                const totalEjercicios = rutina.ejerciciosIds?.length || 0;
                const tieneEjercicios = totalEjercicios > 0;
                const ultimaFecha = ultimaSesionPorRutina[rutina.nombre.toLowerCase().trim()];
                const fechaRelativa = ultimaFecha ? formatearFechaRelativa(ultimaFecha) : null;

                const destino = tieneEjercicios
                  ? '/mis-rutinas/entrenamiento'
                  : '/mis-rutinas';
                const estado = tieneEjercicios
                  ? { nombre: rutina.nombre, rutinaId: rutina.id, ejerciciosIds: rutina.ejerciciosIds }
                  : undefined;

                return (
                  <Link
                    key={rutina.id}
                    to={destino}
                    state={estado}
                    className="card card-hover p-4 sm:p-5 rounded-2xl border border-neutral-800/90 hover:border-[var(--color-primary)]/50 transition-all flex flex-col justify-between group relative overflow-hidden active:scale-[0.99] cursor-pointer"
                  >
                    <div>
                      {/* Fila superior: Categoría + Duración */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-800/90 text-neutral-300 border border-neutral-700/60 truncate max-w-[120px]">
                          {rutina.categoria || (locale === 'es' ? 'General' : 'General')}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400">
                          <Clock size={12} />
                          <span>{rutina.duracion || 45} min</span>
                        </div>
                      </div>

                      {/* Nombre de la rutina */}
                      <h3 className="font-black text-white text-base leading-snug group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
                        {rutina.nombre}
                      </h3>

                      {/* Info de ejercicios y última sesión */}
                      <div className="mt-1.5 flex items-center justify-between text-xs text-neutral-400">
                        <span>
                          {totalEjercicios} {locale === 'es' ? 'ejercicios' : 'exercises'}
                        </span>
                        {fechaRelativa && (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-white">
                            <CheckCircle2 size={11} className="text-emerald-400" />
                            <span className="text-white">{fechaRelativa}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botón de acción directo */}
                    <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-300 group-hover:text-white transition-colors">
                        {tieneEjercicios
                          ? (locale === 'es' ? 'Entrenar ahora' : 'Train now')
                          : (locale === 'es' ? 'Configurar rutina' : 'Setup routine')}
                      </span>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all group-hover:scale-105 shadow-sm bg-black border border-white/15 text-white group-hover:border-white/30"
                      >
                        <Play size={12} fill="#ffffff" className="text-white ml-0.5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
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
            {/* Tarjeta Principal: Carga de Entrenamiento y Volumen Real */}
            <div className="lg:col-span-7 xl:col-span-8 card card-hover p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between">
              {/* Header de la tarjeta */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-neutral-300">
                    <Dumbbell size={16} />
                  </div>
                  <span className="font-bold text-white text-sm">
                    {locale === 'es' ? 'Carga de Entrenamiento' : 'Training Load'}
                  </span>
                </div>
                <Link to="/historial" className="text-neutral-400 hover:text-white transition-colors">
                  <ChevronRight size={16} />
                </Link>
              </div>

              {/* Contenido: Volumen a la izquierda, Histograma limpio de la semana a la derecha */}
              <div className="flex items-end justify-between gap-4 mt-2">
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {statsCalculadas.volumenSemana >= 1000
                      ? `${(statsCalculadas.volumenSemana / 1000).toFixed(1)} Ton`
                      : `${statsCalculadas.volumenSemana} kg`}
                  </p>
                  <p className="text-xs text-neutral-400 font-medium mt-1">
                    {statsCalculadas.sesionesSemanaCount} {locale === 'es' ? 'sesiones esta semana' : 'sessions this week'} · {statsCalculadas.seriesSemana} {locale === 'es' ? 'series' : 'sets'}
                  </p>
                </div>

                {/* Histograma limpio basado 100% en volumen real */}
                <div className="flex items-end gap-2 sm:gap-3 h-16 pb-0.5">
                  {actividadSemanal.map((dia, idx) => {
                    const esDiaActual = idx === hoyDiaIndex;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-1.5" title={`${dia.volumen} kg`}>
                        <div
                          className="w-3 sm:w-4 rounded-full transition-all duration-300"
                          style={{
                            height: `${dia.alturaPct}%`,
                            minHeight: '6px',
                            background: dia.volumen > 0
                              ? 'var(--color-primary)'
                              : esDiaActual
                              ? 'rgba(255, 255, 255, 0.25)'
                              : 'rgba(255, 255, 255, 0.08)',
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
                      {statsCalculadas.caloriasSemana}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-medium mt-1">Kcal estimadas</p>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-neutral-300">
                    {locale === 'es' ? 'Semana' : 'Week'}
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
                      {statsCalculadas.minutosSemana}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-medium mt-1">
                      {locale === 'es' ? 'Minutos sesión' : 'Workout mins'}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-neutral-300">
                    {locale === 'es' ? 'Semana' : 'Week'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 4. STATS RÁPIDAS DE RENDIMIENTO ─── */}
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

      {/* Modal interactivo de Tu Semana / Mes en cifras */}
      <TuSemanaEnCifrasModal
        abierto={modalCifrasAbierto}
        onCerrar={() => setModalCifrasAbierto(false)}
      />
    </AppLayout>
  );
}