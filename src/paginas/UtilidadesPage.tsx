import { useState, useEffect, useRef } from 'react';
import { AppLayout, TituloPagina, Card } from '../componentes';
import { useI18n } from '../context/I18nContext';
import {
  Timer,
  Watch,
  Bell,
  Footprints,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  Flame,
  MapPin,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';

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

type TabUtilidad = 'temporizador' | 'cronometro' | 'alarmas' | 'pasos';

interface AlarmaItem {
  id: string;
  hora: string; // "07:30"
  etiqueta: string;
  activa: boolean;
  dias: string[]; // ['L','M','X','J','V','S','D']
}

interface VueltaItem {
  numero: number;
  tiempoVueltaMs: number;
  tiempoTotalMs: number;
}

export default function UtilidadesPage() {
  const { locale } = useI18n();
  const [tabActiva, setTabActiva] = useState<TabUtilidad>('temporizador');

  // ─────────────────────────────────────────────────────────────
  // 1. TEMPORIZADOR
  // ─────────────────────────────────────────────────────────────
  const [segundosTotales, setSegundosTotales] = useState(60);
  const [tiempoRestante, setTiempoRestante] = useState(60);
  const [tempCorriendo, setTempCorriendo] = useState(false);
  const [tempFinalizado, setTempFinalizado] = useState(false);
  const [sonidoActivado, setSonidoActivado] = useState(true);

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
    if (tempCorriendo && tiempoRestante > 0) {
      interval = setInterval(() => {
        setTiempoRestante((prev) => {
          if (prev <= 1) {
            setTempCorriendo(false);
            setTempFinalizado(true);
            if (sonidoActivado) {
              playBeep(920, 0.3, 3);
            }
            if ('vibrate' in navigator) {
              navigator.vibrate([300, 150, 300]);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [tempCorriendo, tiempoRestante, sonidoActivado]);

  const toggleTemporizador = () => {
    if (tempFinalizado) {
      setTiempoRestante(segundosTotales);
      setTempFinalizado(false);
      setTempCorriendo(true);
    } else {
      setTempCorriendo(!tempCorriendo);
    }
  };

  const reiniciarTemporizador = () => {
    setTempCorriendo(false);
    setTiempoRestante(segundosTotales);
    setTempFinalizado(false);
  };

  const setPreset = (seg: number) => {
    setTempCorriendo(false);
    setTempFinalizado(false);
    setSegundosTotales(seg);
    setTiempoRestante(seg);
  };

  const agregarSegundos = (seg: number) => {
    setTiempoRestante((prev) => Math.max(0, prev + seg));
    setSegundosTotales((prev) => Math.max(0, prev + seg));
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
  // 3. ALARMAS Y RECORDATORIOS
  // ─────────────────────────────────────────────────────────────
  const [alarmas, setAlarmas] = useState<AlarmaItem[]>(() => {
    try {
      const saved = localStorage.getItem('dailyset:alarmas');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: '1', hora: '07:30', etiqueta: 'Entrenamiento Mañanero', activa: true, dias: ['L', 'M', 'X', 'J', 'V'] },
      { id: '2', hora: '13:30', etiqueta: 'Tomar Creatina / Hidratación', activa: true, dias: ['L', 'M', 'X', 'J', 'V', 'S', 'D'] },
      { id: '3', hora: '20:00', etiqueta: 'Estiramientos y Movilidad', activa: false, dias: ['M', 'J', 'S'] },
    ];
  });

  const [nuevaHora, setNuevaHora] = useState('08:00');
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState('');
  const [mostrarCrearAlarma, setMostrarCrearAlarma] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('dailyset:alarmas', JSON.stringify(alarmas));
    } catch {}
  }, [alarmas]);

  // Chequeo de alarmas cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      const ahora = new Date();
      const horaStr = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
      const diaNum = ahora.getDay();
      const diaMap = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
      const diaHoyLetra = diaMap[diaNum];

      alarmas.forEach((a) => {
        if (a.activa && a.hora === horaStr && a.dias.includes(diaHoyLetra)) {
          playBeep(750, 0.4, 2);
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`⏰ ${a.etiqueta || 'Alarma DailySet'}`, {
              body: `Son las ${a.hora}. ¡Momento de tu hábito de entrenamiento!`,
            });
          }
        }
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [alarmas]);

  const toggleAlarma = (id: string) => {
    setAlarmas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, activa: !a.activa } : a))
    );
  };

  const eliminarAlarma = (id: string) => {
    setAlarmas((prev) => prev.filter((a) => a.id !== id));
  };

  const agregarAlarma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaHora) return;
    const nueva: AlarmaItem = {
      id: Date.now().toString(),
      hora: nuevaHora,
      etiqueta: nuevaEtiqueta.trim() || (locale === 'es' ? 'Recordatorio entrenamiento' : 'Workout reminder'),
      activa: true,
      dias: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
    };
    setAlarmas([...alarmas, nueva]);
    setNuevaEtiqueta('');
    setMostrarCrearAlarma(false);
  };

  // ─────────────────────────────────────────────────────────────
  // 4. CUENTA PASOS (PODÓMETRO)
  // ─────────────────────────────────────────────────────────────
  const hoyFechaStr = new Date().toISOString().split('T')[0];
  const [pasosHoy, setPasosHoy] = useState<number>(() => {
    try {
      const val = localStorage.getItem(`dailyset:pasos:${hoyFechaStr}`);
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [objetivoPasos, setObjetivoPasos] = useState<number>(() => {
    try {
      const val = localStorage.getItem('dailyset:pasos_meta');
      return val ? parseInt(val, 10) : 10000;
    } catch {
      return 10000;
    }
  });

  const [sensorActivo, setSensorActivo] = useState(false);
  const [sensorError, setSensorError] = useState('');

  // Persistir pasos
  useEffect(() => {
    try {
      localStorage.setItem(`dailyset:pasos:${hoyFechaStr}`, pasosHoy.toString());
    } catch {}
  }, [pasosHoy, hoyFechaStr]);

  // Guardar meta
  useEffect(() => {
    try {
      localStorage.setItem('dailyset:pasos_meta', objetivoPasos.toString());
    } catch {}
  }, [objetivoPasos]);

  // Algoritmo de detección de pasos con el acelerómetro en dispositivos móviles
  useEffect(() => {
    if (!sensorActivo) return;

    let ultimoPasoTime = 0;
    const threshold = 12.0; // Umbral de aceleración en m/s^2

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      const mag = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
      const ahora = Date.now();

      if (mag > threshold && ahora - ultimoPasoTime > 320) {
        ultimoPasoTime = ahora;
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
        } else {
          setSensorError(locale === 'es' ? 'Permiso de sensores denegado.' : 'Motion sensors permission denied.');
        }
      } catch (err: any) {
        setSensorError(err?.message || 'Error solicitando permiso');
      }
    } else if ('DeviceMotionEvent' in window) {
      setSensorActivo(true);
    } else {
      setSensorError(
        locale === 'es'
          ? 'Tu dispositivo o navegador no soporta el sensor de movimiento. Puedes registrar pasos manualmente.'
          : 'Your device does not support motion sensors. You can add steps manually.'
      );
    }
  };

  const sumarPasos = (cantidad: number) => {
    setPasosHoy((prev) => Math.max(0, prev + cantidad));
  };

  const kmEstimados = (pasosHoy * 0.00078).toFixed(2);
  const kcalEstimadas = Math.round(pasosHoy * 0.04);
  const minEstimados = Math.round(pasosHoy / 100);
  const pctPasos = Math.min(100, Math.round((pasosHoy / objetivoPasos) * 100));

  return (
    <AppLayout>
      <div className="space-y-6 pb-12 max-w-4xl mx-auto">
        <TituloPagina titulo={locale === 'es' ? 'Herramientas y Utilidades' : 'Tools & Utilities'} />

        {/* ══ PESTAÑAS DE UTILIDADES ══ */}
        <div className="flex p-1.5 rounded-2xl bg-neutral-900/60 border border-white/5 backdrop-blur-xl gap-1 overflow-x-auto">
          {[
            { id: 'temporizador', label: locale === 'es' ? 'Temporizador' : 'Timer', icon: <Timer size={16} /> },
            { id: 'cronometro', label: locale === 'es' ? 'Cronómetro' : 'Stopwatch', icon: <Watch size={16} /> },
            { id: 'alarmas', label: locale === 'es' ? 'Alarmas' : 'Alarms', icon: <Bell size={16} /> },
            { id: 'pasos', label: locale === 'es' ? 'Cuenta Pasos' : 'Step Counter', icon: <Footprints size={16} /> },
          ].map((item) => {
            const isActive = tabActiva === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTabActiva(item.id as TabUtilidad)}
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
                      ? (locale === 'es' ? '¡Tiempo Cumplido!' : 'Time Up!')
                      : tempCorriendo
                      ? (locale === 'es' ? 'Descansando...' : 'Running...')
                      : (locale === 'es' ? 'Pausado' : 'Paused')}
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
                  <span>{tempCorriendo ? (locale === 'es' ? 'Pausar' : 'Pause') : (locale === 'es' ? 'Iniciar' : 'Start')}</span>
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
                  {locale === 'es' ? 'Descanso recomendado entre series' : 'Rest presets'}
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
                  {cronoCorriendo ? (locale === 'es' ? 'Cronómetro en marcha' : 'Stopwatch running') : (locale === 'es' ? 'Listo' : 'Ready')}
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
                  <span>{cronoCorriendo ? (locale === 'es' ? 'Parar' : 'Stop') : (locale === 'es' ? 'Iniciar' : 'Start')}</span>
                </button>

                <button
                  type="button"
                  onClick={registrarVuelta}
                  disabled={!cronoCorriendo}
                  className="px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white font-bold text-xs disabled:opacity-30 transition-all cursor-pointer flex items-center gap-1.5"
                  title="Registrar vuelta"
                >
                  <Zap size={14} style={{ color: 'var(--color-primary)' }} />
                  <span>{locale === 'es' ? 'Vuelta' : 'Lap'}</span>
                </button>
              </div>

              {/* Historial de vueltas */}
              {vueltas.length > 0 && (
                <div className="mt-8 pt-6 border-t border-white/5 w-full text-left space-y-2 max-h-60 overflow-y-auto">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-neutral-500 px-3">
                    <span>{locale === 'es' ? 'Vuelta #' : 'Lap #'}</span>
                    <span>{locale === 'es' ? 'Tiempo parcial' : 'Split'}</span>
                    <span>{locale === 'es' ? 'Total' : 'Total'}</span>
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
            3. PESTAÑA: ALARMAS Y RECORDATORIOS
           ───────────────────────────────────────────────────────────── */}
        {tabActiva === 'alarmas' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-base font-black text-white uppercase italic tracking-wide">
                  {locale === 'es' ? 'Alarmas de Entrenamiento' : 'Training Alarms'}
                </h3>
                <p className="text-xs text-neutral-400">
                  {locale === 'es'
                    ? 'Recordatorios para entrenar, tomar suplementos o hidratarte.'
                    : 'Reminders to train, take supplements, or hydrate.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMostrarCrearAlarma(!mostrarCrearAlarma)}
                className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Plus size={14} />
                <span>{locale === 'es' ? 'Nueva Alarma' : 'New Alarm'}</span>
              </button>
            </div>

            {/* Formulario de nueva alarma */}
            {mostrarCrearAlarma && (
              <Card className="p-5 border border-[var(--color-primary)]/30 animate-fadeIn" hoverable={false}>
                <form onSubmit={agregarAlarma} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
                        {locale === 'es' ? 'Hora de la alarma' : 'Alarm time'}
                      </label>
                      <input
                        type="time"
                        value={nuevaHora}
                        onChange={(e) => setNuevaHora(e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-base font-bold outline-none focus:border-[var(--color-primary)] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
                        {locale === 'es' ? 'Etiqueta o Hábito' : 'Label or Habit'}
                      </label>
                      <input
                        type="text"
                        value={nuevaEtiqueta}
                        onChange={(e) => setNuevaEtiqueta(e.target.value)}
                        placeholder={locale === 'es' ? 'Ej: Rutina de Pierna, Creatina...' : 'Ex: Leg day, Creatine...'}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-bold outline-none focus:border-[var(--color-primary)] transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setMostrarCrearAlarma(false)}
                      className="px-4 py-2 rounded-xl bg-white/5 text-neutral-400 hover:text-white text-xs font-bold"
                    >
                      {locale === 'es' ? 'Cancelar' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[var(--color-primary)] text-black text-xs font-black uppercase tracking-wider cursor-pointer"
                    >
                      {locale === 'es' ? 'Guardar Alarma' : 'Save Alarm'}
                    </button>
                  </div>
                </form>
              </Card>
            )}

            {/* Lista de alarmas */}
            <div className="space-y-3">
              {alarmas.map((a) => (
                <div
                  key={a.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    a.activa
                      ? 'bg-neutral-900/80 border-white/10'
                      : 'bg-neutral-900/30 border-white/5 opacity-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                        {a.hora}
                      </span>
                      <span className="text-xs font-bold text-neutral-300">
                        {a.etiqueta}
                      </span>
                    </div>
                    <div className="flex gap-1 pt-1">
                      {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
                        <span
                          key={d}
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                            a.dias.includes(d)
                              ? 'bg-white/10 text-[var(--color-primary)]'
                              : 'text-neutral-600'
                          }`}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleAlarma(a.id)}
                      className={`w-12 h-6 rounded-full relative transition-colors duration-300 cursor-pointer ${
                        a.activa ? 'bg-[var(--color-primary)]' : 'bg-neutral-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full absolute top-0.5 transition-all duration-300 ${
                          a.activa ? 'right-0.5 bg-black' : 'left-0.5 bg-white'
                        }`}
                      />
                    </button>

                    {/* Eliminar */}
                    <button
                      type="button"
                      onClick={() => eliminarAlarma(a.id)}
                      className="p-2 rounded-xl text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            4. PESTAÑA: CUENTA PASOS (PODÓMETRO)
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
                      {locale === 'es' ? 'Pasos Diarios' : 'Daily Steps'}
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {locale === 'es' ? 'Contabiliza tus pasos reales del día' : 'Track your real steps for today'}
                  </p>
                </div>

                {/* Sensor Móvil Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={sensorActivo ? () => setSensorActivo(false) : activarSensor}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      sensorActivo
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${sensorActivo ? 'bg-emerald-400 animate-ping' : 'bg-neutral-500'}`} />
                    <span>{sensorActivo ? (locale === 'es' ? 'Sensor Activo' : 'Sensor Active') : (locale === 'es' ? 'Activar Acelerómetro' : 'Activate Sensor')}</span>
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
                      {locale === 'es' ? 'Pasos hoy' : 'Steps today'}
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tight">
                        {pasosHoy.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const nuevo = prompt(
                            locale === 'es' ? 'Introduce tu meta diaria de pasos:' : 'Enter daily step goal:',
                            objetivoPasos.toString()
                          );
                          if (nuevo && !isNaN(parseInt(nuevo, 10)) && parseInt(nuevo, 10) > 0) {
                            setObjetivoPasos(parseInt(nuevo, 10));
                          }
                        }}
                        className="text-xs font-bold text-neutral-400 hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                        title={locale === 'es' ? 'Cambiar meta diaria' : 'Edit daily goal'}
                      >
                        / {objetivoPasos.toLocaleString()} {locale === 'es' ? 'meta ✎' : 'goal ✎'}
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
                      <span>{pctPasos}% {locale === 'es' ? 'completado' : 'completed'}</span>
                      {pctPasos >= 100 && (
                        <span className="text-emerald-400 flex items-center gap-1 font-black">
                          <Sparkles size={12} /> {locale === 'es' ? '¡Meta alcanzada!' : 'Goal reached!'}
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
                      <span className="text-xs text-neutral-300 font-bold">{locale === 'es' ? 'Distancia' : 'Distance'}</span>
                    </div>
                    <span className="text-xs font-black text-white font-mono">{kmEstimados} km</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame size={14} className="text-amber-400" />
                      <span className="text-xs text-neutral-300 font-bold">{locale === 'es' ? 'Calorías' : 'Calories'}</span>
                    </div>
                    <span className="text-xs font-black text-white font-mono">{kcalEstimadas} kcal</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-emerald-400" />
                      <span className="text-xs text-neutral-300 font-bold">{locale === 'es' ? 'Activo' : 'Active'}</span>
                    </div>
                    <span className="text-xs font-black text-white font-mono">{minEstimados} min</span>
                  </div>
                </div>
              </div>

              {/* Registro Manual de Pasos */}
              <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-neutral-400 font-medium">
                  {locale === 'es' ? 'Ajuste rápido o registro manual:' : 'Quick adjustment or manual log:'}
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
                    title={locale === 'es' ? 'Reiniciar pasos a cero' : 'Reset steps to zero'}
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
