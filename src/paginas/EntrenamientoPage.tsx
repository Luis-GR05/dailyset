import { Link } from 'react-router-dom';
import { AppLayout, Card, ImagenPlaceholder } from "../componentes";

export default function EntrenamientoPage() {
    const ejercicios = [
        {
            id: 1,
            nombre: "Press de Banca",
            series: [
                { numero: 1, anterior: "50KG x 12", kg: 45, reps: 15, completada: true },
                { numero: 2, anterior: "50KG x 12", kg: 45, reps: 20, completada: true },
                { numero: 3, anterior: "50KG x 10", kg: 50, reps: 10, completada: true },
            ],
        },
        {
            id: 2,
            nombre: "Press Inclinado",
            series: [
                { numero: 1, anterior: "40KG x 10", kg: 40, reps: 12, completada: true },
                { numero: 2, anterior: "40KG x 10", kg: 42, reps: 10, completada: true },
            ],
        },
        {
            id: 3,
            nombre: "Aperturas con Mancuernas",
            series: [
                { numero: 1, anterior: "14KG x 12", kg: 14, reps: 15, completada: true },
                { numero: 2, anterior: "14KG x 12", kg: 16, reps: 12, completada: false },
            ],
        },
        {
            id: 4,
            nombre: "Extensión de Tríceps",
            series: [
                { numero: 1, anterior: "20KG x 12", kg: 20, reps: 15, completada: true },
                { numero: 2, anterior: "20KG x 12", kg: 22, reps: 12, completada: false },
                { numero: 3, anterior: "20KG x 10", kg: 22, reps: 10, completada: false },
            ],
        },
        {
            id: 5,
            nombre: "Press Francés",
            series: [
                { numero: 1, anterior: "25KG x 10", kg: 25, reps: 10, completada: false },
                { numero: 2, anterior: "25KG x 10", kg: 25, reps: 8, completada: false },
            ],
        },
    ];

    return (
        <>
            <AppLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Card className="px-6 py-3" hoverable={false}>
                                <span className="text-white font-mono font-bold">00:15:21</span>
                            </Card>
                            <Card className="px-6 py-3" hoverable={false}>
                                <span className="text-white font-bold">Día de Empuje A</span>
                            </Card>
                        </div>
                        <Link to="/mis-rutinas">
                            <button className="bg-red-600 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-red-700 transition-all">
                                FINALIZAR
                            </button>
                        </Link>
                    </div>

                    <div className="space-y-6">
                        {ejercicios.map((ejercicio) => (
                            <Card key={ejercicio.id} className="p-6" hoverable={false}>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <ImagenPlaceholder size="sm" />
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{ejercicio.nombre}</h3>
                                            <p className="text-[#4361EE] text-sm cursor-pointer hover:underline">Ver historial</p>
                                        </div>
                                    </div>
                                    <button className="text-red-500 hover:text-red-400 transition-all">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <div className="grid grid-cols-5 gap-4 px-4 py-2 text-neutral-400 text-sm">
                                        <span></span>
                                        <span>Anterior Serie</span>
                                        <span className="text-center">KG</span>
                                        <span className="text-center">Reps</span>
                                        <span></span>
                                    </div>

                                    {ejercicio.series.map((serie) => (
                                        <div
                                            key={serie.numero}
                                            className="grid grid-cols-5 gap-4 items-center bg-neutral-800 rounded-xl px-4 py-3"
                                        >
                                            <span className="text-[#DBF059] font-bold">{serie.numero}</span>
                                            <span className="text-neutral-400">{serie.anterior}</span>
                                            <input
                                                type="number"
                                                defaultValue={serie.kg}
                                                className="bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-white text-center w-full focus:border-[#4361EE] focus:outline-none"
                                            />
                                            <input
                                                type="number"
                                                defaultValue={serie.reps}
                                                className="bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-white text-center w-full focus:border-[#4361EE] focus:outline-none"
                                            />
                                            <div className="flex justify-center">
                                                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
