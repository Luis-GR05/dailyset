import AppLayout from './AppLayout';
import Boton from '../componentes/ui/Boton';

export default function WorkoutPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Timer y Control Superior */}
        <header className="flex justify-between items-center mb-10 bg-neutral-900/80 p-6 rounded-3xl sticky top-4 z-10 border border-white/5 backdrop-blur-md">
          <div>
            <h1 className="text-2xl font-bold text-accent">Torso - Hipertrofia</h1>
            <p className="font-mono text-xl">00:45:12</p>
          </div>
          <Boton variant="primary" className="bg-red-500 hover:bg-red-600 border-none">
            Finalizar
          </Boton>
        </header>

        {/* Lista de Ejercicios de la Sesión */}
        <div className="space-y-6">
          {[1, 2].map((ex) => (
            <div key={ex} className="bg-neutral-800/40 border border-white/5 rounded-3xl p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold italic uppercase">Press de Banca con Barra</h3>
                  <p className="text-neutral-500 text-sm">RPE objetivo: 8</p>
                </div>
                <button className="text-neutral-400 hover:text-white">...</button>
              </div>

              {/* Tabla de Series */}
              <div className="space-y-3">
                <div className="grid grid-cols-4 text-xs font-bold uppercase text-neutral-500 px-2">
                  <span>Serie</span>
                  <span>Kg</span>
                  <span>Reps</span>
                  <span className="text-right">Check</span>
                </div>
                
                {[1, 2, 3].map((set) => (
                  <div key={set} className="grid grid-cols-4 items-center bg-neutral-900/50 p-3 rounded-xl border border-white/5">
                    <span className="font-bold text-accent">{set}</span>
                    <input type="number" placeholder="80" className="bg-transparent border-none focus:ring-0 w-full" />
                    <input type="number" placeholder="10" className="bg-transparent border-none focus:ring-0 w-full" />
                    <div className="flex justify-end">
                        <input type="checkbox" className="w-6 h-6 rounded-md border-neutral-700 bg-neutral-800 text-accent focus:ring-accent" />
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-4 py-2 border-2 border-dashed border-white/10 rounded-xl text-neutral-500 hover:border-accent hover:text-accent transition-all text-sm font-bold">
                + Añadir Serie
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}