import { useState, useEffect } from 'react';
import type { Ejercicio } from '../../context/EjerciciosContext';
import { X } from 'lucide-react';

interface FormularioEjercicioProps {
    ejercicio?: Ejercicio | null;
    onGuardar: (data: Omit<Ejercicio, 'id'>) => Promise<void>;
    onCerrar: () => void;
}

const CATEGORIAS = ['Fuerza', 'Cardio', 'Empuje'];

export default function FormularioEjercicio({ ejercicio, onGuardar, onCerrar }: FormularioEjercicioProps) {
    const [nombre, setNombre] = useState('');
    const [grupo, setGrupo] = useState('');
    const [categoria, setCategoria] = useState(CATEGORIAS[0]);
    const [descripcion, setDescripcion] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (ejercicio) {
            setNombre(ejercicio.nombre);
            setGrupo(ejercicio.grupo);
            setCategoria(ejercicio.categoria);
            setDescripcion(ejercicio.descripcion);
            setVideoUrl(ejercicio.videoUrl || '');
            setImageUrl(ejercicio.imageUrl || '');
        }
    }, [ejercicio]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim() || !grupo.trim()) return;
        setLoading(true);
        setError(null);
        try {
            await onGuardar({
                nombre: nombre.trim(),
                grupo: grupo.trim(),
                categoria,
                descripcion: descripcion.trim(),
                videoUrl: videoUrl.trim(),
                imageUrl: imageUrl.trim()
            });
        } catch (err: any) {
            setError(err?.message ?? 'Error al guardar el ejercicio');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onCerrar}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="text-lg font-bold text-white">
                        {ejercicio ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
                    </h2>
                    <button className="modal-close-btn" onClick={onCerrar}><X size={16} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label className="form-label">Nombre <span className="text-red-400">*</span></label>
                        <input
                            className="input"
                            type="text"
                            placeholder="Ej. Press de Banca"
                            value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Grupo muscular <span className="text-red-400">*</span></label>
                        <input
                            className="input"
                            type="text"
                            placeholder="Ej. Pecho / tríceps"
                            value={grupo}
                            onChange={e => setGrupo(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Categoría</label>
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
                        <label className="form-label">Descripción</label>
                        <textarea
                            className="input"
                            rows={3}
                            placeholder="Describe cómo se realiza el ejercicio..."
                            value={descripcion}
                            onChange={e => setDescripcion(e.target.value)}
                            style={{ resize: 'none' }}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">URL del Video (YouTube Embed)</label>
                        <input
                            className="input"
                            type="url"
                            placeholder="Ej. https://www.youtube.com/embed/..."
                            value={videoUrl}
                            onChange={e => setVideoUrl(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">URL de la Imagen (Portada)</label>
                        <input
                            className="input"
                            type="url"
                            placeholder="Ej. https://images.unsplash.com/..."
                            value={imageUrl}
                            onChange={e => setImageUrl(e.target.value)}
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
                            {loading ? 'Guardando...' : ejercicio ? 'Guardar cambios' : 'Crear ejercicio'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
