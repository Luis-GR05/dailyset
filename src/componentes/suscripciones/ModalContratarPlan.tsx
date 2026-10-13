// src/componentes/suscripciones/ModalContratarPlan.tsx
import { useState } from 'react';
import {
  X,
  Zap,
  Crown,
  Sparkles,
  ShieldCheck,
  Lock,
  Loader2,
} from 'lucide-react';
import type { CicloFacturacion, DesgloseFinanciero } from '../../types/suscripcion';
import { useI18n } from '../../context/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { abrirPortalFacturacion, iniciarCheckoutStripe } from '../../lib/stripeService';
import { useTextos } from '../../hooks/useTextos';
import { textosPagos } from '../../data/textos/pagos';

interface ModalContratarPlanProps {
  plan: DesgloseFinanciero;
  cicloInicial: CicloFacturacion;
  abierto: boolean;
  onCerrar: () => void;
  /** La app lo usa al volver del navegador de Stripe; la web confirma el plan al volver a /suscripciones. */
  onExito?: (planId: string) => void;
}

export default function ModalContratarPlan({
  plan,
  cicloInicial,
  abierto,
  onCerrar,
}: ModalContratarPlanProps) {
  const { locale } = useI18n();
  const txPagos = useTextos(textosPagos);
  const { user } = useAuth();

  const [ciclo, setCiclo] = useState<CicloFacturacion>(cicloInicial);
  const [procesando, setProcesando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!abierto) return null;

  const esGratis = plan.planId === 'free';
  const esPro = plan.planId === 'pro';
  const esUltra = plan.planId === 'ultra';
  const tieneSuscripcionActiva = !!user?.plan && user.plan !== 'free';

  // Cálculos financieros
  const precioFinal =
    ciclo === 'mensual' ? plan.precioMensual : plan.precioAnual;
  const ahorro =
    ciclo === 'anual' && plan.ahorroAnual > 0 ? plan.ahorroAnual : 0;
  const ivaIncluido = (precioFinal * 0.21).toFixed(2);

  const handleConfirmar = async () => {
    setProcesando(true);
    setErrorMsg('');
    try {
      if (!user || user.id === 'invitado') {
        throw new Error(txPagos.iniciaSesionConTuCuenta);
      }
      if (esGratis) {
        if (!tieneSuscripcionActiva) {
          onCerrar();
          return;
        }
        const portal = await abrirPortalFacturacion();
        if (portal.error) throw new Error(portal.error);
        return; // el navegador redirige a Stripe
      }
      const res = await iniciarCheckoutStripe({ planId: plan.planId as 'pro' | 'ultra', ciclo });
      if (res.error) throw new Error(res.error);
      // El navegador redirige a Stripe; al volver, SuscripcionesPage confirma el plan.
    } catch (err: any) {
      console.error('Error al contratar plan:', err);
      setErrorMsg(
        err?.message ||
          txPagos.huboUnProblemaAlConectar
      );
      setProcesando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-lg rounded-3xl border border-neutral-800 p-6 sm:p-8 overflow-hidden shadow-2xl space-y-6"
        style={{
          backgroundColor: '#121214',
          boxShadow: esPro
            ? '0 0 50px rgba(212,251,52,0.15)'
            : esUltra
            ? '0 0 50px rgba(245,158,11,0.15)'
            : '0 0 40px rgba(255,255,255,0.05)',
        }}
      >
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onCerrar}
          disabled={procesando}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

            {/* Cabecera del Modal */}
            <div className="flex items-center gap-4 pr-8">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
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
                    : '#FFFFFF',
                }}
              >
                {esUltra ? (
                  <Crown size={24} />
                ) : esPro ? (
                  <Zap size={24} />
                ) : (
                  <Sparkles size={24} />
                )}
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                  {txPagos.confirmarSuscripcion}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {locale === 'es' ? `Plan DailySet ${plan.nombre}` : `DailySet ${plan.nombre} Plan`}
                </h3>
              </div>
            </div>

            {/* Selector de ciclo en modal si no es Free */}
            {!esGratis && (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs">
                <span className="text-neutral-400 font-medium">
                  {txPagos.cicloElegido}
                </span>
                <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setCiclo('mensual')}
                    className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                      ciclo === 'mensual'
                        ? 'bg-white text-black'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {txPagos.mensual}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCiclo('anual')}
                    className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                      ciclo === 'anual'
                        ? 'bg-[var(--color-primary)] text-black'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>{txPagos.anual}</span>
                    <span className="text-[9px] bg-black text-[var(--color-primary)] px-1 py-0.2 rounded font-black">
                      -15%
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Desglose de Factura */}
            <div className="p-4 rounded-2xl bg-black/40 border border-neutral-800/80 space-y-2.5 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>{txPagos.planSeleccionado}</span>
                <span className="font-bold text-white">
                  DailySet {plan.nombre} ({ciclo === 'anual' ? txPagos.anual : txPagos.mensual})
                </span>
              </div>

              {ciclo === 'anual' && ahorro > 0 && (
                <div className="flex justify-between text-[var(--color-primary)]">
                  <span>{txPagos.descuentoAnual15}</span>
                  <span className="font-mono font-bold">-{ahorro.toFixed(2).replace('.', ',')} €</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-400">
                <span>{txPagos.impuestos21IvaIncluido}</span>
                <span className="font-mono text-neutral-300">
                  {esGratis ? '0,00 €' : `${ivaIncluido} €`}
                </span>
              </div>

              <div className="pt-2 border-t border-neutral-800 flex justify-between items-baseline">
                <span className="font-black text-sm text-white">
                  {txPagos.totalAPagarHoy}
                </span>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-black text-white font-mono">
                    {esGratis ? '0,00 €' : `${precioFinal.toFixed(2).replace('.', ',')} €`}
                  </span>
                  {ciclo === 'anual' && !esGratis && (
                    <span className="block text-[10px] text-neutral-400">
                      {locale === 'es'
                        ? `Equivalente a ${plan.equivalenteMesAnualTexto}`
                        : `Equal to ${plan.equivalenteMesAnualTexto}`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Pago real con Stripe (tarjeta, Apple Pay, Google Pay según el dispositivo) */}
            {!esGratis && (
              <div className="p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-400 flex items-start gap-2.5">
                <Lock size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  {tieneSuscripcionActiva
                    ? txPagos.yaTienesUnaSuscripcionActiva: txPagos.elPagoSeRealizaEn}
                </span>
              </div>
            )}
            {esGratis && tieneSuscripcionActiva && (
              <div className="p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-400">
                {txPagos.paraVolverAlPlanFree}
              </div>
            )}

            {errorMsg && (
              <p className="text-xs text-red-400 bg-red-950/40 border border-red-800/60 p-2.5 rounded-xl">
                {errorMsg}
              </p>
            )}

            {/* Garantía y Seguridad */}
            <div className="flex items-center gap-2 text-[11px] text-neutral-400 pt-1">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
              <span>
                {txPagos.garantiaDeReembolsoDe14}
              </span>
            </div>

            {/* Botón de Confirmación */}
            <button
              type="button"
              disabled={procesando}
              onClick={handleConfirmar}
              className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                esPro
                  ? 'bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-hover)] shadow-[0_0_30px_var(--color-primary-glow)]'
                  : esUltra
                  ? 'bg-amber-400 text-black hover:bg-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.3)]'
                  : 'bg-white text-black hover:bg-neutral-200'
              }`}
            >
              {procesando ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>
                    {txPagos.conectandoConStripe}
                  </span>
                </>
              ) : (
                <>
                  <Lock size={16} />
                  <span>
                    {esGratis
                      ? tieneSuscripcionActiva
                        ? txPagos.gestionarEnStripe: txPagos.seguirEnPlanFree: tieneSuscripcionActiva
                      ? txPagos.cambiarDePlanEnStripe: locale === 'es'
                      ? `Pagar ${precioFinal.toFixed(2).replace('.', ',')} € con Stripe`
                      : `Pay €${precioFinal.toFixed(2)} with Stripe`}
                  </span>
                </>
              )}
            </button>
      </div>
    </div>
  );
}
