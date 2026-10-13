import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout, TituloPagina, Card } from '../componentes';
import CalculadoraMacrosWizard from '../componentes/utilidades/CalculadoraMacrosWizard';
import Calculadora1RMWizard from '../componentes/utilidades/Calculadora1RMWizard';
import {
  Timer,
  Watch,
  Footprints,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Flame,
  MapPin,
  Clock,
  Sparkles,
  Zap,
  Dumbbell,
  Pencil,
  Utensils,
} from 'lucide-react';
import { useTextos } from '../hooks/useTextos';
import { textosUtilidades } from '../data/textos/utilidades';
import { useAuth } from '../context/AuthContext';
import { crearDetectorPasos, fechaLocal, guardarMetaPasos, guardarPasosDia, leerMetaPasos, leerPasosDia, metricasPasos, recordarSensorPasos, sensorPasosRecordado } from '../lib/pasos';

// Sonido sintético con Web Audio API (funciona en cualquier navegador sin dependencias externas)
function playBeep(frequency = 880, duration = 0.2, count = 1) {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    for (let i = 0; i < count; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime + i * 0.25);
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.25 + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.25);
      osc.stop(ctx.currentTime + i * 0.25 + duration);
    }
  } catch (e) {
    console.warn('Audio no disponible', e);
  }
}

type TabUtilidad = 'temporizador' | 'cronometro' | 'pasos' | '1rm' | 'macros';

interface VueltaItem {
  numero: number;
  tiempoVueltaMs: number;
  tiempoTotalMs: number;
}

