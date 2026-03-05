import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout, TituloPagina, FiltroBoton, CardRutina, BotonPrimario } from "../componentes";
import { RUTINAS_DATA } from '../data/rutinas'; 

export default function MisRutinasPage() {
    const [filtroActivo, setFiltroActivo] = useState("Fuerza");

    const [rutinas, setRutinas] = useState([
        { id: 1, nombre: "Torso - hipertrofia", duracion: 75, categoria: "Fuerza" },
        { id: 2, nombre: "Running 5K", duracion: 30, categoria: "Cardio" },
        { id: 3, nombre: "Press Militar y Tríceps", duracion: 50, categoria: "Empuje" },
        { id: 4, nombre: "Pierna - fuerza", duracion: 60, categoria: "Fuerza" },
        { id: 5, nombre: "Natación", duracion: 45, categoria: "Cardio" },
        { id: 6, nombre: "Pecho - Aperturas", duracion: 65, categoria: "Empuje" },
    ]);

    const categorias = ["Fuerza", "Cardio", "Empuje"];

    const crearNuevaRutina = () => {
        const nueva = {
            id: Date.now(),
            nombre: `Nueva Rutina ${filtroActivo}`,
            duracion: 0,
            categoria: filtroActivo
        };
        setRutinas([...rutinas, nueva]);
    };

    const rutinasFiltradas = rutinas.filter(r => r.categoria === filtroActivo);

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <TituloPagina titulo="Mis Rutinas" />
                    <div onClick={crearNuevaRutina} className="cursor-pointer">
                        <BotonPrimario>+ Crear Rutina</BotonPrimario>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:gap-4">
                    <span className="text-white font-bold text-sm">Filtros:</span>
                    {categorias.map((cat) => (
                        <div key={cat} onClick={() => setFiltroActivo(cat)} className="cursor-pointer">
                            <FiltroBoton nombre={cat} activo={filtroActivo === cat} />
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    {rutinasFiltradas.map((rutina) => {
                        const numEjerciciosReal = RUTINAS_DATA[rutina.nombre]?.length || 0;

                        return (
                            <Link 
                                key={rutina.id} 
                                to="/mis-rutinas/entrenamiento" 
                                state={{ nombre: rutina.nombre }} 
                                className="block"
                            >
                                <CardRutina
                                    nombre={rutina.nombre}
                                    ejercicios={numEjerciciosReal} 
                                    duracion={rutina.duracion}
                                />
                            </Link>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}