// src/data/textos/pagos.ts
// Textos de src/componentes/suscripciones/ModalContratarPlan.tsx y de su espejo en la app (src/ui/suscripciones/Suscripciones.tsx).
// Compartido web ↔ app: edítalo en la web y ejecuta `npm run sync:web` en la app.
import { definirTextos } from '../../lib/textos';

export const textosPagos = definirTextos(
  {
    iniciaSesionConTuCuenta: 'Inicia sesión con tu cuenta para contratar un plan.',
    huboUnProblemaAlConectar: 'Hubo un problema al conectar con la pasarela de pago. Inténtalo de nuevo.',
    confirmarSuscripcion: 'Confirmar Suscripción',
    cicloElegido: 'Ciclo elegido:',
    mensual: 'Mensual',
    anual: 'Anual',
    planSeleccionado: 'Plan seleccionado:',
    descuentoAnual15: 'Descuento anual (-15%):',
    impuestos21IvaIncluido: 'Impuestos (21% IVA incluido):',
    totalAPagarHoy: 'Total a pagar hoy:',
    yaTienesUnaSuscripcionActiva: 'Ya tienes una suscripción activa. Te llevaremos al portal seguro de Stripe para cambiar de plan.',
    elPagoSeRealizaEn: 'El pago se realiza en la página segura de Stripe (tarjeta, Apple Pay o Google Pay). DailySet nunca ve los datos de tu tarjeta.',
    paraVolverAlPlanFree: 'Para volver al plan Free, cancela la renovación en el portal de Stripe. Mantendrás las ventajas hasta el final del periodo pagado.',
    garantiaDeReembolsoDe14: 'Garantía de reembolso de 14 días. Cancela cuando quieras en 1 clic.',
    conectandoConStripe: 'Conectando con Stripe...',
    gestionarEnStripe: 'Gestionar en Stripe',
    seguirEnPlanFree: 'Seguir en Plan Free',
    cambiarDePlanEnStripe: 'Cambiar de plan en Stripe',
  },
  {
    iniciaSesionConTuCuenta: 'Log in to subscribe to a plan.',
    huboUnProblemaAlConectar: 'Could not connect to the payment gateway. Please try again.',
    confirmarSuscripcion: 'Confirm Subscription',
    cicloElegido: 'Billing cycle:',
    mensual: 'Monthly',
    anual: 'Annual',
    planSeleccionado: 'Selected tier:',
    descuentoAnual15: 'Annual discount (-15%):',
    impuestos21IvaIncluido: 'Taxes (21% VAT included):',
    totalAPagarHoy: 'Total due today:',
    yaTienesUnaSuscripcionActiva: 'You already have an active subscription. We will take you to the secure Stripe portal to change plan.',
    elPagoSeRealizaEn: 'Payment happens on the secure Stripe page (card, Apple Pay or Google Pay). DailySet never sees your card details.',
    paraVolverAlPlanFree: 'To go back to Free, cancel the renewal in the Stripe portal. You keep your perks until the end of the paid period.',
    garantiaDeReembolsoDe14: '14-day money-back guarantee. Cancel anytime in 1 click.',
    conectandoConStripe: 'Connecting to Stripe...',
    gestionarEnStripe: 'Manage in Stripe',
    seguirEnPlanFree: 'Stay on Free Plan',
    cambiarDePlanEnStripe: 'Change plan in Stripe',
  }
);
