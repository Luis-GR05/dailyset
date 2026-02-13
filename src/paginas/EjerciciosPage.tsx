import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout, TituloPagina, FiltroBoton, CardEjercicio, Input } from "../componentes";

export default function EjerciciosPage() {
  // 1. Estados para Filtro y Búsqueda
  const [filtroActivo, setFiltroActivo] = useState("Fuerza");
  const [busqueda, setBusqueda] = useState("");

  const categorias = ["Fuerza", "Cardio", "Empuje"];

  // 2. Listado de ejercicios con categoría asignada
  const ejerciciosBase = [
    // FUERZA
    { id: 1, nombre: "Sentadilla Libre", grupo: "Pierna / glúteos", categoria: "Fuerza" },
    { id: 2, nombre: "Peso Muerto", grupo: "Espalda / pierna", categoria: "Fuerza" },
    { id: 3, nombre: "Remo con Barra", grupo: "Espalda / bíceps", categoria: "Fuerza" },
    
    // CARDIO
    { id: 4, nombre: "Cinta de Correr", grupo: "Cuerpo completo", categoria: "Cardio" },
    { id: 5, nombre: "Bicicleta Estática", grupo: "Piernas", categoria: "Cardio" },
    { id: 6, nombre: "Salto a la Comba", grupo: "Cardio vascular", categoria: "Cardio" },

    // EMPUJE
    { id: 7, nombre: "Press de Banca", grupo: "Pecho / tríceps", categoria: "Empuje" },
    { id: 8, nombre: "Press Militar", grupo: "Hombro / tríceps", categoria: "Empuje" },
    { id: 9, nombre: "Fondos en Paralelas", grupo: "Pecho / tríceps", categoria: "Empuje" },
  ];

  // 3. Lógica de filtrado combinada (Categoría + Texto de búsqueda)
  const ejerciciosFiltrados = ejerciciosBase.filter(ejercicio => {
    const coincideFiltro = ejercicio.categoria === filtroActivo;
    const coincideBusqueda = ejercicio.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return coincideFiltro && coincideBusqueda;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <TituloPagina titulo="Ejercicios" />
          <div className="flex-1 w-full">
            <Input
              type="text"
              placeholder="Buscar ejercicio..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-neutral-900 border-neutral-800 rounded-2xl px-4 py-3 md:px-6 md:py-4 w-full"
            />
          </div>
        </div>

        {/* Listado de Filtros */}
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

        {/* Grid de resultados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ejerciciosFiltrados.length > 0 ? (
            ejerciciosFiltrados.map((ejercicio) => (
              <Link key={ejercicio.id} to={`/ejercicios/${ejercicio.id}`} className="block">
                <CardEjercicio
                  nombre={ejercicio.nombre}
                  grupo={ejercicio.grupo}
                />
              </Link>
            ))
          ) : (
            <p className="text-neutral-500 col-span-full py-10 text-center">
              No se encontraron ejercicios de {filtroActivo.toLowerCase()} que coincidan con tu búsqueda.
            </p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}