import { useState } from 'react'; //
import { Link } from 'react-router-dom';
import { AppLayout, TituloPagina, FiltroBoton, CardRutina, BotonPrimario } from "../componentes";

export default function MisRutinasPage() {
    const [filtroActivo, setFiltroActivo] = useState("Fuerza");

    const categorias = ["Fuerza", "Cardio", "Empuje"];

    const rutinasBase = [
        { id: 1, nombre: "Torso - hipertrofia", ejercicios: 6, duracion: 75, categoria: "Fuerza" },
        { id: 2, nombre: "Running 5K", ejercicios: 1, duracion: 30, categoria: "Cardio" },
        { id: 3, nombre: "Press Militar y Tríceps", ejercicios: 4, duracion: 50, categoria: "Empuje" },
        { id: 4, nombre: "Pierna - fuerza", ejercicios: 5, duracion: 60, categoria: "Fuerza" },
        { id: 5, nombre: "Natación", ejercicios: 1, duracion: 45, categoria: "Cardio" },
        { id: 6, nombre: "Pecho - Aperturas", ejercicios: 5, duracion: 65, categoria: "Empuje" },
    ];


    const rutinasFiltradas = rutinasBase.filter(r => r.categoria === filtroActivo);

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <TituloPagina titulo="Mis Rutinas" />
                    <BotonPrimario>+ Crear Rutina</BotonPrimario>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:gap-4">
                    <span className="text-white font-bold text-sm">Filtros:</span>
                    {categorias.map((cat) => (
                        <div key={cat} onClick={() => setFiltroActivo(cat)} className="cursor-pointer">
                            <FiltroBoton 
                                nombre={cat} 
                                activo={filtroActivo === cat} 
                            />
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    {rutinasFiltradas.length > 0 ? (
                        rutinasFiltradas.map((rutina) => (
                            <Link key={rutina.id} to="/mis-rutinas/entrenamiento" className="block">
                                <CardRutina
                                    nombre={rutina.nombre}
                                    ejercicios={rutina.ejercicios}
                                    duracion={rutina.duracion}
                                />
                            </Link>
                        ))
                    ) : (
                        <p className="text-neutral-400">No hay rutinas en esta categoría.</p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}