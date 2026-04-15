import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppLayout, Card, ImagenPlaceholder } from "../componentes";
import { useI18n } from '../context/I18nContext';
import { useRutinas } from '../context/RutinasContext';
import { useEjercicios } from '../context/EjerciciosContext';
import { useHistorial } from '../context/HistorialContext';

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

export default function EntrenamientoPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { t, locale } = useI18n();
    const { rutinas } = useRutinas();
    const { ejercicios: catalogoEjercicios } = useEjercicios();
    const { crearSesion } = useHistorial();

    const rutinaId = (location.state as any)?.rutinaId as number | undefined;
    const nombreRutinaState = (location.state as any)?.nombre as string | undefined;

    const rutina = useMemo(() => {
        if (typeof rutinaId === 'number') return rutinas.find(r => r.id === rutinaId);
        if (nombreRutinaState) return rutinas.find(r => r.nombre === nombreRutinaState);
        return undefined;
    }, [rutinaId, nombreRutinaState, rutinas]);

    const nombreRutina = rutina?.nombre || nombreRutinaState || (locale === 'es' ? "Entrenamiento" : "Training");

    const ejerciciosDeRutina = useMemo(() => {
        const ids = rutina?.ejerciciosIds ?? [];
        const map = new Map(catalogoEjercicios.map(e => [e.id, e] as const));
        return ids
            .map(id => map.get(id))
            .filter(Boolean)
            .map(e => ({ id: e!.id, nombre: e!.nombre }));
    }, [rutina?.ejerciciosIds, catalogoEjercicios]);

    const [ejerciciosUI, setEjerciciosUI] = useState<EjercicioUI[]>([]);
    const [empezado, setEmpezado] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [errorGuardar, setErrorGuardar] = useState<string | null>(null);
    const [startedAtMs, setStartedAtMs] = useState<number | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
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
    }, [ejerciciosDeRutina]);

    useEffect(() => {
        if (!empezado || !startedAtMs) return;
        const id = window.setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - startedAtMs) / 1000));
        }, 500);
        return () => window.clearInterval(id);
    }, [empezado, startedAtMs]);

    const toggleSerie = (ejercicioId: number, serieNumero: number) => {
        setEjerciciosUI(prev => prev.map(ej => {
            if (ej.id !== ejercicioId) return ej;
            return {
                ...ej,
                series: ej.series.map(s =>
                    s.numero === serieNumero ? { ...s, completada: !s.completada } : s
                )
            };
        }));
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
            await crearSesion({
                fecha: todayYYYYMMDD(),
                duracionMin,
                rutinaId: rutina?.id ?? (typeof rutinaId === 'number' ? rutinaId : null),
                ejercicios: ejerciciosUI.map(ej => ({
                    ejercicioId: ej.id,
                    series: ej.series.map(s => ({ kg: s.kg, reps: s.reps, completada: s.completada })),
                })),
            });
            navigate('/historial');
        } catch (e: any) {
            setErrorGuardar(e?.message ?? (locale === 'es' ? 'Error guardando la sesión' : 'Error saving session'));
        } finally {
            setGuardando(false);
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Cabecera Superior */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-2 md:gap-4">
                        <Card className="px-4 py-2 md:px-6 md:py-3" hoverable={false}>
                            <span className="text-white font-mono font-bold text-sm md:text-base">
                                {formatHHMMSS(elapsedSeconds)}
                            </span>
                        </Card>
                        <Card className="px-4 py-2 md:px-6 md:py-3" hoverable={false}>
                            <span className="text-white font-bold text-sm md:text-base">{nombreRutina}</span>
                        </Card>
                        <Card className="px-4 py-2 md:px-6 md:py-3" hoverable={false}>
                            <span className="text-white font-bold text-sm md:text-base">
                                {t.history.totalVolume}: {Math.round(volumenTotal)} {t.history.kg}
                            </span>
                        </Card>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                        {!empezado ? (
                            <button
                                className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all"
                                onClick={() => {
                                    setEmpezado(true);
                                    const now = Date.now();
                                    setStartedAtMs(now);
                                    setElapsedSeconds(0);
                                }}
                            >
                                {(locale === 'es' ? 'EMPEZAR' : 'START')}
                            </button>
                        ) : (
                            <button
                                className="w-full md:w-auto bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                onClick={finish}
                                disabled={guardando}
                            >
                                {(guardando ? (locale === 'es' ? 'GUARDANDO...' : 'SAVING...') : t.training.finishTraining.toUpperCase())}
                            </button>
                        )}
                        <Card className="px-4 py-2 md:px-6 md:py-3" hoverable={false}>
                            <span className="text-neutral-300 text-sm md:text-base">
                                {locale === 'es' ? 'Series hechas' : 'Sets done'}: <span className="text-white font-bold">{seriesRealizadas}</span>
                            </span>
                        </Card>
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
                        ejerciciosUI.map((ejercicio) => (
                            <Card key={ejercicio.id} className="p-4 md:p-6" hoverable={false}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <ImagenPlaceholder size="sm" />
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{ejercicio.nombre}</h3>
                                            <p className="text-sm cursor-pointer hover:underline" style={{ color: 'var(--color-accent)' }}>
                                                {locale === 'es' ? 'Ver historial (próx.)' : 'View history (soon)'}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Botón Eliminar */}
                                    <button
                                        onClick={() => eliminarEjercicio(ejercicio.id)}
                                        className="text-red-500 hover:text-red-400 transition-all active:scale-90"
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
                                            <span className="hidden md:block text-neutral-400 text-sm">—</span>
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
                                            disabled={!empezado}
                                            className="text-sm font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                            style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--color-neutral-3000)', border: '1px solid rgba(255,255,255,0.08)' }}
                                        >
                                            {t.training.addSeries}
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-neutral-900/50 rounded-3xl border border-dashed border-neutral-800">
                            <p className="text-neutral-500 italic">{t.routines.noExercisesInRoutine}</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}