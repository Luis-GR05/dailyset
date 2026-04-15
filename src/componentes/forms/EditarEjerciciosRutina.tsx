import { useState } from 'react';
import { useEjercicios } from '../../context/EjerciciosContext';
import type { Rutina } from '../../context/RutinasContext';
import { X, Plus } from 'lucide-react';

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
                                    <div key={e.id} className="ejercicio-item ejercicio-item-en-rutina">
                                        <div>
                                            <span className="text-white text-sm font-medium">{e.nombre}</span>
                                            <span className="text-neutral-500 text-xs ml-2">{e.grupo}</span>
                                        </div>
                                        <button
                                            className="ejercicio-quitar-btn"
                                            onClick={() => quitar(e.id)}
                                            title="Quitar"
                                        >
                                            <X size={10} />
                                        </button>
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
                                <div key={e.id} className="ejercicio-item ejercicio-item-disponible">
                                    <div>
                                        <span className="text-white text-sm font-medium">{e.nombre}</span>
                                        <span className="text-neutral-500 text-xs ml-2">{e.grupo}</span>
                                        <span className="ejercicio-categoria-badge">{e.categoriaEjercicio}</span>
                                    </div>
                                    <button
                                        className="ejercicio-agregar-btn"
                                        onClick={() => agregar(e.id)}
                                        title="Añadir"
                                    >
                                        <Plus size={14} />
                                    </button>
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