export default function UtilidadesPage() {
  const tx = useTextos(textosUtilidades);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabQuery = searchParams.get('tab') as TabUtilidad | null;
  const [tabActiva, setTabActiva] = useState<TabUtilidad>(
    tabQuery && ['temporizador', 'cronometro', 'pasos', '1rm', 'macros'].includes(tabQuery)
      ? tabQuery
      : 'temporizador'
  );

  useEffect(() => {
    if (tabQuery && ['temporizador', 'cronometro', 'pasos', '1rm', 'macros'].includes(tabQuery)) {
      setTabActiva(tabQuery);
    }
  }, [tabQuery]);

  // ─────────────────────────────────────────────────────────────
  // 1. TEMPORIZADOR
  // ─────────────────────────────────────────────────────────────
  const [segundosTotales, setSegundosTotales] = useState(60);
  const [tiempoRestante, setTiempoRestante] = useState(60);
  const [tempCorriendo, setTempCorriendo] = useState(false);
  const [tempFinalizado, setTempFinalizado] = useState(false);
  const [sonidoActivado, setSonidoActivado] = useState(true);

  const tempTargetEndRef = useRef<number>(0);
  const tempRestanteRef = useRef<number>(60);

  // Presets rápidos para descanso entre series
  const presetsTemporizador = [
    { label: '30s', seg: 30 },
    { label: '45s', seg: 45 },
    { label: '60s', seg: 60 },
    { label: '90s', seg: 90 },
    { label: '2 min', seg: 120 },
    { label: '3 min', seg: 180 },
    { label: '5 min', seg: 300 },
  ];

  useEffect(() => {
    let interval: any = null;

    const syncTimer = () => {
      if (!tempCorriendo) return;
      const ahora = Date.now();
      const diffMs = tempTargetEndRef.current - ahora;
      const rem = Math.max(0, Math.ceil(diffMs / 1000));

      setTiempoRestante(rem);

      if (diffMs <= 0) {
        setTempCorriendo(false);
        setTempFinalizado(true);
        setTiempoRestante(0);
        if (sonidoActivado) {
          playBeep(920, 0.3, 3);
        }
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([300, 150, 300]);
        }
      }
    };

    if (tempCorriendo) {
      syncTimer();
      interval = setInterval(syncTimer, 250);
    }

    const handleVisibility = () => {
      if (tempCorriendo) {
        syncTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, [tempCorriendo, sonidoActivado]);

  const toggleTemporizador = () => {
    if (tempFinalizado) {
      tempTargetEndRef.current = Date.now() + segundosTotales * 1000;
      setTiempoRestante(segundosTotales);
      setTempFinalizado(false);
      setTempCorriendo(true);
    } else if (!tempCorriendo) {
      tempTargetEndRef.current = Date.now() + tiempoRestante * 1000;
      setTempCorriendo(true);
    } else {
      const rem = Math.max(0, Math.ceil((tempTargetEndRef.current - Date.now()) / 1000));
      setTiempoRestante(rem);
      tempRestanteRef.current = rem;
      setTempCorriendo(false);
    }
  };

  const reiniciarTemporizador = () => {
    setTempCorriendo(false);
    setTiempoRestante(segundosTotales);
    tempRestanteRef.current = segundosTotales;
    setTempFinalizado(false);
  };

  const setPreset = (seg: number) => {
    setTempCorriendo(false);
    setTempFinalizado(false);
    setSegundosTotales(seg);
    setTiempoRestante(seg);
    tempRestanteRef.current = seg;
  };

  const agregarSegundos = (seg: number) => {
    if (tempCorriendo) {
      tempTargetEndRef.current += seg * 1000;
      const rem = Math.max(0, Math.ceil((tempTargetEndRef.current - Date.now()) / 1000));
      setTiempoRestante(rem);
      setSegundosTotales((prev) => Math.max(prev, rem));
    } else {
      setTiempoRestante((prev) => Math.max(0, prev + seg));
      setSegundosTotales((prev) => Math.max(0, prev + seg));
      tempRestanteRef.current = Math.max(0, tempRestanteRef.current + seg);
    }
  };

  const formatTiempo = (seg: number) => {
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progresoTempPct = segundosTotales > 0 ? ((segundosTotales - tiempoRestante) / segundosTotales) * 100 : 0;

  // ─────────────────────────────────────────────────────────────
  // 2. CRONÓMETRO
  // ─────────────────────────────────────────────────────────────
  const [cronoTiempoMs, setCronoTiempoMs] = useState(0);
  const [cronoCorriendo, setCronoCorriendo] = useState(false);
  const [vueltas, setVueltas] = useState<VueltaItem[]>([]);
  const cronoUltimoTiempoRef = useRef<number>(0);
  const cronoAnimRef = useRef<number | null>(null);

  useEffect(() => {
    if (cronoCorriendo) {
      cronoUltimoTiempoRef.current = performance.now() - cronoTiempoMs;
      const step = () => {
        setCronoTiempoMs(performance.now() - cronoUltimoTiempoRef.current);
        cronoAnimRef.current = requestAnimationFrame(step);
      };
      cronoAnimRef.current = requestAnimationFrame(step);
    } else {
      if (cronoAnimRef.current) cancelAnimationFrame(cronoAnimRef.current);
    }
    return () => {
      if (cronoAnimRef.current) cancelAnimationFrame(cronoAnimRef.current);
    };
  }, [cronoCorriendo]);

  const toggleCronometro = () => {
    setCronoCorriendo(!cronoCorriendo);
  };

  const reiniciarCronometro = () => {
    setCronoCorriendo(false);
    setCronoTiempoMs(0);
    setVueltas([]);
  };

  const registrarVuelta = () => {
    const tiempoTotal = cronoTiempoMs;
    const tiempoVueltaAnterior = vueltas.length > 0 ? vueltas[0].tiempoTotalMs : 0;
    const nuevaVuelta: VueltaItem = {
      numero: vueltas.length + 1,
      tiempoVueltaMs: tiempoTotal - tiempoVueltaAnterior,
      tiempoTotalMs: tiempoTotal,
    };
    setVueltas([nuevaVuelta, ...vueltas]);
  };

  const formatCrono = (ms: number) => {
    const totalSeg = Math.floor(ms / 1000);
    const min = Math.floor(totalSeg / 60);
    const seg = totalSeg % 60;
    const cSec = Math.floor((ms % 1000) / 10);
    return {
      min: String(min).padStart(2, '0'),
      seg: String(seg).padStart(2, '0'),
      cs: String(cSec).padStart(2, '0'),
    };
  };

  // ─────────────────────────────────────────────────────────────
  // 3. CUENTA PASOS (PODÓMETRO)
  // ─────────────────────────────────────────────────────────────
  // Lógica compartida con la app: src/lib/pasos.ts (fecha LOCAL, detector, métricas)
  const { user } = useAuth();
  const [hoyFechaStr, setHoyFechaStr] = useState(() => fechaLocal());
  const [pasosHoy, setPasosHoy] = useState<number>(() => leerPasosDia(fechaLocal()));
  const [objetivoPasos, setObjetivoPasos] = useState<number>(() => leerMetaPasos());
  const [sensorActivo, setSensorActivo] = useState(false);
  const [sensorError, setSensorError] = useState('');

  // Cambio de día a medianoche (hora local) aunque la página siga abierta
  useEffect(() => {
    const iv = window.setInterval(() => {
      const hoy = fechaLocal();
      setHoyFechaStr((prev) => {
        if (prev !== hoy) setPasosHoy(leerPasosDia(hoy));
        return hoy;
      });
    }, 30000);
    return () => window.clearInterval(iv);
  }, []);

  // Persistir pasos y meta
  useEffect(() => {
    guardarPasosDia(hoyFechaStr, pasosHoy);
  }, [pasosHoy, hoyFechaStr]);
  useEffect(() => {
    guardarMetaPasos(objetivoPasos);
  }, [objetivoPasos]);

  // Detección de pasos con el acelerómetro (filtro de gravedad + detección de picos)
  useEffect(() => {
    if (!sensorActivo) return;
    const detector = crearDetectorPasos();
    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;
      if (detector.procesar(acc.x, acc.y, acc.z, event.timeStamp || performance.now())) {
        setPasosHoy((prev) => prev + 1);
      }
    };
    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [sensorActivo]);

  const activarSensor = async () => {
    setSensorError('');
    if (typeof (DeviceMotionEvent as any)?.requestPermission === 'function') {
      try {
        const res = await (DeviceMotionEvent as any).requestPermission();
        if (res === 'granted') {
          setSensorActivo(true);
          recordarSensorPasos(true);
        } else {
          setSensorError(tx.permisoDeSensoresDenegado);
        }
      } catch (err: any) {
        setSensorError(err?.message || 'Error solicitando permiso');
      }
    } else if ('DeviceMotionEvent' in window) {
      setSensorActivo(true);
      recordarSensorPasos(true);
    } else {
      setSensorError(tx.sensorNoSoportado);
    }
  };

  const desactivarSensor = () => {
    setSensorActivo(false);
    recordarSensorPasos(false);
  };

  // Si el usuario lo dejó activado, reanudarlo al volver (iOS exige pulsar el botón otra vez)
  useEffect(() => {
    const necesitaPermiso = typeof (DeviceMotionEvent as any)?.requestPermission === 'function';
    if (sensorPasosRecordado() && !necesitaPermiso && 'DeviceMotionEvent' in window) setSensorActivo(true);
  }, []);

  const sumarPasos = (cantidad: number) => {
    setPasosHoy((prev) => Math.max(0, prev + cantidad));
  };

  const metricas = metricasPasos(pasosHoy, { alturaCm: user?.alturaCm, pesoKg: user?.pesoKg });
  const kmEstimados = metricas.km.toFixed(2);
  const kcalEstimadas = metricas.kcal;
  const minEstimados = metricas.minutosActivos;
  const pctPasos = Math.min(100, Math.round((pasosHoy / objetivoPasos) * 100));

  return (
    <AppLayout>
      <div className="space-y-6 pb-12 max-w-4xl mx-auto">
        <TituloPagina titulo={tx.herramientasYUtilidades} />

        {/* ══ PESTAÑAS DE UTILIDADES ══ */}
        <div className="flex p-1.5 rounded-2xl bg-neutral-900/60 border border-white/5 backdrop-blur-xl gap-1 overflow-x-auto">
          {[
            { id: 'temporizador', label: tx.temporizador, icon: <Timer size={16} /> },
            { id: 'cronometro', label: tx.cronometro, icon: <Watch size={16} /> },
            { id: 'pasos', label: tx.cuentaPasos, icon: <Footprints size={16} /> },
            { id: '1rm', label: tx.calculadora1rm, icon: <Dumbbell size={16} /> },
            { id: 'macros', label: tx.caloriasYMacros, icon: <Utensils size={16} /> },
          ].map((item) => {
            const isActive = tabActiva === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setTabActiva(item.id as TabUtilidad);
                  setSearchParams({ tab: item.id });
                }}
                className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-black shadow-lg scale-100'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            1. PESTAÑA: TEMPORIZADOR
           ───────────────────────────────────────────────────────────── */}
        {tabActiva === 'temporizador' && (
          <div className="space-y-6 animate-fadeIn">
            <Card className="p-6 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden" hoverable={false}>
              {/* Toggle de sonido */}
              <button
                type="button"
                onClick={() => setSonidoActivado(!sonidoActivado)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
                title={sonidoActivado ? 'Sonido activado' : 'Silenciado'}
              >
                {sonidoActivado ? <Volume2 size={18} style={{ color: 'var(--color-primary)' }} /> : <VolumeX size={18} />}
              </button>

              {/* Círculo central o display digital */}
              <div className="my-4 relative flex items-center justify-center">
                <div
                  className={`w-60 h-60 sm:w-68 sm:h-68 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-300 ${
                    tempFinalizado
                      ? 'border-emerald-400 bg-emerald-500/10 animate-pulse'
                      : tempCorriendo
                      ? 'border-[var(--color-primary)] shadow-[0_0_40px_rgba(219,240,89,0.15)]'
                      : 'border-white/10 bg-white/[0.02]'
                  }`}
                >
                  <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white">
                    {formatTiempo(tiempoRestante)}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 mt-2">
                    {tempFinalizado
                      ? tx.tiempoCumplido
                      : tempCorriendo
                      ? tx.descansando
                      : tx.pausado}
                  </span>

                  {/* Barra fina de progreso */}
                  <div className="w-36 h-1.5 rounded-full bg-white/10 overflow-hidden mt-3">
                    <div
                      className="h-full bg-[var(--color-primary)] transition-all duration-300"
                      style={{ width: `${progresoTempPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Botones de acción principales */}
              <div className="flex items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={reiniciarTemporizador}
                  className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-all cursor-pointer"
                  title="Reiniciar"
                >
                  <RotateCcw size={20} />
                </button>

                <button
                  type="button"
                  onClick={toggleTemporizador}
                  className={`px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
                    tempCorriendo
                      ? 'bg-amber-400 text-black'
                      : 'bg-[var(--color-primary)] text-black'
                  }`}
                >
                  {tempCorriendo ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                  <span>{tempCorriendo ? tx.pausar : tx.iniciar}</span>
                </button>

                <button
                  type="button"
                  onClick={() => agregarSegundos(30)}
                  className="px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white font-bold text-xs transition-all cursor-pointer"
                  title="Añadir 30 segundos"
                >
                  +30s
                </button>
              </div>

              {/* Presets rápidos */}
              <div className="mt-8 pt-6 border-t border-white/5 w-full">
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3">
                  {tx.descansoRecomendadoEntreSeries}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {presetsTemporizador.map((p) => (
                    <button
                      key={p.seg}
                      type="button"
                      onClick={() => setPreset(p.seg)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        segundosTotales === p.seg && !tempCorriendo
                          ? 'bg-white text-black font-black'
                          : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            2. PESTAÑA: CRONÓMETRO
           ───────────────────────────────────────────────────────────── */}
        {tabActiva === 'cronometro' && (
          <div className="space-y-6 animate-fadeIn">
            <Card className="p-6 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden" hoverable={false}>
              {/* Display de tiempo con milisegundos */}
              <div className="my-6">
                {(() => {
                  const { min, seg, cs } = formatCrono(cronoTiempoMs);
                  return (
                    <div className="flex items-baseline justify-center font-mono font-black text-white">
                      <span className="text-5xl sm:text-7xl">{min}</span>
                      <span className="text-3xl sm:text-5xl text-neutral-500 mx-1">:</span>
                      <span className="text-5xl sm:text-7xl">{seg}</span>
                      <span className="text-3xl sm:text-5xl text-[var(--color-primary)] ml-2">.{cs}</span>
                    </div>
                  );
                })()}
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mt-2">
                  {cronoCorriendo ? tx.cronometroEnMarcha : tx.listo}
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={reiniciarCronometro}
                  disabled={cronoTiempoMs === 0}
                  className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
                  title="Reiniciar"
                >
                  <RotateCcw size={20} />
                </button>

                <button
                  type="button"
                  onClick={toggleCronometro}
                  className={`px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
                    cronoCorriendo
                      ? 'bg-amber-400 text-black'
                      : 'bg-[var(--color-primary)] text-black'
                  }`}
                >
                  {cronoCorriendo ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                  <span>{cronoCorriendo ? tx.parar : tx.iniciar}</span>
                </button>

                <button
                  type="button"
                  onClick={registrarVuelta}
                  disabled={!cronoCorriendo}
                  className="px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white font-bold text-xs disabled:opacity-30 transition-all cursor-pointer flex items-center gap-1.5"
                  title="Registrar vuelta"
                >
                  <Zap size={14} style={{ color: 'var(--color-primary)' }} />
                  <span>{tx.vuelta}</span>
                </button>
              </div>

              {/* Historial de vueltas */}
              {vueltas.length > 0 && (
                <div className="mt-8 pt-6 border-t border-white/5 w-full text-left space-y-2 max-h-60 overflow-y-auto">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-neutral-500 px-3">
                    <span>{tx.vueltaNumero}</span>
                    <span>{tx.tiempoParcial}</span>
                    <span>{tx.total}</span>
                  </div>
                  {vueltas.map((v) => {
                    const parcial = formatCrono(v.tiempoVueltaMs);
                    const total = formatCrono(v.tiempoTotalMs);
                    return (
                      <div
                        key={v.numero}
                        className="flex justify-between items-center px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-mono"
                      >
                        <span className="font-bold text-white">#{v.numero}</span>
                        <span className="text-[var(--color-primary)] font-bold">
                          +{parcial.min}:{parcial.seg}.{parcial.cs}
                        </span>
                        <span className="text-neutral-400">
                          {total.min}:{total.seg}.{total.cs}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            3. PESTAÑA: CUENTA PASOS (PODÓMETRO)
           ───────────────────────────────────────────────────────────── */}
        {tabActiva === 'pasos' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Tarjeta Principal de Pasos */}
            <Card className="p-6 sm:p-8 relative overflow-hidden" hoverable={false}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                      <Footprints size={18} />
                    </span>
                    <h3 className="text-base font-black text-white uppercase italic tracking-wide">
                      {tx.pasosDiarios}
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {tx.contabilizaTusPasosRealesDel}
                  </p>
                </div>

                {/* Sensor Móvil Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={sensorActivo ? desactivarSensor : activarSensor}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      sensorActivo
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${sensorActivo ? 'bg-emerald-400 animate-ping' : 'bg-neutral-500'}`} />
                    <span>{sensorActivo ? tx.sensorActivo : tx.activarAcelerometro}</span>
                  </button>
                </div>
              </div>

              {sensorError && (
                <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                  {sensorError}
                </div>
              )}

              {/* Display de Pasos y Barra de Meta */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 space-y-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                      {tx.pasosHoy}
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tight">
                        {pasosHoy.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const nuevo = prompt(tx.introduceTuMetaDiariaDe,
                            objetivoPasos.toString()
                          );
                          if (nuevo && !isNaN(parseInt(nuevo, 10)) && parseInt(nuevo, 10) > 0) {
                            setObjetivoPasos(parseInt(nuevo, 10));
                          }
                        }}
                        className="text-xs font-bold text-neutral-400 hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                        title={tx.cambiarMetaDiaria}
                      >
                        <span className="inline-flex items-center gap-1">
                          / {objetivoPasos.toLocaleString()} {tx.meta}
                          <Pencil size={11} className="inline" />
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="space-y-1.5 pt-2">
                    <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-500 shadow-sm"
                        style={{
                          width: `${pctPasos}%`,
                          backgroundColor: pctPasos >= 100 ? '#34d399' : 'var(--color-primary)',
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-bold text-neutral-400">
                      <span>{pctPasos}% {tx.completado}</span>
                      {pctPasos >= 100 && (
                        <span className="text-emerald-400 flex items-center gap-1 font-black">
                          <Sparkles size={12} /> {tx.metaAlcanzada}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Métricas estimadas */}
                <div className="md:col-span-5 grid grid-cols-3 md:grid-cols-1 gap-2.5">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-sky-400" />
                      <span className="text-xs text-neutral-300 font-bold">{tx.distancia}</span>
                    </div>
                    <span className="text-xs font-black text-white font-mono">{kmEstimados} km</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame size={14} className="text-amber-400" />
                      <span className="text-xs text-neutral-300 font-bold">{tx.calorias}</span>
                    </div>
                    <span className="text-xs font-black text-white font-mono">{kcalEstimadas} kcal</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-emerald-400" />
                      <span className="text-xs text-neutral-300 font-bold">{tx.activo}</span>
                    </div>
                    <span className="text-xs font-black text-white font-mono">{minEstimados} min</span>
                  </div>
                </div>
              </div>

              {/* Registro Manual de Pasos */}
              <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-neutral-400 font-medium">
                  {tx.ajusteRapidoORegistroManual}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => sumarPasos(100)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    +100
                  </button>
                  <button
                    type="button"
                    onClick={() => sumarPasos(500)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    +500
                  </button>
                  <button
                    type="button"
                    onClick={() => sumarPasos(1000)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    +1.000
                  </button>
                  <button
                    type="button"
                    onClick={() => setPasosHoy(0)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-all cursor-pointer ml-1"
                    title={tx.reiniciarPasosACero}
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            4. PESTAÑA: CALCULADORA DE 1RM (ONE REP MAX)
           ───────────────────────────────────────────────────────────── */}
        {tabActiva === '1rm' && (
          <div className="space-y-6 animate-fadeIn">
            <Calculadora1RMWizard />
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/* ══ 5. CALCULADORA DE CALORÍAS Y MACRONUTRIENTES (WIZARD)══ */}
        {/* ══════════════════════════════════════════════════════════ */}
        {tabActiva === 'macros' && (
          <div className="space-y-6 animate-fadeIn">
            <CalculadoraMacrosWizard />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
