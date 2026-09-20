import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout, TituloPagina, ResumenEstadisticas, Card, BotonPrimario } from "../componentes";
import { useHistorial } from "../context/HistorialContext";
import { useI18n } from '../context/I18nContext';
import MesCalendario from '../componentes/ui/MesCalendario';
import {
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dumbbell,
  Search,
  ArrowRight,
  Activity,
  X,
} from 'lucide-react';

export default function HistorialPage() {
  const { metricas, sesiones, getSesionesPorMes, getSesionesPorFecha, getMetricasPorMes } = useHistorial();
  const { locale } = useI18n();
  const navigate = useNavigate();

  // Modo de vista: 'mes' (por defecto muestra sólo el mes actual) | 'anio' (vista del año entero)
  const [vista, setVista] = useState<'mes' | 'anio'>('mes');

  // Mes y año actualmente inspeccionados (por defecto el mes actual)
  const ahora = useMemo(() => new Date(), []);
  const [mesActual, setMesActual] = useState(ahora.getMonth());
  const [anioActual, setAnioActual] = useState(ahora.getFullYear());

  // Año inspeccionado en la vista anual
  const [anioSeleccionado, setAnioSeleccionado] = useState(ahora.getFullYear());

  // Búsqueda en la vista anual
  const [busquedaAnio, setBusquedaAnio] = useState('');

  // Día seleccionado en el calendario interactivo del mes
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(null);

  // Nombre formateado del mes seleccionado
  const localeStr = locale === 'es' ? 'es-ES' : 'en-US';
  const nombreMesSeleccionado = useMemo(() => {
    return new Date(anioActual, mesActual).toLocaleString(localeStr, { month: 'long' });
  }, [anioActual, mesActual, localeStr]);

  // Días entrenados en el mes seleccionado
  const diasEntrenadosMes = useMemo(() => {
    return getSesionesPorMes(mesActual, anioActual);
  }, [mesActual, anioActual, getSesionesPorMes]);

  // Métricas del mes seleccionado
  const metricasMes = useMemo(() => {
    return getMetricasPorMes(mesActual, anioActual);
  }, [mesActual, anioActual, getMetricasPorMes]);

  // Sesiones detalladas del mes seleccionado
  const sesionesDelMes = useMemo(() => {
    return sesiones.filter((s) => {
      const parts = s.fecha.split('-');
      if (parts.length < 3) return false;
      const anio = parseInt(parts[0], 10);
      const mes = parseInt(parts[1], 10) - 1;
      return anio === anioActual && mes === mesActual;
    }).sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [sesiones, mesActual, anioActual]);

  // Minutos totales del mes
  const minutosTotalesMes = useMemo(() => {
    return sesionesDelMes.reduce((acc, s) => acc + (s.duracionMin || 0), 0);
  }, [sesionesDelMes]);

  // Navegar entre meses
  const irMesAnterior = () => {
    if (mesActual === 0) {
      setMesActual(11);
      setAnioActual(a => a - 1);
    } else {
      setMesActual(m => m - 1);
    }
    setDiaSeleccionado(null);
  };

  const irMesSiguiente = () => {
    if (mesActual === 11) {
      setMesActual(0);
      setAnioActual(a => a + 1);
    } else {
      setMesActual(m => m + 1);
    }
    setDiaSeleccionado(null);
  };

  const irAMesHoy = () => {
    setMesActual(ahora.getMonth());
    setAnioActual(ahora.getFullYear());
    setDiaSeleccionado(null);
  };

  const esMesDeHoy = mesActual === ahora.getMonth() && anioActual === ahora.getFullYear();

  // Navegar entre años en la vista anual
  const irAnioAnterior = () => setAnioSeleccionado(a => a - 1);
  const irAnioSiguiente = () => setAnioSeleccionado(a => a + 1);

  // Años disponibles en el historial
  const aniosDisponibles = useMemo(() => {
    const years = new Set<number>();
    years.add(ahora.getFullYear());
    sesiones.forEach(s => {
      const y = parseInt(s.fecha.split('-')[0], 10);
      if (!isNaN(y)) years.add(y);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [sesiones, ahora]);

  // Sesiones de todo el año seleccionado
  const sesionesDelAnio = useMemo(() => {
    return sesiones.filter(s => {
      const y = parseInt(s.fecha.split('-')[0], 10);
      return y === anioSeleccionado;
    }).sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [sesiones, anioSeleccionado]);

  // Métricas del año seleccionado
  const metricasAnio = useMemo(() => {
    const totalSesiones = sesionesDelAnio.length;
    const volumenTotalKg = sesionesDelAnio.reduce((tot, s) => {
      return tot + s.ejercicios.reduce((sTot, e) => {
        return sTot + e.series.reduce((sub, ser) => sub + (ser.kg || 0) * (ser.reps || 0), 0);
      }, 0);
    }, 0);
    const minutosTotales = sesionesDelAnio.reduce((tot, s) => tot + (s.duracionMin || 0), 0);
    const mesesActivos = new Set(sesionesDelAnio.map(s => s.fecha.split('-')[1])).size;

    return { totalSesiones, volumenTotalKg, minutosTotales, mesesActivos };
  }, [sesionesDelAnio]);

  // Desglose de los 12 meses del año seleccionado
  const mesesDelAnio = useMemo(() => {
    return Array.from({ length: 12 }, (_, m) => {
      const sesionesMes = sesionesDelAnio.filter(s => {
        const mesIndex = parseInt(s.fecha.split('-')[1], 10) - 1;
        return mesIndex === m;
      });
      const volumenMes = sesionesMes.reduce((tot, s) => {
        return tot + s.ejercicios.reduce((sTot, e) => {
          return sTot + e.series.reduce((sub, ser) => sub + (ser.kg || 0) * (ser.reps || 0), 0);
        }, 0);
      }, 0);
      const nombre = new Date(anioSeleccionado, m).toLocaleString(localeStr, { month: 'long' });
      return {
        mes: m,
        nombre,
        totalSesiones: sesionesMes.length,
        volumenKg: volumenMes,
        sesiones: sesionesMes,
      };
    });
  }, [sesionesDelAnio, anioSeleccionado, localeStr]);

  // Sesiones filtradas por búsqueda en el año
  const sesionesAnioFiltradas = useMemo(() => {
    if (!busquedaAnio.trim()) return [];
    const q = busquedaAnio.toLowerCase();
    return sesionesDelAnio.filter(s =>
      s.rutina.toLowerCase().includes(q) ||
      s.ejercicios.some(e => e.nombre.toLowerCase().includes(q))
    );
  }, [sesionesDelAnio, busquedaAnio]);

  // Clic en un día del calendario del mes
  const handleDiaClick = (dia: number) => {
    setDiaSeleccionado(prev => prev === dia ? null : dia);
  };

  const fechaSeleccionadaStr = diaSeleccionado !== null
    ? `${anioActual}-${String(mesActual + 1).padStart(2, '0')}-${String(diaSeleccionado).padStart(2, '0')}`
    : null;

  const sesionesDiaSeleccionado = fechaSeleccionadaStr
    ? getSesionesPorFecha(fechaSeleccionadaStr)
    : [];

  // Formato de fecha legible
  const formatearFechaLarga = (fechaStr: string) => {
    const [y, m, d] = fechaStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString(localeStr, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Abrir mes desde la vista anual
  const abrirMesDesdeAnio = (mesIndex: number) => {
    setMesActual(mesIndex);
    setAnioActual(anioSeleccionado);
    setVista('mes');
    setDiaSeleccionado(null);
  };

  return (
    <AppLayout fullWidth>
      <div className="space-y-6 pb-16 max-w-7xl mx-auto w-full">

        {/* ─── CABECERA PRINCIPAL Y SELECTOR DE VISTA ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div>
            <TituloPagina titulo={locale === 'es' ? "Historial de Entrenamientos" : "Workout History"} />
            <p className="text-neutral-400 text-xs sm:text-sm mt-1">
              {locale === 'es'
                ? "Consulta tus sesiones realizadas, volumen acumulado y constancia."
                : "Review your completed sessions, accumulated volume, and monthly discipline."}
            </p>
          </div>

          {/* Selector de Modo: Mes actual (por defecto) vs Año entero */}
          <div className="flex p-1 rounded-2xl bg-white/[0.04] border border-white/10 self-start md:self-auto shrink-0 shadow-sm">
            <button
              onClick={() => setVista('mes')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                vista === 'mes'
                  ? 'bg-[var(--color-primary)] text-black font-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Calendar size={14} />
              <span>{locale === 'es' ? 'Mes actual' : 'Current month'}</span>
            </button>

            <button
              onClick={() => setVista('anio')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                vista === 'anio'
                  ? 'bg-[var(--color-primary)] text-black font-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Layers size={14} />
              <span>{locale === 'es' ? 'Año entero' : 'Full year'}</span>
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* VISTA 1: MES ACTUAL (POR DEFECTO AL ENTRAR AL HISTORIAL)      */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {vista === 'mes' && (
          <div className="space-y-6 animate-fadeIn">

            {/* Barra de control del mes con navegación directa */}
            <div className="card p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 shrink-0">
                  <button
                    onClick={irMesAnterior}
                    className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title={locale === 'es' ? 'Mes anterior' : 'Previous month'}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={irMesSiguiente}
                    className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title={locale === 'es' ? 'Mes siguiente' : 'Next month'}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black capitalize text-white leading-tight">
                      {nombreMesSeleccionado} <span className="text-neutral-400 font-mono text-base font-normal">{anioActual}</span>
                    </h2>

                    {/* Selector interactivo para saltar directamente a cualquier mes */}
                    <input
                      type="month"
                      value={`${anioActual}-${String(mesActual + 1).padStart(2, '0')}`}
                      onChange={(e) => {
                        if (!e.target.value) return;
                        const [y, m] = e.target.value.split('-').map(Number);
                        setAnioActual(y);
                        setMesActual(m - 1);
                        setDiaSeleccionado(null);
                      }}
                      title={locale === 'es' ? 'Elegir otro mes' : 'Select another month'}
                      className="bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs rounded-xl px-2.5 py-1 outline-none focus:border-[var(--color-primary)] cursor-pointer hover:border-neutral-500 transition-colors"
                    />
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {sesionesDelMes.length} {locale === 'es' ? 'sesiones registradas' : 'sessions recorded'}
                  </p>
                </div>
              </div>

              {!esMesDeHoy && (
                <button
                  onClick={irAMesHoy}
                  className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer self-start sm:self-auto shrink-0"
                >
                  {locale === 'es' ? '← Volver al mes actual' : '← Back to current month'}
                </button>
              )}
            </div>

            {/* Tarjetas de Métricas del Mes */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              <div className="card p-4 rounded-2xl">
                <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <Calendar size={14} className="text-[var(--color-primary)]" />
                  <span>{locale === 'es' ? 'Entrenamientos' : 'Workouts'}</span>
                </div>
                <p className="text-2xl font-black text-white leading-none">
                  {sesionesDelMes.length}
                </p>
                <p className="text-[11px] text-neutral-400 mt-1.5">
                  {diasEntrenadosMes.length} {locale === 'es' ? 'días activos' : 'active days'}
                </p>
              </div>

              <div className="card p-4 rounded-2xl">
                <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <Dumbbell size={14} className="text-sky-400" />
                  <span>{locale === 'es' ? 'Volumen Total' : 'Volume'}</span>
                </div>
                <p className="text-2xl font-black text-white leading-none">
                  {metricasMes.volumenKg >= 1000
                    ? `${(metricasMes.volumenKg / 1000).toFixed(1)} Ton`
                    : `${metricasMes.volumenKg} kg`}
                </p>
                <p className="text-[11px] text-neutral-400 mt-1.5">
                  {locale === 'es' ? 'peso movido en el mes' : 'moved this month'}
                </p>
              </div>

              <div className="card p-4 rounded-2xl">
                <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <Clock size={14} className="text-amber-400" />
                  <span>{locale === 'es' ? 'Tiempo' : 'Time'}</span>
                </div>
                <p className="text-2xl font-black text-white leading-none">
                  {Math.floor(minutosTotalesMes / 60)}h {minutosTotalesMes % 60}m
                </p>
                <p className="text-[11px] text-neutral-400 mt-1.5">
                  {locale === 'es' ? 'dedicado a entrenar' : 'dedicated to training'}
                </p>
              </div>

              <div className="card p-4 rounded-2xl">
                <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <Activity size={14} className="text-emerald-400" />
                  <span>{locale === 'es' ? 'Intensidad' : 'Intensity'}</span>
                </div>
                <p className="text-2xl font-black text-white leading-none">
                  {metricasMes.intensidad}
                </p>
                <p className="text-[11px] text-neutral-400 mt-1.5">
                  {locale === 'es' ? 'promedio mensual' : 'monthly average'}
                </p>
              </div>
            </div>

            {/* Layout Principal: Calendario Interactivo a la Izquierda + Feed de Sesiones a la Derecha */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              {/* Columna Izquierda: Calendario del Mes */}
              <div className="lg:col-span-5 space-y-4">
                <Card className="p-5 sm:p-6" hoverable={false}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Calendar size={16} className="text-[var(--color-primary)]" />
                      <span>{locale === 'es' ? 'Días del Mes' : 'Days of the Month'}</span>
                    </h3>
                    <span className="text-[11px] text-neutral-400 font-medium">
                      {locale === 'es' ? 'Pulsa un día para ver detalle' : 'Click day for details'}
                    </span>
                  </div>

                  <MesCalendario
                    mes={mesActual}
                    anio={anioActual}
                    diasEntrenados={diasEntrenadosMes}
                    diaSeleccionado={diaSeleccionado}
                    onDiaClick={handleDiaClick}
                  />

                  {/* Leyenda del calendario */}
                  <div className="mt-5 pt-3 border-t border-neutral-800 flex items-center justify-around text-xs text-neutral-400">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[var(--color-primary)] shadow-sm"></span>
                      <span>{locale === 'es' ? 'Día entrenado' : 'Workout day'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-white/10 border border-white/20"></span>
                      <span>{locale === 'es' ? 'Descanso' : 'Rest day'}</span>
                    </div>
                  </div>
                </Card>

                {/* Desglose interactivo del día seleccionado */}
                {diaSeleccionado !== null && (
                  <div className="card p-5 rounded-2xl border border-[var(--color-primary)]/40 bg-neutral-900/90 animate-fadeIn">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] animate-pulse"></span>
                        <h4 className="text-sm font-extrabold text-white capitalize">
                          {fechaSeleccionadaStr && formatearFechaLarga(fechaSeleccionadaStr)}
                        </h4>
                      </div>
                      <button
                        onClick={() => setDiaSeleccionado(null)}
                        className="p-1 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title={locale === 'es' ? 'Cerrar detalle' : 'Close detail'}
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {sesionesDiaSeleccionado.length > 0 ? (
                      <div className="mt-3 space-y-3">
                        {sesionesDiaSeleccionado.map((sesion) => {
                          const volTotalSesion = sesion.ejercicios.reduce((acc, ej) => {
                            return acc + ej.series.reduce((sAcc, s) => sAcc + (s.kg || 0) * (s.reps || 0), 0);
                          }, 0);

                          return (
                            <div key={sesion.id} className="p-3.5 rounded-xl bg-neutral-800/60 border border-neutral-700/60 space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <h5 className="font-bold text-white text-sm">{sesion.rutina}</h5>
                                <span className="text-xs text-neutral-400 font-mono">{sesion.duracionMin} min</span>
                              </div>

                              <div className="flex items-center gap-3 text-xs text-neutral-300">
                                <span>Volumen: <strong className="text-[var(--color-primary)] font-mono">{volTotalSesion} kg</strong></span>
                                <span>·</span>
                                <span>Ejercicios: <strong className="text-white font-mono">{sesion.ejercicios.length}</strong></span>
                              </div>

                              <div className="pt-2 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => navigate(`/historial/${sesion.fecha}`)}
                                  className="px-3.5 py-1.5 rounded-xl bg-[var(--color-primary)] text-black text-xs font-black uppercase tracking-wider hover:opacity-90 flex items-center gap-1.5 cursor-pointer shadow-md"
                                >
                                  <span>{locale === 'es' ? 'Ver sesión completa' : 'View full session'}</span>
                                  <ArrowRight size={13} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-4 text-center space-y-2.5">
                        <p className="text-xs text-neutral-300 font-medium">
                          {locale === 'es'
                            ? 'No hay ningún entrenamiento registrado en este día.'
                            : 'No workouts recorded on this day.'}
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          {locale === 'es'
                            ? 'Día de descanso o sin sesión guardada en la fecha seleccionada.'
                            : 'Rest day or no session saved for this date.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate('/mis-rutinas')}
                          className="mt-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Dumbbell size={13} style={{ color: 'var(--color-primary)' }} />
                          <span>{locale === 'es' ? 'Ir a Mis Rutinas para entrenar' : 'Go to My Routines'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Columna Derecha: Feed Detallado de Sesiones del Mes */}
              <div className="lg:col-span-7 space-y-3.5">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Dumbbell size={16} className="text-[var(--color-primary)]" />
                    <span>{locale === 'es' ? 'Sesiones del Mes' : 'Month Sessions'}</span>
                    <span className="text-xs font-normal text-neutral-400 font-mono">({sesionesDelMes.length})</span>
                  </h3>
                </div>

                {sesionesDelMes.length > 0 ? (
                  <div className="space-y-3">
                    {sesionesDelMes.map((sesion) => {
                      const volSesion = sesion.ejercicios.reduce((tot, ej) =>
                        tot + ej.series.reduce((sTot, s) => sTot + (s.kg || 0) * (s.reps || 0), 0), 0);

                      return (
                        <div
                          key={sesion.id}
                          onClick={() => navigate(`/historial/${sesion.fecha}`)}
                          className="card card-hover p-4 sm:p-5 rounded-2xl cursor-pointer transition-all border border-neutral-800 hover:border-neutral-600 flex flex-col justify-between gap-3 group"
                        >
                          {/* Cabecera de la sesión */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-300 capitalize">
                                  {formatearFechaLarga(sesion.fecha)}
                                </span>
                                <span className="text-xs text-neutral-400 flex items-center gap-1 font-mono">
                                  <Clock size={12} />
                                  {sesion.duracionMin} min
                                </span>
                              </div>
                              <h4 className="text-base sm:text-lg font-black text-white mt-1.5 group-hover:text-[var(--color-primary)] transition-colors">
                                {sesion.rutina}
                              </h4>
                            </div>

                            <div className="flex sm:flex-col items-end justify-between sm:justify-center">
                              <span className="text-xs text-neutral-400 uppercase font-bold tracking-wider">{locale === 'es' ? 'Volumen' : 'Volume'}</span>
                              <span className="text-sm sm:text-base font-black text-white font-mono">
                                {volSesion >= 1000 ? `${(volSesion / 1000).toFixed(1)}k` : volSesion} <span className="text-xs text-[var(--color-primary)]">kg</span>
                              </span>
                            </div>
                          </div>

                          {/* Previsualización de Ejercicios incluidos */}
                          {sesion.ejercicios.length > 0 && (
                            <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap gap-1.5">
                              {sesion.ejercicios.slice(0, 4).map((ej) => (
                                <span
                                  key={ej.id}
                                  className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-white/[0.03] border border-white/5 text-neutral-300 truncate max-w-[180px]"
                                >
                                  {ej.nombre} ({ej.series.length}s)
                                </span>
                              ))}
                              {sesion.ejercicios.length > 4 && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-white/5 text-neutral-400">
                                  +{sesion.ejercicios.length - 4} más
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-neutral-400 pt-1 group-hover:text-white transition-colors">
                            <span className="text-[11px] font-semibold">{locale === 'es' ? 'Ver desglose completo' : 'View full breakdown'}</span>
                            <ArrowRight size={14} className="text-[var(--color-primary)] group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="card p-8 sm:p-12 text-center rounded-3xl flex flex-col items-center justify-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500">
                      <Dumbbell size={28} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">
                        {locale === 'es' ? 'No hay entrenamientos en este mes' : 'No workouts recorded this month'}
                      </h4>
                      <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                        {locale === 'es'
                          ? 'Inicia un nuevo entrenamiento o selecciona una rutina para comenzar a registrar tu historial.'
                          : 'Start a new workout or pick a routine to begin building your training history.'}
                      </p>
                    </div>
                    <div className="pt-2">
                      <BotonPrimario onClick={() => navigate('/mis-rutinas')}>
                        {locale === 'es' ? 'Ir a Mis Rutinas' : 'Go to My Routines'}
                      </BotonPrimario>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* VISTA 2: AÑO ENTERO (12 MESES Y RESUMEN ANUAL)               */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {vista === 'anio' && (
          <div className="space-y-6 animate-fadeIn">

            {/* Cabecera del Año con selector de año y buscador */}
            <div className="card p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                  <button
                    onClick={irAnioAnterior}
                    className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title={locale === 'es' ? 'Año anterior' : 'Previous year'}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={irAnioSiguiente}
                    className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title={locale === 'es' ? 'Año siguiente' : 'Next year'}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    {anioSeleccionado}
                  </h2>

                  {/* Selector rápido de año */}
                  <select
                    value={anioSeleccionado}
                    onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
                    className="bg-neutral-800 border border-neutral-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:border-[var(--color-primary)] cursor-pointer"
                  >
                    {aniosDisponibles.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Buscador dentro del año */}
              <div className="relative w-full md:w-72">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder={locale === 'es' ? `Buscar sesiones en ${anioSeleccionado}...` : `Search workouts in ${anioSeleccionado}...`}
                  value={busquedaAnio}
                  onChange={(e) => setBusquedaAnio(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs outline-none focus:border-[var(--color-primary)] transition-colors"
                />
              </div>
            </div>

            {/* Estadísticas del Año */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              <div className="card p-4 rounded-2xl">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  {locale === 'es' ? 'Entrenamientos en el año' : 'Workouts in year'}
                </div>
                <p className="text-2xl font-black text-white">{metricasAnio.totalSesiones}</p>
                <p className="text-[11px] text-neutral-500 mt-1">{metricasAnio.mesesActivos} {locale === 'es' ? 'meses con actividad' : 'active months'}</p>
              </div>

              <div className="card p-4 rounded-2xl">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  {locale === 'es' ? 'Volumen Anual' : 'Annual Volume'}
                </div>
                <p className="text-2xl font-black text-white">
                  {metricasAnio.volumenTotalKg >= 1000
                    ? `${(metricasAnio.volumenTotalKg / 1000).toFixed(1)} Ton`
                    : `${metricasAnio.volumenTotalKg} kg`}
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">{locale === 'es' ? 'peso total movido' : 'total weight moved'}</p>
              </div>

              <div className="card p-4 rounded-2xl">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  {locale === 'es' ? 'Tiempo Entrenado' : 'Time Trained'}
                </div>
                <p className="text-2xl font-black text-white">
                  {Math.floor(metricasAnio.minutosTotales / 60)}h {metricasAnio.minutosTotales % 60}m
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">{locale === 'es' ? 'horas acumuladas' : 'accumulated hours'}</p>
              </div>

              <div className="card p-4 rounded-2xl">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  {locale === 'es' ? 'Promedio / Mes' : 'Avg / Month'}
                </div>
                <p className="text-2xl font-black text-white">
                  {metricasAnio.mesesActivos > 0
                    ? Math.round(metricasAnio.totalSesiones / metricasAnio.mesesActivos)
                    : 0}
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">{locale === 'es' ? 'sesiones por mes activo' : 'sessions per active month'}</p>
              </div>
            </div>

            {/* Si hay búsqueda activa: resultados de la búsqueda */}
            {busquedaAnio.trim() ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs font-bold text-white">
                    {locale === 'es'
                      ? `Resultados para "${busquedaAnio}": ${sesionesAnioFiltradas.length} sesiones`
                      : `Results for "${busquedaAnio}": ${sesionesAnioFiltradas.length} sessions`}
                  </p>
                  <button
                    onClick={() => setBusquedaAnio('')}
                    className="text-xs text-[var(--color-primary)] hover:underline cursor-pointer"
                  >
                    {locale === 'es' ? 'Ver todos los meses' : 'View all months'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sesionesAnioFiltradas.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => navigate(`/historial/${s.fecha}`)}
                      className="card card-hover p-4 rounded-2xl cursor-pointer border border-neutral-800 hover:border-neutral-600 transition-all flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs text-neutral-400 font-mono">{formatearFechaLarga(s.fecha)}</span>
                          <h4 className="text-base font-bold text-white mt-1">{s.rutina}</h4>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-neutral-300 font-mono">
                          {s.duracionMin} min
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {s.ejercicios.map(e => (
                          <span key={e.id} className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                            {e.nombre}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Grid de los 12 Meses del Año */
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Calendar size={16} className="text-[var(--color-primary)]" />
                    <span>{locale === 'es' ? `Meses de ${anioSeleccionado}` : `Months of ${anioSeleccionado}`}</span>
                  </h3>
                  <span className="text-xs text-neutral-400">
                    {locale === 'es' ? 'Pulsa en un mes para ver su calendario' : 'Click a month to view calendar'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {mesesDelAnio.map((m) => {
                    const tieneSesiones = m.totalSesiones > 0;
                    const esMesActualEnAnio = m.mes === ahora.getMonth() && anioSeleccionado === ahora.getFullYear();

                    return (
                      <div
                        key={m.mes}
                        onClick={() => abrirMesDesdeAnio(m.mes)}
                        className={`card card-hover p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 cursor-pointer border ${
                          esMesActualEnAnio
                            ? 'border-[var(--color-primary)] shadow-[0_0_20px_rgba(219,240,89,0.12)]'
                            : tieneSesiones
                            ? 'border-neutral-800 hover:border-neutral-600'
                            : 'border-neutral-800/50 opacity-60 hover:opacity-100 hover:border-neutral-700'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-lg font-black text-white capitalize">
                              {m.nombre}
                            </h4>
                            {esMesActualEnAnio && (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-black">
                                {locale === 'es' ? 'Actual' : 'Current'}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-neutral-400">
                            {tieneSesiones
                              ? `${m.totalSesiones} ${locale === 'es' ? 'entrenamientos' : 'workouts'}`
                              : (locale === 'es' ? 'Sin entrenamientos' : 'No workouts')}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                          {tieneSesiones ? (
                            <span className="font-mono text-neutral-300 font-bold">
                              {m.volumenKg >= 1000 ? `${(m.volumenKg / 1000).toFixed(1)}k` : m.volumenKg} <span className="text-neutral-500 font-normal">kg</span>
                            </span>
                          ) : (
                            <span className="text-neutral-500 text-[11px]">—</span>
                          )}

                          <span className="text-[11px] font-bold text-[var(--color-primary)] flex items-center gap-1 group-hover:underline">
                            <span>{locale === 'es' ? 'Ver mes' : 'View month'}</span>
                            <ArrowRight size={12} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── RESUMEN GLOBAL INFERIOR ─── */}
        <div className="pt-4 border-t border-neutral-800">
          <ResumenEstadisticas
            volumenTotalKg={metricas.volumenTotalKg}
            intensidad={metricas.intensidad}
            disciplinaPct={metricas.disciplinaPct}
          />
        </div>

      </div>
    </AppLayout>
  );
}
