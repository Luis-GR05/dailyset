import { useMemo, useState } from 'react';
import { AppLayout, Card } from '../componentes';
import { useI18n } from '../context/I18nContext';
import { useHistorial } from '../context/HistorialContext';
import LineChartElement from '../componentes/charts/LineChartElement';

export default function ProgresoPage() {
    const { t, locale } = useI18n();
    const { sesiones, metricas } = useHistorial();

    const ejerciciosDisponibles = useMemo(() => {
        const set = new Set<string>();
        sesiones.forEach(s => s.ejercicios.forEach(ej => set.add(ej.nombre)));
        return Array.from(set.values()).sort((a, b) => a.localeCompare(b));
    }, [sesiones]);

    const [ejSeleccionado, setEjSeleccionado] = useState<string>('');

    const seleccion = ejSeleccionado || ejerciciosDisponibles[0] || '';

    const serieProgreso = useMemo(() => {
        if (!seleccion) return [];
        // Un punto por sesión: máximo kg usado en ese ejercicio ese día.
        const points: { name: string; value: number }[] = [];
        sesiones
            .slice()
            .sort((a, b) => a.fecha.localeCompare(b.fecha))
            .forEach(s => {
                const ej = s.ejercicios.find(e => e.nombre === seleccion);
                if (!ej) return;
                const maxKg = ej.series.reduce((m, serie) => Math.max(m, serie.kg), 0);
                points.push({ name: s.fecha.slice(5), value: Math.round(maxKg) });
            });
        return points.slice(-12);
    }, [sesiones, seleccion]);

    const metricasCards = useMemo(() => {
        const totalMin = sesiones.reduce((t, s) => t + (s.duracionMin ?? 0), 0);
        const totalHours = totalMin >= 60 ? `${(totalMin / 60).toFixed(1)}h` : `${totalMin}m`;
        const volumeDisplay = metricas.volumenTotalKg >= 1000 ? `${(metricas.volumenTotalKg / 1000).toFixed(1)}k kg` : `${metricas.volumenTotalKg} kg`;

        // PRs (simple): nº ejercicios con algún kg>0 (sirve como “récords” iniciales).
        const prs = ejerciciosDisponibles.length;

        return [
            { label: t.progress.totalVolume, value: volumeDisplay, color: 'text-white' },
            { label: t.progress.sessions, value: String(sesiones.length), color: 'text-white' },
            { label: t.progress.records, value: prs ? String(prs) : '—', color: 'text-white' },
            { label: t.progress.totalTime, value: totalHours, color: 'text-white' },
        ];
    }, [metricas.volumenTotalKg, sesiones, ejerciciosDisponibles.length, t.progress.totalVolume, t.progress.sessions, t.progress.records, t.progress.totalTime]);

    return (
        <AppLayout>
            <div className="space-y-8">
                <header>
                    <h1 className="text-3xl font-black uppercase tracking-tighter italic">{t.progress.title}</h1>
                    <p className="text-neutral-400">{t.progress.subtitle}</p>
                </header>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {metricasCards.map((metric, i) => (
                        <Card key={i} className="p-5 bg-neutral-900/50 border-white/5">
                            <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">{metric.label}</p>
                            <p className={`text-2xl font-black mt-1 ${metric.color}`}>{metric.value}</p>
                        </Card>
                    ))}
                </div>

                <Card className="p-6 bg-neutral-900/40 border-white/5">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold">
                            {locale === 'es' ? 'Progresión por ejercicio' : 'Exercise progression'}
                        </h3>
                        <select
                            className="bg-black border border-white/10 rounded-lg text-xs p-1"
                            value={seleccion}
                            onChange={(e) => setEjSeleccionado(e.target.value)}
                            disabled={ejerciciosDisponibles.length === 0}
                            aria-label={locale === 'es' ? 'Seleccionar ejercicio' : 'Select exercise'}
                        >
                            {ejerciciosDisponibles.length === 0 ? (
                                <option value="">{locale === 'es' ? 'Sin datos' : 'No data'}</option>
                            ) : (
                                ejerciciosDisponibles.map(n => <option key={n} value={n}>{n}</option>)
                            )}
                        </select>
                    </div>
                    <div className="mt-4">
                        {serieProgreso.length > 0 ? (
                            <LineChartElement
                                items={serieProgreso}
                                title={locale === 'es' ? 'Máximo (kg) por sesión' : 'Session max (kg)'}
                                height={180}
                                showGrid={false}
                                lineColor="var(--color-primary)"
                            />
                        ) : (
                            <div className="h-40 flex items-center justify-center text-center">
                                <p className="text-neutral-600 text-sm">
                                    {locale === 'es'
                                        ? 'Completa entrenamientos para ver tu progresión.'
                                        : 'Complete workouts to see your progression.'}
                                </p>
                            </div>
                        )}
                    </div>
                </Card>

                <div className="bg-neutral-900/50 rounded-3xl border border-white/5 overflow-hidden">
                    <div className="p-5 border-b border-white/5">
                        <h3 className="font-bold uppercase italic text-sm tracking-widest text-accent">
                            {locale === 'es' ? 'Récords personales' : 'Personal records'}
                        </h3>
                    </div>
                    <div className="divide-y divide-white/5">
                        {ejerciciosDisponibles.length === 0 ? (
                            <div className="p-6 text-center">
                                <p className="text-neutral-600 text-sm">
                                    {locale === 'es' ? 'Sin récords aún.' : 'No records yet.'}
                                </p>
                            </div>
                        ) : (
                            ejerciciosDisponibles.slice(0, 6).map((ex, i) => (
                                <div key={ex} className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                                    <span className="font-medium">{ex}</span>
                                    <div className="text-right">
                                        <p className="font-black text-white">
                                            {Math.max(0, ...sesiones.flatMap(s => (s.ejercicios.find(e => e.nombre === ex)?.series ?? []).map(se => se.kg)))} kg
                                        </p>
                                        <p className="text-[10px] text-neutral-500 font-mono">
                                            {locale === 'es' ? 'Máximo registrado' : 'Recorded max'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}