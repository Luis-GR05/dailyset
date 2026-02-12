import { Line } from "recharts";
import { AppLayout, TituloPagina, CardEstadistica, Card } from "../componentes";
import LineChartElement from "../componentes/charts/LineChartElement";

export default function EstadisticasPage() {
    const estadisticas = [
        { titulo: "Total de Entrenos", valor: "24", color: "text-[#4361EE]" },
        { titulo: "Tiempo Total", valor: "12.5 H", color: "text-[#4361EE]" },
        { titulo: "Kcal Quemadas", valor: "4.200", color: "text-[#4361EE]" },
    ];

    return (
        <>
            <AppLayout>
                <div className="space-y-6">
                    <TituloPagina titulo="Progreso General" />

                    <Card className="p-6" hoverable={false}>
                        <LineChartElement items={[{ name: "Ene", value: 0 }, { name: "Feb", value: 30 }, { name: "Mar", value: 40 }, { name: "Abr", value: 50 }]} title={"Estadísticas de Progreso"} />
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
