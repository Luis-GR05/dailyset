import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AppLayout, Card, ImagenPlaceholder } from "../componentes";
import { RUTINAS_DATA } from '../data/rutinas';

interface Serie {
  numero: number;
  anterior: string;
  kg: number;
  reps: number;
  completada: boolean;
}

interface Ejercicio {
  id: number;
  nombre: string;
  series: Serie[];
}

export default function EntrenamientoPage() {
    const location = useLocation();
    
    const nombreRutina = location.state?.nombre || "Día de Empuje A";

    const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);

    useEffect(() => {
        const datos = RUTINAS_DATA[nombreRutina];
        if (datos) {
            setEjercicios(datos);
        } else {
            setEjercicios([]); 
        }
    }, [nombreRutina]);

    const toggleSerie = (ejercicioId: number, serieNumero: number) => {
        setEjercicios(prev => prev.map(ej => {
            if (ej.id === ejercicioId) {
                return {
                    ...ej,
                    series: ej.series.map(s => 
                        s.numero === serieNumero ? { ...s, completada: !s.completada } : s
                    )
                };
            }
            return ej;
        }));
    };

    const eliminarEjercicio = (id: number) => {
        setEjercicios(prev => prev.filter(ej => ej.id !== id));
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Cabecera Superior */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-2 md:gap-4">
                        <Card className="px-4 py-2 md:px-6 md:py-3" hoverable={false}>
                            <span className="text-white font-mono font-bold text-sm md:text-base">00:15:21</span>
                        </Card>
                        <Card className="px-4 py-2 md:px-6 md:py-3" hoverable={false}>
                            <span className="text-white font-bold text-sm md:text-base">{nombreRutina}</span>
                        </Card>
                    </div>
                    <Link to="/mis-rutinas">
                        <button className="w-full md:w-auto bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-all">
                            FINALIZAR
                        </button>
                    </Link>
                </div>

                {/* Listado de Ejercicios */}
                <div className="space-y-6">
                    {ejercicios.length > 0 ? (
                        ejercicios.map((ejercicio) => (
                            <Card key={ejercicio.id} className="p-4 md:p-6" hoverable={false}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <ImagenPlaceholder size="sm" />
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{ejercicio.nombre}</h3>
                                            <p className="text-[#4361EE] text-sm cursor-pointer hover:underline">Ver historial</p>
                                        </div>
                                    </div>
                                    {/* Botón Eliminar */}
                                    <button 
                                        onClick={() => eliminarEjercicio(ejercicio.id)}
                                        className="text-red-500 hover:text-red-400 transition-all active:scale-90"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {/* Cabecera de Columnas */}
                                    <div className="grid grid-cols-4 md:grid-cols-5 gap-4 px-4 py-1 text-neutral-500 text-xs font-bold uppercase tracking-wider">
                                        <span>Serie</span>
                                        <span className="hidden md:block">Anterior</span>
                                        <span className="text-center">KG</span>
                                        <span className="text-center">Reps</span>
                                        <span className="text-center">Estado</span>
                                    </div>

                                    {/* Filas de Series */}
                                    {ejercicio.series.map((serie) => (
                                        <div key={serie.numero} className="grid grid-cols-4 md:grid-cols-5 gap-4 items-center bg-neutral-800/50 p-3 rounded-xl border border-neutral-800">
                                            <span className="text-[#DBF059] font-bold ml-2">{serie.numero}</span>
                                            <span className="hidden md:block text-neutral-400 text-sm">{serie.anterior}</span>
                                            <input type="number" defaultValue={serie.kg} className="bg-neutral-700 text-white text-center rounded-lg py-2 w-full focus:ring-1 focus:ring-[#4361EE] outline-none" />
                                            <input type="number" defaultValue={serie.reps} className="bg-neutral-700 text-white text-center rounded-lg py-2 w-full focus:ring-1 focus:ring-[#4361EE] outline-none" />
                                            
                                            {/* Botón Check Verde */}
                                            <div className="flex justify-center">
                                                <button 
                                                    onClick={() => toggleSerie(ejercicio.id, serie.numero)}
                                                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                                                        serie.completada ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-neutral-700'
                                                    }`}
                                                >
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-neutral-900/50 rounded-3xl border border-dashed border-neutral-800">
                            <p className="text-neutral-500 italic">Esta rutina aún no tiene ejercicios asignados.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}