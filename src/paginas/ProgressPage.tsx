import { AppLayout } from "../componentes";

export default function ProgressPage() {
  return (
    <AppLayout>
      <div className="space-y-10">
        <header>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Progreso</h1>
          <p className="text-neutral-400 mt-2">Tu evolución visual y numérica en un solo lugar.</p>
        </header>

        {/* Gráfico principal (Placeholder) */}
        <section className="bg-neutral-800/50 p-8 rounded-3xl border border-white/5 h-80 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-accent/5 to-transparent"></div>
          <p className="text-neutral-500 font-medium italic">Gráfico de volumen de entrenamiento acumulado...</p>
          {/* Aquí integrarías una librería como Recharts o Chart.js */}
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Récords Personales */}
          <section className="bg-neutral-800/50 p-6 rounded-3xl border border-white/5">
            <h3 className="text-xl font-bold mb-6 italic uppercase">Personal Records (PRs)</h3>
            <div className="space-y-4">
              {[
                { lift: 'Sentadilla', weight: '140kg', date: 'Hace 2 días' },
                { lift: 'Press Banca', weight: '100kg', date: 'Hace 1 semana' },
                { lift: 'Peso Muerto', weight: '180kg', date: 'Ayer' },
              ].map((pr, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-neutral-900/50 rounded-2xl border border-white/5">
                  <div>
                    <p className="font-bold text-accent">{pr.lift}</p>
                    <p className="text-xs text-neutral-500">{pr.date}</p>
                  </div>
                  <span className="text-2xl font-black italic">{pr.weight}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Historial de peso corporal */}
          <section className="bg-neutral-800/50 p-6 rounded-3xl border border-white/5">
            <h3 className="text-xl font-bold mb-6 italic uppercase">Peso Corporal</h3>
            <div className="overflow-hidden rounded-2xl border border-white/5">
              <table className="w-full text-left bg-neutral-900/30">
                <thead className="bg-neutral-900/80 text-xs text-neutral-500 uppercase">
                  <tr>
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Peso</th>
                    <th className="p-4">Cambio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { d: '08 Feb', w: '79.5kg', c: '-0.2' },
                    { d: '01 Feb', w: '79.7kg', c: '+0.5' },
                    { d: '25 Ene', w: '79.2kg', c: '-0.3' },
                  ].map((row, i) => (
                    <tr key={i} className="text-sm">
                      <td className="p-4">{row.d}</td>
                      <td className="p-4 font-bold">{row.w}</td>
                      <td className={`p-4 ${row.c.startsWith('+') ? 'text-red-400' : 'text-green-400'}`}>
                        {row.c}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}