import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Rutina } from '../../context/RutinasContext';
import { useEjercicios, type Ejercicio } from '../../context/EjerciciosContext';
import { RUTINAS_PREDEFINIDAS, getCategoriaColor } from '../../data/rutinasPredefinidas';
import { X, Plus, Eye, ArrowUp, ArrowDown, Search, Dumbbell, Lock, Globe } from 'lucide-react';

interface FormularioRutinaProps {
    rutina?: Rutina | null;
    onGuardar: (data: { nombre: string; categoria: string; duracion: number; ejerciciosIds: number[]; is_public?: boolean }) => Promise<void>;
    onCerrar: () => void;
}

const CATEGORIAS = [
    'Fuerza',
    'Cardio',
    'Empuje',
    'Tirón',
    'Pierna',
    'Calistenia',
    'Core',
    'Movilidad',
    'Hipertrofia',
    'Funcional',
];

const FILTROS_MUSCULARES = [
    'Todos',
    'Pecho',
    'Espalda',
    'Piernas',
    'Hombros',
    'Brazos',
    'Core',
    'Cardio',
];

export default function FormularioRutina({ rutina, onGuardar, onCerrar }: FormularioRutinaProps) {
    const { ejercicios } = useEjercicios();

    const [nombre, setNombre] = useState('');
    const [categoria, setCategoria] = useState(CATEGORIAS[0]);
    const [duracion, setDuracion] = useState(45);
    const [isPublic, setIsPublic] = useState(false);
    const [seleccionados, setSeleccionados] = useState<number[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [filtroMusculo, setFiltroMusculo] = useState('Todos');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (rutina) {
            setNombre(rutina.nombre);
            setCategoria(rutina.categoria);
            setDuracion(rutina.duracion);
            setIsPublic(rutina.is_public ?? false);
            setSeleccionados(rutina.ejerciciosIds || []);
        } else {
            setIsPublic(false); // Por defecto privada
        }
    }, [rutina]);

    // Pool de ejercicios: base de datos o fallback de plantillas predefinidas
    const fallbackEjercicios: Ejercicio[] = useMemo(() => {
        return RUTINAS_PREDEFINIDAS.flatMap(r => r.ejercicios.map(e => ({
            id: e.id,
            nombre: e.nombre,
            grupo: r.categoria,
            musculosPrimarios: [],
            musculosSecundarios: [],
            categoriaEjercicio: r.categoria.toLowerCase(),
            dificultad: r.nivel.toLowerCase(),
            descripcion: '',
            instruccionesPasos: [],
            esPublico: true,
        })));
    }, []);

    const allEjercicios = useMemo(() => {
        const pool = (ejercicios && ejercicios.length > 0) ? ejercicios : fallbackEjercicios;
        const map = new Map<number, Ejercicio>();
        pool.forEach(e => {
            if (!map.has(e.id)) map.set(e.id, e);
        });
        return Array.from(map.values());
    }, [ejercicios, fallbackEjercicios]);

    // Ejercicios seleccionados en orden de inclusión
    const enRutina = useMemo(() => {
        return seleccionados.map(id => {
            const encontrado = allEjercicios.find(e => e.id === id);
            return encontrado || {
                id,
                nombre: `Ejercicio #${id}`,
                grupo: '',
                musculosPrimarios: [],
                musculosSecundarios: [],
                categoriaEjercicio: '',
                dificultad: '',
                descripcion: '',
                instruccionesPasos: [],
                esPublico: true,
            };
        });
    }, [seleccionados, allEjercicios]);

    // Filtrar ejercicios disponibles
    const disponibles = useMemo(() => {
        const query = busqueda.trim().toLowerCase();
        return allEjercicios.filter(e => {
            if (seleccionados.includes(e.id)) return false;

            // Filtro por texto
            const matchTexto = !query ||
                e.nombre.toLowerCase().includes(query) ||
                (e.grupo && e.grupo.toLowerCase().includes(query)) ||
                (e.categoriaEjercicio && e.categoriaEjercicio.toLowerCase().includes(query)) ||
                e.musculosPrimarios.some(m => m.toLowerCase().includes(query));

            if (!matchTexto) return false;

            // Filtro por grupo muscular
            if (filtroMusculo === 'Todos') return true;

            const allM = [
                e.grupo ?? '',
                e.categoriaEjercicio ?? '',
                ...(e.musculosPrimarios ?? []),
                ...(e.musculosSecundarios ?? []),
                e.nombre,
            ].join(' ').toLowerCase();

            switch (filtroMusculo) {
                case 'Pecho':
                    return allM.includes('pecho') || allM.includes('chest') || allM.includes('pectoral');
                case 'Espalda':
                    return allM.includes('espalda') || allM.includes('back') || allM.includes('dorsal') || allM.includes('lat') || allM.includes('trapecio');
                case 'Piernas':
                    return allM.includes('pierna') || allM.includes('leg') || allM.includes('quad') || allM.includes('cuádricep') || allM.includes('glúteo') || allM.includes('glute') || allM.includes('femoral') || allM.includes('isquio') || allM.includes('gemelo') || allM.includes('calf');
                case 'Hombros':
                    return allM.includes('hombro') || allM.includes('shoulder') || allM.includes('deltoid');
                case 'Brazos':
                    return allM.includes('brazo') || allM.includes('arm') || allM.includes('bicep') || allM.includes('bícep') || allM.includes('tricep') || allM.includes('trícep') || allM.includes('antebrazo');
                case 'Core':
                    return allM.includes('core') || allM.includes('abs') || allM.includes('abdom') || allM.includes('oblicuo') || allM.includes('lumbar');
                case 'Cardio':
                    return allM.includes('cardio') || allM.includes('plyometric') || allM.includes('salto') || allM.includes('jump') || allM.includes('burpee') || allM.includes('hiit');
                default:
                    return true;
            }
        });
    }, [allEjercicios, seleccionados, busqueda, filtroMusculo]);

    const agregar = (id: number) => {
        if (!seleccionados.includes(id)) {
            setSeleccionados(prev => [...prev, id]);
        }
    };

    const quitar = (id: number) => {
        setSeleccionados(prev => prev.filter(eid => eid !== id));
    };

    const moverArriba = (idx: number) => {
        if (idx <= 0) return;
        setSeleccionados(prev => {
            const copia = [...prev];
            const temp = copia[idx - 1];
            copia[idx - 1] = copia[idx];
            copia[idx] = temp;
            return copia;
        });
    };

    const moverAbajo = (idx: number) => {
        if (idx >= seleccionados.length - 1) return;
        setSeleccionados(prev => {
            const copia = [...prev];
            const temp = copia[idx + 1];
            copia[idx + 1] = copia[idx];
            copia[idx] = temp;
            return copia;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim()) return;
        setLoading(true);
        setError(null);
        try {
            await onGuardar({
                nombre: nombre.trim(),
                categoria,
                duracion,
                ejerciciosIds: seleccionados,
                is_public: isPublic,
            });
        } catch (err: any) {
            setError(err?.message ?? 'Error al guardar la rutina');
        } finally {
            setLoading(false);
        }
    };

    const catColor = getCategoriaColor(categoria);

    return (
        <div className="modal-overlay" onClick={onCerrar}>
            <div className="modal-box modal-box-lg" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
                {/* Cabecera */}
                <div className="modal-header">
                    <div className="flex items-center gap-2">
                        <Dumbbell size={20} style={{ color: catColor.bg }} />
                        <h2 className="text-lg font-bold text-white">
                            {rutina ? 'Editar Rutina' : 'Nueva Rutina'}
                        </h2>
                    </div>
                    <button className="modal-close-btn" onClick={onCerrar} title="Cerrar"><X size={16} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {/* Fila 1: Nombre */}
                    <div className="form-group">
                        <label className="form-label">Nombre <span className="text-red-400">*</span></label>
                        <input
                            className="input"
                            type="text"
                            placeholder="Ej. Torso - Hipertrofia"
                            value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    {/* Fila 2: Tipo de rutina + Duración estimada */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="form-group">
                            <div className="flex items-center justify-between">
                                <label className="form-label">Tipo de rutina</label>
                                <span
                                    className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full shadow-sm"
                                    style={{ background: catColor.bg, color: catColor.text }}
                                >
                                    {categoria}
                                </span>
                            </div>
                            <select
                                className="input"
                                value={categoria}
                                onChange={e => setCategoria(e.target.value)}
                            >
                                {CATEGORIAS.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Duración estimada (min)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    className="input"
                                    type="number"
                                    min={1}
                                    max={300}
                                    value={duracion}
                                    onChange={e => setDuracion(Number(e.target.value))}
                                />
                                <div className="flex gap-1 shrink-0">
                                    {[30, 45, 60].map(m => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => setDuracion(m)}
                                            className={`px-2 py-1 text-xs rounded-lg font-medium border transition-colors ${
                                                duracion === m
                                                    ? 'bg-neutral-800 text-white border-neutral-600'
                                                    : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:text-white'
                                            }`}
                                        >
                                            {m}'
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fila 3: Control de Privacidad */}
                    <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                                {isPublic ? (
                                    <Globe size={14} className="text-[var(--color-primary)]" />
                                ) : (
                                    <Lock size={14} className="text-neutral-400" />
                                )}
                                Privacidad de la rutina
                            </span>
                            <span className="text-[10px] text-neutral-500 font-medium">
                                Por defecto: Privada
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setIsPublic(false)}
                                className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                                    !isPublic
                                        ? 'bg-neutral-800 border-neutral-600 text-white shadow-sm'
                                        : 'bg-neutral-900/50 border-neutral-800/80 text-neutral-400 hover:text-neutral-200'
                                }`}
                            >
                                <Lock size={13} className={!isPublic ? 'text-white' : 'text-neutral-500'} />
                                <span>Privada (Solo tú)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsPublic(true)}
                                className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                                    isPublic
                                        ? 'bg-[var(--color-primary)]/15 border-[var(--color-primary)]/40 text-[var(--color-primary)] shadow-sm'
                                        : 'bg-neutral-900/50 border-neutral-800/80 text-neutral-400 hover:text-neutral-200'
                                }`}
                            >
                                <Globe size={13} className={isPublic ? 'text-[var(--color-primary)]' : 'text-neutral-500'} />
                                <span>Pública (Comunidad)</span>
                            </button>
                        </div>
                        <p className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                            {isPublic ? (
                                <>
                                    <Globe size={12} className="text-[var(--color-primary)] shrink-0" />
                                    <span>Visible en el Feed Social y en tu perfil público para que otros atletas puedan verla y clonarla.</span>
                                </>
                            ) : (
                                <>
                                    <Lock size={12} className="text-neutral-400 shrink-0" />
                                    <span>Solo tú puedes ver y entrenar con esta rutina. No aparecerá en el feed social.</span>
                                </>
                            )}
                        </p>
                    </div>

                    {/* ── SELECCIÓN DE EJERCICIOS A MANO ── */}
                    <div className="pt-2 border-t border-neutral-800/80 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                                    <span>Ejercicios de la rutina</span>
                                    <span
                                        className="text-xs px-2 py-0.2 rounded-full font-bold"
                                        style={{
                                            background: seleccionados.length > 0 ? 'rgba(219, 240, 89, 0.15)' : 'rgba(255,255,255,0.06)',
                                            color: seleccionados.length > 0 ? 'var(--color-primary)' : '#A3A3A3',
                                        }}
                                    >
                                        {seleccionados.length} {seleccionados.length === 1 ? 'ejercicio' : 'ejercicios'}
                                    </span>
                                </h3>
                                <p className="text-xs text-neutral-400 mt-0.5">
                                    Selecciona los ejercicios a mano para armar tu entrenamiento a tu gusto.
                                </p>
                            </div>
                            {seleccionados.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setSeleccionados([])}
                                    className="text-[11px] text-neutral-500 hover:text-red-400 transition-colors"
                                >
                                    Vaciar lista
                                </button>
                            )}
                        </div>

                        {/* Lista de seleccionados */}
                        <div className="ejercicios-en-rutina" style={{ maxHeight: '160px' }}>
                            {enRutina.length === 0 ? (
                                <div className="text-center py-5 px-3">
                                    <p className="text-neutral-500 text-xs">
                                        No has añadido ejercicios aún. Usa el buscador de abajo para añadirlos con <strong className="text-neutral-300">+</strong>.
                                    </p>
                                </div>
                            ) : (
                                enRutina.map((e, idx) => (
                                    <div key={e.id} className="ejercicio-item ejercicio-item-en-rutina">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="ejercicio-orden-badge shrink-0">#{idx + 1}</span>
                                            <span className="text-white text-xs sm:text-sm font-medium truncate">{e.nombre}</span>
                                            {e.grupo && (
                                                <span className="text-neutral-500 text-[11px] shrink-0 hidden sm:inline">{e.grupo}</span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <button
                                                type="button"
                                                className="ejercicio-reorden-btn"
                                                onClick={() => moverArriba(idx)}
                                                disabled={idx === 0}
                                                title="Subir de posición"
                                            >
                                                <ArrowUp size={12} />
                                            </button>
                                            <button
                                                type="button"
                                                className="ejercicio-reorden-btn"
                                                onClick={() => moverAbajo(idx)}
                                                disabled={idx === enRutina.length - 1}
                                                title="Bajar de posición"
                                            >
                                                <ArrowDown size={12} />
                                            </button>
                                            <Link
                                                to={`/ejercicios/${e.id}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-1 text-neutral-400 hover:text-[var(--color-primary)] transition-colors"
                                                title="Ver cómo se hace el ejercicio"
                                            >
                                                <Eye size={13} />
                                            </Link>
                                            <button
                                                type="button"
                                                className="ejercicio-quitar-btn"
                                                onClick={() => quitar(e.id)}
                                                title="Quitar de la rutina"
                                            >
                                                <X size={11} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Buscador y filtros para añadir ejercicios */}
                        <div className="space-y-2 pt-1">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                                <input
                                    className="input pl-9 pr-8 text-xs sm:text-sm"
                                    type="text"
                                    placeholder="Buscar ejercicio a mano (ej. press, sentadilla, dominadas)..."
                                    value={busqueda}
                                    onChange={e => setBusqueda(e.target.value)}
                                />
                                {busqueda && (
                                    <button
                                        type="button"
                                        onClick={() => setBusqueda('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                                    >
                                        <X size={13} />
                                    </button>
                                )}
                            </div>

                            {/* Chips de grupos musculares */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                                {FILTROS_MUSCULARES.map(m => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setFiltroMusculo(m)}
                                        className={`chip-filtro-musculo ${filtroMusculo === m ? 'activo' : ''}`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>

                            {/* Lista de disponibles */}
                            <div className="ejercicios-disponibles" style={{ maxHeight: '180px' }}>
                                {disponibles.length === 0 ? (
                                    <p className="text-neutral-500 text-xs text-center py-4">
                                        {busqueda || filtroMusculo !== 'Todos'
                                            ? 'No se encontraron ejercicios con ese criterio.'
                                            : 'Todos los ejercicios disponibles ya están añadidos.'}
                                    </p>
                                ) : (
                                    disponibles.slice(0, 60).map(e => {
                                        const badgeCatColor = getCategoriaColor(e.categoriaEjercicio || e.grupo);
                                        return (
                                            <div key={e.id} className="ejercicio-item ejercicio-item-disponible">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="text-white text-xs sm:text-sm font-medium truncate">{e.nombre}</span>
                                                    {e.grupo && (
                                                        <span className="text-neutral-500 text-[11px] shrink-0 hidden sm:inline">{e.grupo}</span>
                                                    )}
                                                    {e.categoriaEjercicio && (
                                                        <span
                                                            className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0"
                                                            style={{
                                                                background: badgeCatColor.bg,
                                                                color: badgeCatColor.text,
                                                            }}
                                                        >
                                                            {e.categoriaEjercicio}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <Link
                                                        to={`/ejercicios/${e.id}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="p-1 text-neutral-400 hover:text-[var(--color-primary)] transition-colors"
                                                        title="Ver detalles del ejercicio"
                                                    >
                                                        <Eye size={13} />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        className="ejercicio-agregar-btn"
                                                        onClick={() => agregar(e.id)}
                                                        title="Añadir a la rutina"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}

                    {/* Botones de acción */}
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onCerrar} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading
                                ? 'Guardando...'
                                : rutina
                                ? 'Guardar cambios'
                                : seleccionados.length > 0
                                ? `Crear rutina (${seleccionados.length} ejercicios)`
                                : 'Crear rutina'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
