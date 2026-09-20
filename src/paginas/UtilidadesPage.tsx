import { useState, useEffect, useRef } from 'react';
import { AppLayout, TituloPagina, Card } from '../componentes';
import { useI18n } from '../context/I18nContext';
import { useAuth } from '../context/AuthContext';
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
  Calculator,
  Target,
  Percent,
  TrendingUp,
  Info,
  Sliders,
  Layers,
  Award,
  Pencil,
  Utensils,
  Scale,
  PieChart,
  Apple,
  ArrowDownRight,
  ArrowUpRight,
  HeartPulse,
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

type TabUtilidad = 'temporizador' | 'cronometro' | 'pasos' | '1rm' | 'macros';

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

  // ─────────────────────────────────────────────────────────────
  // 4. CALCULADORA DE 1RM (ONE REP MAX)
  // ─────────────────────────────────────────────────────────────
  const [peso1RM, setPeso1RM] = useState<number>(80);
  const [reps1RM, setReps1RM] = useState<number>(5);
  const [unidad1RM, setUnidad1RM] = useState<'kg' | 'lbs'>('kg');
  const [formula1RM, setFormula1RM] = useState<'promedio' | 'epley' | 'brzycki' | 'lander' | 'lombardi'>('promedio');
  const [ejercicio1RM, setEjercicio1RM] = useState<string>('Press de Banca');

  const calcular1RM = (peso: number, reps: number, formula: string) => {
    if (!peso || peso <= 0 || !reps || reps <= 0) return 0;
    if (reps === 1) return peso;

    const epley = peso * (1 + reps / 30);
    const brzycki = peso * (36 / (37 - reps));
    const lander = (100 * peso) / (101.3 - 2.67123 * reps);
    const lombardi = peso * Math.pow(reps, 0.10);

    let val = 0;
    switch (formula) {
      case 'epley':
        val = epley;
        break;
      case 'brzycki':
        val = brzycki;
        break;
      case 'lander':
        val = lander;
        break;
      case 'lombardi':
        val = lombardi;
        break;
      case 'promedio':
      default:
        val = (epley + brzycki + lander + lombardi) / 4;
        break;
    }
    return Math.round(val * 10) / 10;
  };

  const rmCalculado = calcular1RM(peso1RM, reps1RM, formula1RM);
  const rmEpley = calcular1RM(peso1RM, reps1RM, 'epley');
  const rmBrzycki = calcular1RM(peso1RM, reps1RM, 'brzycki');
  const rmLander = calcular1RM(peso1RM, reps1RM, 'lander');
  const rmLombardi = calcular1RM(peso1RM, reps1RM, 'lombardi');

  // Tabla de porcentajes estándar de entrenamiento
  const tablaPorcentajes = [
    { pct: 100, reps: '1 rep', desc: locale === 'es' ? 'Fuerza Máxima (Récord)' : 'Max Strength (PR)', zona: 'max' },
    { pct: 95, reps: '2 reps', desc: locale === 'es' ? 'Fuerza Pura / Potencia' : 'Pure Strength / Power', zona: 'max' },
    { pct: 90, reps: '3 - 4 reps', desc: locale === 'es' ? 'Fuerza Pesada' : 'Heavy Strength', zona: 'max' },
    { pct: 85, reps: '5 - 6 reps', desc: locale === 'es' ? 'Fuerza e Hipertrofia' : 'Strength & Hypertrophy', zona: 'hiper' },
    { pct: 80, reps: '7 - 8 reps', desc: locale === 'es' ? 'Hipertrofia Óptima' : 'Optimal Hypertrophy', zona: 'hiper' },
    { pct: 75, reps: '9 - 10 reps', desc: locale === 'es' ? 'Hipertrofia y Volumen' : 'Hypertrophy & Volume', zona: 'hiper' },
    { pct: 70, reps: '11 - 12 reps', desc: locale === 'es' ? 'Capacidad de Trabajo' : 'Work Capacity', zona: 'resist' },
    { pct: 65, reps: '13 - 15 reps', desc: locale === 'es' ? 'Resistencia Muscular' : 'Muscular Endurance', zona: 'resist' },
    { pct: 60, reps: '16 - 20 reps', desc: locale === 'es' ? 'Bombeo y Descarga' : 'Pump & Deload', zona: 'resist' },
    { pct: 50, reps: '20+ reps', desc: locale === 'es' ? 'Calentamiento / Activación' : 'Warm-up / Activation', zona: 'resist' },
  ];

  // ─────────────────────────────────────────────────────────────
  // 5. CALCULADORA DE CALORÍAS Y MACRONUTRIENTES (TDEE & MACROS)
  // ─────────────────────────────────────────────────────────────
  const { user } = useAuth();

  const [generoMacros, setGeneroMacros] = useState<'masculino' | 'femenino'>(
    user?.genero === 'femenino' ? 'femenino' : 'masculino'
  );
  const [edadMacros, setEdadMacros] = useState<number>(user?.edad || 26);
  const [pesoMacros, setPesoMacros] = useState<number>(user?.pesoKg || 75);
  const [alturaMacros, setAlturaMacros] = useState<number>(user?.alturaCm || 178);
  const [grasaCorporalMacros, setGrasaCorporalMacros] = useState<number | ''>('');
  const [unidadPesoMacros, setUnidadPesoMacros] = useState<'kg' | 'lbs'>('kg');

  const [nivelActividadMacros, setNivelActividadMacros] = useState<
    'sedentario' | 'ligero' | 'moderado' | 'activo' | 'muy_activo'
  >(user?.nivelActividad || 'moderado');

  const [objetivoMacros, setObjetivoMacros] = useState<
    'perdida_agresiva' | 'deficit_moderado' | 'mantenimiento' | 'volumen_limpio' | 'volumen_agresivo'
  >('deficit_moderado');

  const [distribucionMacros, setDistribucionMacros] = useState<
    'equilibrado' | 'alto_proteina' | 'alto_carbos' | 'keto'
  >('alto_proteina');

  const [numComidas, setNumComidas] = useState<number>(4);

  // Sincronizar automáticamente si el usuario ya tenía datos guardados en el perfil
  useEffect(() => {
    if (user?.edad) setEdadMacros(user.edad);
    if (user?.pesoKg) setPesoMacros(user.pesoKg);
    if (user?.alturaCm) setAlturaMacros(user.alturaCm);
    if (user?.genero && user.genero !== 'otro') setGeneroMacros(user.genero);
    if (user?.nivelActividad) setNivelActividadMacros(user.nivelActividad);
  }, [user]);

  // Peso normalizado en KG para las fórmulas científicas
  const pesoKgReal = unidadPesoMacros === 'lbs' ? pesoMacros * 0.453592 : pesoMacros;

  // 1. BMR (Tasa Metabólica Basal)
  const calcularBMR = () => {
    if (!pesoKgReal || !alturaMacros || !edadMacros) return 0;
    if (grasaCorporalMacros !== '' && Number(grasaCorporalMacros) > 0) {
      const masaMagra = pesoKgReal * (1 - Number(grasaCorporalMacros) / 100);
      return Math.round(370 + 21.6 * masaMagra);
    }
    const bmrBase = 10 * pesoKgReal + 6.25 * alturaMacros - 5 * edadMacros;
    return Math.round(generoMacros === 'masculino' ? bmrBase + 5 : bmrBase - 161);
  };

  const bmrCalculado = calcularBMR();

  // 2. Factores de Actividad Física
  const factoresActividad = {
    sedentario: 1.2,
    ligero: 1.375,
    moderado: 1.55,
    activo: 1.725,
    muy_activo: 1.9,
  };

  const factorActividadActual = factoresActividad[nivelActividadMacros] || 1.55;
  const tdeeMantenimiento = Math.round(bmrCalculado * factorActividadActual);

  // 3. Modificador de Objetivo
  const modificadoresObjetivo = {
    perdida_agresiva: -0.25,
    deficit_moderado: -0.15,
    mantenimiento: 0,
    volumen_limpio: 0.10,
    volumen_agresivo: 0.18,
  };

  const pctObjetivo = modificadoresObjetivo[objetivoMacros] || 0;
  const caloriasObjetivo = Math.round(tdeeMantenimiento * (1 + pctObjetivo));
  const diferenciaCalorica = caloriasObjetivo - tdeeMantenimiento;
  const cambioSemanalKg = Math.round(((diferenciaCalorica * 7) / 7700) * 100) / 100;

  // 4. Distribución de Macronutrientes
  const presetsDistribucion = {
    equilibrado: { carbPct: 40, protPct: 30, grasPct: 30, desc: locale === 'es' ? 'Equilibrado (40C / 30P / 30G)' : 'Balanced (40C / 30P / 30G)' },
    alto_proteina: { carbPct: 35, protPct: 40, grasPct: 25, desc: locale === 'es' ? 'Alto en Proteína (35C / 40P / 25G)' : 'High Protein (35C / 40P / 25G)' },
    alto_carbos: { carbPct: 55, protPct: 25, grasPct: 20, desc: locale === 'es' ? 'Rendimiento (55C / 25P / 20G)' : 'Performance (55C / 25P / 20G)' },
    keto: { carbPct: 5, protPct: 30, grasPct: 65, desc: locale === 'es' ? 'Cetogénica (5C / 30P / 65G)' : 'Keto (5C / 30P / 65G)' },
  };

  const presetActual = presetsDistribucion[distribucionMacros];

  const gramosProteina = Math.round((caloriasObjetivo * (presetActual.protPct / 100)) / 4);
  const gramosCarbohidratos = Math.round((caloriasObjetivo * (presetActual.carbPct / 100)) / 4);
  const gramosGrasas = Math.round((caloriasObjetivo * (presetActual.grasPct / 100)) / 9);

  const protPorKg = (gramosProteina / (pesoKgReal || 1)).toFixed(1);
  const carbPorKg = (gramosCarbohidratos / (pesoKgReal || 1)).toFixed(1);
  const grasPorKg = (gramosGrasas / (pesoKgReal || 1)).toFixed(1);

  const kcalPorComida = Math.round(caloriasObjetivo / (numComidas || 1));
  const protPorComida = Math.round(gramosProteina / (numComidas || 1));
  const carbPorComida = Math.round(gramosCarbohidratos / (numComidas || 1));
  const grasPorComida = Math.round(gramosGrasas / (numComidas || 1));

  return (
    <AppLayout>
      <div className="space-y-6 pb-12 max-w-4xl mx-auto">
        <TituloPagina titulo={locale === 'es' ? 'Herramientas y Utilidades' : 'Tools & Utilities'} />

        {/* ══ PESTAÑAS DE UTILIDADES ══ */}
        <div className="flex p-1.5 rounded-2xl bg-neutral-900/60 border border-white/5 backdrop-blur-xl gap-1 overflow-x-auto">
          {[
            { id: 'temporizador', label: locale === 'es' ? 'Temporizador' : 'Timer', icon: <Timer size={16} /> },
            { id: 'cronometro', label: locale === 'es' ? 'Cronómetro' : 'Stopwatch', icon: <Watch size={16} /> },
            { id: 'pasos', label: locale === 'es' ? 'Cuenta Pasos' : 'Step Counter', icon: <Footprints size={16} /> },
            { id: '1rm', label: locale === 'es' ? 'Calculadora 1RM' : '1RM Calculator', icon: <Dumbbell size={16} /> },
            { id: 'macros', label: locale === 'es' ? 'Calorías y Macros' : 'Calories & Macros', icon: <Utensils size={16} /> },
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
                        <span className="inline-flex items-center gap-1">
                          / {objetivoPasos.toLocaleString()} {locale === 'es' ? 'meta' : 'goal'}
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

        {/* ─────────────────────────────────────────────────────────────
            4. PESTAÑA: CALCULADORA DE 1RM (ONE REP MAX)
           ───────────────────────────────────────────────────────────── */}
        {tabActiva === '1rm' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Cabecera explicativa de la calculadora */}
            <div className="bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-900 border border-white/5 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                      <Calculator size={20} />
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {locale === 'es' ? 'Calculadora de 1RM' : '1RM Calculator'}
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
                    {locale === 'es'
                      ? 'Calcula tu Repetición Máxima (1RM) a partir del peso y repeticiones de una serie pesada, utilizando fórmulas científicas estandarizadas sin necesidad de llegar al fallo absoluto.'
                      : 'Calculate your One Rep Max (1RM) from weight and repetitions using standardized scientific formulas.'}
                  </p>
                </div>

                {/* Toggle de Unidad (KG / LBS) */}
                <div className="flex items-center gap-1 p-1 bg-black/40 border border-white/10 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setUnidad1RM('kg')}
                    className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                      unidad1RM === 'kg'
                        ? 'bg-[var(--color-primary)] text-black shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    KG
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnidad1RM('lbs')}
                    className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                      unidad1RM === 'lbs'
                        ? 'bg-[var(--color-primary)] text-black shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    LBS
                  </button>
                </div>
              </div>

              {/* Chips de ejercicios populares */}
              <div className="flex items-center gap-2 overflow-x-auto pt-4 no-scrollbar">
                <span className="text-xs text-neutral-500 font-bold shrink-0 flex items-center gap-1">
                  <Dumbbell size={13} />
                  {locale === 'es' ? 'Ejercicio:' : 'Exercise:'}
                </span>
                {[
                  'Press de Banca',
                  'Sentadilla',
                  'Peso Muerto',
                  'Press Militar',
                  'Dominadas',
                  'Otro',
                ].map((ej) => (
                  <button
                    key={ej}
                    type="button"
                    onClick={() => setEjercicio1RM(ej)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                      ejercicio1RM === ej
                        ? 'bg-neutral-800 border-neutral-600 text-white shadow-sm'
                        : 'bg-white/[0.02] border-white/5 text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.05]'
                    }`}
                  >
                    {ej}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid principal: Formulario de entrada + Resultado Destacado */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Tarjeta de Entrada de Datos */}
              <Card className="p-5 sm:p-6 md:col-span-7 space-y-6" hoverable={false}>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sliders size={16} className="text-[var(--color-primary)]" />
                  <span>{locale === 'es' ? 'Datos del levantamiento' : 'Lift Data'}</span>
                </h3>

                {/* Input: Peso Levantado */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                      <Target size={14} className="text-neutral-400" />
                      <span>{locale === 'es' ? 'Peso levantado' : 'Weight lifted'}</span>
                    </label>
                    <span className="text-xs font-mono font-bold text-white">
                      {peso1RM} {unidad1RM}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={600}
                      step={0.5}
                      value={peso1RM || ''}
                      onChange={(e) => setPeso1RM(Math.max(0, Number(e.target.value)))}
                      className="input py-2.5 text-base font-mono font-bold bg-neutral-950 border-neutral-800 text-white rounded-xl w-full"
                    />
                    <span className="text-xs font-bold text-neutral-400 uppercase shrink-0 px-2">
                      {unidad1RM}
                    </span>
                  </div>

                  {/* Steppers rápidos de peso */}
                  <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
                    {[-10, -2.5, +2.5, +5, +10].map((delta) => (
                      <button
                        key={delta}
                        type="button"
                        onClick={() => setPeso1RM((prev) => Math.max(1, prev + delta))}
                        className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/5 transition-colors cursor-pointer shrink-0"
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input: Repeticiones Realizadas */}
                <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-neutral-400" />
                      <span>{locale === 'es' ? 'Repeticiones completadas' : 'Reps completed'}</span>
                    </label>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-neutral-800 text-[var(--color-primary)]">
                      {reps1RM} {reps1RM === 1 ? 'rep' : 'reps'}
                    </span>
                  </div>

                  {/* Slider visual de repeticiones */}
                  <input
                    type="range"
                    min={1}
                    max={15}
                    step={1}
                    value={reps1RM}
                    onChange={(e) => setReps1RM(Number(e.target.value))}
                    className="w-full accent-[var(--color-primary)] cursor-pointer h-2 bg-neutral-800 rounded-lg"
                  />

                  {/* Botones de repeticiones frecuentes */}
                  <div className="grid grid-cols-6 gap-1.5 pt-1">
                    {[1, 3, 5, 8, 10, 12].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setReps1RM(r)}
                        className={`py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          reps1RM === r
                            ? 'bg-[var(--color-primary)] text-black border-[var(--color-primary)] shadow-sm'
                            : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selector de Fórmula de Cálculo */}
                <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                  <label className="text-xs font-bold text-neutral-300 block">
                    {locale === 'es' ? 'Fórmula de cálculo' : 'Calculation formula'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'promedio', label: locale === 'es' ? 'Promedio' : 'Average', sub: locale === 'es' ? 'Más fiable' : 'Most reliable' },
                      { id: 'epley', label: 'Epley', sub: 'Estándar fuerza' },
                      { id: 'brzycki', label: 'Brzycki', sub: '1 - 10 reps' },
                      { id: 'lander', label: 'Lander', sub: 'Precisión media' },
                      { id: 'lombardi', label: 'Lombardi', sub: 'No lineal' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFormula1RM(f.id as any)}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          formula1RM === f.id
                            ? 'bg-neutral-800 border-neutral-600 text-white shadow-sm'
                            : 'bg-neutral-950/40 border-neutral-800/80 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <span className="text-xs font-bold block">{f.label}</span>
                        <span className="text-[10px] text-neutral-500 font-medium block">{f.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Tarjeta de Visualización de 1RM */}
              <div className="md:col-span-5 flex flex-col gap-4">
                <Card className="p-6 flex flex-col items-center justify-center text-center relative overflow-hidden bg-gradient-to-b from-neutral-900 to-neutral-950 border-neutral-800 flex-1 shadow-xl" hoverable={false}>
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-primary)]/5 blur-[80px] pointer-events-none" />

                  <span className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase mb-1">
                    {locale === 'es' ? 'Tu 1RM Estimado' : 'Your Estimated 1RM'}
                  </span>

                  {ejercicio1RM && (
                    <span className="text-xs font-bold text-neutral-300 mb-3 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                      {ejercicio1RM}
                    </span>
                  )}

                  {/* Display gigante de 1RM */}
                  <div className="my-2">
                    <span className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_25px_rgba(219,240,89,0.2)]">
                      {rmCalculado}
                    </span>
                    <span className="text-xl sm:text-2xl font-extrabold text-[var(--color-primary)] ml-2">
                      {unidad1RM}
                    </span>
                  </div>

                  {/* Insignia de fiabilidad del cálculo */}
                  <div className="mt-3">
                    {reps1RM <= 5 ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                        <Award size={13} />
                        <span>{locale === 'es' ? 'Alta fiabilidad (1-5 reps)' : 'High accuracy (1-5 reps)'}</span>
                      </span>
                    ) : reps1RM <= 10 ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">
                        <Info size={13} />
                        <span>{locale === 'es' ? 'Fiabilidad moderada (6-10 reps)' : 'Moderate accuracy (6-10 reps)'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700 text-xs font-bold">
                        <Info size={13} />
                        <span>{locale === 'es' ? 'Referencial (>10 reps)' : 'Approximate (>10 reps)'}</span>
                      </span>
                    )}
                  </div>

                  {/* Comparación rápida de las 4 fórmulas */}
                  <div className="grid grid-cols-2 gap-2 w-full mt-6 pt-4 border-t border-neutral-800/80">
                    <div className="p-2 rounded-xl bg-neutral-950/60 border border-neutral-800/60 text-left">
                      <span className="text-[10px] text-neutral-500 font-bold block">Epley</span>
                      <span className="text-xs font-mono font-black text-white">{rmEpley} {unidad1RM}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-neutral-950/60 border border-neutral-800/60 text-left">
                      <span className="text-[10px] text-neutral-500 font-bold block">Brzycki</span>
                      <span className="text-xs font-mono font-black text-white">{rmBrzycki} {unidad1RM}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-neutral-950/60 border border-neutral-800/60 text-left">
                      <span className="text-[10px] text-neutral-500 font-bold block">Lander</span>
                      <span className="text-xs font-mono font-black text-white">{rmLander} {unidad1RM}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-neutral-950/60 border border-neutral-800/60 text-left">
                      <span className="text-[10px] text-neutral-500 font-bold block">Lombardi</span>
                      <span className="text-xs font-mono font-black text-white">{rmLombardi} {unidad1RM}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* ── TABLA DE PORCENTAJES DE CARGA Y REPETICIONES OBJETIVO ── */}
            <Card className="p-5 sm:p-6 space-y-4" hoverable={false}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                    <Percent size={17} className="text-[var(--color-primary)]" />
                    <span>{locale === 'es' ? 'Tabla de Porcentajes de Carga' : 'Training Load Percentages'}</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {locale === 'es'
                      ? 'Pesos calculados para programar tus series de fuerza, hipertrofia o calentamiento.'
                      : 'Calculated weights to program your strength, hypertrophy, or warm-up sets.'}
                  </p>
                </div>
              </div>

              {/* Tabla Responsive de Porcentajes */}
              <div className="overflow-x-auto rounded-xl border border-neutral-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider text-[11px]">
                      <th className="p-3">{locale === 'es' ? 'Porcentaje' : 'Percentage'}</th>
                      <th className="p-3">{locale === 'es' ? 'Peso Estimado' : 'Estimated Weight'}</th>
                      <th className="p-3">{locale === 'es' ? 'Reps Estimadas' : 'Estimated Reps'}</th>
                      <th className="p-3">{locale === 'es' ? 'Objetivo de Entrenamiento' : 'Training Objective'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {tablaPorcentajes.map((fila) => {
                      const pesoFila = Math.round((rmCalculado * (fila.pct / 100)) * 10) / 10;
                      return (
                        <tr
                          key={fila.pct}
                          className={`hover:bg-white/[0.02] transition-colors ${
                            fila.pct === 100 ? 'bg-[var(--color-primary)]/[0.04]' : ''
                          }`}
                        >
                          <td className="p-3 font-mono font-black text-white flex items-center gap-1.5">
                            {fila.pct === 100 && (
                              <Target size={13} className="text-[var(--color-primary)]" />
                            )}
                            <span>{fila.pct}%</span>
                          </td>
                          <td className="p-3 font-mono font-black text-[var(--color-primary)] text-sm">
                            {pesoFila} {unidad1RM}
                          </td>
                          <td className="p-3 font-bold text-neutral-300">
                            {fila.reps}
                          </td>
                          <td className="p-3 text-neutral-400">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                fila.zona === 'max'
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                  : fila.zona === 'hiper'
                                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20'
                                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              }`}
                            >
                              {fila.desc}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* ── GUÍA RÁPIDA DE ZONAS DE ENTRENAMIENTO ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
                    <Target size={16} />
                  </span>
                  <h4 className="font-extrabold text-white text-xs sm:text-sm">
                    {locale === 'es' ? 'Fuerza Máxima' : 'Max Strength'}
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-red-400 font-bold block">85% - 100% 1RM</span>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {locale === 'es'
                    ? 'Orientado a adaptaciones neuromusculares y potencia máxima (1 a 5 repeticiones). Descansos largos de 3 a 5 minutos.'
                    : 'Targeted at neuromuscular adaptations and maximum power (1-5 reps). Rest 3-5 minutes.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    <TrendingUp size={16} />
                  </span>
                  <h4 className="font-extrabold text-white text-xs sm:text-sm">
                    {locale === 'es' ? 'Hipertrofia' : 'Hypertrophy'}
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-[var(--color-primary)] font-bold block">70% - 85% 1RM</span>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {locale === 'es'
                    ? 'Rango óptimo para ganancia de masa muscular y volumen de trabajo (6 a 12 repeticiones). Descansos de 60 a 90 segundos.'
                    : 'Optimal range for muscle mass and training volume (6-12 reps). Rest 60-90 seconds.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                    <Layers size={16} />
                  </span>
                  <h4 className="font-extrabold text-white text-xs sm:text-sm">
                    {locale === 'es' ? 'Resistencia y Descarga' : 'Endurance & Deload'}
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-blue-400 font-bold block">50% - 70% 1RM</span>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {locale === 'es'
                    ? 'Ideal para series de calentamiento, semanas de descarga activa o acondicionamiento metabólico (+15 reps).'
                    : 'Ideal for warm-up sets, deload weeks, or conditioning (+15 reps).'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/* ══ 5. CALCULADORA DE CALORÍAS Y MACRONUTRIENTES         ══ */}
        {/* ══════════════════════════════════════════════════════════ */}
        {tabActiva === 'macros' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* ── PARÁMETROS DEL USUARIO ── */}
            <Card className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
                    <Utensils size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      {locale === 'es' ? 'Parámetros Corporales y Actividad' : 'Body Parameters & Activity'}
                    </h3>
                    <p className="text-xs text-neutral-400">
                      {locale === 'es'
                        ? 'Cálculo de TDEE y BMR mediante ecuaciones validadas (Mifflin-St Jeor / Katch-McArdle)'
                        : 'TDEE & BMR estimation using validated scientific formulas'}
                    </p>
                  </div>
                </div>

                {/* Selector Sexo Biológico */}
                <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setGeneroMacros('masculino')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      generoMacros === 'masculino'
                        ? 'bg-[var(--color-primary)] text-neutral-950 shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {locale === 'es' ? 'Masculino' : 'Male'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGeneroMacros('femenino')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      generoMacros === 'femenino'
                        ? 'bg-[var(--color-primary)] text-neutral-950 shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {locale === 'es' ? 'Femenino' : 'Female'}
                  </button>
                </div>
              </div>

              {/* Medidas corporales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Edad */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    {locale === 'es' ? 'Edad (años)' : 'Age (years)'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={10}
                      max={120}
                      value={edadMacros || ''}
                      onChange={(e) => setEdadMacros(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono font-bold focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                      placeholder="25"
                    />
                  </div>
                </div>

                {/* Peso */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-300">
                      {locale === 'es' ? 'Peso' : 'Weight'}
                    </label>
                    <div className="flex items-center text-[10px] bg-neutral-950 rounded px-1 border border-neutral-800">
                      <button
                        type="button"
                        onClick={() => setUnidadPesoMacros('kg')}
                        className={`px-1.5 py-0.5 rounded ${
                          unidadPesoMacros === 'kg' ? 'text-[var(--color-primary)] font-bold' : 'text-neutral-500'
                        }`}
                      >
                        kg
                      </button>
                      <span className="text-neutral-700">|</span>
                      <button
                        type="button"
                        onClick={() => setUnidadPesoMacros('lbs')}
                        className={`px-1.5 py-0.5 rounded ${
                          unidadPesoMacros === 'lbs' ? 'text-[var(--color-primary)] font-bold' : 'text-neutral-500'
                        }`}
                      >
                        lbs
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min={20}
                      max={300}
                      value={pesoMacros || ''}
                      onChange={(e) => setPesoMacros(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono font-bold focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                      placeholder="75"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-500">
                      {unidadPesoMacros}
                    </span>
                  </div>
                </div>

                {/* Altura */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    {locale === 'es' ? 'Altura (cm)' : 'Height (cm)'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={100}
                      max={250}
                      value={alturaMacros || ''}
                      onChange={(e) => setAlturaMacros(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono font-bold focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                      placeholder="178"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-500">
                      cm
                    </span>
                  </div>
                </div>

                {/* % Grasa Corporal (Opcional) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-300">
                      {locale === 'es' ? '% Grasa Corporal' : 'Body Fat %'}
                    </label>
                    <span className="text-[10px] text-neutral-500">
                      {locale === 'es' ? 'Opcional' : 'Optional'}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min={3}
                      max={60}
                      step="0.5"
                      value={grasaCorporalMacros}
                      onChange={(e) => setGrasaCorporalMacros(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono font-bold focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                      placeholder="15"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-500">
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Nivel de actividad física */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <HeartPulse size={14} className="text-[var(--color-primary)]" />
                  {locale === 'es' ? 'Nivel de Actividad Semanal' : 'Weekly Activity Level'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                  {[
                    {
                      id: 'sedentario',
                      nombre: locale === 'es' ? 'Sedentario' : 'Sedentary',
                      desc: locale === 'es' ? 'Poco o ningún ejercicio' : 'Little to no exercise',
                      factor: 'x1.2',
                    },
                    {
                      id: 'ligero',
                      nombre: locale === 'es' ? 'Ligero' : 'Light',
                      desc: locale === 'es' ? '1 a 3 días/semana' : '1-3 days/week',
                      factor: 'x1.375',
                    },
                    {
                      id: 'moderado',
                      nombre: locale === 'es' ? 'Moderado' : 'Moderate',
                      desc: locale === 'es' ? '3 a 5 días/semana' : '3-5 days/week',
                      factor: 'x1.55',
                    },
                    {
                      id: 'activo',
                      nombre: locale === 'es' ? 'Activo' : 'Active',
                      desc: locale === 'es' ? '6 a 7 días intensos' : '6-7 heavy days',
                      factor: 'x1.725',
                    },
                    {
                      id: 'muy_activo',
                      nombre: locale === 'es' ? 'Muy Activo' : 'Very Active',
                      desc: locale === 'es' ? 'Entreno doble o físico' : 'Physical labor / 2x a day',
                      factor: 'x1.9',
                    },
                  ].map((act) => {
                    const activo = nivelActividadMacros === act.id;
                    return (
                      <button
                        key={act.id}
                        type="button"
                        onClick={() => setNivelActividadMacros(act.id as any)}
                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          activo
                            ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-white shadow-sm'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1 w-full">
                          <span className={`text-xs font-bold ${activo ? 'text-[var(--color-primary)]' : 'text-neutral-200'}`}>
                            {act.nombre}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                            {act.factor}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 line-clamp-2 leading-snug">
                          {act.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Objetivo Calórico y Distribución de Macronutrientes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Objetivo */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                    <Target size={14} className="text-[var(--color-primary)]" />
                    {locale === 'es' ? 'Objetivo Calórico' : 'Calorie Goal'}
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      {
                        id: 'perdida_agresiva',
                        label: locale === 'es' ? 'Déficit Agresivo (-25%)' : 'Aggressive Cut (-25%)',
                        desc: locale === 'es' ? 'Pérdida rápida de grasa' : 'Fast fat loss',
                      },
                      {
                        id: 'deficit_moderado',
                        label: locale === 'es' ? 'Déficit Moderado (-15%)' : 'Moderate Cut (-15%)',
                        desc: locale === 'es' ? 'Preserva al máximo la masa muscular' : 'Preserves maximum muscle mass',
                      },
                      {
                        id: 'mantenimiento',
                        label: locale === 'es' ? 'Mantenimiento (0%)' : 'Maintenance (0%)',
                        desc: locale === 'es' ? 'Recomposición corporal y fuerza' : 'Body recomposition and performance',
                      },
                      {
                        id: 'volumen_limpio',
                        label: locale === 'es' ? 'Superávit Limpio (+10%)' : 'Lean Bulk (+10%)',
                        desc: locale === 'es' ? 'Ganancia muscular con mínima grasa' : 'Muscle gain with minimal fat',
                      },
                      {
                        id: 'volumen_agresivo',
                        label: locale === 'es' ? 'Superávit Intenso (+18%)' : 'Aggressive Bulk (+18%)',
                        desc: locale === 'es' ? 'Máxima ganancia de fuerza y masa' : 'Maximum size and strength phase',
                      },
                    ].map((obj) => {
                      const activo = objetivoMacros === obj.id;
                      return (
                        <button
                          key={obj.id}
                          type="button"
                          onClick={() => setObjetivoMacros(obj.id as any)}
                          className={`p-2.5 px-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                            activo
                              ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-white'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                          }`}
                        >
                          <div>
                            <div className={`text-xs font-bold ${activo ? 'text-[var(--color-primary)]' : 'text-neutral-200'}`}>
                              {obj.label}
                            </div>
                            <div className="text-[11px] text-neutral-500">{obj.desc}</div>
                          </div>
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              activo
                                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]'
                                : 'border-neutral-700'
                            }`}
                          >
                            {activo && <span className="w-1.5 h-1.5 rounded-full bg-neutral-950" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Distribución de Macronutrientes y Número de Comidas */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                      <PieChart size={14} className="text-[var(--color-primary)]" />
                      {locale === 'es' ? 'Proporción de Macronutrientes' : 'Macronutrient Ratio'}
                    </label>
                    <div className="space-y-2">
                      {[
                        {
                          id: 'alto_proteina',
                          label: locale === 'es' ? 'Alto en Proteína' : 'High Protein',
                          ratios: '40% P / 35% C / 25% G',
                          desc: locale === 'es' ? 'Recomendado para fuerza y definición' : 'Recommended for strength & cutting',
                        },
                        {
                          id: 'equilibrado',
                          label: locale === 'es' ? 'Equilibrado' : 'Balanced',
                          ratios: '30% P / 40% C / 30% G',
                          desc: locale === 'es' ? 'Sostenible y versátil para cualquier estilo' : 'Sustainable everyday balance',
                        },
                        {
                          id: 'alto_carbos',
                          label: locale === 'es' ? 'Rendimiento Atlético' : 'Athletic Performance',
                          ratios: '25% P / 55% C / 20% G',
                          desc: locale === 'es' ? 'Prioriza reservas de glucógeno y resistencia' : 'High glycogen & endurance',
                        },
                        {
                          id: 'keto',
                          label: locale === 'es' ? 'Cetogénica / Keto' : 'Ketogenic',
                          ratios: '30% P / 5% C / 65% G',
                          desc: locale === 'es' ? 'Grasas predominantes y carbohidratos mínimos' : 'Low carb, fat-adapted energy',
                        },
                      ].map((macro) => {
                        const activo = distribucionMacros === macro.id;
                        return (
                          <button
                            key={macro.id}
                            type="button"
                            onClick={() => setDistribucionMacros(macro.id as any)}
                            className={`w-full p-2.5 px-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                              activo
                                ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-white'
                                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                            }`}
                          >
                            <div>
                              <div className={`text-xs font-bold ${activo ? 'text-[var(--color-primary)]' : 'text-neutral-200'}`}>
                                {macro.label}
                              </div>
                              <div className="text-[11px] text-neutral-500">{macro.desc}</div>
                            </div>
                            <span className="text-[11px] font-mono text-[var(--color-primary)] font-bold">
                              {macro.ratios}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selector de número de comidas */}
                  <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                        <Utensils size={14} className="text-[var(--color-primary)]" />
                        {locale === 'es' ? 'Comidas al Día' : 'Meals per Day'}
                      </label>
                      <span className="text-xs font-mono font-bold text-[var(--color-primary)]">
                        {numComidas} {locale === 'es' ? 'comidas' : 'meals'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {[2, 3, 4, 5, 6].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setNumComidas(n)}
                          className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                            numComidas === n
                              ? 'bg-[var(--color-primary)] text-neutral-950 border-[var(--color-primary)] shadow-sm'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* ── TARJETAS PRINCIPALES DE RESULTADOS ENERGÉTICOS ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Calorías Objetivo */}
              <div className="relative p-6 rounded-3xl bg-neutral-900/90 border border-[var(--color-primary)]/40 shadow-xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    {locale === 'es' ? 'Calorías Objetivo' : 'Target Calories'}
                  </span>
                  <span className="p-2 rounded-xl bg-[var(--color-primary)]/20 text-[var(--color-primary)]">
                    <Flame size={18} />
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
                    {caloriasObjetivo.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-neutral-400">kcal/día</span>
                </div>

                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <span className="text-neutral-400">
                    {diferenciaCalorica === 0
                      ? locale === 'es' ? 'Equilibrio energético' : 'Energy balance'
                      : diferenciaCalorica > 0
                      ? `+${diferenciaCalorica} kcal vs TDEE`
                      : `${diferenciaCalorica} kcal vs TDEE`}
                  </span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      cambioSemanalKg < 0
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : cambioSemanalKg > 0
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {cambioSemanalKg < 0 ? <ArrowDownRight size={12} /> : cambioSemanalKg > 0 ? <ArrowUpRight size={12} /> : null}
                    {cambioSemanalKg > 0 ? `+${cambioSemanalKg}` : cambioSemanalKg} kg/sem
                  </span>
                </div>
              </div>

              {/* TDEE Mantenimiento */}
              <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      {locale === 'es' ? 'Mantenimiento (TDEE)' : 'Maintenance (TDEE)'}
                    </span>
                    <span className="p-2 rounded-xl bg-neutral-800 text-neutral-300">
                      <Scale size={18} />
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-black font-mono text-white">
                      {tdeeMantenimiento.toLocaleString()}
                    </span>
                    <span className="text-sm font-semibold text-neutral-400">kcal/día</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    {locale === 'es'
                      ? 'Gasto energético diario total considerando tu nivel de actividad física.'
                      : 'Total daily energy expenditure factoring in your weekly activity.'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-800/80 text-[11px] font-mono text-neutral-500">
                  Factor PAL: {factorActividadActual}x
                </div>
              </div>

              {/* BMR Tasa Metabólica Basal */}
              <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      {locale === 'es' ? 'Metabolismo Basal (BMR)' : 'Basal Metabolic Rate'}
                    </span>
                    <span className="p-2 rounded-xl bg-neutral-800 text-neutral-300">
                      <HeartPulse size={18} />
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-black font-mono text-white">
                      {bmrCalculado.toLocaleString()}
                    </span>
                    <span className="text-sm font-semibold text-neutral-400">kcal/día</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    {locale === 'es'
                      ? 'Calorías mínimas en reposo absoluto para funciones vitales celulares.'
                      : 'Minimum energy expenditure at complete physical and mental rest.'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-800/80 text-[11px] font-mono text-neutral-500">
                  {grasaCorporalMacros && Number(grasaCorporalMacros) > 0
                    ? 'Fórmula: Katch-McArdle (Masa Magra)'
                    : 'Fórmula: Mifflin-St Jeor'}
                </div>
              </div>
            </div>

            {/* ── DESGLOSE DE MACRONUTRIENTES ── */}
            <Card className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-800/80">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <PieChart size={18} className="text-[var(--color-primary)]" />
                    {locale === 'es' ? 'Reparto de Macronutrientes' : 'Macronutrient Breakdown'}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {presetActual.desc}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-neutral-400">
                  100% ({caloriasObjetivo} kcal)
                </span>
              </div>

              {/* Barra de progreso apilada de Macronutrientes */}
              <div className="space-y-2">
                <div className="h-4 w-full rounded-full bg-neutral-950 overflow-hidden flex p-0.5 gap-0.5 border border-neutral-800">
                  <div
                    style={{ width: `${presetActual.protPct}%` }}
                    className="h-full bg-blue-500 rounded-l-full transition-all duration-500"
                    title={`Proteínas: ${presetActual.protPct}%`}
                  />
                  <div
                    style={{ width: `${presetActual.carbPct}%` }}
                    className="h-full bg-amber-500 transition-all duration-500"
                    title={`Carbohidratos: ${presetActual.carbPct}%`}
                  />
                  <div
                    style={{ width: `${presetActual.grasPct}%` }}
                    className="h-full bg-rose-500 rounded-r-full transition-all duration-500"
                    title={`Grasas: ${presetActual.grasPct}%`}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] font-mono text-neutral-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    {locale === 'es' ? 'Proteínas' : 'Protein'} ({presetActual.protPct}%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    {locale === 'es' ? 'Carbohidratos' : 'Carbs'} ({presetActual.carbPct}%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    {locale === 'es' ? 'Grasas' : 'Fats'} ({presetActual.grasPct}%)
                  </span>
                </div>
              </div>

              {/* Tarjetas individuales de cada macronutriente */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Proteínas */}
                <div className="p-5 rounded-2xl bg-neutral-950/70 border border-blue-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <h4 className="text-sm font-extrabold text-white">
                        {locale === 'es' ? 'Proteínas' : 'Protein'}
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      4 kcal/g
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black font-mono text-white">
                      {gramosProteina}
                    </span>
                    <span className="text-sm font-bold text-neutral-400">g/día</span>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-neutral-800/80 text-xs">
                    <div className="flex justify-between text-neutral-400">
                      <span>{locale === 'es' ? 'Ratio corporal:' : 'Body ratio:'}</span>
                      <span className="font-mono font-bold text-blue-400">{protPorKg} g/kg</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>{locale === 'es' ? 'Energía total:' : 'Total energy:'}</span>
                      <span className="font-mono text-neutral-300">{gramosProteina * 4} kcal</span>
                    </div>
                  </div>
                </div>

                {/* Carbohidratos */}
                <div className="p-5 rounded-2xl bg-neutral-950/70 border border-amber-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <h4 className="text-sm font-extrabold text-white">
                        {locale === 'es' ? 'Carbohidratos' : 'Carbs'}
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      4 kcal/g
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black font-mono text-white">
                      {gramosCarbohidratos}
                    </span>
                    <span className="text-sm font-bold text-neutral-400">g/día</span>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-neutral-800/80 text-xs">
                    <div className="flex justify-between text-neutral-400">
                      <span>{locale === 'es' ? 'Ratio corporal:' : 'Body ratio:'}</span>
                      <span className="font-mono font-bold text-amber-400">{carbPorKg} g/kg</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>{locale === 'es' ? 'Energía total:' : 'Total energy:'}</span>
                      <span className="font-mono text-neutral-300">{gramosCarbohidratos * 4} kcal</span>
                    </div>
                  </div>
                </div>

                {/* Grasas */}
                <div className="p-5 rounded-2xl bg-neutral-950/70 border border-rose-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <h4 className="text-sm font-extrabold text-white">
                        {locale === 'es' ? 'Grasas Saludables' : 'Healthy Fats'}
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      9 kcal/g
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black font-mono text-white">
                      {gramosGrasas}
                    </span>
                    <span className="text-sm font-bold text-neutral-400">g/día</span>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-neutral-800/80 text-xs">
                    <div className="flex justify-between text-neutral-400">
                      <span>{locale === 'es' ? 'Ratio corporal:' : 'Body ratio:'}</span>
                      <span className="font-mono font-bold text-rose-400">{grasPorKg} g/kg</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>{locale === 'es' ? 'Energía total:' : 'Total energy:'}</span>
                      <span className="font-mono text-neutral-300">{gramosGrasas * 9} kcal</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* ── DISTRIBUCIÓN SUGERIDA POR COMIDAS ── */}
            <Card className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    <Apple size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white">
                      {locale === 'es'
                        ? `Distribución en ${numComidas} Comidas Diarias`
                        : `Breakdown for ${numComidas} Daily Meals`}
                    </h4>
                    <p className="text-xs text-neutral-400">
                      {locale === 'es'
                        ? 'Promedio aproximado por ingesta para mantener niveles óptimos de energía y síntesis proteica.'
                        : 'Equally distributed target per meal to optimize energy and muscle protein synthesis.'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2.5 py-1 rounded-xl border border-[var(--color-primary)]/20">
                  ~{kcalPorComida} kcal / {locale === 'es' ? 'comida' : 'meal'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Array.from({ length: numComidas }).map((_, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/90 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        {locale === 'es' ? `Comida ${idx + 1}` : `Meal ${idx + 1}`}
                      </span>
                      <span className="text-xs font-mono font-bold text-neutral-300">
                        {kcalPorComida} kcal
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-neutral-900 text-center">
                      <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <span className="text-[10px] text-blue-400 block font-medium">Prot</span>
                        <span className="text-xs font-mono font-bold text-white">{protPorComida}g</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <span className="text-[10px] text-amber-400 block font-medium">Carb</span>
                        <span className="text-xs font-mono font-bold text-white">{carbPorComida}g</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                        <span className="text-[10px] text-rose-400 block font-medium">Grasa</span>
                        <span className="text-xs font-mono font-bold text-white">{grasPorComida}g</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* ── NOTA CIENTÍFICA / GUÍA NUTRICIONAL ── */}
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 flex items-start gap-3 text-xs text-neutral-400 leading-relaxed">
              <span className="p-1.5 rounded-lg bg-neutral-800 text-[var(--color-primary)] mt-0.5 flex-shrink-0">
                <Info size={16} />
              </span>
              <div>
                <span className="font-bold text-neutral-200 block mb-1">
                  {locale === 'es' ? 'Pautas basadas en evidencia' : 'Evidence-based guidelines'}
                </span>
                {locale === 'es'
                  ? 'Para optimizar la síntesis proteica muscular (MPS), se recomienda distribuir el consumo de proteínas en tomas de 20 a 40g cada 3-4 horas. Los valores de BMR y TDEE son aproximaciones científicas; monitorea el peso corporal durante 2-3 semanas y ajusta las calorías según la respuesta real de tu organismo.'
                  : 'To optimize muscle protein synthesis (MPS), distribute protein into 20-40g doses every 3-4 hours. BMR and TDEE equations are approximations; track weight for 2-3 weeks and adjust intake accordingly.'}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
