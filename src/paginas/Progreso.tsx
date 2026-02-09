import { AppLayout } from '../componentes';
import { Card } from '../componentes';

export default function ProgresoPage() {
    return (
        <AppLayout>
            <div className="space-y-8">
                <header>
                    <h1 className="text-3xl font-black uppercase tracking-tighter italic">Tu Evolución</h1>
                    <p className="text-neutral-400">Análisis detallado de tu rendimiento físico.</p>
                </header>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Volumen Total', value: '42.5k kg', color: 'text-accent' },
                        { label: 'Sesiones', value: '18', color: 'text-white' },
                        { label: 'Récords (PR)', value: '5', color: 'text-primary-700' },
                        { label: 'Tiempo total', value: '24h', color: 'text-white' },
                    ].map((metric, i) => (
                        <Card key={i} className="p-5 bg-neutral-900/50 border-white/5">
                            <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">{metric.label}</p>
                            <p className={`text-2xl font-black mt-1 ${metric.color}`}>{metric.value}</p>
                        </Card>
                    ))}
                </div>

                <Card className="p-6 h-80 bg-neutral-900/40 border-white/5 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold">Progresión en Press de Banca</h3>
                        <select className="bg-black border border-white/10 rounded-lg text-xs p-1">
                            <option>Últimos 30 días</option>
                            <option>Histórico</option>
                        </select>
                    </div>
                    <div className="flex-1 flex items-end gap-2 px-2 pb-2">
                        {[40, 65, 55, 80, 70, 95, 100].map((height, i) => (
                            <div 
                                key={i} 
                                className="flex-1 bg-primary-700/20 border-t-2 border-primary-700 rounded-t-sm" 
                                style={{ height: `${height}%` }}
                            ></div>
                        ))}
                    </div>
                </Card>

                <div className="bg-neutral-900/50 rounded-3xl border border-white/5 overflow-hidden">
                    <div className="p-5 border-b border-white/5">
                        <h3 className="font-bold uppercase italic text-sm tracking-widest text-accent">Personal Records</h3>
                    </div>
                    <div className="divide-y divide-white/5">
                        {['Sentadilla', 'Peso Muerto', 'Press Militar'].map((ex, i) => (
                            <div key={i} className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                                <span className="font-medium">{ex}</span>
                                <div className="text-right">
                                    <p className="font-black text-white">120 kg</p>
                                    <p className="text-[10px] text-neutral-500 font-mono">12/05/2025</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}