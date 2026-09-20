import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout, TituloPagina, FiltroBoton, BotonPrimario, Loading } from "../componentes";
import { useRutinas } from '../context/RutinasContext';
import type { Rutina } from '../context/RutinasContext';
import { useEjercicios } from '../context/EjerciciosContext';
import type { Ejercicio } from '../context/EjerciciosContext';
import FormularioRutina from '../componentes/forms/FormularioRutina';
import EditarEjerciciosRutina from '../componentes/forms/EditarEjerciciosRutina';
import { Pencil, Trash2, ListPlus, X, Dumbbell, Sparkles, Check, Clock, ChevronDown, ChevronUp, Plus, Brain, RefreshCw, ArrowLeft } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { RUTINAS_PREDEFINIDAS, NIVEL_COLOR, type RutinaTemplate } from '../data/rutinasPredefinidas';

type Modal =
    | { tipo: 'crear' }
    | { tipo: 'editar'; rutina: Rutina }
    | { tipo: 'ejercicios'; rutina: Rutina }
    | { tipo: 'confirmarEliminar'; rutina: Rutina }
    | null;

interface WizardAnswers {
    objetivo: 'ganar_musculo' | 'perder_peso' | 'resistencia' | 'flexibilidad' | '';
    nivel: 'principiante' | 'intermedio' | 'avanzado' | '';
    dias: 2 | 3 | 4 | 5 | 0;
    duracion: 30 | 45 | 60 | 90 | 0;
    equipamiento: 'ninguno' | 'basico' | 'completo' | '';
    zona: 'completo' | 'superior' | 'inferior' | 'core' | '';
}
interface EjercicioIA { id: number; nombre: string; grupo: string; series: number; reps: number; tiempo?: number; desc: string; }
interface RutinaGeneradaIA { nombre: string; categoria: string; duracion: number; nivel: string; objetivo: string; zona: string; color: string; ejercicios: EjercicioIA[]; }

function generarRutinaIA(answers: WizardAnswers, ejerciciosDB: Ejercicio[], locale: string): RutinaGeneradaIA | null {
    if (!ejerciciosDB.length) return null;
    const catMap: Record<string, string[]> = {
        ganar_musculo: ['strength', 'fuerza'],
        perder_peso: ['strength', 'cardio', 'plyometrics', 'fuerza'],
        resistencia: ['cardio', 'plyometrics'],
        flexibilidad: ['stretching', 'flexibility', 'movilidad'],
    };
    const zonaMap: Record<string, string[]> = {
        completo: [],
        superior: ['chest', 'back', 'shoulder', 'bicep', 'tricep', 'deltoid', 'pectoral', 'espalda', 'hombro', 'pecho', 'lat'],
        inferior: ['leg', 'glute', 'quad', 'hamstring', 'calf', 'pierna', 'glúteo', 'cuádricep', 'isquio', 'gemelo'],
        core: ['abs', 'core', 'abdominal', 'abdominales', 'lumbar'],
    };
    const equipMap: Record<string, string[]> = {
        ninguno: ['body only', 'cuerpo', ''],
        basico: ['body only', 'dumbbell', 'barbell', 'mancuerna', 'barra', 'kettlebell', 'cable', ''],
        completo: [],
    };
    const numMap: Record<number, number> = { 30: 4, 45: 5, 60: 6, 90: 8 };
    const n = numMap[answers.duracion] ?? 5;
    const setsMap: Record<string, { series: number; reps: number; tiempo?: number; desc: string }> = {
        ganar_musculo: { series: 4, reps: 10, desc: '4 × 10 reps' },
        perder_peso: { series: 3, reps: 15, desc: '3 × 15 reps' },
        resistencia: { series: 3, reps: 20, desc: '3 × 20 reps' },
        flexibilidad: { series: 3, reps: 0, tiempo: 30, desc: '3 × 30 seg' },
    };
    const sr = setsMap[answers.objetivo] ?? { series: 3, reps: 12, desc: '3 × 12 reps' };
    function matches(e: Ejercicio, relaxLevel: number): boolean {
        if (relaxLevel < 2) {
            const cats = catMap[answers.objetivo] ?? [];
            if (cats.length > 0) { const ec = (e.categoriaEjercicio ?? '').toLowerCase(); if (!cats.some(c => ec.includes(c))) return false; }
        }
        const zonaKw = zonaMap[answers.zona] ?? [];
        if (zonaKw.length > 0) {
            const allM = [(e.grupo ?? ''), ...(e.musculosPrimarios ?? [])].join(' ').toLowerCase();
            if (!zonaKw.some(k => allM.includes(k))) return false;
        }
        if (answers.equipamiento !== 'completo') {
            const eqKw = equipMap[answers.equipamiento] ?? [];
            const eq = (e.equipamiento ?? '').toLowerCase();
            if (!eqKw.some(k => !k || eq.includes(k))) return false;
        }
        if (relaxLevel === 0 && answers.nivel) { if (e.dificultad?.toLowerCase() !== answers.nivel) return false; }
        return true;
    }
    let filtered: Ejercicio[] = [];
    for (let relax = 0; relax <= 3; relax++) {
        filtered = ejerciciosDB.filter(e => matches(e, relax));
        if (filtered.length >= n) break;
    }
    if (filtered.length < n) filtered = [...ejerciciosDB];
    const selected = [...filtered].sort(() => Math.random() - 0.5).slice(0, n);
    const lblObjetivo: Record<string,string> = { ganar_musculo: locale==='es'?'Ganar Músculo':'Build Muscle', perder_peso: locale==='es'?'Perder Peso':'Fat Loss', resistencia: locale==='es'?'Resistencia':'Endurance', flexibilidad: locale==='es'?'Flexibilidad':'Flexibility' };
    const lblZona: Record<string,string> = { completo: locale==='es'?'Cuerpo Completo':'Full Body', superior: locale==='es'?'Tren Superior':'Upper Body', inferior: locale==='es'?'Tren Inferior':'Lower Body', core: 'Core' };
    const lblNivel: Record<string,string> = { principiante: locale==='es'?'Principiante':'Beginner', intermedio: locale==='es'?'Intermedio':'Intermediate', avanzado: locale==='es'?'Avanzado':'Advanced' };
    const catRutina: Record<string,string> = { ganar_musculo:'Fuerza', perder_peso:'Cardio', resistencia:'Cardio', flexibilidad:'Movilidad' };
    const colorRutina: Record<string,string> = { ganar_musculo:'#DBF059', perder_peso:'#f59e0b', resistencia:'#4361EE', flexibilidad:'#34d399' };
    const zona = lblZona[answers.zona] ?? ''; const objetivo = lblObjetivo[answers.objetivo] ?? '';
    return {
        nombre: locale==='es'?`Rutina ${zona} · ${objetivo}`:`${zona} Routine · ${objetivo}`,
        categoria: catRutina[answers.objetivo] ?? 'Fuerza',
        duracion: answers.duracion, nivel: lblNivel[answers.nivel] ?? '', objetivo, zona,
        color: colorRutina[answers.objetivo] ?? '#DBF059',
        ejercicios: selected.map(e => ({ id: e.id, nombre: e.nombre, grupo: e.grupo ?? '', series: sr.series, reps: sr.reps, tiempo: sr.tiempo, desc: sr.desc })),
    };
}

