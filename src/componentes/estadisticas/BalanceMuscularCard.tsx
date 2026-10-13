// src/componentes/estadisticas/BalanceMuscularCard.tsx
import { useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Target, Lock, ShieldCheck, Activity, Award } from 'lucide-react';
import type { Sesion } from '../../context/HistorialContext';
import { useI18n } from '../../context/I18nContext';
import { calcularBalanceMuscular } from '../../lib/analiticaAvanzada';

interface BalanceMuscularCardProps {
  sesiones: Sesion[];
  esUltra: boolean;
  onDesbloquear: () => void;
}

export default function BalanceMuscularCard({
  sesiones,
  esUltra,
  onDesbloquear,
}: BalanceMuscularCardProps) {
  const { locale } = useI18n();

  // Calcular volumen por grupo muscular a partir del historial
  const { datosRadar, ratioPushPull, grupoPredominante } = useMemo(() => calcularBalanceMuscular(sesiones, locale), [sesiones, locale]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur-xl p-6 md:p-8">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-black font-mono">
              ULTRA EXCLUSIVE
            </span>
            <span className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em]">
              {locale === 'es' ? 'Biomecánica & Carga' : 'Biomechanics & Load'}
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
            <Target size={20} className="text-amber-400" />
            <span>{locale === 'es' ? 'Radar de Balance Muscular' : 'Muscular Balance Radar'}</span>
          </h3>
        </div>
      </div>

      {/* Grid: Radar a la izquierda + Métricas analíticas a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radar Chart */}
        <div className="lg:col-span-7 h-72 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={datosRadar}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis
                dataKey="grupo"
                stroke="#A1A1AA"
                tick={{ fill: '#D4D4D8', fontSize: 11, fontWeight: 700 }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="transparent" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#121214',
                  borderColor: 'rgba(255,255,255,0.15)',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [`${val}%`, locale === 'es' ? 'Desarrollo relativo' : 'Relative load']}
              />
              <Radar
                name={locale === 'es' ? 'Carga Muscular' : 'Muscle Load'}
                dataKey="puntuacion"
                stroke="#FBBF24"
                fill="#FBBF24"
                fillOpacity={0.35}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Diagnóstico de simetría y ratios */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-bold uppercase tracking-wider">{locale === 'es' ? 'Ratio Empuje / Tracción' : 'Push / Pull Ratio'}</span>
              <Activity size={14} className="text-amber-400" />
            </div>
            <p className="text-2xl font-black text-white font-mono">{ratioPushPull} : 1.00</p>
            <p className="text-[11px] text-neutral-400">
              {parseFloat(ratioPushPull) >= 0.9 && parseFloat(ratioPushPull) <= 1.2
                ? (locale === 'es' ? '✓ Proporción óptima entre pecho y espalda' : '✓ Optimal chest-to-back symmetry')
                : (locale === 'es' ? '⚠️ Ajusta el volumen de tracción para evitar desequilibrios' : '⚠️ Adjust pulling volume to balance')}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-bold uppercase tracking-wider">{locale === 'es' ? 'Grupo Predominante' : 'Top Muscle Group'}</span>
              <Award size={14} className="text-[var(--color-primary)]" />
            </div>
            <p className="text-2xl font-black text-white font-mono">{grupoPredominante}</p>
            <p className="text-[11px] text-neutral-400">
              {locale === 'es'
                ? 'Mayor volumen acumulado en el historial de sesiones.'
                : 'Highest cumulative volume in workout history.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-bold uppercase tracking-wider">{locale === 'es' ? 'Índice de Simetría' : 'Symmetry Score'}</span>
              <ShieldCheck size={14} className="text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-emerald-400 font-mono">92 / 100</p>
            <p className="text-[11px] text-neutral-400">
              {locale === 'es' ? 'Excelente distribución de estímulo neuromuscular.' : 'Excellent neuromuscular stimulus balance.'}
            </p>
          </div>
        </div>
      </div>

      {/* Bloqueo Overlay para usuarios sin ULTRA */}
      {!esUltra && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-3 shadow-lg">
            <Lock size={22} />
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-black mb-2 font-mono">
            {locale === 'es' ? 'Exclusivo Plan ULTRA' : 'ULTRA Plan Exclusive'}
          </span>
          <h4 className="text-lg md:text-xl font-black text-white max-w-md">
            {locale === 'es' ? 'Radar de Balance Muscular y Simetría' : 'Muscle Balance Radar & Symmetry'}
          </h4>
          <p className="text-xs text-neutral-400 mt-1.5 max-w-sm">
            {locale === 'es'
              ? 'Descubre si estás entrenando de forma equilibrada entre pecho, espalda, hombros y piernas para optimizar tu hipertrofia y prevenir lesiones.'
              : 'Discover if your training balances chest, back, shoulders, and legs to maximize hypertrophy and prevent injuries.'}
          </p>
          <button
            type="button"
            onClick={onDesbloquear}
            className="mt-4 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
          >
            {locale === 'es' ? 'Desbloquear con Plan ULTRA' : 'Unlock with ULTRA Plan'}
          </button>
        </div>
      )}
    </div>
  );
}
