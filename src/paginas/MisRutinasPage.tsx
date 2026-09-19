import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout, TituloPagina, FiltroBoton, BotonPrimario, Loading } from "../componentes";
import { useRutinas } from '../context/RutinasContext';
import type { Rutina } from '../context/RutinasContext';
import FormularioRutina from '../componentes/forms/FormularioRutina';
import EditarEjerciciosRutina from '../componentes/forms/EditarEjerciciosRutina';
import { Pencil, Trash2, ListPlus, X, Dumbbell, Sparkles, Check, Clock, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { RUTINAS_PREDEFINIDAS, NIVEL_COLOR, type RutinaTemplate } from '../data/rutinasPredefinidas';

type Modal =
    | { tipo: 'crear' }
    | { tipo: 'editar'; rutina: Rutina }
    | { tipo: 'ejercicios'; rutina: Rutina }
    | { tipo: 'confirmarEliminar'; rutina: Rutina }
    | null;

export default function MisRutinasPage() {
    const { rutinas, cargando, error, carga, agregarRutina, editarRutina, eliminarRutina, actualizarEjerciciosRutina } = useRutinas();
    const { t, locale } = useI18n();

    // Pestaña principal: 'mis_rutinas' o 'preestablecidas'
    const [tabActiva, setTabActiva] = useState<'mis_rutinas' | 'preestablecidas'>('mis_rutinas');

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

                        {error && <p className="text-red-400 text-sm">{error}</p>}

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
                                                        className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full"
                                                        style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--color-neutral-2000)' }}
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
                                                        className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full"
                                                        style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--color-neutral-2000)' }}
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
                                                        className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                                                        style={{
                                                            background: `${plantilla.color}22`,
                                                            color: plantilla.color,
                                                            border: `1px solid ${plantilla.color}44`,
                                                        }}
                                                    >
                                                        {plantilla.categoria}
                                                    </span>
                                                    <span
                                                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                                        style={{
                                                            background: `${nivelBadgeColor}18`,
                                                            color: nivelBadgeColor,
                                                            border: `1px solid ${nivelBadgeColor}33`,
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