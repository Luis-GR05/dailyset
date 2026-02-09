import { AppLayout } from '../componentes';
import { Input } from '../componentes';
import { ExerciseCard } from '../componentes';

export default function EjerciciosPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-black uppercase tracking-tight">Biblioteca</h1>
          <p className="text-neutral-400">Explora más de 200 ejercicios con técnica perfecta.</p>
        </header>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input placeholder="Buscar ejercicio (ej. Press Militar)..." className="w-full" />
          </div>
          <select className="bg-neutral-900 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-accent">
            <option>Todos los músculos</option>
            <option>Pecho</option>
            <option>Espalda</option>
            <option>Pierna</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <ExerciseCard />
           <ExerciseCard />
           <ExerciseCard />
           <ExerciseCard />
           <ExerciseCard />
           <ExerciseCard />
        </div>
      </div>
    </AppLayout>
  );
}