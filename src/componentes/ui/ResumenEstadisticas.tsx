import Card from './Card';


interface ResumenEstadisticasProps {
    volumenTotalKg: number;
    intensidad: string;
    disciplinaPct: number;
}

export default function ResumenEstadisticas({ volumenTotalKg, intensidad, disciplinaPct }: ResumenEstadisticasProps) {
    const volumenDisplay = volumenTotalKg >= 1000
        ? `${(volumenTotalKg / 1000).toFixed(1)} Ton`
        : `${volumenTotalKg} kg`;

    const intensidadIcon = intensidad === 'Alta' ? '🔥' : intensidad === 'Media' ? '⚡' : '💤';

    return (
        <div className="grid grid-cols-3 gap-3">
            <Card className="p-4 text-center" hoverable={false}>
                <h3 className="text-neutral-400 text-xs uppercase font-bold mb-2">Volumen Total</h3>
                <p className="text-xl font-bold text-white leading-tight">{volumenDisplay}</p>
            </Card>
            <Card className="p-4 text-center" hoverable={false}>
                <h3 className="text-neutral-400 text-xs uppercase font-bold mb-2">Intensidad</h3>
                <p className="text-xl font-bold text-white leading-tight">{intensidad} {intensidadIcon}</p>
            </Card>
            <Card className="p-4 text-center" hoverable={false}>
                <h3 className="text-neutral-400 text-xs uppercase font-bold mb-2">Disciplina</h3>
                <p className="text-xl font-bold text-[#DBF059] leading-tight">{disciplinaPct}% 🎯</p>
            </Card>
        </div>
    );
}
