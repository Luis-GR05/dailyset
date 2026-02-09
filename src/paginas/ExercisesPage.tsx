import AppLayout from './AppLayout';
import { ExerciseCard } from '../componentes/Card'; // Ajustado según tu estructura
import Boton from '../componentes/ui/Boton';
import Input from '../componentes/ui/Input';

export default function ExercisesPage() {
  const categories = ["Todos", "Pecho", "Espalda", "Piernas", "Hombros", "Brazos"];

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header de Búsqueda */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-black uppercase tracking-tighter">Explorar Ejercicios</h1>
            <p className="text-neutral-400 mt-2">Busca la técnica correcta para tus levantamientos.</p>
            <div className="mt-4 max-w-md">
              <Input placeholder="Buscar ejercicio... (ej. Press Banca)" type="text" />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map((cat) => (
              <button 
                key={cat} 
                className="px-4 py-2 rounded-full border border-white/10 text-sm font-medium hover:bg-accent hover:text-black transition-colors whitespace-nowrap"
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Rejilla de Ejercicios */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Aquí mapearías tus ejercicios reales */}
          <ExerciseCard />
          <ExerciseCard />
          <ExerciseCard />
          <ExerciseCard />
          <ExerciseCard />
          <ExerciseCard />
          <ExerciseCard />
          <ExerciseCard />
        </section>
      </div>
    </AppLayout>
  );
}