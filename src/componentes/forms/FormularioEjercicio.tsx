import { useState, useEffect } from 'react';
import type { Ejercicio } from '../../context/EjerciciosContext';
import { X } from 'lucide-react';

interface FormularioEjercicioProps {
    ejercicio?: Ejercicio | null;
    onGuardar: (data: Omit<Ejercicio, 'id'>) => Promise<void>;
    onCerrar: () => void;
}

const CATEGORIAS = [
  { value: 'strength',    label: 'Fuerza' },
  { value: 'stretching',  label: 'Estiramiento' },
  { value: 'plyometrics', label: 'Pliométrico' },
  { value: 'cardio',      label: 'Cardio' },
  { value: 'strongman',   label: 'Strongman' },
  { value: 'powerlifting','label': 'Powerlifting' },
  { value: 'general',     label: 'General' },
];

const DIFICULTADES = [
  { value: 'principiante', label: 'Principiante' },
  { value: 'intermedio',   label: 'Intermedio' },
  { value: 'avanzado',     label: 'Avanzado' },
];

export default function FormularioEjercicio({ ejercicio, onGuardar, onCerrar }: FormularioEjercicioProps) {
    const [nombre,              setNombre]              = useState('');
    const [grupo,               setGrupo]               = useState('');
    const [categoriaEjercicio,  setCategoriaEjercicio]  = useState('strength');
    const [dificultad,          setDificultad]          = useState('principiante');
    const [descripcion,         setDescripcion]         = useState('');
    const [equipamiento,        setEquipamiento]        = useState('');
    const [videoUrl,            setVideoUrl]            = useState('');
    const [imagenInicio,        setImagenInicio]        = useState('');
    const [loading,             setLoading]             = useState(false);
    const [error,               setError]               = useState<string | null>(null);

    useEffect(() => {
        if (ejercicio) {
            setNombre(ejercicio.nombre);
            setGrupo(ejercicio.grupo);
            setCategoriaEjercicio(ejercicio.categoriaEjercicio ?? 'strength');
            setDificultad(ejercicio.dificultad ?? 'principiante');
            setDescripcion(ejercicio.descripcion);
            setEquipamiento(ejercicio.equipamiento ?? '');
            setVideoUrl(ejercicio.videoUrl ?? '');
            setImagenInicio(ejercicio.imagenInicio ?? '');
        }
    }, [ejercicio]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim() || !grupo.trim()) return;
        setLoading(true);
        setError(null);
        try {
            await onGuardar({
                externalId:           undefined,
                nombre:               nombre.trim(),
                grupo:                grupo.trim(),
                musculosPrimarios:    [grupo.trim()],
                musculosSecundarios:  [],
                categoriaEjercicio,
                dificultad,
                equipamiento:         equipamiento.trim() || undefined,
                descripcion:          descripcion.trim(),
                instruccionesPasos:   [],
                imagenInicio:         imagenInicio.trim() || undefined,
                imagenFinal:          undefined,
                videoUrl:             videoUrl.trim() || undefined,
                esPublico:            false,
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
                        <label className="form-label">Músculo principal <span className="text-red-400">*</span></label>
                        <input
                            className="input"
                            type="text"
                            placeholder="Ej. chest, quadriceps, biceps..."
                            value={grupo}
                            onChange={e => setGrupo(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="form-label">Categoría</label>
                            <select className="input" value={categoriaEjercicio} onChange={e => setCategoriaEjercicio(e.target.value)}>
                                {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Dificultad</label>
                            <select className="input" value={dificultad} onChange={e => setDificultad(e.target.value)}>
                                {DIFICULTADES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Equipamiento</label>
                        <input
                            className="input"
                            type="text"
                            placeholder="Ej. barbell, dumbbell, body only..."
                            value={equipamiento}
                            onChange={e => setEquipamiento(e.target.value)}
                        />
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
                            placeholder="https://www.youtube.com/embed/..."
                            value={videoUrl}
                            onChange={e => setVideoUrl(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">URL de la Imagen</label>
                        <input
                            className="input"
                            type="text"
                            placeholder="https://... o /exercises/Barbell_Squat/0.jpg"
                            value={imagenInicio}
                            onChange={e => setImagenInicio(e.target.value)}
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
