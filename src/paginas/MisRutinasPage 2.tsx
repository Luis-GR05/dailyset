import { Link } from 'react-router-dom';
import { AppLayout, TituloPagina, FiltroBoton, CardRutina, BotonPrimario } from "../componentes";

export default function MisRutinasPage() {
    const filtros = [
        { nombre: "Fuerza", activo: true },
        { nombre: "Cardio", activo: false },
        { nombre: "Empuje", activo: false },
    ];

    const rutinas = [
        { id: 1, nombre: "Torso - hipertrofia", ejercicios: 6, duracion: 75 },
        { id: 2, nombre: "Pierna - fuerza", ejercicios: 5, duracion: 60 },
        { id: 3, nombre: "Empuje A", ejercicios: 6, duracion: 70 },
        { id: 4, nombre: "Tirón A", ejercicios: 5, duracion: 65 },
        { id: 5, nombre: "Fullbody", ejercicios: 8, duracion: 90 },
        { id: 6, nombre: "Torso - fuerza", ejercicios: 6, duracion: 80 },
        { id: 7, nombre: "Pierna - hipertrofia", ejercicios: 7, duracion: 85 },
        { id: 8, nombre: "Empuje B", ejercicios: 5, duracion: 60 },
    ];

    return (
        <>
            <AppLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <TituloPagina titulo="Mis Rutinas" />
                        <BotonPrimario>+ Crear Rutina</BotonPrimario>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-white font-bold">Filtros:</span>
                        {filtros.map((filtro, index) => (
                            <FiltroBoton key={index} nombre={filtro.nombre} activo={filtro.activo} />
                        ))}
                    </div>

                    <div className="space-y-4">
                        {rutinas.map((rutina) => (
                            <Link key={rutina.id} to="/mis-rutinas/entrenamiento" className="block">
                                <CardRutina
                                    nombre={rutina.nombre}
                                    ejercicios={rutina.ejercicios}
                                    duracion={rutina.duracion}
                                />
                            </Link>
                        ))}
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
