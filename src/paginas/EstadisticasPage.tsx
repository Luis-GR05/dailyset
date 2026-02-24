import { AppLayout, TituloPagina, CardEstadistica } from "../componentes";
import LineChartElement from "../componentes/charts/LineChartElement";

export default function EstadisticasPage() {
    const estadisticas = [
        { titulo: "Total de Entrenos", valor: "134" },
        { titulo: "Tiempo Total", valor: "147.5 H" },
        { titulo: "Kcal Quemadas", valor: "11.300" },
    ];

    const dataGrafico = [
        { name: "Ene", value: 1 }, { name: "Feb", value: 13 }, { name: "Mar", value: 20 }, 
        { name: "Abr", value: 23 }, { name: "May", value: 19 }, { name: "Jun", value: 11 }, 
        { name: "Jul", value: 2 }, { name: "Ago", value: 1 }, { name: "Sep", value: 4 }, 
        { name: "Oct", value: 18 }, { name: "Nov", value: 16 }, { name: "Dic", value: 6 }
    ];

    return (
        <AppLayout>
            <div className="space-y-4 pb-10 max-w-5xl mx-auto">
                <TituloPagina titulo="Progreso General Anual" />

                <div className="p-8 bg-neutral-900/40 border border-white/5 rounded-2xl backdrop-blur-xl">
                    <div className="mb-8">
                        <span className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] italic">
                            Volumen de Entrenamiento
                        </span>
                    </div>
                    <LineChartElement items={dataGrafico} title={""} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {estadisticas.map((stat, index) => (
                        <div key={index}>
                            <CardEstadistica
                                titulo={stat.titulo}
                                valor={stat.valor}
                            />
                        </div>
                    ))}
                </div>

                <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-8 backdrop-blur-xl">
                    <h3 className="text-white font-black italic text-sm uppercase mb-6 tracking-widest border-l-2 border-[#DBF059] pl-4">
                        Análisis de Rendimiento
                    </h3>
                    <div className="space-y-4">
                        {[
                            { label: "Intensidad Media", value: "85%" },
                            { label: "Frecuencia Semanal", value: "4.2 DÍAS" },
                            { label: "Mejor Racha", value: "22 DÍAS" }
                        ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                                <span className="text-neutral-500 text-[10px] font-black uppercase tracking-widest italic">
                                    {item.label}
                                </span>
                                <span className="text-[#DBF059] font-black italic text-lg tracking-tighter">
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}