export default function MisRutinasPage() {
    const { rutinas, cargando, error, carga, refrescar, agregarRutina, editarRutina, eliminarRutina, actualizarEjerciciosRutina } = useRutinas();
    const { t, locale } = useI18n();

    // Pestaña principal: 'mis_rutinas' o 'preestablecidas'
    const [tabActiva, setTabActiva] = useState<'mis_rutinas' | 'preestablecidas' | 'ia'>('mis_rutinas');

    // Categorías disponibles en las rutinas del usuario
    const categoriasUsuario = useMemo(() => {
        const cats = [...new Set(rutinas.map(r => r.categoria))];
        return cats.length > 0 ? cats : ['Fuerza'];
    }, [rutinas]);

    const [filtroUsuario, setFiltroUsuario] = useState<string>('Todas');
    const [filtroPredefinidas, setFiltroPredefinidas] = useState<string>('Todas');
    const [modal, setModal] = useState<Modal>(null);

    // Estado para expansión de ejercicios en plantillas
    const [rutinaExpandida, setRutinaExpandida] = useState<string | null>(null);
    // Estado de carga al adoptar una rutina
    const [adoptandoId, setAdoptandoId] = useState<string | null>(null);
    // Mensaje de éxito temporal
    const [mensajeExito, setMensajeExito] = useState<string | null>(null);

    // ── IA Wizard ────────────────────────────────────────────────────────────
    const { ejercicios: ejerciciosDB } = useEjercicios();
    const [pasoIA, setPasoIA] = useState(0);
    const [wizardAnswers, setWizardAnswers] = useState<WizardAnswers>({ objetivo: '', nivel: '', dias: 0, duracion: 0, equipamiento: '', zona: '' });
    const [generando, setGenerando] = useState(false);
    const [rutinaIA, setRutinaIA] = useState<RutinaGeneradaIA | null>(null);
    const [guardandoIA, setGuardandoIA] = useState(false);
    const [exitoIA, setExitoIA] = useState(false);

    const categoriasPredefinidas = useMemo(() => {
        return ['Todas', 'Fuerza', 'Cardio', 'Calistenia', 'Core', 'Movilidad'];
    }, []);

    const rutinasUsuarioFiltradas = useMemo(() => {
        if (filtroUsuario === 'Todas') return rutinas;
        return rutinas.filter(r => r.categoria.toLowerCase() === filtroUsuario.toLowerCase());
    }, [rutinas, filtroUsuario]);

    const rutinasPredefinidasFiltradas = useMemo(() => {
        if (filtroPredefinidas === 'Todas') return RUTINAS_PREDEFINIDAS;
        return RUTINAS_PREDEFINIDAS.filter(r => r.categoria.toLowerCase() === filtroPredefinidas.toLowerCase());
    }, [filtroPredefinidas]);

    const [elapsedMs, setElapsedMs] = useState(0);
    useEffect(() => {
        if (!cargando || !carga.startedAtMs) return;
        const id = window.setInterval(() => {
            setElapsedMs(Math.max(0, performance.now() - (carga.startedAtMs ?? performance.now())));
        }, 100);
        return () => window.clearInterval(id);
    }, [cargando, carga.startedAtMs]);

    const handleGuardarRutina = async (data: { nombre: string; categoria: string; duracion: number }) => {
        if (modal?.tipo === 'crear') {
            await agregarRutina({ ...data, ejerciciosIds: [] });
            setMensajeExito(locale === 'es' ? '¡Rutina creada con éxito!' : 'Routine created successfully!');
            setTimeout(() => setMensajeExito(null), 3500);
        } else if (modal?.tipo === 'editar') {
            await editarRutina({ ...modal.rutina, ...data });
        }
        setModal(null);
    };

    const handleGuardarEjercicios = async (ejerciciosIds: number[]) => {
        if (modal?.tipo === 'ejercicios') {
            await actualizarEjerciciosRutina(modal.rutina.id, ejerciciosIds);
        }
        setModal(null);
    };

    const handleEliminar = async () => {
        if (modal?.tipo === 'confirmarEliminar') {
            await eliminarRutina(modal.rutina.id);
        }
        setModal(null);
    };

    // Adoptar una rutina predefinida
    const handleCogerRutina = async (plantilla: RutinaTemplate) => {
        setAdoptandoId(plantilla.id);
        try {
            await agregarRutina({
                nombre: locale === 'es' ? plantilla.nombre : plantilla.nombreEn,
                categoria: plantilla.categoria,
                duracion: plantilla.duracion,
                ejerciciosIds: plantilla.ejerciciosIds,
            });
            setMensajeExito(
                locale === 'es'
                    ? `¡Rutina "${plantilla.nombre}" añadida a tus rutinas con ${plantilla.ejercicios.length} ejercicios!`
                    : `Routine "${plantilla.nombreEn}" added to your routines with ${plantilla.ejercicios.length} exercises!`
            );
            setTimeout(() => setMensajeExito(null), 4000);
            // Cambiar a la pestaña de mis rutinas para verla directamente
            setTabActiva('mis_rutinas');
            setFiltroUsuario('Todas');
        } catch (e: any) {
            console.error('Error al adoptar rutina predefinida:', e);
        } finally {
            setAdoptandoId(null);
        }
    };

    const contarEjercicios = (rutina: Rutina) => rutina.ejerciciosIds?.length ?? 0;

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Cabecera principal */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <TituloPagina titulo={t.routines.title} />
                        <p className="text-sm mt-1" style={{ color: 'var(--color-neutral-2000)' }}>
                            {locale === 'es'
                                ? 'Diseña tus entrenamientos personalizados o elige entre nuestras rutinas preestablecidas.'
                                : 'Design custom workouts or pick from our pre-built routines.'}
                        </p>
                    </div>
                    <div onClick={() => setModal({ tipo: 'crear' })} className="cursor-pointer">
                        <BotonPrimario>+ {t.routines.newRoutine}</BotonPrimario>
                    </div>
                </div>

                {/* Banner de éxito */}
                {mensajeExito && (
                    <div
                        className="p-4 rounded-xl flex items-center gap-3 animate-fade-in shadow-lg"
                        style={{
                            background: 'rgba(219, 240, 89, 0.12)',
                            border: '1px solid rgba(219, 240, 89, 0.35)',
                            color: 'var(--color-accent)',
                        }}
                    >
                        <Check size={20} className="shrink-0" />
                        <span className="text-sm font-semibold text-white">{mensajeExito}</span>
                    </div>
                )}

                {/* Selector de pestañas principales */}
                <div className="flex items-center gap-3 border-b border-neutral-800 pb-3">
                    <button
                        onClick={() => setTabActiva('mis_rutinas')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                            tabActiva === 'mis_rutinas'
                                ? 'bg-white text-black shadow-md'
                                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                        }`}
                    >
                        <Dumbbell size={16} />
                        <span>{locale === 'es' ? 'Mis Rutinas' : 'My Routines'}</span>
                        <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                tabActiva === 'mis_rutinas' ? 'bg-neutral-200 text-neutral-900' : 'bg-neutral-800 text-neutral-300'
                            }`}
                        >
                            {rutinas.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setTabActiva('preestablecidas')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                            tabActiva === 'preestablecidas'
                                ? 'bg-white text-black shadow-md'
                                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                        }`}
                    >
                        <Sparkles size={16} style={{ color: tabActiva === 'preestablecidas' ? '#000' : 'var(--color-accent)' }} />
                        <span>{locale === 'es' ? 'Rutinas Preestablecidas' : 'Pre-built Routines'}</span>
                        <span
                            className="px-2 py-0.5 rounded-full text-xs font-bold"
                            style={{
                                background: tabActiva === 'preestablecidas' ? 'rgba(0,0,0,0.15)' : 'rgba(219, 240, 89, 0.2)',
                                color: tabActiva === 'preestablecidas' ? '#000' : 'var(--color-accent)',
                            }}
                        >
                            {RUTINAS_PREDEFINIDAS.length}
                        </span>
                    </button>

                    <button
                        onClick={() => { setTabActiva('ia'); setRutinaIA(null); setPasoIA(0); setWizardAnswers({ objetivo:'', nivel:'', dias:0, duracion:0, equipamiento:'', zona:'' }); setExitoIA(false); }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                            tabActiva === 'ia'
                                ? 'bg-white text-black shadow-md'
                                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                        }`}
                    >
                        <Brain size={16} style={{ color: tabActiva === 'ia' ? '#000' : 'var(--color-primary)' }} />
                        <span>{locale === 'es' ? 'Rutina con IA' : 'AI Routine'}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black"
                            style={{ background: tabActiva === 'ia' ? 'rgba(0,0,0,0.15)' : 'rgba(219,240,89,0.15)', color: tabActiva === 'ia' ? '#000' : 'var(--color-primary)' }}>
                            ✨
                        </span>
                    </button>
                </div>

                {/* ═══════════════ PESTAÑA: MIS RUTINAS PERSONALIZADAS ═══════════════ */}
                {tabActiva === 'mis_rutinas' && (
                    <div className="space-y-6">
                        {/* Filtros de usuario (si tiene rutinas) */}
                        {rutinas.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                <span className="text-white font-bold text-sm">{locale === 'es' ? 'Filtros:' : 'Filters:'}</span>
                                <div onClick={() => setFiltroUsuario('Todas')} className="cursor-pointer">
                                    <FiltroBoton nombre={locale === 'es' ? 'Todas' : 'All'} activo={filtroUsuario === 'Todas'} />
                                </div>
                                {categoriasUsuario.map((cat) => (
                                    <div key={cat} onClick={() => setFiltroUsuario(cat)} className="cursor-pointer">
                                        <FiltroBoton nombre={cat} activo={filtroUsuario === cat} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Estado cargando */}
                        {cargando && (
                            <div className="py-12 text-center">
                                <Loading />
                                <p className="text-neutral-500 text-xs mt-3">
                                    {locale === 'es'
                                        ? `Cargando rutinas… ${(elapsedMs / 1000).toFixed(1)}s`
                                        : `Loading routines… ${(elapsedMs / 1000).toFixed(1)}s`}
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-300">
                                <span>⚠️ {error}</span>
                                <button
                                    onClick={() => refrescar()}
                                    className="self-start sm:self-auto px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer"
                                >
                                    {locale === 'es' ? 'Reintentar conexión' : 'Retry connection'}
                                </button>
                            </div>
                        )}

                        {/* Estado vacío general cuando no hay ninguna rutina */}
                        {!cargando && rutinas.length === 0 && (
                            <div className="py-14 px-6 text-center rounded-2xl border border-dashed border-neutral-800 flex flex-col items-center justify-center gap-4 bg-neutral-900/30">
                                <div className="w-14 h-14 rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-400">
                                    <Dumbbell size={28} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">
                                        {locale === 'es' ? 'No hay ninguna rutina aún. ¡Crea una!' : 'No routines yet. Create one!'}
                                    </h3>
                                    <p className="text-neutral-400 text-sm max-w-md mx-auto">
                                        {locale === 'es'
                                            ? 'Crea tu propia rutina desde cero o añade una de nuestras rutinas preestablecidas listas para entrenar.'
                                            : 'Create your custom routine from scratch or pick one of our pre-built routines ready to train.'}
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                                    <button
                                        onClick={() => setModal({ tipo: 'crear' })}
                                        className="btn btn-secondary text-sm font-semibold flex items-center gap-2"
                                    >
                                        <Plus size={16} />
                                        {locale === 'es' ? 'Crear rutina personalizada' : 'Create custom routine'}
                                    </button>
                                    <button
                                        onClick={() => setTabActiva('preestablecidas')}
                                        className="btn text-sm font-bold flex items-center gap-2"
                                        style={{ background: 'var(--color-accent)', color: '#000' }}
                                    >
                                        <Sparkles size={16} />
                                        {locale === 'es' ? 'Explorar rutinas preestablecidas' : 'Explore pre-built routines'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Estado vacío por filtro */}
                        {!cargando && rutinas.length > 0 && rutinasUsuarioFiltradas.length === 0 && (
                            <p className="text-neutral-500 text-center py-10">
                                {locale === 'es'
                                    ? 'No hay ninguna rutina con este filtro.'
                                    : 'No routines found for this filter.'}
                            </p>
                        )}

                        {/* Lista de rutinas del usuario */}
                        {!cargando && rutinasUsuarioFiltradas.length > 0 && (
                            <div className="space-y-4">
                                {rutinasUsuarioFiltradas.map((rutina) => (
                                    <div key={rutina.id} className="card card-hover px-6 py-5 flex items-center gap-6">
                                        {/* Icono */}
                                        <div className="w-12 h-12 rounded-xl bg-neutral-800 shrink-0 flex items-center justify-center overflow-hidden">
                                            {rutina.imageUrl ? (
                                                <img src={rutina.imageUrl} alt={rutina.nombre} className="w-full h-full object-cover" />
                                            ) : (
                                                <Dumbbell size={22} className="text-neutral-400" />
                                            )}
                                        </div>

                                        {/* Info y enlace a entrenamiento */}
                                        {contarEjercicios(rutina) > 0 ? (
                                            <Link
                                                to="/mis-rutinas/entrenamiento"
                                                state={{ nombre: rutina.nombre, rutinaId: rutina.id }}
                                                className="flex-1 min-w-0"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-white text-base truncate">{rutina.nombre}</h3>
                                                    <span
                                                        className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full shadow-sm"
                                                        style={{ background: 'var(--color-primary)', color: '#000000' }}
                                                    >
                                                        {rutina.categoria}
                                                    </span>
                                                </div>
                                                <p className="text-neutral-400 text-sm mt-0.5">
                                                    {contarEjercicios(rutina)} {t.routines.exercises.toLowerCase()} · {rutina.duracion} {t.routines.min}
                                                </p>
                                            </Link>
                                        ) : (
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-white text-base truncate">{rutina.nombre}</h3>
                                                    <span
                                                        className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full shadow-sm"
                                                        style={{ background: 'var(--color-primary)', color: '#000000' }}
                                                    >
                                                        {rutina.categoria}
                                                    </span>
                                                </div>
                                                <p className="text-neutral-400 text-sm mt-0.5">
                                                    0 {t.routines.exercises.toLowerCase()} · {rutina.duracion} {t.routines.min}
                                                </p>
                                                <p className="text-xs mt-1" style={{ color: 'var(--color-accent)' }}>
                                                    {locale === 'es'
                                                        ? 'Añade ejercicios con el botón de lista para poder iniciar'
                                                        : 'Add exercises with the list button to start'}
                                                </p>
                                            </div>
                                        )}

                                        {/* Acciones */}
                                        <div className="card-actions shrink-0" style={{ opacity: 1 }}>
                                            <button
                                                className="card-action-btn info"
                                                title={t.routines.addExercises}
                                                onClick={() => setModal({ tipo: 'ejercicios', rutina })}
                                            >
                                                <ListPlus size={15} />
                                            </button>
                                            <button
                                                className="card-action-btn"
                                                title={t.routines.editRoutine}
                                                onClick={() => setModal({ tipo: 'editar', rutina })}
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                className="card-action-btn danger"
                                                title={t.routines.deleteRoutine}
                                                onClick={() => setModal({ tipo: 'confirmarEliminar', rutina })}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════════════ PESTAÑA: RUTINAS PREESTABLECIDAS ═══════════════ */}
                {tabActiva === 'preestablecidas' && (
                    <div className="space-y-6">
                        {/* Filtros de categoría para preestablecidas */}
                        <div className="flex flex-wrap items-center gap-2 md:gap-3">
                            <span className="text-white font-bold text-sm">{locale === 'es' ? 'Categoría:' : 'Category:'}</span>
                            {categoriasPredefinidas.map((cat) => (
                                <div key={cat} onClick={() => setFiltroPredefinidas(cat)} className="cursor-pointer">
                                    <FiltroBoton
                                        nombre={cat === 'Todas' && locale !== 'es' ? 'All' : cat}
                                        activo={filtroPredefinidas === cat}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Grid de tarjetas de rutinas preestablecidas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
                            {rutinasPredefinidasFiltradas.map((plantilla) => {
                                const isExpanded = rutinaExpandida === plantilla.id;
                                const isAdding = adoptandoId === plantilla.id;
                                const nivelBadgeColor = NIVEL_COLOR[plantilla.nivel] || '#34d399';

                                return (
                                    <div
                                        key={plantilla.id}
                                        className="card card-hover p-5 flex flex-col justify-between rounded-2xl relative overflow-hidden transition-all duration-300"
                                        style={{
                                            border: `1px solid rgba(255, 255, 255, 0.08)`,
                                        }}
                                    >
                                        <div className="space-y-3">
                                            {/* Insignias: Categoría, Nivel y Duración */}
                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm"
                                                        style={{
                                                            background: plantilla.color,
                                                            color: ['#4361EE', '#8b5cf6'].includes(plantilla.color) ? '#ffffff' : '#000000',
                                                            border: '1px solid rgba(0, 0, 0, 0.15)',
                                                        }}
                                                    >
                                                        {plantilla.categoria}
                                                    </span>
                                                    <span
                                                        className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm"
                                                        style={{
                                                            background: nivelBadgeColor,
                                                            color: '#000000',
                                                            border: '1px solid rgba(0, 0, 0, 0.15)',
                                                        }}
                                                    >
                                                        {plantilla.nivel}
                                                    </span>
                                                </div>

                                                <span className="text-xs text-neutral-400 flex items-center gap-1 font-medium">
                                                    <Clock size={13} />
                                                    {plantilla.duracion} {t.routines.min}
                                                </span>
                                            </div>

                                            {/* Título de la rutina */}
                                            <h3 className="font-extrabold text-white text-lg leading-snug">
                                                {locale === 'es' ? plantilla.nombre : plantilla.nombreEn}
                                            </h3>

                                            {/* Descripción */}
                                            <p className="text-neutral-400 text-xs leading-relaxed">
                                                {locale === 'es' ? plantilla.descripcion : plantilla.descripcionEn}
                                            </p>

                                            {/* Desplegable / Vista previa de los ejercicios incluidos */}
                                            <div className="pt-2 border-t border-neutral-800/80">
                                                <button
                                                    type="button"
                                                    onClick={() => setRutinaExpandida(isExpanded ? null : plantilla.id)}
                                                    className="w-full flex items-center justify-between text-xs font-bold py-1.5 transition-colors"
                                                    style={{ color: 'var(--color-white)' }}
                                                >
                                                    <span className="flex items-center gap-1.5">
                                                        <Dumbbell size={14} style={{ color: plantilla.color }} />
                                                        {locale === 'es'
                                                            ? `Ver ejercicios incluidos (${plantilla.ejercicios.length})`
                                                            : `Included exercises (${plantilla.ejercicios.length})`}
                                                    </span>
                                                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                                </button>

                                                {isExpanded && (
                                                    <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-neutral-800">
                                                        {plantilla.ejercicios.map((ej, idx) => (
                                                            <div key={ej.id} className="flex items-center gap-2 text-xs">
                                                                <span
                                                                    className="w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0"
                                                                    style={{
                                                                        background: 'var(--color-neutral-800)',
                                                                        color: 'var(--color-neutral-1000)',
                                                                    }}
                                                                >
                                                                    {idx + 1}
                                                                </span>
                                                                <Link
                                                                    to={`/ejercicios/${ej.id}`}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-neutral-300 hover:text-white hover:underline truncate transition-colors"
                                                                    title={`${ej.nombre} (${locale === 'es' ? 'Ver detalle' : 'View details'})`}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    {ej.nombre}
                                                                </Link>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Botón para coger/adoptar la rutina */}
                                        <div className="mt-5 pt-3 border-t border-neutral-800/60">
                                            <button
                                                type="button"
                                                disabled={isAdding}
                                                onClick={() => handleCogerRutina(plantilla)}
                                                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 shadow-md active:scale-98 cursor-pointer"
                                                style={{
                                                    background: 'var(--color-accent)',
                                                    color: '#000',
                                                    opacity: isAdding ? 0.7 : 1,
                                                }}
                                            >
                                                {isAdding ? (
                                                    <span>{locale === 'es' ? 'Añadiendo rutina…' : 'Adding routine…'}</span>
                                                ) : (
                                                    <>
                                                        <Plus size={15} strokeWidth={3} />
                                                        <span>{locale === 'es' ? 'Coger esta rutina' : 'Add this routine'}</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ═══════════════ PESTAÑA: RUTINA CON IA ═══════════════════════════════ */}
                {tabActiva === 'ia' && (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="text-center space-y-3 py-2">
                            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
                                style={{ background: 'rgba(219,240,89,0.1)', border: '1px solid rgba(219,240,89,0.25)' }}>
                                <Brain size={28} style={{ color: 'var(--color-primary)' }} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white">
                                    {locale === 'es' ? 'Rutina Personalizada con IA' : 'AI-Powered Custom Routine'}
                                </h2>
                                <p className="text-neutral-400 text-sm mt-1 max-w-sm mx-auto">
                                    {locale === 'es'
                                        ? 'Responde 6 preguntas y crearé tu rutina ideal al instante.'
                                        : "Answer 6 questions and I'll build your ideal routine instantly."}
                                </p>
                            </div>
                        </div>

                        {/* Wizard steps */}
                        {!rutinaIA && !generando && (
                            <div className="space-y-5 max-w-lg mx-auto w-full">
                                {/* Progress bar */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1">
                                        {[0,1,2,3,4,5].map(i => (
                                            <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                                                style={{ backgroundColor: i < pasoIA ? 'var(--color-primary)' : i === pasoIA ? 'rgba(219,240,89,0.45)' : 'rgba(255,255,255,0.08)' }} />
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                                            {locale === 'es' ? `Paso ${pasoIA + 1} de 6` : `Step ${pasoIA + 1} of 6`}
                                        </p>
                                        {pasoIA > 0 && (
                                            <button onClick={() => setPasoIA(p => Math.max(0, p - 1))}
                                                className="flex items-center gap-1 text-[10px] text-neutral-500 hover:text-white transition-colors font-bold uppercase tracking-widest">
                                                <ArrowLeft size={11} />
                                                {locale === 'es' ? 'Atrás' : 'Back'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Step 0: Objetivo */}
                                {pasoIA === 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-base font-bold text-white">{locale === 'es' ? '¿Cuál es tu objetivo principal?' : 'What is your main goal?'}</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {([
                                                { value: 'ganar_musculo', icon: '💪', label: locale === 'es' ? 'Ganar músculo' : 'Build muscle', sub: locale === 'es' ? 'Más volumen y fuerza' : 'More size & strength', color: '#DBF059' },
                                                { value: 'perder_peso', icon: '🔥', label: locale === 'es' ? 'Perder peso' : 'Lose weight', sub: locale === 'es' ? 'Quemar grasa' : 'Burn fat', color: '#f59e0b' },
                                                { value: 'resistencia', icon: '🏃', label: locale === 'es' ? 'Resistencia' : 'Endurance', sub: locale === 'es' ? 'Aguante y cardio' : 'Stamina & cardio', color: '#4361EE' },
                                                { value: 'flexibilidad', icon: '🧘', label: locale === 'es' ? 'Flexibilidad' : 'Flexibility', sub: locale === 'es' ? 'Movilidad y elasticidad' : 'Mobility & stretching', color: '#34d399' },
                                            ] as const).map(opt => (
                                                <button key={opt.value}
                                                    onClick={() => { setWizardAnswers(p => ({ ...p, objetivo: opt.value })); setPasoIA(1); }}
                                                    className="p-4 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
                                                    style={{ background: wizardAnswers.objetivo === opt.value ? `${opt.color}18` : 'rgba(255,255,255,0.03)', border: wizardAnswers.objetivo === opt.value ? `2px solid ${opt.color}` : '2px solid rgba(255,255,255,0.07)' }}
                                                >
                                                    <div className="text-2xl mb-2">{opt.icon}</div>
                                                    <div className="font-bold text-white text-sm">{opt.label}</div>
                                                    <div className="text-neutral-500 text-[11px] mt-0.5">{opt.sub}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Step 1: Nivel */}
                                {pasoIA === 1 && (
                                    <div className="space-y-4">
                                        <h3 className="text-base font-bold text-white">{locale === 'es' ? '¿Cuál es tu nivel de experiencia?' : 'What is your experience level?'}</h3>
                                        <div className="flex flex-col gap-3">
                                            {([
                                                { value: 'principiante', icon: '🌱', label: locale === 'es' ? 'Principiante' : 'Beginner', sub: locale === 'es' ? 'Menos de 1 año entrenando' : 'Less than 1 year training', color: '#34d399' },
                                                { value: 'intermedio', icon: '🏋️', label: locale === 'es' ? 'Intermedio' : 'Intermediate', sub: locale === 'es' ? '1-3 años de experiencia' : '1-3 years of experience', color: '#f59e0b' },
                                                { value: 'avanzado', icon: '🥇', label: locale === 'es' ? 'Avanzado' : 'Advanced', sub: locale === 'es' ? 'Más de 3 años entrenando' : 'More than 3 years training', color: '#ef4444' },
                                            ] as const).map(opt => (
                                                <button key={opt.value}
                                                    onClick={() => { setWizardAnswers(p => ({ ...p, nivel: opt.value })); setPasoIA(2); }}
                                                    className="p-4 rounded-2xl flex items-center gap-4 text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                                                    style={{ background: wizardAnswers.nivel === opt.value ? `${opt.color}15` : 'rgba(255,255,255,0.03)', border: wizardAnswers.nivel === opt.value ? `2px solid ${opt.color}` : '2px solid rgba(255,255,255,0.07)' }}
                                                >
                                                    <div className="text-2xl">{opt.icon}</div>
                                                    <div>
                                                        <div className="font-bold text-white text-sm">{opt.label}</div>
                                                        <div className="text-neutral-500 text-[11px] mt-0.5">{opt.sub}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Días */}
                                {pasoIA === 2 && (
                                    <div className="space-y-4">
                                        <h3 className="text-base font-bold text-white">{locale === 'es' ? '¿Cuántos días a la semana entrenas?' : 'How many days per week do you train?'}</h3>
                                        <div className="grid grid-cols-4 gap-3">
                                            {([2, 3, 4, 5] as const).map(d => (
                                                <button key={d}
                                                    onClick={() => { setWizardAnswers(p => ({ ...p, dias: d })); setPasoIA(3); }}
                                                    className="aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-200 hover:scale-[1.04] active:scale-[0.97]"
                                                    style={{ background: wizardAnswers.dias === d ? 'rgba(219,240,89,0.15)' : 'rgba(255,255,255,0.03)', border: wizardAnswers.dias === d ? '2px solid var(--color-primary)' : '2px solid rgba(255,255,255,0.07)' }}
                                                >
                                                    <span className="text-2xl font-black" style={{ color: wizardAnswers.dias === d ? 'var(--color-primary)' : 'white' }}>{d}</span>
                                                    <span className="text-[10px] text-neutral-500 mt-1">{locale === 'es' ? 'días' : 'days'}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Duración */}
                                {pasoIA === 3 && (
                                    <div className="space-y-4">
                                        <h3 className="text-base font-bold text-white">{locale === 'es' ? '¿Cuánto tiempo tienes por sesión?' : 'How much time per session?'}</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {([
                                                { mins: 30, sub: locale === 'es' ? 'Sesión express' : 'Express session' },
                                                { mins: 45, sub: locale === 'es' ? 'Compacta y eficiente' : 'Compact & efficient' },
                                                { mins: 60, sub: locale === 'es' ? 'Sesión completa' : 'Full session' },
                                                { mins: 90, sub: locale === 'es' ? 'Entrenamiento intensivo' : 'Intensive training' },
                                            ] as const).map(opt => (
                                                <button key={opt.mins}
                                                    onClick={() => { setWizardAnswers(p => ({ ...p, duracion: opt.mins })); setPasoIA(4); }}
                                                    className="p-4 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
                                                    style={{ background: wizardAnswers.duracion === opt.mins ? 'rgba(219,240,89,0.15)' : 'rgba(255,255,255,0.03)', border: wizardAnswers.duracion === opt.mins ? '2px solid var(--color-primary)' : '2px solid rgba(255,255,255,0.07)' }}
                                                >
                                                    <div className="text-2xl font-black" style={{ color: wizardAnswers.duracion === opt.mins ? 'var(--color-primary)' : 'white' }}>{opt.mins} min</div>
                                                    <div className="text-neutral-500 text-[11px] mt-1">{opt.sub}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Equipamiento */}
                                {pasoIA === 4 && (
                                    <div className="space-y-4">
                                        <h3 className="text-base font-bold text-white">{locale === 'es' ? '¿Qué equipamiento tienes disponible?' : 'What equipment do you have?'}</h3>
                                        <div className="flex flex-col gap-3">
                                            {([
                                                { value: 'ninguno', icon: '🤸', label: locale === 'es' ? 'Sin equipamiento' : 'No equipment', sub: locale === 'es' ? 'Calistenia y peso corporal' : 'Calisthenics & bodyweight', color: '#34d399' },
                                                { value: 'basico', icon: '🏠', label: locale === 'es' ? 'Equipamiento básico' : 'Basic equipment', sub: locale === 'es' ? 'Mancuernas, barra, bandas' : 'Dumbbells, barbell, bands', color: '#f59e0b' },
                                                { value: 'completo', icon: '🏢', label: locale === 'es' ? 'Gimnasio completo' : 'Full gym access', sub: locale === 'es' ? 'Todo disponible' : 'All equipment available', color: '#4361EE' },
                                            ] as const).map(opt => (
                                                <button key={opt.value}
                                                    onClick={() => { setWizardAnswers(p => ({ ...p, equipamiento: opt.value })); setPasoIA(5); }}
                                                    className="p-4 rounded-2xl flex items-center gap-4 text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                                                    style={{ background: wizardAnswers.equipamiento === opt.value ? `${opt.color}15` : 'rgba(255,255,255,0.03)', border: wizardAnswers.equipamiento === opt.value ? `2px solid ${opt.color}` : '2px solid rgba(255,255,255,0.07)' }}
                                                >
                                                    <div className="text-2xl">{opt.icon}</div>
                                                    <div>
                                                        <div className="font-bold text-white text-sm">{opt.label}</div>
                                                        <div className="text-neutral-500 text-[11px] mt-0.5">{opt.sub}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Step 5: Zona */}
                                {pasoIA === 5 && (
                                    <div className="space-y-4">
                                        <h3 className="text-base font-bold text-white">{locale === 'es' ? '¿Qué zona quieres trabajar?' : 'Which area to focus on?'}</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {([
                                                { value: 'completo', icon: '🔄', label: locale === 'es' ? 'Cuerpo completo' : 'Full body', sub: locale === 'es' ? 'Todo a la vez' : 'Everything at once', color: '#DBF059' },
                                                { value: 'superior', icon: '👆', label: locale === 'es' ? 'Tren superior' : 'Upper body', sub: locale === 'es' ? 'Pecho, espalda, brazos' : 'Chest, back, arms', color: '#f59e0b' },
                                                { value: 'inferior', icon: '👇', label: locale === 'es' ? 'Tren inferior' : 'Lower body', sub: locale === 'es' ? 'Piernas y glúteos' : 'Legs & glutes', color: '#4361EE' },
                                                { value: 'core', icon: '⭕', label: 'Core', sub: locale === 'es' ? 'Abdominales y lumbar' : 'Abs & lower back', color: '#34d399' },
                                            ] as const).map(opt => (
                                                <button key={opt.value}
                                                    onClick={() => {
                                                        const newAnswers = { ...wizardAnswers, zona: opt.value };
                                                        setWizardAnswers(newAnswers);
                                                        setGenerando(true);
                                                        setTimeout(() => {
                                                            const rutina = generarRutinaIA(newAnswers, ejerciciosDB, locale);
                                                            setRutinaIA(rutina);
                                                            setGenerando(false);
                                                        }, 2200);
                                                    }}
                                                    className="p-4 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
                                                    style={{ background: wizardAnswers.zona === opt.value ? `${opt.color}18` : 'rgba(255,255,255,0.03)', border: wizardAnswers.zona === opt.value ? `2px solid ${opt.color}` : '2px solid rgba(255,255,255,0.07)' }}
                                                >
                                                    <div className="text-2xl mb-2">{opt.icon}</div>
                                                    <div className="font-bold text-white text-sm">{opt.label}</div>
                                                    <div className="text-neutral-500 text-[11px] mt-0.5">{opt.sub}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Generating animation */}
                        {generando && (
                            <div className="py-16 text-center space-y-6">
                                <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
                                    style={{ background: 'rgba(219,240,89,0.1)', border: '1px solid rgba(219,240,89,0.25)' }}>
                                    <Brain size={28} style={{ color: 'var(--color-primary)' }} className="animate-pulse" />
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                    {[0,1,2].map(i => (
                                        <div key={i} className="w-2.5 h-2.5 rounded-full animate-bounce"
                                            style={{ backgroundColor: 'var(--color-primary)', animationDelay: `${i * 200}ms` }} />
                                    ))}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-white font-bold text-sm">{locale === 'es' ? 'Analizando tu perfil…' : 'Analyzing your profile…'}</p>
                                    <p className="text-neutral-500 text-xs">{locale === 'es' ? 'Seleccionando los mejores ejercicios para ti' : 'Selecting the best exercises for you'}</p>
                                </div>
                            </div>
                        )}

                        {/* Generated routine result */}
                        {rutinaIA && !generando && (
                            <div className="space-y-5 max-w-lg mx-auto w-full">
                                {/* Result header card */}
                                <div className="p-5 rounded-2xl space-y-3"
                                    style={{ background: `${rutinaIA.color}10`, border: `1px solid ${rutinaIA.color}30` }}>
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                                                style={{ background: rutinaIA.color, color: rutinaIA.color === '#4361EE' ? '#fff' : '#000' }}>
                                                {rutinaIA.categoria}
                                            </span>
                                            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-white">
                                                {rutinaIA.nivel}
                                            </span>
                                            <span className="text-xs text-neutral-400 flex items-center gap-1">
                                                <Clock size={12} />{rutinaIA.duracion} {t.routines.min}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => { setRutinaIA(null); setPasoIA(5); setWizardAnswers(p => ({ ...p, zona: '' })); }}
                                            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors"
                                        >
                                            <RefreshCw size={12} />{locale === 'es' ? 'Regenerar' : 'Regenerate'}
                                        </button>
                                    </div>
                                    <h3 className="text-xl font-black text-white leading-tight">{rutinaIA.nombre}</h3>
                                    <p className="text-[11px] text-neutral-400">
                                        {rutinaIA.ejercicios.length} {locale === 'es' ? 'ejercicios' : 'exercises'} · {rutinaIA.objetivo} · {rutinaIA.zona}
                                    </p>
                                </div>

                                {/* Exercise list */}
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 ml-1">
                                        {locale === 'es' ? 'Ejercicios incluidos' : 'Included exercises'}
                                    </h4>
                                    {rutinaIA.ejercicios.map((ej, i) => (
                                        <div key={ej.id} className="flex items-center gap-3 p-3 rounded-xl"
                                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                            <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-black text-[11px]"
                                                style={{ background: `${rutinaIA.color}20`, color: rutinaIA.color }}>
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-sm font-bold truncate">{ej.nombre}</p>
                                                {ej.grupo && <p className="text-neutral-500 text-[11px]">{ej.grupo}</p>}
                                            </div>
                                            <span className="text-[10px] font-black px-2 py-1 rounded-lg shrink-0"
                                                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-neutral-2000)' }}>
                                                {ej.desc}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Save actions */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <button
                                        onClick={async () => {
                                            if (!rutinaIA) return;
                                            setGuardandoIA(true);
                                            try {
                                                await agregarRutina({
                                                    nombre: rutinaIA.nombre,
                                                    categoria: rutinaIA.categoria,
                                                    duracion: rutinaIA.duracion,
                                                    ejerciciosIds: rutinaIA.ejercicios.map(e => e.id),
                                                });
                                                setExitoIA(true);
                                                setMensajeExito(locale === 'es' ? `¡Rutina "${rutinaIA.nombre}" guardada!` : `Routine "${rutinaIA.nombre}" saved!`);
                                                setTimeout(() => {
                                                    setTabActiva('mis_rutinas');
                                                    setRutinaIA(null); setPasoIA(0);
                                                    setWizardAnswers({ objetivo:'', nivel:'', dias:0, duracion:0, equipamiento:'', zona:'' });
                                                    setMensajeExito(null);
                                                }, 2000);
                                            } catch { /* ignore */ }
                                            finally { setGuardandoIA(false); }
                                        }}
                                        disabled={guardandoIA || exitoIA}
                                        className="flex-1 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
                                        style={{ background: exitoIA ? '#34d399' : rutinaIA.color, color: '#000' }}
                                    >
                                        <Dumbbell size={15} />
                                        {guardandoIA ? (locale === 'es' ? 'Guardando…' : 'Saving…') : exitoIA ? '✓ Guardado' : (locale === 'es' ? 'Guardar en Mis Rutinas' : 'Save to My Routines')}
                                    </button>
                                    <button
                                        onClick={() => { setRutinaIA(null); setPasoIA(0); setWizardAnswers({ objetivo:'', nivel:'', dias:0, duracion:0, equipamiento:'', zona:'' }); setExitoIA(false); }}
                                        className="px-5 py-3 rounded-xl font-bold text-sm text-neutral-400 hover:text-white transition-colors"
                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                                    >
                                        {locale === 'es' ? 'Empezar de nuevo' : 'Start over'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal: Crear / Editar rutina */}
            {(modal?.tipo === 'crear' || modal?.tipo === 'editar') && (
                <FormularioRutina
                    rutina={modal.tipo === 'editar' ? modal.rutina : null}
                    onGuardar={handleGuardarRutina}
                    onCerrar={() => setModal(null)}
                />
            )}

            {/* Modal: Gestionar ejercicios */}
            {modal?.tipo === 'ejercicios' && (
                <EditarEjerciciosRutina
                    rutina={modal.rutina}
                    onGuardar={handleGuardarEjercicios}
                    onCerrar={() => setModal(null)}
                />
            )}

            {/* Modal: Confirmar eliminación */}
            {modal?.tipo === 'confirmarEliminar' && (
                <div className="modal-overlay" onClick={() => setModal(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="text-lg font-bold text-white">{t.routines.deleteRoutine}</h2>
                            <button className="modal-close-btn" onClick={() => setModal(null)}><X size={16} /></button>
                        </div>
                        <div className="modal-form">
                            <p className="text-neutral-300 text-sm">
                                ¿Seguro que quieres eliminar <strong className="text-white">"{modal.rutina.nombre}"</strong>?
                                {` ${t.routines.confirmDeleteDesc}`}
                            </p>
                            <div className="modal-actions">
                                <button className="btn btn-secondary" onClick={() => setModal(null)}>{t.routines.cancel}</button>
                                <button
                                    className="btn"
                                    style={{ background: '#ef4444', color: 'white' }}
                                    onClick={handleEliminar}
                                >
                                    {t.routines.delete}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}