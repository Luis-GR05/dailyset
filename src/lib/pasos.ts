// src/lib/pasos.ts
// Lógica compartida (web ↔ app) del cuenta pasos.
//  - Fecha del día en hora LOCAL (antes se usaba UTC y el día cambiaba a la 1:00/2:00 en España)
//  - Persistencia de pasos por día y meta diaria
//  - Detector de pasos a partir del acelerómetro (web y respaldo en la app)
//  - Distancia y calorías según altura y peso del usuario

export const CLAVE_META_PASOS = 'dailyset:pasos_meta';
/** '1' si el usuario dejó el sensor activado (se reanuda al volver). */
export const CLAVE_SENSOR_PASOS = 'dailyset:pasos_sensor';
export const META_PASOS_POR_DEFECTO = 10000;

/** YYYY-MM-DD en la zona horaria del dispositivo. */
export function fechaLocal(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dia}`;
}

/** Medianoche local del día de `d`. */
export function inicioDelDia(d: Date = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

export function clavePasosDia(fecha: string): string {
  return `dailyset:pasos:${fecha}`;
}

function leerEntero(clave: string, porDefecto: number): number {
  try {
    const v = localStorage.getItem(clave);
    const n = v !== null ? parseInt(v, 10) : NaN;
    return Number.isFinite(n) ? n : porDefecto;
  } catch {
    return porDefecto;
  }
}

function guardar(clave: string, valor: string) {
  try {
    localStorage.setItem(clave, valor);
  } catch {
    // almacenamiento no disponible: se pierde sólo la persistencia
  }
}

export function leerPasosDia(fecha: string): number {
  return leerEntero(clavePasosDia(fecha), 0);
}

export function guardarPasosDia(fecha: string, pasos: number) {
  guardar(clavePasosDia(fecha), String(Math.round(pasos)));
}

export function leerMetaPasos(): number {
  const meta = leerEntero(CLAVE_META_PASOS, META_PASOS_POR_DEFECTO);
  return meta > 0 ? meta : META_PASOS_POR_DEFECTO;
}

export function guardarMetaPasos(meta: number) {
  if (meta > 0) guardar(CLAVE_META_PASOS, String(Math.round(meta)));
}

export function sensorPasosRecordado(): boolean {
  try {
    return localStorage.getItem(CLAVE_SENSOR_PASOS) === '1';
  } catch {
    return false;
  }
}

export function recordarSensorPasos(activo: boolean) {
  guardar(CLAVE_SENSOR_PASOS, activo ? '1' : '0');
}

/* ───────── Detector de pasos (acelerómetro) ─────────
 * Recibe muestras de aceleración INCLUYENDO la gravedad, en m/s² (≈20-60 Hz).
 *  1. Separa la gravedad con un filtro paso bajo y se queda con la aceleración dinámica.
 *  2. Suaviza el ruido.
 *  3. Cuenta un paso por cada pico (subida por encima del umbral y bajada posterior).
 *  4. El umbral se adapta a la intensidad de la marcha; se descartan picos demasiado
 *     seguidos (vibraciones, > 3,5 por segundo) y sacudidas muy bruscas.
 */
export interface DetectorPasos {
  /** Devuelve true si la muestra completa un paso. `t` en milisegundos. */
  procesar(x: number, y: number, z: number, t: number): boolean;
  reiniciar(): void;
}

export function crearDetectorPasos(): DetectorPasos {
  const UMBRAL_MIN = 0.7;
  const UMBRAL_MAX = 3;
  const INTERVALO_MIN_MS = 280;
  const PICO_MAX = 10; // por encima: sacudida, no un paso
  const TAU_GRAVEDAD_MS = 1000; // filtro lento: estima la gravedad
  const TAU_SUAVIZADO_MS = 40; // filtro rápido: quita ruido
  let gravedad = 0;
  let suave = 0;
  let umbral = 0.9;
  let enPico = false;
  let maxPico = 0;
  let ultimoPaso = -Infinity;
  let ultimoPico = -Infinity;
  let tAnterior: number | null = null;

  return {
    procesar(x, y, z, t) {
      const mag = Math.sqrt(x * x + y * y + z * z);
      if (tAnterior === null) {
        tAnterior = t;
        gravedad = mag;
        return false;
      }
      // Coeficientes según el tiempo real entre muestras (la frecuencia varía por dispositivo)
      const dt = Math.min(200, Math.max(1, t - tAnterior));
      tAnterior = t;
      const aG = dt / (TAU_GRAVEDAD_MS + dt);
      const aS = dt / (TAU_SUAVIZADO_MS + dt);
      gravedad += aG * (mag - gravedad);
      suave += aS * (mag - gravedad - suave);

      if (!enPico) {
        if (suave > umbral) {
          enPico = true;
          maxPico = suave;
        }
        return false;
      }

      if (suave > maxPico) maxPico = suave;
      if (suave > umbral * 0.3) return false;

      // Fin del pico
      enPico = false;
      umbral = Math.min(UMBRAL_MAX, Math.max(UMBRAL_MIN, 0.7 * umbral + 0.3 * maxPico * 0.5));
      // Picos más seguidos que el ritmo máximo de carrera (≈3,5/s) son vibraciones, no pasos
      const separacion = t - ultimoPico;
      ultimoPico = t;
      if (maxPico >= PICO_MAX) return false;
      if (separacion < INTERVALO_MIN_MS || t - ultimoPaso < INTERVALO_MIN_MS) return false;
      ultimoPaso = t;
      return true;
    },
    reiniciar() {
      gravedad = 0;
      suave = 0;
      umbral = 0.9;
      enPico = false;
      maxPico = 0;
      ultimoPaso = -Infinity;
      ultimoPico = -Infinity;
      tAnterior = null;
    },
  };
}

/* ───────── Métricas ───────── */
export interface MetricasPasos {
  km: number;
  kcal: number;
  minutosActivos: number;
  zancadaM: number;
}

/**
 * Distancia: zancada ≈ 41,5 % de la altura (0,78 m si no se conoce).
 * Calorías: ≈ 0,53 kcal por kg de peso cada 1.000 pasos (0,04 kcal/paso a 75 kg).
 * Tiempo activo: ≈ 100 pasos por minuto.
 */
export function metricasPasos(pasos: number, datos: { alturaCm?: number | null; pesoKg?: number | null } = {}): MetricasPasos {
  const altura = datos.alturaCm && datos.alturaCm >= 100 && datos.alturaCm <= 250 ? datos.alturaCm : null;
  const peso = datos.pesoKg && datos.pesoKg >= 30 && datos.pesoKg <= 300 ? datos.pesoKg : 75;
  const zancadaM = altura ? Math.round(altura * 0.415) / 100 : 0.78;
  return {
    km: Math.round(pasos * zancadaM) / 1000,
    kcal: Math.round(pasos * peso * 0.00053),
    minutosActivos: Math.round(pasos / 100),
    zancadaM,
  };
}
