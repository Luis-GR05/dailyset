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

export default function HistorialPage() {
  const { metricas, sesiones, getSesionesPorMes, getSesionesPorFecha, getMetricasPorMes } = useHistorial();
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

  // Configuración de alcance temporal y selección de fecha específica
  const [anioLimite, setAnioLimite] = useState<number>(2020);
  const [fechaIr, setFechaIr] = useState<string>('');
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');

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

  // Años disponibles en el historial: desde año actual hasta anioLimite o año de sesión más antigua
  const aniosDisponibles = useMemo(() => {
    const years = new Set<number>();
    const anioMax = ahora.getFullYear();
    const anioMinSesiones = sesiones.length > 0
      ? Math.min(...sesiones.map(s => parseInt(s.fecha.split('-')[0], 10) || anioMax))
      : anioMax;
    const anioMin = Math.min(anioLimite, anioMinSesiones);

    for (let y = anioMax; y >= anioMin; y--) {
      years.add(y);
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [sesiones, ahora, anioLimite]);

  // Lista dinámica de meses generados
  const todosLosMeses = useMemo(() => {
    const meses: { mes: number; anio: number }[] = [];
    const anioMax = ahora.getFullYear();
    const anioMinSesiones = sesiones.length > 0
      ? Math.min(...sesiones.map(s => parseInt(s.fecha.split('-')[0], 10) || anioMax))
      : anioMax;
    const anioMin = Math.min(anioLimite, anioMinSesiones);

    for (let y = anioMax; y >= anioMin; y--) {
      const mesMax = y === anioMax ? ahora.getMonth() : 11;
      for (let m = mesMax; m >= 0; m--) {
        if (fechaDesde || fechaHasta) {
          const primerDiaMes = new Date(y, m, 1);
          const ultimoDiaMes = new Date(y, m + 1, 0);
          if (fechaDesde && ultimoDiaMes < new Date(fechaDesde)) continue;
          if (fechaHasta && primerDiaMes > new Date(fechaHasta)) continue;
        }
        meses.push({ mes: m, anio: y });
      }
    }
    return meses;
  }, [ahora, anioLimite, sesiones, fechaDesde, fechaHasta]);

  // Sesiones filtradas para la vista completa
  const sesionesFiltradasTodo = useMemo(() => {
    return sesiones.filter(s => {
      const matchBusqueda = !busqueda.trim() ||
        s.rutina.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.ejercicios.some(e => e.nombre.toLowerCase().includes(busqueda.toLowerCase()));

      const anio = parseInt(s.fecha.split('-')[0], 10);
      const matchAnio = filtroAnio === 'todos' || anio === filtroAnio;

      const matchDesde = !fechaDesde || s.fecha >= fechaDesde;
      const matchHasta = !fechaHasta || s.fecha <= fechaHasta;

      return matchBusqueda && matchAnio && matchDesde && matchHasta;
    }).sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [sesiones, busqueda, filtroAnio, fechaDesde, fechaHasta]);

  // Saltar a cualquier fecha seleccionada
  const handleIrAFecha = (fechaDestino: string) => {
    if (!fechaDestino) return;
    const parts = fechaDestino.split('-').map(Number);
    if (parts.length < 3 || isNaN(parts[0])) return;
    const [y, m] = parts;

    // Si hay una sesión ese día, navegar a su detalle
    const sesionesEseDia = getSesionesPorFecha(fechaDestino);
    if (sesionesEseDia && sesionesEseDia.length > 0) {
      navigate(`/historial/${fechaDestino}`);
      return;
    }

    // Si no hay sesión o para consultar ese mes en el calendario
    setAnioActual(y);
    setMesActual(m - 1);
    setVista('mes_actual');
  };

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
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black capitalize text-white leading-tight">
                      {nombreMesSeleccionado} <span className="text-neutral-400 font-mono text-base font-normal">{anioActual}</span>
                    </h2>
                    <input
                      type="month"
                      value={`${anioActual}-${String(mesActual + 1).padStart(2, '0')}`}
                      onChange={(e) => {
                        if (!e.target.value) return;
                        const [y, m] = e.target.value.split('-').map(Number);
                        setAnioActual(y);
                        setMesActual(m - 1);
                      }}
                      title={locale === 'es' ? 'Seleccionar mes y año' : 'Select month and year'}
                      className="bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs rounded-xl px-2.5 py-1 outline-none focus:border-[var(--color-primary)] cursor-pointer hover:border-neutral-500 transition-colors"
                    />
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
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

            {/* Panel de Selección de Fechas, Alcance Temporal y Búsqueda */}
            <div className="card p-4 sm:p-5 rounded-2xl space-y-4">
              
              {/* Fila 1: Buscador y Salto directo a fecha específica */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                {/* Buscador */}
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    placeholder={locale === 'es' ? "Buscar por rutina o ejercicio..." : "Search routine or exercise..."}
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs sm:text-sm outline-none focus:border-[var(--color-primary)] transition-colors"
                  />
                </div>

                {/* Ir directamente a una fecha elegida */}
                <div className="flex items-center gap-2 bg-neutral-800/90 p-1.5 rounded-xl border border-neutral-700 shrink-0">
                  <span className="text-xs text-neutral-300 font-bold px-2 flex items-center gap-1.5">
                    <Calendar size={13} className="text-[var(--color-primary)]" />
                    {locale === 'es' ? 'Ir a fecha:' : 'Go to date:'}
                  </span>
                  <input
                    type="date"
                    value={fechaIr}
                    onChange={(e) => setFechaIr(e.target.value)}
                    className="bg-neutral-900 border border-neutral-700 text-white text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-[var(--color-primary)]"
                  />
                  <button
                    onClick={() => handleIrAFecha(fechaIr)}
                    disabled={!fechaIr}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                      fechaIr
                        ? 'bg-[var(--color-primary)] text-black cursor-pointer hover:brightness-110'
                        : 'bg-white/5 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    {locale === 'es' ? 'Ver' : 'Go'}
                  </button>
                </div>
              </div>

              {/* Fila 2: Filtro por Año + Selector de límite hasta qué año ir + Rango personalizado */}
              <div className="pt-3 border-t border-neutral-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                
                {/* Selector rápido de años */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0">
                  <span className="text-xs font-bold text-neutral-400 mr-1 flex items-center gap-1 shrink-0">
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

                {/* Controles de Límite y Rango de Fechas */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {/* Selector de hasta qué año consultar */}
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400 font-semibold">{locale === 'es' ? 'Hasta año:' : 'Back to year:'}</span>
                    <select
                      value={anioLimite}
                      onChange={(e) => setAnioLimite(Number(e.target.value))}
                      className="bg-neutral-800 border border-neutral-700 text-white rounded-lg px-2.5 py-1 text-xs font-mono outline-none focus:border-[var(--color-primary)]"
                    >
                      <option value={2024}>2024 (2 {locale === 'es' ? 'años' : 'years'})</option>
                      <option value={2023}>2023 (3 {locale === 'es' ? 'años' : 'years'})</option>
                      <option value={2022}>2022 (4 {locale === 'es' ? 'años' : 'years'})</option>
                      <option value={2020}>2020 (6 {locale === 'es' ? 'años' : 'years'})</option>
                      <option value={2018}>2018 (8 {locale === 'es' ? 'años' : 'years'})</option>
                      <option value={2015}>2015 (10 {locale === 'es' ? 'años' : 'years'})</option>
                      <option value={2010}>2010 ({locale === 'es' ? 'Histórico completo' : 'Full history'})</option>
                    </select>
                  </div>

                  {/* Rango Desde / Hasta */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-neutral-500 font-semibold">{locale === 'es' ? 'Desde:' : 'From:'}</span>
                    <input
                      type="date"
                      value={fechaDesde}
                      onChange={(e) => setFechaDesde(e.target.value)}
                      className="bg-neutral-800 border border-neutral-700 text-white text-[11px] rounded-lg px-2 py-1 outline-none focus:border-[var(--color-primary)]"
                    />
                    <span className="text-neutral-500 font-semibold">{locale === 'es' ? 'Hasta:' : 'To:'}</span>
                    <input
                      type="date"
                      value={fechaHasta}
                      onChange={(e) => setFechaHasta(e.target.value)}
                      className="bg-neutral-800 border border-neutral-700 text-white text-[11px] rounded-lg px-2 py-1 outline-none focus:border-[var(--color-primary)]"
                    />
                    {(fechaDesde || fechaHasta) && (
                      <button
                        onClick={() => { setFechaDesde(''); setFechaHasta(''); }}
                        className="text-[11px] text-red-400 hover:underline px-1"
                      >
                        {locale === 'es' ? 'Limpiar' : 'Clear'}
                      </button>
                    )}
                  </div>
                </div>

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
              /* Grid completo de meses históricos dinámicos */
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-base font-extrabold text-white">
                    {locale === 'es' ? 'Todos los Meses' : 'All Months'}
                  </h3>
                  <span className="text-xs text-neutral-400 font-mono">
                    {todosLosMeses.filter(m => filtroAnio === 'todos' || m.anio === filtroAnio).length} {locale === 'es' ? 'meses en archivo' : 'months archived'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {todosLosMeses.filter(m => filtroAnio === 'todos' || m.anio === filtroAnio).map((m, i) => (
                    <MonthCard key={`${m.anio}-${m.mes}-${i}`} mes={m.mes} anio={m.anio} />
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
