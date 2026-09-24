import Card from './Card';
import { useI18n } from '../../context/I18nContext';
import { Dumbbell, Flame, Zap, Activity, Target } from 'lucide-react';

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

    const renderIntensidadIcon = () => {
        if (intensidad === 'Alta') {
            return <Flame size={16} className="text-amber-400 shrink-0" />;
        }
        if (intensidad === 'Media') {
            return <Zap size={16} className="text-yellow-400 shrink-0" />;
        }
        return <Activity size={16} className="text-sky-400 shrink-0" />;
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="p-4 text-center flex flex-col items-center justify-center" hoverable={false}>
                <div className="flex items-center gap-1.5 text-neutral-400 mb-1.5">
                    <Dumbbell size={13} />
                    <h3 className="text-xs uppercase font-bold tracking-wider">{t.history.totalVolume}</h3>
                </div>
                <p className="text-xl font-black leading-tight" style={{ color: 'var(--color-white)' }}>{volumenDisplay}</p>
            </Card>

            <Card className="p-4 text-center flex flex-col items-center justify-center" hoverable={false}>
                <div className="flex items-center gap-1.5 text-neutral-400 mb-1.5">
                    {renderIntensidadIcon()}
                    <h3 className="text-xs uppercase font-bold tracking-wider">{t.history.intensity}</h3>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                    <p className="text-xl font-black leading-tight" style={{ color: 'var(--color-white)' }}>{intensidadLabel}</p>
                </div>
            </Card>

            <Card className="p-4 text-center flex flex-col items-center justify-center" hoverable={false}>
                <div className="flex items-center gap-1.5 text-neutral-400 mb-1.5">
                    <Target size={13} className="text-white" />
                    <h3 className="text-xs uppercase font-bold tracking-wider">{t.history.discipline}</h3>
                </div>
                <p className="text-xl font-black leading-tight text-white">{disciplinaPct}%</p>
            </Card>
        </div>
    );
}
