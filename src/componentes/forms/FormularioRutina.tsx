import { useState, useEffect } from 'react';
import type { Rutina } from '../../context/RutinasContext';
import { X } from 'lucide-react';

interface FormularioRutinaProps {
    rutina?: Rutina | null;
    onGuardar: (data: { nombre: string; categoria: string; duracion: number }) => void;
    onCerrar: () => void;
}

const CATEGORIAS = ['Fuerza', 'Cardio', 'Empuje'];

export default function FormularioRutina({ rutina, onGuardar, onCerrar }: FormularioRutinaProps) {
    const [nombre, setNombre] = useState('');
    const [categoria, setCategoria] = useState(CATEGORIAS[0]);
    const [duracion, setDuracion] = useState(45);

    useEffect(() => {
        if (rutina) {
            setNombre(rutina.nombre);
            setCategoria(rutina.categoria);
            setDuracion(rutina.duracion);
        }
    }, [rutina]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim()) return;
        onGuardar({ nombre: nombre.trim(), categoria, duracion });
    };

    return (
        <div className="modal-overlay" onClick={onCerrar}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="text-lg font-bold text-white">
                        {rutina ? 'Editar Rutina' : 'Nueva Rutina'}
                    </h2>
                    <button className="modal-close-btn" onClick={onCerrar}><X size={16} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
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

                    <div className="form-group">
                        <label className="form-label">Tipo de rutina</label>
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
                        <input
                            className="input"
                            type="number"
                            min={1}
                            max={300}
                            value={duracion}
                            onChange={e => setDuracion(Number(e.target.value))}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onCerrar}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {rutina ? 'Guardar cambios' : 'Crear rutina'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
