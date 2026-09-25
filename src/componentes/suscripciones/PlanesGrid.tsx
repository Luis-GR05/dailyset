// src/componentes/suscripciones/PlanesGrid.tsx
import { Check, Zap, Crown, Sparkles, ArrowRight, Star } from 'lucide-react';
import { DESGLOSE_FINANCIERO } from '../../data/planesSuscripcion';
import type { CicloFacturacion, DesgloseFinanciero, TipoPlan } from '../../types/suscripcion';
import { useI18n } from '../../context/I18nContext';

interface PlanesGridProps {
  ciclo: CicloFacturacion;
  onChangeCiclo: (ciclo: CicloFacturacion) => void;
  planActual: TipoPlan;
  onSeleccionarPlan: (plan: DesgloseFinanciero) => void;
}

export default function PlanesGrid({
  ciclo,
  onChangeCiclo,
  planActual,
  onSeleccionarPlan,
}: PlanesGridProps) {
  const { locale } = useI18n();

  const featuresPorPlan: Record<TipoPlan, { es: string[]; en: string[] }> = {
    free: {
      es: [
        'Hasta 4 rutinas activas (Torso-Pierna / PPL)',
        'Historial y calendario de los últimos 45 días',
        'Búsqueda y guías técnicas básicas',
        'Gráfica de volumen semanal',
        'Seguir hasta 20 personas en el feed',
        'Ver y clonar rutinas de la comunidad',
        'Soporte estándar de la comunidad',
      ],
      en: [
        'Up to 4 active routines (Upper-Lower / PPL)',
        'Calendar & history of the last 45 days',
        'Search and basic exercise technical guides',
        'Weekly workout volume analytics',
        'Follow up to 20 community athletes',
        'Explore and clone community routines',
        'Standard community support',
      ],
    },
    pro: {
      es: [
        'Hasta 12 rutinas + duplicación instantánea',
        '1 año de historial + tonelaje total acumulado',
        'Catálogo completo + histórico de marcas y récords',
        'Gráfica de progresión por ejercicio (1 año)',
        'Seguir y feed sin límite de usuarios',
        'Publicar y compartir rutinas propias',
        'Hasta 10 rutinas personalizadas',
      ],
      en: [
        'Up to 12 routines + instant duplication',
        '1 year of history + cumulative tonnage stats',
        'Full catalog + PR history & record tracker',
        'Progression charts per exercise (1 year)',
        'Unlimited social follow and feed',
        'Publish and share your own custom workouts',
        'Up to 10 custom routines',
      ],
    },
    ultra: {
      es: [
        'Rutinas activas ilimitadas + importar/exportar',
        'Historial vitalicio completo + exportación CSV/PDF',
        'Catálogo completo + notas privadas por ejercicio',
        'Gráficas avanzadas: balance muscular y comparativas',
        'Seguir y feed ilimitado con métricas de atletas',
        'Estadísticas exclusivas de quién usa tus rutinas',
        'Rutinas y ejercicios personalizados ilimitados',
      ],
      en: [
        'Unlimited routines + athlete import/export',
        'Lifetime workout history + CSV/PDF export',
        'Full catalog + private notes per exercise',
        'Advanced charts: muscular balance & comparisons',
        'Unlimited social follow with athlete telemetry',
        'Exclusive analytics on who uses your routines',
        'Unlimited custom routines & custom exercises',
      ],
    },
  };

  return (
    <div className="w-full space-y-8">
      {/* ── Selector de Facturación (Mensual vs Anual -15%) ── */}
      <div className="flex flex-col items-center justify-center space-y-3">
        <div
          className="inline-flex items-center p-1.5 rounded-full border shadow-inner backdrop-blur-md"
          style={{
            backgroundColor: 'var(--color-neutral-800)',
            borderColor: 'var(--color-neutral-900)',
          }}
        >
          <button
            type="button"
            onClick={() => onChangeCiclo('mensual')}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
              ciclo === 'mensual'
                ? 'bg-white text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {locale === 'es' ? 'Facturación Mensual' : 'Monthly Billing'}
          </button>

          <button
            type="button"
            onClick={() => onChangeCiclo('anual')}
            className={`relative px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
              ciclo === 'anual'
                ? 'bg-[var(--color-primary)] text-black shadow-[0_0_20px_var(--color-primary-glow)] font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>{locale === 'es' ? 'Facturación Anual' : 'Annual Billing'}</span>
            <span
              className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full tracking-wider transition-colors ${
                ciclo === 'anual'
                  ? 'bg-black text-[var(--color-primary)]'
                  : 'bg-[var(--color-primary)] text-black'
              }`}
            >
              -15% DTO
            </span>
          </button>
        </div>
      </div>

      {/* ── Grid de los 3 Planes ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-2">
        {DESGLOSE_FINANCIERO.map((plan) => {
          const esActual = planActual === plan.planId;
          const esPro = plan.planId === 'pro';
          const esUltra = plan.planId === 'ultra';

          // Precios dinámicos según ciclo
          const precioNum =
            ciclo === 'mensual' ? plan.precioMensual : plan.precioAnual;

          return (
            <div
              key={plan.planId}
              className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 backdrop-blur-xl bg-neutral-900/60 ${
                esPro
                  ? 'border border-[var(--color-primary)] shadow-[0_0_30px_rgba(212,251,52,0.15)] scale-[1.02] md:-translate-y-2'
                  : esUltra
                  ? 'border border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.12)]'
                  : 'border border-white/10 hover:border-white/20'
              }`}
            >
              {/* Badge superior para Pro y Ultra */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase shadow-md whitespace-nowrap ${
                      esPro
                        ? 'bg-[var(--color-primary)] text-black shadow-[0_0_15px_var(--color-primary-glow)]'
                        : esUltra
                        ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {esPro && <Zap size={11} className="fill-black shrink-0" />}
                    {esUltra && <Crown size={11} className="fill-black shrink-0" />}
                    <span className="leading-none">{locale === 'es' ? plan.badge : plan.badgeEn}</span>
                  </span>
                </div>
              )}

              {/* Indicador de Plan Actual */}
              {esActual && (
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-white/10 text-white border border-white/20">
                    <Star size={12} className="text-white fill-white" />
                    {locale === 'es' ? 'Tu plan actual' : 'Your current plan'}
                  </span>
                </div>
              )}

              {/* Cabecera del Plan */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3
                    className="text-2xl sm:text-3xl font-black tracking-tight"
                    style={{
                      color: esPro
                        ? 'var(--color-primary)'
                        : esUltra
                        ? '#FBBF24'
                        : 'white',
                    }}
                  >
                    {locale === 'es' ? plan.nombre : plan.nombreEn}
                  </h3>
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
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
                      <Crown size={20} />
                    ) : esPro ? (
                      <Zap size={20} />
                    ) : (
                      <Sparkles size={20} />
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-neutral-400 min-h-[38px] leading-relaxed">
                  {locale === 'es' ? plan.subtitulo : plan.subtituloEn}
                </p>

                {/* Precio Principal */}
                <div className="mt-6 mb-4 pb-6 border-b border-white/10">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
                      {precioNum === 0
                        ? '0,00 €'
                        : ciclo === 'mensual'
                        ? `${plan.precioMensual.toFixed(2).replace('.', ',')} €`
                        : `${plan.precioAnual.toFixed(2).replace('.', ',')} €`}
                    </span>
                    <span className="text-sm font-semibold text-neutral-400">
                      {precioNum === 0
                        ? ''
                        : ciclo === 'mensual'
                        ? locale === 'es'
                          ? '/mes'
                          : '/month'
                        : locale === 'es'
                        ? '/año'
                        : '/year'}
                    </span>
                  </div>

                  {/* Detalle del desglose financiero en modo anual */}
                  {ciclo === 'anual' && plan.precioAnual > 0 && (
                    <div className="mt-2.5 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-400">
                          {locale === 'es' ? 'Equivalente mensual:' : 'Monthly equiv:'}
                        </span>
                        <span className="font-bold text-white font-mono">
                          {plan.equivalenteMesAnualTexto}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--color-primary)] font-bold">
                          {locale === 'es' ? 'Ahorro anual (-15%):' : 'Annual savings (-15%):'}
                        </span>
                        <span className="font-bold text-[var(--color-primary)] font-mono">
                          +{plan.ahorroAnualTexto}
                        </span>
                      </div>
                    </div>
                  )}

                  {ciclo === 'mensual' && plan.precioMensual > 0 && (
                    <p className="text-[11px] text-neutral-400 mt-2">
                      {locale === 'es'
                        ? `O ahorra ${plan.ahorroAnualTexto} con facturación anual`
                        : `Or save ${plan.ahorroAnualTexto} with annual billing`}
                    </p>
                  )}
                </div>

                {/* Lista de Funcionalidades */}
                <div className="space-y-3 mb-8">
                  <p className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
                    {locale === 'es' ? 'QUÉ INCLUYE ESTE PLAN:' : 'WHAT IS INCLUDED:'}
                  </p>
                  <ul className="space-y-2.5">
                    {featuresPorPlan[plan.planId][locale].map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                        <span
                          className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5"
                          style={{
                            backgroundColor: esPro
                              ? 'var(--color-primary)'
                              : esUltra
                              ? '#FBBF24'
                              : 'rgba(255,255,255,0.15)',
                            color: '#000000',
                          }}
                        >
                          <Check size={11} strokeWidth={3} />
                        </span>
                        <span className="text-neutral-200 leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Botón de Acción / CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onSeleccionarPlan(plan)}
                  disabled={esActual}
                  className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer shadow-lg ${
                    esActual
                      ? 'bg-neutral-800 text-neutral-400 border border-neutral-700 cursor-default opacity-80'
                      : esPro
                      ? 'bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-hover)] hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_25px_var(--color-primary-glow)]'
                      : esUltra
                      ? 'bg-amber-400 text-black hover:bg-amber-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_25px_rgba(245,158,11,0.3)]'
                      : 'bg-white text-black hover:bg-neutral-200 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {esActual ? (
                    <>
                      <Check size={16} />
                      <span>{locale === 'es' ? 'Plan Activo' : 'Active Plan'}</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {plan.precioMensual === 0
                          ? locale === 'es'
                            ? 'Seleccionar Free'
                            : 'Select Free'
                          : locale === 'es'
                          ? `Elegir ${plan.nombre}`
                          : `Choose ${plan.nombre}`}
                      </span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-neutral-400 mt-2.5">
                  {plan.precioMensual === 0
                    ? locale === 'es'
                      ? 'Sin tarjeta de crédito requerida'
                      : 'No credit card required'
                    : locale === 'es'
                    ? 'Cancela o cambia de plan cuando quieras'
                    : 'Cancel or switch plans anytime'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
