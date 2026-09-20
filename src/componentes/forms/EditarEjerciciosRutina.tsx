import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEjercicios } from '../../context/EjerciciosContext';
import type { Rutina } from '../../context/RutinasContext';
import { X, Plus, Eye } from 'lucide-react';

interface EditarEjerciciosRutinaProps {
    rutina: Rutina;
    onGuardar: (ejerciciosIds: number[]) => void;
    onCerrar: () => void;
}

export default function EditarEjerciciosRutina({ rutina, onGuardar, onCerrar }: EditarEjerciciosRutinaProps) {
    const { ejercicios } = useEjercicios();
    const [seleccionados, setSeleccionados] = useState<number[]>(rutina.ejerciciosIds);
    const [busqueda, setBusqueda] = useState('');

    const quitar = (id: number) => setSeleccionados(prev => prev.filter(eid => eid !== id));
    const agregar = (id: number) => setSeleccionados(prev => [...prev, id]);

    const disponibles = ejercicios.filter(
        e => !seleccionados.includes(e.id) &&
            e.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    const enRutina = ejercicios.filter(e => seleccionados.includes(e.id));

    return (
        <div className="modal-overlay" onClick={onCerrar}>
            <div className="modal-box modal-box-lg" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="text-lg font-bold text-white">
                        Ejercicios de "{rutina.nombre}"
                    </h2>
                    <button className="modal-close-btn" onClick={onCerrar}><X size={16} /></button>
                </div>

                <div className="modal-form">
                    {/* Ejercicios en la rutina */}
                    <div className="form-group">
                        <label className="form-label">En la rutina ({enRutina.length})</label>
                        <div className="ejercicios-en-rutina">
                            {enRutina.length === 0 ? (
                                <p className="text-neutral-500 text-sm text-center py-4">Sin ejercicios aún. Añade alguno abajo.</p>
                            ) : (
                                enRutina.map(e => (
                                    <div key={e.id} className="ejercicio-item ejercicio-item-en-rutina flex items-center justify-between">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-white text-sm font-medium truncate">{e.nombre}</span>
                                            {e.grupo && <span className="text-neutral-500 text-xs shrink-0">{e.grupo}</span>}
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Link
                                                to={`/ejercicios/${e.id}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-1 text-neutral-400 hover:text-[var(--color-primary)] transition-colors"
                                                title="Ver cómo se hace el ejercicio"
                                            >
                                                <Eye size={14} />
                                            </Link>
                                            <button
                                                className="ejercicio-quitar-btn"
                                                onClick={() => quitar(e.id)}
                                                title="Quitar"
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Buscador de disponibles */}
                    <div className="form-group">
                        <label className="form-label">Añadir ejercicio</label>
                        <input
                            className="input"
                            type="text"
                            placeholder="Buscar ejercicio..."
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                        />
                    </div>

                    {/* Lista disponibles */}
                    <div className="ejercicios-disponibles">
                        {disponibles.length === 0 ? (
                            <p className="text-neutral-500 text-sm text-center py-4">
                                {busqueda ? 'Sin resultados.' : 'Todos los ejercicios ya están en la rutina.'}
                            </p>
                        ) : (
                            disponibles.map(e => (
                                <div key={e.id} className="ejercicio-item ejercicio-item-disponible flex items-center justify-between">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-white text-sm font-medium truncate">{e.nombre}</span>
                                        {e.grupo && <span className="text-neutral-500 text-xs shrink-0">{e.grupo}</span>}
                                        <span className="ejercicio-categoria-badge shrink-0">{e.categoriaEjercicio}</span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Link
                                            to={`/ejercicios/${e.id}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-1 text-neutral-400 hover:text-[var(--color-primary)] transition-colors"
                                            title="Ver cómo se hace el ejercicio"
                                        >
                                            <Eye size={14} />
                                        </Link>
                                        <button
                                            className="ejercicio-agregar-btn"
                                            onClick={() => agregar(e.id)}
                                            title="Añadir"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onCerrar}>
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => onGuardar(seleccionados)}
                        >
                            Guardar cambios
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
