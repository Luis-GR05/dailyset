import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout, TituloPagina, MonthCard, ResumenEstadisticas, Card, BotonPrimario } from "../componentes";
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
  Filter,
  Activity
} from 'lucide-react';

// Generar los últimos 24 meses desde el mes actual
function getUltimos24Meses() {
  const meses = [];
  const ahora = new Date();
  for (let i = 0; i < 24; i++) {
    const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    meses.push({ mes: d.getMonth(), anio: d.getFullYear() });
  }
  return meses;
}

const TODOS_MESES = getUltimos24Meses();

export default function HistorialPage() {
  const { metricas, sesiones, getSesionesPorMes, getMetricasPorMes } = useHistorial();
  const { locale } = useI18n();
  const navigate = useNavigate();

  // Modo de vista: 'mes_actual' | 'todo'
  const [vista, setVista] = useState<'mes_actual' | 'todo'>('mes_actual');

  // Mes y año actualmente inspeccionados (por defecto el actual)
  const ahora = new Date();
  const [mesActual, setMesActual] = useState(ahora.getMonth());
  const [anioActual, setAnioActual] = useState(ahora.getFullYear());

  // Búsqueda en historial completo
  const [busqueda, setBusqueda] = useState('');
  const [filtroAnio, setFiltroAnio] = useState<number | 'todos'>('todos');

  // Nombre formateado del mes
  const localeStr = locale === 'es' ? 'es-ES' : 'en-US';
  const nombreMesSeleccionado = new Date(anioActual, mesActual).toLocaleString(localeStr, { month: 'long' });

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
  };

  const irMesSiguiente = () => {
    if (mesActual === 11) {
      setMesActual(0);
      setAnioActual(a => a + 1);
    } else {
      setMesActual(m => m + 1);
    }
  };

  const irAMesHoy = () => {
    const hoy = new Date();
    setMesActual(hoy.getMonth());
    setAnioActual(hoy.getFullYear());
  };

  const esMesDeHoy = mesActual === ahora.getMonth() && anioActual === ahora.getFullYear();

  // Años disponibles en el historial
  const aniosDisponibles = useMemo(() => {
    const years = new Set<number>();
    sesiones.forEach(s => {
      const y = parseInt(s.fecha.split('-')[0], 10);
      if (!isNaN(y)) years.add(y);
    });
    years.add(ahora.getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [sesiones, ahora]);

  // Sesiones filtradas para la vista completa
  const sesionesFiltradasTodo = useMemo(() => {
    if (!busqueda.trim() && filtroAnio === 'todos') {
      return sesiones;
    }
    return sesiones.filter(s => {
      const matchBusqueda = !busqueda.trim() ||
        s.rutina.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.ejercicios.some(e => e.nombre.toLowerCase().includes(busqueda.toLowerCase()));

      const anio = parseInt(s.fecha.split('-')[0], 10);
      const matchAnio = filtroAnio === 'todos' || anio === filtroAnio;

      return matchBusqueda && matchAnio;
    });
  }, [sesiones, busqueda, filtroAnio]);

  // Manejar clic en un día del calendario
  const handleDiaClick = (dia: number) => {
    const mm = String(mesActual + 1).padStart(2, '0');
    const dd = String(dia).padStart(2, '0');
    navigate(`/historial/${anioActual}-${mm}-${dd}`);
  };

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

  return (
    <AppLayout fullWidth>
      <div className="space-y-6 pb-16 max-w-7xl mx-auto w-full">

        {/* ─── CABECERA PRINCIPAL Y SELECTOR DE VISTA ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div>
            <TituloPagina titulo={locale === 'es' ? "Historial de Entrenamientos" : "Workout History"} />
            <p className="text-neutral-400 text-xs sm:text-sm mt-1">
              {locale === 'es'
                ? "Consulta tus sesiones realizadas, volumen acumulado y constancia mensual."
                : "Review your completed sessions, accumulated volume, and monthly discipline."}
            </p>
          </div>

          {/* Toggle de Modo: Mes actual vs Historial de todo */}
          <div className="flex p-1 rounded-2xl bg-white/[0.04] border border-white/10 self-start md:self-auto shrink-0">
            <button
              onClick={() => setVista('mes_actual')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                vista === 'mes_actual'
                  ? 'bg-[var(--color-primary)] text-black font-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Calendar size={14} />
              <span>{locale === 'es' ? 'Meses Actuales' : 'Current Months'}</span>
            </button>

            <button
              onClick={() => setVista('todo')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                vista === 'todo'
                  ? 'bg-[var(--color-primary)] text-black font-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Layers size={14} />
              <span>{locale === 'es' ? 'Historial de Todo' : 'All-Time History'}</span>
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* VISTA 1: MESES ACTUALES (POR DEFECTO)                        */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {vista === 'mes_actual' && (
          <div className="space-y-6">

            {/* Barra de control del mes seleccionado */}
            <div className="card p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                  <button
                    onClick={irMesAnterior}
                    className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                    title={locale === 'es' ? 'Mes anterior' : 'Previous month'}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={irMesSiguiente}
                    className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                    title={locale === 'es' ? 'Mes siguiente' : 'Next month'}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-black capitalize text-white leading-tight">
                    {nombreMesSeleccionado} <span className="text-neutral-400 font-mono text-base font-normal">{anioActual}</span>
                  </h2>
                  <p className="text-xs text-neutral-400">
                    {sesionesDelMes.length} {locale === 'es' ? 'sesiones registradas este mes' : 'sessions recorded this month'}
                  </p>
                </div>
              </div>

              {!esMesDeHoy && (
                <button
                  onClick={irAMesHoy}
                  className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  {locale === 'es' ? 'Ir al mes actual' : 'Jump to current month'}
                </button>
              )}
            </div>

            {/* Tarjetas de Métricas Rápidas del Mes */}
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

            {/* Layout Principal del Mes: Calendario Interactivo a la Izquierda + Feed de Sesiones a la Derecha */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Columna Izquierda: Calendario del Mes */}
              <div className="lg:col-span-5 space-y-4">
                <Card className="p-5 sm:p-6" hoverable={false}>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
                    <span className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Calendar size={15} className="text-[var(--color-primary)]" />
                      {locale === 'es' ? 'Días del Mes' : 'Month Days'}
                    </span>
                    <span className="text-xs text-neutral-400 font-medium">
                      {locale === 'es' ? 'Pulsa un día para ver detalle' : 'Click a day to view details'}
                    </span>
                  </div>

                  <MesCalendario
                    mes={mesActual}
                    anio={anioActual}
                    entrenamientos={diasEntrenadosMes}
                    onDiaClick={handleDiaClick}
                  />

                  <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />
                      <span>{locale === 'es' ? 'Día con entrenamiento' : 'Trained day'}</span>
                    </div>
                    <span className="font-mono text-white font-bold">{diasEntrenadosMes.length} {locale === 'es' ? 'días' : 'days'}</span>
                  </div>
                </Card>
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
                      // Calcular volumen de la sesión
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
                            <span className="text-[11px] font-semibold">{locale === 'es' ? 'Ver serie por serie y desglose' : 'View set by set breakdown'}</span>
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
        {/* VISTA 2: HISTORIAL DE TODO (TODOS LOS MESES Y BÚSQUEDA)      */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {vista === 'todo' && (
          <div className="space-y-6">

            {/* Filtros y Buscador para todo el historial */}
            <div className="card p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder={locale === 'es' ? "Buscar por rutina o ejercicio..." : "Search routine or exercise..."}
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs sm:text-sm outline-none focus:border-[var(--color-primary)] transition-colors"
                />
              </div>

              {/* Selector de años */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                <span className="text-xs font-bold text-neutral-400 mr-1 flex items-center gap-1">
                  <Filter size={12} /> {locale === 'es' ? 'Año:' : 'Year:'}
                </span>
                <button
                  onClick={() => setFiltroAnio('todos')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    filtroAnio === 'todos'
                      ? 'bg-[var(--color-primary)] text-black font-black'
                      : 'bg-white/5 text-neutral-400 hover:text-white'
                  }`}
                >
                  {locale === 'es' ? 'Todos' : 'All'}
                </button>
                {aniosDisponibles.map((y) => (
                  <button
                    key={y}
                    onClick={() => setFiltroAnio(y)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      filtroAnio === y
                        ? 'bg-[var(--color-primary)] text-black font-black'
                        : 'bg-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            {/* Si está buscando, muestra la lista filtrada directamente */}
            {busqueda.trim() ? (
              <div className="space-y-3">
                <p className="text-xs text-neutral-400 font-semibold px-1">
                  {locale === 'es'
                    ? `Resultados para "${busqueda}": ${sesionesFiltradasTodo.length} sesiones encontradas`
                    : `Results for "${busqueda}": ${sesionesFiltradasTodo.length} sessions found`}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sesionesFiltradasTodo.map((s) => (
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
              /* Grid completo de meses históricos */
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-base font-extrabold text-white">
                    {locale === 'es' ? 'Todos los Meses' : 'All Months'}
                  </h3>
                  <span className="text-xs text-neutral-400 font-mono">
                    {TODOS_MESES.length} {locale === 'es' ? 'meses en archivo' : 'months archived'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {TODOS_MESES.filter(m => filtroAnio === 'todos' || m.anio === filtroAnio).map((m, i) => (
                    <MonthCard key={i} mes={m.mes} anio={m.anio} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── RESUMEN GLOBAL INFERIOR (CON ICONOS LUCIDE LIMPIOS) ─── */}
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
