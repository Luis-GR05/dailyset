// src/types/suscripcion.ts
// Tipos para el módulo de suscripciones y planes de DailySet

export type TipoPlan = 'free' | 'pro' | 'ultra';
export type CicloFacturacion = 'mensual' | 'anual';

export interface DesgloseFinanciero {
  planId: TipoPlan;
  nombre: string;
  nombreEn: string;
  subtitulo: string;
  subtituloEn: string;
  badge?: string;
  badgeEn?: string;
  popular?: boolean;
  elite?: boolean;
  precioMensual: number;
  precioMensualTexto: string;
  precioAnual: number;
  precioAnualTexto: string;
  equivalenteMesAnual: number;
  equivalenteMesAnualTexto: string;
  ahorroAnual: number;
  ahorroAnualTexto: string;
  porcentajeDescuentoAnual: number;
  colorAcento: string;
}

export interface ItemMatrizFuncionalidad {
  moduloId: string;
  modulo: string;
  moduloEn: string;
  descripcionModulo?: string;
  descripcionModuloEn?: string;
  free: string;
  freeEn: string;
  basico: string; // Pro
  basicoEn: string;
  premium: string; // Ultra
  premiumEn: string;
  icono: string;
  destacado?: boolean;
}

export interface TransaccionSuscripcion {
  id: string;
  usuarioId: string;
  plan: TipoPlan;
  ciclo: CicloFacturacion;
  monto: number;
  moneda: string;
  metodoPago: 'tarjeta' | 'apple_pay' | 'google_pay' | 'bizum';
  fecha: string;
  estado: 'completado' | 'pendiente' | 'cancelado';
}
