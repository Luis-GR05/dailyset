import { useState, useEffect } from 'react';
import type { Rutina } from '../../context/RutinasContext';
import { X } from 'lucide-react';

interface FormularioRutinaProps {
    rutina?: Rutina | null;
    onGuardar: (data: { nombre: string; categoria: string; duracion: number }) => Promise<void>;
    onCerrar: () => void;
}

const CATEGORIAS = ['Fuerza', 'Cardio', 'Empuje'];

export default function FormularioRutina({ rutina, onGuardar, onCerrar }: FormularioRutinaProps) {
    const [nombre, setNombre] = useState('');
    const [categoria, setCategoria] = useState(CATEGORIAS[0]);
    const [duracion, setDuracion] = useState(45);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (rutina) {
            setNombre(rutina.nombre);
            setCategoria(rutina.categoria);
            setDuracion(rutina.duracion);
        }
    }, [rutina]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim()) return;
        setLoading(true);
        setError(null);
        try {
            await onGuardar({ nombre: nombre.trim(), categoria, duracion });
        } catch (err: any) {
            setError(err?.message ?? 'Error al guardar la rutina');
        } finally {
            setLoading(false);
        }
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

                    {error && (
                        <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onCerrar} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Guardando...' : rutina ? 'Guardar cambios' : 'Crear rutina'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
