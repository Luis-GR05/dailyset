import { Link } from 'react-router-dom';
import { AppLayout, TituloPagina, FiltroBoton, CardEjercicio, Input } from "../componentes";

export default function EjerciciosPage() {
  const filtros = [
    { nombre: "Fuerza", activo: true },
    { nombre: "Cardio", activo: false },
  ];

  const ejercicios = [
    { id: 1, nombre: "Press de Banca", grupo: "Pecho / tríceps" },
    { id: 2, nombre: "Sentadilla", grupo: "Pierna / glúteos" },
    { id: 3, nombre: "Peso Muerto", grupo: "Espalda / pierna" },
    { id: 4, nombre: "Press Militar", grupo: "Hombro / tríceps" },
    { id: 5, nombre: "Remo con Barra", grupo: "Espalda / bíceps" },
    { id: 6, nombre: "Curl de Bíceps", grupo: "Bíceps" },
    { id: 7, nombre: "Extensión Tríceps", grupo: "Tríceps" },
    { id: 8, nombre: "Dominadas", grupo: "Espalda / bíceps" },
    { id: 9, nombre: "Fondos", grupo: "Pecho / tríceps" },
    { id: 10, nombre: "Hip Thrust", grupo: "Glúteos / pierna" },
    { id: 11, nombre: "Elevaciones Laterales", grupo: "Hombro" },
    { id: 12, nombre: "Press Inclinado", grupo: "Pecho / hombro" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <TituloPagina titulo="Ejercicios" />
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Buscar ejercicio..."
              className="bg-neutral-900 border-neutral-800 rounded-2xl px-6 py-4"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-white font-bold">Filtros:</span>
          {filtros.map((filtro, index) => (
            <FiltroBoton key={index} nombre={filtro.nombre} activo={filtro.activo} />
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ejercicios.map((ejercicio) => (
            <Link key={ejercicio.id} to={`/ejercicios/${ejercicio.id}`} className="block">
              <CardEjercicio nombre={ejercicio.nombre} grupo={ejercicio.grupo} />
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}