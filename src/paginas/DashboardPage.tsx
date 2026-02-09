import AppLayout from './AppLayout';
import { ExerciseCard } from './Card';
import Boton from './Boton';

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-10">

        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Panel Principal</h1>
            <p className="text-neutral-400 mt-2">Hoy toca: <span className="text-accent font-bold">Torso - Hipertrofia</span></p>
          </div>
          <Boton variant="primary" className="shadow-lg shadow-accent/10">
            Continuar Entrenamiento
          </Boton>
        </section>

       
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Tus Rutinas Semanales</h2>
            <button className="text-accent text-sm font-bold hover:underline">Ver todas</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           
            <ExerciseCard />
            <ExerciseCard />
            <ExerciseCard />
          </div>
        </section>

       
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-neutral-800/50 p-6 rounded-3xl border border-white/5">
                <h3 className="text-lg font-bold mb-4">Actividad Reciente</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between border-b border-white/5 pb-3">
                            <div>
                                <p className="font-medium">Sesión de Pierna</p>
                                <p className="text-xs text-neutral-500">Ayer, 18:30</p>
                            </div>
                            <span className="text-accent font-mono">+450kg vol.</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
      </div>
    </AppLayout>
  );
}