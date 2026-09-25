// src/componentes/suscripciones/ModalContratarPlan.tsx
import { useState } from 'react';
import {
  X,
  Zap,
  Crown,
  Sparkles,
  CreditCard,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Loader2,
  Calendar,
} from 'lucide-react';
import type { CicloFacturacion, DesgloseFinanciero } from '../../types/suscripcion';
import { useI18n } from '../../context/I18nContext';
import { useAuth } from '../../context/AuthContext';

interface ModalContratarPlanProps {
  plan: DesgloseFinanciero;
  cicloInicial: CicloFacturacion;
  abierto: boolean;
  onCerrar: () => void;
  onExito: (planId: string) => void;
}

type MetodoPago = 'tarjeta' | 'apple_pay' | 'google_pay' | 'bizum';

export default function ModalContratarPlan({
  plan,
  cicloInicial,
  abierto,
  onCerrar,
  onExito,
}: ModalContratarPlanProps) {
  const { locale } = useI18n();
  const { user, updateUser } = useAuth();

  const [ciclo, setCiclo] = useState<CicloFacturacion>(cicloInicial);
  const [metodo, setMetodo] = useState<MetodoPago>('tarjeta');
  const [procesando, setProcesando] = useState(false);
  const [completado, setCompletado] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Formulario de tarjeta simulado
  const [numTarjeta, setNumTarjeta] = useState('•••• •••• •••• 4242');
  const [caducidad, setCaducidad] = useState('12/28');
  const [cvc, setCvc] = useState('•••');
  const [telefonoBizum, setTelefonoBizum] = useState('600 000 000');

  if (!abierto) return null;

  const esGratis = plan.planId === 'free';
  const esPro = plan.planId === 'pro';
  const esUltra = plan.planId === 'ultra';

  // Cálculos financieros
  const precioFinal =
    ciclo === 'mensual' ? plan.precioMensual : plan.precioAnual;
  const precioSinDescuento =
    ciclo === 'anual' ? Number((plan.precioMensual * 12).toFixed(2)) : plan.precioMensual;
  const ahorro =
    ciclo === 'anual' && plan.ahorroAnual > 0 ? plan.ahorroAnual : 0;
  const ivaIncluido = (precioFinal * 0.21).toFixed(2);

  const handleConfirmar = async () => {
    setProcesando(true);
    setErrorMsg('');

    try {
      // Simular latencia de verificación bancaria segura
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const fechaHoy = new Date();
      if (ciclo === 'mensual') {
        fechaHoy.setMonth(fechaHoy.getMonth() + 1);
      } else {
        fechaHoy.setFullYear(fechaHoy.getFullYear() + 1);
      }

      await updateUser({
        plan: plan.planId,
        cicloFacturacion: ciclo,
        fechaRenovacionPlan: fechaHoy.toISOString().split('T')[0],
      });

      setCompletado(true);
      setTimeout(() => {
        onExito(plan.planId);
      }, 1600);
    } catch (err: any) {
      console.error('Error al contratar plan:', err);
      setErrorMsg(
        locale === 'es'
          ? 'Hubo un problema al procesar el cambio de plan. Inténtalo de nuevo.'
          : 'Could not process plan change. Please try again.'
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

        {completado ? (
          /* Estado de éxito con animación */
          <div className="py-8 text-center space-y-4 animate-scale-up">
            <div
              className="w-16 h-16 rounded-full mx-auto flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: esPro
                  ? 'var(--color-primary)'
                  : esUltra
                  ? '#FBBF24'
                  : '#FFFFFF',
                color: '#000000',
              }}
            >
              <CheckCircle2 size={36} strokeWidth={2.5} />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">
                {locale === 'es' ? '¡Plan Activado con Éxito!' : 'Plan Activated Successfully!'}
              </h3>
              <p className="text-sm text-neutral-300">
                {locale === 'es'
                  ? `Ahora tienes acceso a todas las ventajas de DailySet ${plan.nombre}.`
                  : `You now have full access to DailySet ${plan.nombre} features.`}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 max-w-sm mx-auto">
              <p>
                {locale === 'es'
                  ? `Suscripción ${ciclo === 'anual' ? 'Anual' : 'Mensual'} activa para ${user?.email || 'tu cuenta'}.`
                  : `${ciclo === 'anual' ? 'Annual' : 'Monthly'} subscription active for ${user?.email || 'your account'}.`}
              </p>
            </div>
          </div>
        ) : (
          <>
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
                  {locale === 'es' ? 'Confirmar Suscripción' : 'Confirm Subscription'}
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
                  {locale === 'es' ? 'Ciclo elegido:' : 'Billing cycle:'}
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
                    {locale === 'es' ? 'Mensual' : 'Monthly'}
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
                    <span>{locale === 'es' ? 'Anual' : 'Annual'}</span>
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
                <span>{locale === 'es' ? 'Plan seleccionado:' : 'Selected tier:'}</span>
                <span className="font-bold text-white">
                  DailySet {plan.nombre} ({ciclo === 'anual' ? (locale === 'es' ? 'Anual' : 'Annual') : (locale === 'es' ? 'Mensual' : 'Monthly')})
                </span>
              </div>

              {ciclo === 'anual' && ahorro > 0 && (
                <div className="flex justify-between text-[var(--color-primary)]">
                  <span>{locale === 'es' ? 'Descuento anual (-15%):' : 'Annual discount (-15%):'}</span>
                  <span className="font-mono font-bold">-{ahorro.toFixed(2).replace('.', ',')} €</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-400">
                <span>{locale === 'es' ? 'Impuestos (21% IVA incluido):' : 'Taxes (21% VAT included):'}</span>
                <span className="font-mono text-neutral-300">
                  {esGratis ? '0,00 €' : `${ivaIncluido} €`}
                </span>
              </div>

              <div className="pt-2 border-t border-neutral-800 flex justify-between items-baseline">
                <span className="font-black text-sm text-white">
                  {locale === 'es' ? 'Total a pagar hoy:' : 'Total due today:'}
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

            {/* Métodos de Pago si es de pago */}
            {!esGratis && (
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-neutral-400 block">
                  {locale === 'es' ? 'Método de Pago Seguro' : 'Secure Payment Method'}
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setMetodo('tarjeta')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      metodo === 'tarjeta'
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-white'
                        : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <CreditCard size={18} />
                    <span className="text-[11px] font-bold">Tarjeta</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMetodo('apple_pay')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      metodo === 'apple_pay'
                        ? 'border-white bg-white/10 text-white'
                        : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span className="text-base font-black">Pay</span>
                    <span className="text-[11px] font-bold">Apple Pay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMetodo('google_pay')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      metodo === 'google_pay'
                        ? 'border-blue-400 bg-blue-500/10 text-white'
                        : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span className="text-base font-bold text-blue-400">GPay</span>
                    <span className="text-[11px] font-bold">Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMetodo('bizum')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      metodo === 'bizum'
                        ? 'border-emerald-400 bg-emerald-500/10 text-white'
                        : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Smartphone size={18} className="text-emerald-400" />
                    <span className="text-[11px] font-bold">Bizum</span>
                  </button>
                </div>

                {/* Campos de pago simulados */}
                {metodo === 'tarjeta' && (
                  <div className="space-y-2 p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-xs">
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold uppercase block mb-1">
                        {locale === 'es' ? 'Número de tarjeta' : 'Card number'}
                      </label>
                      <input
                        type="text"
                        value={numTarjeta}
                        onChange={(e) => setNumTarjeta(e.target.value)}
                        className="w-full bg-black/60 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-neutral-400 font-bold uppercase block mb-1">
                          {locale === 'es' ? 'Caducidad' : 'Expiry'}
                        </label>
                        <input
                          type="text"
                          value={caducidad}
                          onChange={(e) => setCaducidad(e.target.value)}
                          className="w-full bg-black/60 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-400 font-bold uppercase block mb-1">
                          CVC / CVV
                        </label>
                        <input
                          type="text"
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value)}
                          className="w-full bg-black/60 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {metodo === 'bizum' && (
                  <div className="p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-xs space-y-1">
                    <label className="text-[10px] text-neutral-400 font-bold uppercase block">
                      {locale === 'es' ? 'Número de teléfono Bizum' : 'Bizum phone number'}
                    </label>
                    <input
                      type="text"
                      value={telefonoBizum}
                      onChange={(e) => setTelefonoBizum(e.target.value)}
                      className="w-full bg-black/60 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                    <p className="text-[10px] text-neutral-500">
                      {locale === 'es'
                        ? 'Recibirás una notificación en la app de tu banco para validar el pago.'
                        : 'You will receive a notification in your banking app to validate.'}
                    </p>
                  </div>
                )}
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
                {locale === 'es'
                  ? 'Garantía de reembolso de 14 días. Cancela cuando quieras en 1 clic.'
                  : '14-day money-back guarantee. Cancel anytime in 1 click.'}
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
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.3)]'
                  : 'bg-white text-black hover:bg-neutral-200'
              }`}
            >
              {procesando ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>
                    {locale === 'es'
                      ? 'Procesando suscripción segura...'
                      : 'Processing secure subscription...'}
                  </span>
                </>
              ) : (
                <>
                  <Lock size={16} />
                  <span>
                    {esGratis
                      ? locale === 'es'
                        ? 'Confirmar Plan Free'
                        : 'Confirm Free Plan'
                      : locale === 'es'
                      ? `Pagar ${precioFinal.toFixed(2).replace('.', ',')} € y Activar`
                      : `Pay €${precioFinal.toFixed(2)} and Activate`}
                  </span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
