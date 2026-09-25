// src/componentes/suscripciones/TablaDesgloseFinanciero.tsx
import { Zap, Crown, Sparkles, TrendingDown, Info, ShieldCheck } from 'lucide-react';
import { DESGLOSE_FINANCIERO } from '../../data/planesSuscripcion';
import { useI18n } from '../../context/I18nContext';
import type { TipoPlan } from '../../types/suscripcion';

interface TablaDesgloseFinancieroProps {
  planActual?: TipoPlan;
  onSeleccionarPlan?: (planId: TipoPlan) => void;
}

export default function TablaDesgloseFinanciero({
  planActual,
  onSeleccionarPlan,
}: TablaDesgloseFinancieroProps) {
  const { locale } = useI18n();

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <TrendingDown className="text-[var(--color-primary)]" size={24} />
            <span>
              {locale === 'es'
                ? 'Desglose Financiero y Cuotas'
                : 'Financial Breakdown and Rates'}
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            {locale === 'es'
              ? 'Comparativa oficial de tarifas mensuales y ahorro con suscripción anual (-15%)'
              : 'Official comparison of monthly rates and annual subscription savings (-15%)'}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300">
          <Info size={14} className="text-[var(--color-primary)]" />
          <span>{locale === 'es' ? 'Precios con IVA incluido' : 'Prices include VAT'}</span>
        </div>
      </div>

      {/* ── Vista de Tabla en Escritorio ── */}
      <div className="hidden md:block overflow-x-auto rounded-3xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-950/80">
              <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-neutral-400">
                {locale === 'es' ? 'Plan' : 'Plan'}
              </th>
              <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-neutral-400">
                {locale === 'es' ? 'Mensual' : 'Monthly'}
              </th>
              <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-neutral-400">
                <span className="inline-flex items-center gap-1.5">
                  <span>{locale === 'es' ? 'Anual (-15%)' : 'Annual (-15%)'}</span>
                  <span className="bg-[var(--color-primary)] text-black text-[10px] font-black px-1.5 py-0.5 rounded">
                    HOT
                  </span>
                </span>
              </th>
              <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-neutral-400">
                {locale === 'es' ? 'Equiv. / mes' : 'Equiv. / mo'}
              </th>
              <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-neutral-400">
                {locale === 'es' ? 'Ahorro anual' : 'Annual Savings'}
              </th>
              <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-neutral-400 text-right">
                {locale === 'es' ? 'Estado' : 'Status'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/80 text-sm">
            {DESGLOSE_FINANCIERO.map((fila) => {
              const esActual = planActual === fila.planId;
              const esPro = fila.planId === 'pro';
              const esUltra = fila.planId === 'ultra';

              return (
                <tr
                  key={fila.planId}
                  className={`transition-colors ${
                    esActual
                      ? 'bg-white/[0.03]'
                      : esPro
                      ? 'hover:bg-[var(--color-primary)]/[0.04]'
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Plan */}
                  <td className="py-5 px-6 font-bold">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: esPro
                            ? 'var(--color-primary-muted)'
                            : esUltra
                            ? 'rgba(245, 158, 11, 0.15)'
                            : 'rgba(255, 255, 255, 0.05)',
                          color: esPro
                            ? 'var(--color-primary)'
                            : esUltra
                            ? '#FBBF24'
                            : '#A1A1AA',
                        }}
                      >
                        {esUltra ? (
                          <Crown size={18} />
                        ) : esPro ? (
                          <Zap size={18} />
                        ) : (
                          <Sparkles size={18} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="font-black text-base"
                            style={{
                              color: esPro
                                ? 'var(--color-primary)'
                                : esUltra
                                ? '#FBBF24'
                                : 'white',
                            }}
                          >
                            {fila.nombre}
                          </span>
                          {fila.badge && (
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full whitespace-nowrap ${
                                esPro
                                  ? 'bg-[var(--color-primary)] text-black'
                                  : esUltra
                                  ? 'bg-amber-400 text-black'
                                  : 'bg-neutral-800 text-neutral-300'
                              }`}
                            >
                              {locale === 'es' ? fila.badge : fila.badgeEn}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-neutral-400 font-normal block">
                          {locale === 'es' ? fila.subtitulo : fila.subtituloEn}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Mensual */}
                  <td className="py-5 px-6 font-mono font-bold text-white text-base">
                    {fila.precioMensualTexto}
                  </td>

                  {/* Anual (-15%) */}
                  <td className="py-5 px-6 font-mono font-bold text-white text-base">
                    {fila.precioAnualTexto}
                  </td>

                  {/* Equiv. / mes */}
                  <td className="py-5 px-6 font-mono font-bold text-neutral-300 text-base">
                    {fila.equivalenteMesAnualTexto}
                  </td>

                  {/* Ahorro anual */}
                  <td className="py-5 px-6">
                    {fila.ahorroAnual > 0 ? (
                      <span className="inline-flex items-center gap-1 font-mono font-black text-base text-[var(--color-primary)]">
                        +{fila.ahorroAnualTexto}
                      </span>
                    ) : (
                      <span className="font-mono text-neutral-400">—</span>
                    )}
                  </td>

                  {/* Estado / Acción */}
                  <td className="py-5 px-6 text-right">
                    {esActual ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-white/10 text-white border border-white/20">
                        {locale === 'es' ? 'ACTUAL' : 'CURRENT'}
                      </span>
                    ) : onSeleccionarPlan ? (
                      <button
                        type="button"
                        onClick={() => onSeleccionarPlan(fila.planId)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-transform hover:scale-105 active:scale-95 cursor-pointer ${
                          esPro
                            ? 'bg-[var(--color-primary)] text-black'
                            : esUltra
                            ? 'bg-amber-400 text-black'
                            : 'bg-white text-black'
                        }`}
                      >
                        {locale === 'es' ? 'Elegir' : 'Select'}
                      </button>
                    ) : (
                      <span className="text-xs text-neutral-400 font-medium">
                        {locale === 'es' ? 'Disponible' : 'Available'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Vista Móvil (Cards condensadas) ── */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {DESGLOSE_FINANCIERO.map((fila) => {
          const esActual = planActual === fila.planId;
          const esPro = fila.planId === 'pro';
          const esUltra = fila.planId === 'ultra';

          return (
            <div
              key={fila.planId}
              className={`p-5 rounded-2xl border ${
                esActual
                  ? 'border-white/30 bg-neutral-900'
                  : esPro
                  ? 'border-[var(--color-primary)]/40 bg-neutral-900/90'
                  : 'border-neutral-800 bg-neutral-900/60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4
                    className="font-black text-lg"
                    style={{
                      color: esPro
                        ? 'var(--color-primary)'
                        : esUltra
                        ? '#FBBF24'
                        : 'white',
                    }}
                  >
                    {fila.nombre}
                  </h4>
                  {fila.badge && (
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full whitespace-nowrap ${
                        esPro
                          ? 'bg-[var(--color-primary)] text-black'
                          : esUltra
                          ? 'bg-amber-400 text-black'
                          : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      {locale === 'es' ? fila.badge : fila.badgeEn}
                    </span>
                  )}
                </div>
                {esActual && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/10 text-white">
                    {locale === 'es' ? 'Tu Plan' : 'Your Plan'}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-neutral-800 my-2">
                <div>
                  <span className="text-neutral-400 block">
                    {locale === 'es' ? 'Mensual:' : 'Monthly:'}
                  </span>
                  <span className="font-mono font-bold text-white text-sm">
                    {fila.precioMensualTexto}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block">
                    {locale === 'es' ? 'Anual (-15%):' : 'Annual (-15%):'}
                  </span>
                  <span className="font-mono font-bold text-white text-sm">
                    {fila.precioAnualTexto}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block">
                    {locale === 'es' ? 'Equiv./mes:' : 'Equiv./mo:'}
                  </span>
                  <span className="font-mono font-bold text-neutral-300">
                    {fila.equivalenteMesAnualTexto}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--color-primary)] block font-semibold">
                    {locale === 'es' ? 'Ahorro anual:' : 'Annual savings:'}
                  </span>
                  <span className="font-mono font-bold text-[var(--color-primary)]">
                    {fila.ahorroAnual > 0 ? `+${fila.ahorroAnualTexto}` : '—'}
                  </span>
                </div>
              </div>

              {onSeleccionarPlan && !esActual && (
                <button
                  type="button"
                  onClick={() => onSeleccionarPlan(fila.planId)}
                  className={`w-full mt-2 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${
                    esPro
                      ? 'bg-[var(--color-primary)] text-black'
                      : esUltra
                      ? 'bg-amber-400 text-black'
                      : 'bg-white text-black'
                  }`}
                >
                  {locale === 'es' ? `Elegir ${fila.nombre}` : `Select ${fila.nombre}`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
