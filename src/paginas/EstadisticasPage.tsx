import { AppLayout, TituloPagina, CardEstadistica, Card } from "../componentes";

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
                        <h3 className="text-[#DBF059] font-bold mb-4">Gráfica</h3>
                        <div className="h-48">
                            <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
                                <path
                                    d="M 0 100 Q 50 80, 100 60 T 200 40 T 300 70 T 400 50"
                                    fill="none"
                                    stroke="#DBF059"
                                    strokeWidth="3"
                                />
                            </svg>
                        </div>
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
