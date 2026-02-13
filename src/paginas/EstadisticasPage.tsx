import { Line } from "recharts";
import { AppLayout, TituloPagina, CardEstadistica, Card } from "../componentes";
import LineChartElement from "../componentes/charts/LineChartElement";

export default function EstadisticasPage() {
    const estadisticas = [
        { titulo: "Total de Entrenos", valor: "134", color: "text-[#4361EE]" },
        { titulo: "Tiempo Total", valor: "147.5 H", color: "text-[#4361EE]" },
        { titulo: "Kcal Quemadas", valor: "11.300", color: "text-[#4361EE]" },
    ];

    return (
        <>
            <AppLayout>
                <div className="space-y-6">
                    <TituloPagina titulo="Progreso General Anual" />

                    <Card className="p-6" hoverable={false}>
                        <LineChartElement items={[{ name: "Ene", value: 1 }, { name: "Feb", value: 13 }, { name: "Mar", value: 20 }, { name: "Abr", value: 23 }, { name: "May", value: 19 }, { name: "Jun", value: 11 }, { name: "Jul", value: 2 }, { name: "Ago", value: 1 }, { name: "Sep", value: 4 }, { name: "Oct", value: 18 }, { name: "Nov", value: 16 }, { name: "Dic", value: 6 }]} title={"Total de entrenos"} />
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {estadisticas.map((stat, index) => (
                            <CardEstadistica
                                key={index}
                                titulo={stat.titulo}
                                valor={stat.valor}
                                color={stat.color}
                            />
                        ))}
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
