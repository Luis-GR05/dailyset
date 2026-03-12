import Card from './Card';
import { useI18n } from '../../context/I18nContext';

interface ResumenEstadisticasProps {
    volumenTotalKg: number;
    intensidad: string;
    disciplinaPct: number;
}

export default function ResumenEstadisticas({ volumenTotalKg, intensidad, disciplinaPct }: ResumenEstadisticasProps) {
    const { t, locale } = useI18n();

    const volumenDisplay = volumenTotalKg >= 1000
        ? `${(volumenTotalKg / 1000).toFixed(1)} Ton`
        : `${volumenTotalKg} kg`;

    const intensidadMap: Record<string, string> = locale === 'es'
        ? { Alta: 'Alta', Media: 'Media', Baja: 'Baja' }
        : { Alta: 'High', Media: 'Medium', Baja: 'Low' };

    const intensidadLabel = intensidadMap[intensidad] ?? intensidad;
    const intensidadIcon = intensidad === 'Alta' ? '🔥' : intensidad === 'Media' ? '⚡' : '💤';

    return (
        <div className="grid grid-cols-3 gap-3">
            <Card className="p-4 text-center" hoverable={false}>
                <h3 className="text-neutral-400 text-xs uppercase font-bold mb-2">{t.history.totalVolume}</h3>
                <p className="text-xl font-bold leading-tight" style={{ color: 'var(--color-white)' }}>{volumenDisplay}</p>
            </Card>
            <Card className="p-4 text-center" hoverable={false}>
                <h3 className="text-neutral-400 text-xs uppercase font-bold mb-2">{t.history.intensity}</h3>
                <p className="text-xl font-bold leading-tight" style={{ color: 'var(--color-white)' }}>{intensidadLabel} {intensidadIcon}</p>
            </Card>
            <Card className="p-4 text-center" hoverable={false}>
                <h3 className="text-neutral-400 text-xs uppercase font-bold mb-2">{t.history.discipline}</h3>
                <p className="text-xl font-bold leading-tight" style={{ color: 'var(--color-primary)' }}>{disciplinaPct}% 🎯</p>
            </Card>
        </div>
    );
}
