import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AppLayout, Card } from "../componentes";
import { Eye, ExternalLink, Dumbbell, Sun, Timer } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useRutinas } from '../context/RutinasContext';
import { useEjercicios } from '../context/EjerciciosContext';
import { useHistorial } from '../context/HistorialContext';
import { useWakeLock } from '../hooks/useWakeLock';
import TemporizadorDescanso from '../componentes/entrenamiento/TemporizadorDescanso';
import TarjetaCompartirModal, { type DatosCompartirSesion } from '../componentes/compartir/TarjetaCompartirModal';

type EntrenamientoLocationState = {
    nombre?: string;
    rutinaId?: number | string;
    ejerciciosIds?: number[];
} | null;

interface SerieUI {
    numero: number;
    kg: number;
    reps: number;
    completada: boolean;
}

interface EjercicioUI {
    id: number;
    nombre: string;
    series: SerieUI[];
}

function pad2(n: number) {
    return String(n).padStart(2, '0');
}

function formatHHMMSS(totalSeconds: number) {
    const s = Math.max(0, Math.floor(totalSeconds));
    const hh = Math.floor(s / 3600);
    const mm = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    return `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
}

function todayYYYYMMDD() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = pad2(d.getMonth() + 1);
    const dd = pad2(d.getDate());
    return `${yyyy}-${mm}-${dd}`;
}

function clamp(n: number, min: number, max: number) {
    return Math.min(max, Math.max(min, n));
}

function calcularPuntuacion(args: {
    ejercicios: { series: { kg: number; reps: number; completada: boolean }[] }[];
}) {
    // Ecuación (Índice de Carga Proyectada):
    // S = ( V_total / (N_ex * S̄) ) * ω
    // donde V_total = Σ (kg * reps * series) de lo completado,
    // N_ex = nº ejercicios, S̄ = promedio series por ejercicio, ω escala a 1-5.
    //
    // Nota: N_ex * S̄ = totalSeries, así que la expresión equivale a:
    // S = (V_total / totalSeries) * ω

    const ejerciciosConTrabajo = args.ejercicios
        .map(e => ({
            totalSeries: e.series.filter(s => s.completada).length,
            volumen: e.series.reduce((t, s) => t + (s.completada ? (s.kg * s.reps) : 0), 0),
        }))
        .filter(e => e.totalSeries > 0);

    const N_ex = ejerciciosConTrabajo.length;
    const totalSeries = ejerciciosConTrabajo.reduce((t, e) => t + e.totalSeries, 0);
    const V_total = ejerciciosConTrabajo.reduce((t, e) => t + e.volumen, 0);

    if (N_ex === 0 || totalSeries === 0 || V_total <= 0) return 1;

    const S_bar = totalSeries / N_ex;
    const omega = 0.005; // escala empírica: ~600 de (kg*reps) por serie → ~3 puntos
    const raw = (V_total / (N_ex * S_bar)) * omega;
    return Math.round(clamp(raw, 1, 5));
}

export default function EntrenamientoPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { t, locale } = useI18n();
    const { rutinas } = useRutinas();
    const { ejercicios: catalogoEjercicios } = useEjercicios();
    const { crearSesion } = useHistorial();

    const state = (location.state ?? null) as EntrenamientoLocationState;
    const rutinaId = state?.rutinaId;
    const nombreRutinaState = state?.nombre;

    const rutina = useMemo(() => {
        if (rutinaId !== undefined && rutinaId !== null) {
            return rutinas.find(r => r.id === Number(rutinaId) || String(r.id) === String(rutinaId));
        }
        if (nombreRutinaState) return rutinas.find(r => r.nombre === nombreRutinaState);
        return rutinas.length > 0 ? rutinas[0] : undefined;
    }, [rutinaId, nombreRutinaState, rutinas]);

    const nombreRutina = rutina?.nombre || nombreRutinaState || (locale === 'es' ? "Entrenamiento" : "Training");

    const ejerciciosDeRutina = useMemo(() => {
        const ids = (rutina?.ejerciciosIds && rutina.ejerciciosIds.length > 0)
            ? rutina.ejerciciosIds
            : (state?.ejerciciosIds ?? []);
        const map = new Map(catalogoEjercicios.map(e => [e.id, e] as const));
        return ids.map(id => {
            const found = map.get(id);
            return {
                id,
                nombre: found?.nombre || (locale === 'es' ? `Ejercicio #${id}` : `Exercise #${id}`),
            };
        });
    }, [rutina?.ejerciciosIds, state?.ejerciciosIds, catalogoEjercicios, locale]);

    const { isSupported: wakeLockSupported, isActive: wakeLockActive, request: requestWakeLock, release: releaseWakeLock, toggle: toggleWakeLock } = useWakeLock();

    const [ejerciciosUI, setEjerciciosUI] = useState<EjercicioUI[]>([]);
    const [empezado, setEmpezado] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [errorGuardar, setErrorGuardar] = useState<string | null>(null);
    const [startedAtMs, setStartedAtMs] = useState<number | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // Estados para Temporizador de Descanso
    const [mostrarDescanso, setMostrarDescanso] = useState(false);
    const [segundosDescansoConfig] = useState(90);
    const [ejercicioDescansoActual, setEjercicioDescansoActual] = useState<string>('');
    const [descansoKey, setDescansoKey] = useState(0);

    // Estados para Tarjeta de Compartir Story / WhatsApp
    const [mostrarModalCompartir, setMostrarModalCompartir] = useState(false);
    const [datosCompartir, setDatosCompartir] = useState<DatosCompartirSesion | null>(null);

    useEffect(() => {
        if (empezado) return;
        // Inicializar ejercicios/series desde la rutina real
        const base = (ejerciciosDeRutina.length > 0 ? ejerciciosDeRutina : []).map((ej) => ({
            id: ej.id,
            nombre: ej.nombre,
            series: [
                { numero: 1, kg: 0, reps: 0, completada: false },
                { numero: 2, kg: 0, reps: 0, completada: false },
            ],
        }));
        setEjerciciosUI(base);
    }, [ejerciciosDeRutina, empezado]);

    useEffect(() => {
        if (!empezado || !startedAtMs) return;
        const id = window.setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - startedAtMs) / 1000));
        }, 500);
        return () => window.clearInterval(id);
    }, [empezado, startedAtMs]);

    const toggleSerie = (ejercicioId: number, serieNumero: number) => {
        let recienCompletada = false;
        let nombreEjercicio = '';
        setEjerciciosUI(prev => prev.map(ej => {
            if (ej.id !== ejercicioId) return ej;
            nombreEjercicio = ej.nombre;
            return {
                ...ej,
                series: ej.series.map(s => {
                    if (s.numero === serieNumero) {
                        const nuevoEstado = !s.completada;
                        if (nuevoEstado) recienCompletada = true;
                        return { ...s, completada: nuevoEstado };
                    }
                    return s;
                })
            };
        }));

        // Si se completa una serie durante el entrenamiento, activar descanso automáticamente
        if (recienCompletada && empezado) {
            setEjercicioDescansoActual(nombreEjercicio);
            setDescansoKey(prev => prev + 1);
            setMostrarDescanso(true);
        }
    };

    const actualizarSerieCampo = (ejercicioId: number, serieNumero: number, campo: 'kg' | 'reps', valor: number) => {
        setEjerciciosUI(prev => prev.map(ej => {
            if (ej.id !== ejercicioId) return ej;
            return {
                ...ej,
                series: ej.series.map(s => s.numero === serieNumero ? { ...s, [campo]: valor } : s),
            };
        }));
    };

    const addSerie = (ejercicioId: number) => {
        setEjerciciosUI(prev => prev.map(ej => {
            if (ej.id !== ejercicioId) return ej;
            const nextNumero = ej.series.length + 1;
            return { ...ej, series: [...ej.series, { numero: nextNumero, kg: 0, reps: 0, completada: false }] };
        }));
    };

    const quitarSerie = (ejercicioId: number, serieNumero: number) => {
        setEjerciciosUI(prev => prev.map(ej => {
            if (ej.id !== ejercicioId) return ej;
            // Mantener al menos 1 serie por ejercicio
            if (ej.series.length <= 1) return ej;
            const filtradas = ej.series.filter(s => s.numero !== serieNumero);
            // Renumerar
            const renumeradas = filtradas.map((s, idx) => ({ ...s, numero: idx + 1 }));
            return { ...ej, series: renumeradas };
        }));
    };

    const eliminarEjercicio = (id: number) => {
        setEjerciciosUI(prev => prev.filter(ej => ej.id !== id));
    };

    const volumenTotal = useMemo(() => {
        return ejerciciosUI.reduce((total, ej) => (
            total + ej.series.reduce((s, serie) => s + (serie.kg * serie.reps), 0)
        ), 0);
    }, [ejerciciosUI]);

    const seriesRealizadas = useMemo(() => {
        return ejerciciosUI.reduce((t, ej) => t + ej.series.filter(s => s.completada).length, 0);
    }, [ejerciciosUI]);

    const finish = async () => {
        if (guardando) return;
        setErrorGuardar(null);
        setGuardando(true);
        try {
            const duracionMin = Math.max(1, Math.round(elapsedSeconds / 60));
            const puntuacion = calcularPuntuacion({
                ejercicios: ejerciciosUI,
            });
            await crearSesion({
                fecha: todayYYYYMMDD(),
                duracionMin,
                puntuacion,
                rutinaId: rutina?.id ?? (typeof rutinaId === 'number' ? rutinaId : null),
                ejercicios: ejerciciosUI.map(ej => ({
                    ejercicioId: ej.id,
                    series: ej.series.map(s => ({ kg: s.kg, reps: s.reps, completada: s.completada })),
                })),
            });

            // Liberar pantalla encendida y cerrar descanso
            releaseWakeLock();
            setMostrarDescanso(false);

            // Preparar datos para la tarjeta de compartir
            const fecha_ = new Date();
            const fechaTexto = fecha_.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
                weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
            });

            const resumenEjercicios = ejerciciosUI.map(ej => {
                const seriesHechas = ej.series.filter(s => s.completada);
                const maxKg = seriesHechas.reduce((max, s) => Math.max(max, s.kg), 0);
                return {
                    nombre: ej.nombre,
                    series: seriesHechas.length > 0 ? seriesHechas.length : ej.series.length,
                    mejorPeso: maxKg > 0 ? maxKg : undefined,
                };
            });

            setDatosCompartir({
                nombreRutina,
                duracionMin,
                volumenKg: volumenTotal,
                totalSeries: seriesRealizadas,
                fechaTexto,
                puntuacion,
                ejercicios: resumenEjercicios,
            });
            setMostrarModalCompartir(true);
        } catch (e: any) {
            const msg = e instanceof Error ? e.message : undefined;
            setErrorGuardar(msg ?? (locale === 'es' ? 'Error guardando la sesión' : 'Error saving session'));
        } finally {
            setGuardando(false);
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Cabecera Superior */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="h-9 px-3.5 rounded-xl border border-neutral-800 bg-neutral-900/60 flex items-center gap-2">
                            <span className="text-white font-mono font-bold text-xs sm:text-sm">
                                {formatHHMMSS(elapsedSeconds)}
                            </span>
                        </div>
                        <div className="h-9 px-3.5 rounded-xl border border-neutral-800 bg-neutral-900/60 flex items-center gap-2">
                            <span className="text-white font-bold text-xs sm:text-sm">{nombreRutina}</span>
                        </div>
                        <div className="h-9 px-3.5 rounded-xl border border-neutral-800 bg-neutral-900/60 flex items-center gap-2">
                            <span className="text-neutral-400 text-xs">{t.history.totalVolume}:</span>
                            <span className="text-white font-bold text-xs sm:text-sm">
                                {Math.round(volumenTotal)} {t.history.kg}
                            </span>
                        </div>

                        {/* Botón Wake Lock (Pantalla siempre encendida) */}
                        {wakeLockSupported && (
                            <button
                                type="button"
                                onClick={toggleWakeLock}
                                title={
                                    wakeLockActive
                                        ? (locale === 'es' ? 'Pantalla siempre activa (clic para desactivar)' : 'Screen stay awake active (click to disable)')
                                        : (locale === 'es' ? 'Mantener pantalla siempre encendida' : 'Keep screen awake')
                                }
                                className={`h-9 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                                    wakeLockActive
                                        ? 'bg-[#DBF059]/15 border-[#DBF059]/40 text-[#DBF059] shadow-[0_0_12px_rgba(219,240,89,0.15)]'
                                        : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white'
                                }`}
                            >
                                <Sun size={14} className={wakeLockActive ? 'animate-pulse text-[#DBF059]' : ''} />
                                <span className="hidden sm:inline">
                                    {wakeLockActive
                                        ? (locale === 'es' ? 'Pantalla Activa' : 'Awake')
                                        : (locale === 'es' ? 'Pantalla' : 'Screen')}
                                </span>
                            </button>
                        )}

                        {/* Botón de acceso directo al Temporizador de descanso */}
                        <button
                            type="button"
                            onClick={() => {
                                setDescansoKey(prev => prev + 1);
                                setMostrarDescanso(prev => !prev);
                            }}
                            title={locale === 'es' ? 'Temporizador de descanso' : 'Rest timer'}
                            className={`h-9 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                                mostrarDescanso
                                    ? 'bg-[#DBF059]/15 border-[#DBF059]/40 text-[#DBF059]'
                                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white'
                            }`}
                        >
                            <Timer size={14} />
                            <span className="hidden sm:inline">
                                {locale === 'es' ? 'Descanso' : 'Rest'}
                            </span>
                        </button>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        {!empezado ? (
                            <button
                                className="flex-1 md:flex-initial h-9 px-5 rounded-xl font-bold text-xs uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm active:scale-95 flex items-center justify-center cursor-pointer"
                                onClick={() => {
                                    if (ejerciciosUI.length === 0) {
                                        setErrorGuardar(locale === 'es'
                                            ? 'Añade ejercicios a la rutina antes de empezar.'
                                            : 'Add exercises to the routine before starting.');
                                        return;
                                    }
                                    setEmpezado(true);
                                    requestWakeLock();
                                    const now = Date.now();
                                    setStartedAtMs(now);
                                    setElapsedSeconds(0);
                                }}
                            >
                                {(locale === 'es' ? 'EMPEZAR' : 'START')}
                            </button>
                        ) : (
                            <button
                                className="flex-1 md:flex-initial h-9 px-5 rounded-xl font-bold text-xs uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white transition-all shadow-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                                onClick={finish}
                                disabled={guardando}
                            >
                                {(guardando ? (locale === 'es' ? 'GUARDANDO...' : 'SAVING...') : t.training.finishTraining.toUpperCase())}
                            </button>
                        )}
                        <div className="h-9 px-3.5 rounded-xl border border-neutral-800 bg-neutral-900/60 flex items-center gap-2 text-xs text-neutral-300 shrink-0">
                            <span className="text-neutral-400">{locale === 'es' ? 'Series hechas:' : 'Sets done:'}</span>
                            <span className="text-white font-bold text-xs sm:text-sm">{seriesRealizadas}</span>
                        </div>
                    </div>
                </div>

                {errorGuardar && (
                    <Card className="p-4 border border-red-500/30" hoverable={false}>
                        <p className="text-red-300 text-sm">{errorGuardar}</p>
                    </Card>
                )}

                {/* Listado de Ejercicios */}
                <div className="space-y-6">
                    {ejerciciosUI.length > 0 ? (
                        ejerciciosUI.map((ejercicio) => {
                            const infoEj = catalogoEjercicios.find(e => e.id === ejercicio.id);
                            const imagenUrl = infoEj?.imagenInicio || infoEj?.imagenFinal;

                            return (
                                <Card key={ejercicio.id} className="p-4 md:p-6" hoverable={false}>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-4">
                                                <Link
                                                    to={`/ejercicios/${ejercicio.id}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="w-14 h-14 rounded-xl bg-neutral-800 shrink-0 overflow-hidden flex items-center justify-center border border-white/10 hover:border-[var(--color-primary)] transition-all group"
                                                    title={locale === 'es' ? 'Ver técnica y cómo se hace' : 'View technique and how to perform'}
                                                >
                                                    {imagenUrl ? (
                                                        <img src={imagenUrl} alt={ejercicio.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                    ) : (
                                                        <Dumbbell size={22} className="text-neutral-400 group-hover:text-[var(--color-primary)] transition-colors" />
                                                    )}
                                                </Link>
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Link
                                                            to={`/ejercicios/${ejercicio.id}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="font-bold text-white text-lg hover:underline transition-colors"
                                                        >
                                                            {ejercicio.nombre}
                                                        </Link>
                                                        {infoEj?.grupo && (
                                                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                                                                {infoEj.grupo}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                                        <Link
                                                            to={`/ejercicios/${ejercicio.id}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg transition-all"
                                                            style={{
                                                                background: 'rgba(219, 240, 89, 0.12)',
                                                                color: 'var(--color-primary)',
                                                                border: '1px solid rgba(219, 240, 89, 0.35)',
                                                            }}
                                                        >
                                                            <Eye size={13} />
                                                            <span>{locale === 'es' ? 'Ver cómo se hace' : 'How to perform'}</span>
                                                            <ExternalLink size={11} className="opacity-70" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                    {/* Botón Eliminar */}
                                    <button
                                        onClick={() => eliminarEjercicio(ejercicio.id)}
                                        disabled={empezado}
                                        aria-label={locale === 'es' ? 'Eliminar ejercicio' : 'Remove exercise'}
                                        className="text-red-500 hover:text-red-400 transition-all active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {/* Cabecera de Columnas */}
                                    <div className="grid grid-cols-4 md:grid-cols-5 gap-4 px-4 py-1 text-neutral-500 text-xs font-bold uppercase tracking-wider">
                                        <span>{t.training.set}</span>
                                        <span className="hidden md:block">{t.training.previous}</span>
                                        <span className="text-center">{t.training.kg}</span>
                                        <span className="text-center">{t.training.reps}</span>
                                        <span className="text-center">{t.training.done}</span>
                                    </div>

                                    {/* Filas de Series */}
                                    {ejercicio.series.map((serie) => (
                                        <div key={serie.numero} className="grid grid-cols-4 md:grid-cols-5 gap-4 items-center bg-neutral-800/50 p-3 rounded-xl border border-neutral-800">
                                            <span className="font-bold ml-2" style={{ color: 'var(--color-primary)' }}>{serie.numero}</span>
                                            <div className="hidden md:flex items-center gap-2">
                                                <span className="text-neutral-400 text-sm">—</span>
                                                {!empezado && (
                                                    <button
                                                        type="button"
                                                        onClick={() => quitarSerie(ejercicio.id, serie.numero)}
                                                        className="text-neutral-400 hover:text-white transition-colors"
                                                        aria-label={locale === 'es' ? 'Quitar serie' : 'Remove set'}
                                                        title={locale === 'es' ? 'Quitar serie' : 'Remove set'}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                            <input
                                                type="number"
                                                value={serie.kg}
                                                min={0}
                                                step={0.5}
                                                disabled={!empezado}
                                                className="bg-neutral-700 text-white text-center rounded-lg py-2 w-full outline-none disabled:opacity-60"
                                                onChange={e => actualizarSerieCampo(ejercicio.id, serie.numero, 'kg', Number(e.target.value))}
                                                onFocus={e => (e.currentTarget.style.outline = '1px solid var(--color-accent)')}
                                                onBlur={e => (e.currentTarget.style.outline = 'none')}
                                            />
                                            <input
                                                type="number"
                                                value={serie.reps}
                                                min={0}
                                                step={1}
                                                disabled={!empezado}
                                                className="bg-neutral-700 text-white text-center rounded-lg py-2 w-full outline-none disabled:opacity-60"
                                                onChange={e => actualizarSerieCampo(ejercicio.id, serie.numero, 'reps', Number(e.target.value))}
                                                onFocus={e => (e.currentTarget.style.outline = '1px solid var(--color-accent)')}
                                                onBlur={e => (e.currentTarget.style.outline = 'none')}
                                            />

                                            {/* Botón Check Verde */}
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => toggleSerie(ejercicio.id, serie.numero)}
                                                    disabled={!empezado}
                                                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${serie.completada ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-neutral-700'
                                                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                                                >
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="pt-2">
                                        <button
                                            onClick={() => addSerie(ejercicio.id)}
                                            disabled={empezado}
                                            className="text-sm font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                            style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--color-neutral-3000)', border: '1px solid rgba(255,255,255,0.08)' }}
                                        >
                                            {t.training.addSeries}
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                ) : (
                        <div className="text-center py-20 bg-neutral-900/50 rounded-3xl border border-dashed border-neutral-800">
                            <p className="text-neutral-500 italic">{t.routines.noExercisesInRoutine}</p>
                        </div>
                    )}
                </div>

                {/* Temporizador flotante de descanso entre series */}
                {mostrarDescanso && (
                    <TemporizadorDescanso
                        key={descansoKey}
                        segundosIniciales={segundosDescansoConfig}
                        ejercicioNombre={ejercicioDescansoActual}
                        onTerminar={() => {}}
                        onCerrar={() => setMostrarDescanso(false)}
                    />
                )}

                {/* Modal de Tarjeta para Compartir (Stories / WhatsApp) */}
                {mostrarModalCompartir && datosCompartir && (
                    <TarjetaCompartirModal
                        abierto={mostrarModalCompartir}
                        onCerrar={() => {
                            setMostrarModalCompartir(false);
                            navigate('/historial');
                        }}
                        datos={datosCompartir}
                        onContinuar={() => navigate('/historial')}
                    />
                )}
            </div>
        </AppLayout>
    );
}