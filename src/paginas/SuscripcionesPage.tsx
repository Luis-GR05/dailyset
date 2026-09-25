// src/paginas/SuscripcionesPage.tsx
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AppLayout, TituloPagina } from '../componentes';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { DESGLOSE_FINANCIERO } from '../data/planesSuscripcion';
import type { CicloFacturacion, DesgloseFinanciero, TipoPlan } from '../types/suscripcion';
import PlanesGrid from '../componentes/suscripciones/PlanesGrid';
import TablaDesgloseFinanciero from '../componentes/suscripciones/TablaDesgloseFinanciero';
import MatrizFuncionalidades from '../componentes/suscripciones/MatrizFuncionalidades';
import ModalContratarPlan from '../componentes/suscripciones/ModalContratarPlan';
import PreguntasFrecuentes from '../componentes/suscripciones/PreguntasFrecuentes';
import BannerGarantia from '../componentes/suscripciones/BannerGarantia';
import {
  Crown,
  Zap,
  Sparkles,
  CheckCircle2,
  TrendingDown,
  Layers,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

type TabSeccion = 'planes' | 'matriz' | 'cuotas' | 'faq';

export default function SuscripcionesPage() {
  const { user, updateUser } = useAuth();
  const { locale } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabQuery = searchParams.get('tab') as TabSeccion | null;
  const [tabActiva, setTabActiva] = useState<TabSeccion>(
    tabQuery && ['planes', 'matriz', 'cuotas', 'faq'].includes(tabQuery)
      ? tabQuery
      : 'planes'
  );

  const [ciclo, setCiclo] = useState<CicloFacturacion>(
    (user?.cicloFacturacion as CicloFacturacion) || 'anual'
  );

  // Modal de contratación / checkout
  const [modalAbierto, setModalAbierto] = useState(false);
  const [planSeleccionado, setPlanSeleccionado] = useState<DesgloseFinanciero>(
    DESGLOSE_FINANCIERO.find((p) => p.planId === (user?.plan || 'pro')) || DESGLOSE_FINANCIERO[1]
  );

  // Notificación de éxito
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const planActual: TipoPlan = (user?.plan as TipoPlan) || 'free';

  useEffect(() => {
    document.title =
      locale === 'es'
        ? 'Planes y Suscripción | DailySet'
        : 'Plans & Subscription | DailySet';
  }, [locale]);

  const handleSeleccionarPlan = (plan: DesgloseFinanciero) => {
    setPlanSeleccionado(plan);
    setModalAbierto(true);
  };

  const handleSeleccionarPlanPorId = (planId: TipoPlan) => {
    const plan = DESGLOSE_FINANCIERO.find((p) => p.planId === planId);
    if (plan) {
      setPlanSeleccionado(plan);
      setModalAbierto(true);
    }
  };

  const handleExitoContratacion = (planId: string) => {
    setModalAbierto(false);
    const nombrePlan =
      DESGLOSE_FINANCIERO.find((p) => p.planId === planId)?.nombre || planId;
    setMensajeExito(
      locale === 'es'
        ? `¡Enhorabuena! Has activado con éxito el Plan DailySet ${nombrePlan}.`
        : `Congratulations! You have successfully activated DailySet ${nombrePlan} Plan.`
    );
    setTimeout(() => {
      setMensajeExito(null);
    }, 5000);
  };

  const infoPlanActual =
    DESGLOSE_FINANCIERO.find((p) => p.planId === planActual) || DESGLOSE_FINANCIERO[0];

  return (
    <AppLayout>
      <div className="space-y-8 pb-12 animate-fade-in">
        {/* ── Banner de Éxito Flotante / Alerta ── */}
        {mensajeExito && (
          <div className="p-4 rounded-2xl bg-[var(--color-primary)] text-black font-bold flex items-center justify-between shadow-[0_0_30px_var(--color-primary-glow)]">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} className="shrink-0" />
              <p className="text-sm">{mensajeExito}</p>
            </div>
            <button
              onClick={() => setMensajeExito(null)}
              className="text-black font-black text-sm px-2 py-1 rounded-lg hover:bg-black/10 transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Encabezado Principal ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div>
            <TituloPagina
              titulo={locale === 'es' ? 'Planes de Suscripción' : 'Subscription Plans'}
              subtitulo={
                locale === 'es'
                  ? 'Elige el nivel de potencia que necesita tu entrenamiento. Desbloquea rutinas ilimitadas, analíticas avanzadas y más.'
                  : 'Choose the power tier your training demands. Unlock unlimited routines, advanced analytics and more.'
              }
            />
          </div>

          {/* Tarjeta resumen del Plan Actual del usuario */}
          <div
            className="p-4 rounded-2xl border flex items-center gap-4 bg-neutral-900/90 shadow-md shrink-0"
            style={{
              borderColor:
                planActual === 'ultra'
                  ? 'rgba(245, 158, 11, 0.4)'
                  : planActual === 'pro'
                  ? 'var(--color-primary)'
                  : 'var(--color-neutral-800)',
            }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor:
                  planActual === 'ultra'
                    ? 'rgba(245, 158, 11, 0.2)'
                    : planActual === 'pro'
                    ? 'var(--color-primary-muted)'
                    : 'rgba(255, 255, 255, 0.05)',
                color:
                  planActual === 'ultra'
                    ? '#FBBF24'
                    : planActual === 'pro'
                    ? 'var(--color-primary)'
                    : '#A1A1AA',
              }}
            >
              {planActual === 'ultra' ? (
                <Crown size={22} />
              ) : planActual === 'pro' ? (
                <Zap size={22} />
              ) : (
                <Sparkles size={22} />
              )}
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">
                {locale === 'es' ? 'Tu plan activo:' : 'Your active plan:'}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="font-black text-lg"
                  style={{
                    color:
                      planActual === 'ultra'
                        ? '#FBBF24'
                        : planActual === 'pro'
                        ? 'var(--color-primary)'
                        : '#FFFFFF',
                  }}
                >
                  Plan {infoPlanActual.nombre}
                </span>
                {planActual !== 'free' && (
                  <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-white/10 text-white font-bold">
                    {user?.cicloFacturacion === 'anual'
                      ? locale === 'es'
                        ? 'Anual'
                        : 'Annual'
                      : locale === 'es'
                      ? 'Mensual'
                      : 'Monthly'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400">
                {planActual === 'free'
                  ? locale === 'es'
                    ? 'Actualiza para desbloquear todo el potencial'
                    : 'Upgrade to unlock full potential'
                  : locale === 'es'
                  ? 'Todas las ventajas activadas'
                  : 'All perks active'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Navegación entre Pestañas de Contenido ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-800 scrollbar-hide">
          <button
            type="button"
            onClick={() => setTabActiva('planes')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              tabActiva === 'planes'
                ? 'bg-white text-black shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap size={16} />
            <span>{locale === 'es' ? 'Planes y Precios' : 'Plans & Pricing'}</span>
          </button>

          <button
            type="button"
            onClick={() => setTabActiva('matriz')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              tabActiva === 'matriz'
                ? 'bg-[var(--color-primary)] text-black shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers size={16} />
            <span>
              {locale === 'es' ? 'Matriz de Funcionalidades' : 'Feature Matrix'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTabActiva('cuotas')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              tabActiva === 'cuotas'
                ? 'bg-white text-black shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <TrendingDown size={16} />
            <span>
              {locale === 'es' ? 'Desglose Financiero' : 'Financial Breakdown'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTabActiva('faq')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              tabActiva === 'faq'
                ? 'bg-white text-black shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <HelpCircle size={16} />
            <span>{locale === 'es' ? 'Garantía y FAQ' : 'Guarantee & FAQ'}</span>
          </button>
        </div>

        {/* ── Contenido de la Pestaña Activa ── */}
        {tabActiva === 'planes' && (
          <div className="space-y-8">
            <PlanesGrid
              ciclo={ciclo}
              onChangeCiclo={setCiclo}
              planActual={planActual}
              onSeleccionarPlan={handleSeleccionarPlan}
            />
          </div>
        )}

        {tabActiva === 'matriz' && (
          <div className="space-y-8">
            <MatrizFuncionalidades planActual={planActual} />
          </div>
        )}

        {tabActiva === 'cuotas' && (
          <div className="space-y-8">
            <TablaDesgloseFinanciero
              planActual={planActual}
              onSeleccionarPlan={handleSeleccionarPlanPorId}
            />
          </div>
        )}

        {tabActiva === 'faq' && (
          <div className="space-y-8">
            <BannerGarantia />
            <PreguntasFrecuentes />
          </div>
        )}

        {/* ── Modal de Checkout y Contratación ── */}
        <ModalContratarPlan
          plan={planSeleccionado}
          cicloInicial={ciclo}
          abierto={modalAbierto}
          onCerrar={() => setModalAbierto(false)}
          onExito={handleExitoContratacion}
        />
      </div>
    </AppLayout>
  );
}
