import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout, TituloPagina, FiltroBoton, BotonPrimario, Loading } from "../componentes";
import { useRutinas } from '../context/RutinasContext';
import type { Rutina } from '../context/RutinasContext';
import FormularioRutina from '../componentes/forms/FormularioRutina';
import EditarEjerciciosRutina from '../componentes/forms/EditarEjerciciosRutina';
import { Pencil, Trash2, ListPlus, X } from 'lucide-react';

type Modal =
    | { tipo: 'crear' }
    | { tipo: 'editar'; rutina: Rutina }
    | { tipo: 'ejercicios'; rutina: Rutina }
    | { tipo: 'confirmarEliminar'; rutina: Rutina }
    | null;

export default function MisRutinasPage() {
    const { rutinas, cargando, error, agregarRutina, editarRutina, eliminarRutina, actualizarEjerciciosRutina } = useRutinas();

    const categorias = [...new Set(rutinas.map(r => r.categoria))];
    const [filtroActivo, setFiltroActivo] = useState(categorias[0] ?? 'Fuerza');
    const [modal, setModal] = useState<Modal>(null);

    const rutinasFiltradas = rutinas.filter(r => r.categoria === filtroActivo);

    const handleGuardarRutina = async (data: { nombre: string; categoria: string; duracion: number }) => {
        if (modal?.tipo === 'crear') {
            await agregarRutina({ ...data, ejerciciosIds: [] });
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

    const contarEjercicios = (rutina: Rutina) => rutina.ejerciciosIds.length;

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <TituloPagina titulo="Mis Rutinas" />
                    <div onClick={() => setModal({ tipo: 'crear' })} className="cursor-pointer">
                        <BotonPrimario>+ Crear Rutina</BotonPrimario>
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap items-center gap-2 md:gap-4">
                    <span className="text-white font-bold text-sm">Filtros:</span>
                    {categorias.map((cat) => (
                        <div key={cat} onClick={() => setFiltroActivo(cat)} className="cursor-pointer">
                            <FiltroBoton nombre={cat} activo={filtroActivo === cat} />
                        </div>
                    ))}
                </div>

                {/* Lista rutinas */}
                <div className="space-y-4">
                    {cargando && (
                        <div className="py-10">
                            <Loading />
                        </div>
                    )}
                    {error && (
                        <p className="text-red-400 text-sm">{error}</p>
                    )}
                    {rutinasFiltradas.length === 0 && (
                        <p className="text-neutral-500 text-center py-10">
                            No hay rutinas de {filtroActivo.toLowerCase()}. ¡Crea una!
                        </p>
                    )}
                    {rutinasFiltradas.map((rutina) => (
                        <div key={rutina.id} className="card card-hover px-6 py-5 flex items-center gap-6">
                            {/* Icono placeholder */}
                            <div className="w-12 h-12 rounded-xl bg-neutral-800 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                {rutina.imageUrl ? (
                                    <img src={rutina.imageUrl} alt={rutina.nombre} className="w-full h-full object-cover" />
                                ) : (
                                    <svg className="w-6 h-6 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                )}
                            </div>
                            {/* Info */}
                            <Link
                                to="/mis-rutinas/entrenamiento"
                                state={{ nombre: rutina.nombre }}
                                className="flex-1 min-w-0"
                            >
                                <h3 className="font-bold text-white text-base truncate">{rutina.nombre}</h3>
                                <p className="text-neutral-400 text-sm">
                                    {contarEjercicios(rutina)} ejercicios · {rutina.duracion} min
                                </p>
                            </Link>
                            {/* Acciones */}
                            <div className="card-actions flex-shrink-0" style={{ opacity: 1 }}>
                                <button
                                    className="card-action-btn info"
                                    title="Gestionar ejercicios"
                                    onClick={() => setModal({ tipo: 'ejercicios', rutina })}
                                >
                                    <ListPlus size={15} />
                                </button>
                                <button
                                    className="card-action-btn"
                                    title="Editar rutina"
                                    onClick={() => setModal({ tipo: 'editar', rutina })}
                                >
                                    <Pencil size={14} />
                                </button>
                                <button
                                    className="card-action-btn danger"
                                    title="Eliminar rutina"
                                    onClick={() => setModal({ tipo: 'confirmarEliminar', rutina })}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
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
                            <h2 className="text-lg font-bold text-white">Eliminar Rutina</h2>
                            <button className="modal-close-btn" onClick={() => setModal(null)}><X size={16} /></button>
                        </div>
                        <div className="modal-form">
                            <p className="text-neutral-300 text-sm">
                                ¿Seguro que quieres eliminar <strong className="text-white">"{modal.rutina.nombre}"</strong>?
                                Esta acción no se puede deshacer.
                            </p>
                            <div className="modal-actions">
                                <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
                                <button
                                    className="btn"
                                    style={{ background: '#ef4444', color: 'white' }}
                                    onClick={handleEliminar}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
