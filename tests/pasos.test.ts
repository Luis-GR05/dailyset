import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { crearDetectorPasos, fechaLocal, guardarPasosDia, inicioDelDia, leerMetaPasos, leerPasosDia, metricasPasos } from '../src/lib/pasos';

/** Simula el acelerómetro: gravedad en Z + oscilación vertical de la marcha + ruido. */
function simular(segundos: number, hz: number, frecuenciaPaso: number, amplitud: number, ruido = 0.15) {
  const detector = crearDetectorPasos();
  let pasos = 0;
  let semilla = 1;
  const aleatorio = () => ((semilla = (semilla * 16807) % 2147483647) / 2147483647 - 0.5) * 2;
  for (let i = 0; i < segundos * hz; i++) {
    const t = (i * 1000) / hz;
    const z = 9.81 + amplitud * Math.sin(2 * Math.PI * frecuenciaPaso * (t / 1000)) + ruido * aleatorio();
    if (detector.procesar(0.3 + ruido * aleatorio(), 0.2 + ruido * aleatorio(), z, t)) pasos++;
  }
  return pasos;
}

describe('detector de pasos', () => {
  it('cuenta los pasos de una marcha normal (2 pasos/s durante 30 s)', () => {
    const pasos = simular(30, 50, 2, 2.5);
    expect(pasos).toBeGreaterThanOrEqual(55);
    expect(pasos).toBeLessThanOrEqual(62);
  });

  it('cuenta una marcha suave que el umbral fijo anterior (12 m/s²) perdía', () => {
    const pasos = simular(20, 50, 1.6, 1.0);
    expect(pasos).toBeGreaterThanOrEqual(28);
    expect(pasos).toBeLessThanOrEqual(34);
  });

  it('cuenta igual con frecuencias de muestreo distintas (20 Hz)', () => {
    expect(simular(30, 20, 2, 2.5)).toBeGreaterThanOrEqual(55);
  });

  it('no cuenta pasos con el móvil quieto (sólo ruido)', () => {
    expect(simular(20, 50, 2, 0, 0.2)).toBe(0);
    expect(simular(20, 50, 2, 0, 0.4)).toBeLessThanOrEqual(2);
  });

  it('no cuenta vibraciones rápidas (coche, máquina)', () => {
    expect(simular(20, 50, 8, 15, 0.2)).toBeLessThanOrEqual(2);
  });
});

describe('fecha local', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('usa el día local, no el UTC', () => {
    // 00:30 hora local: con toISOString() (UTC) en España todavía sería el día anterior
    const d = new Date(2026, 9, 13, 0, 30);
    expect(fechaLocal(d)).toBe('2026-10-13');
    expect(inicioDelDia(d).getHours()).toBe(0);
    expect(inicioDelDia(d).getDate()).toBe(13);
  });
});

describe('persistencia', () => {
  const almacen = new Map<string, string>();
  beforeEach(() => {
    almacen.clear();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => (almacen.has(k) ? almacen.get(k)! : null),
      setItem: (k: string, v: string) => void almacen.set(k, v),
      removeItem: (k: string) => void almacen.delete(k),
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('guarda y lee los pasos de cada día por separado', () => {
    guardarPasosDia('2026-10-12', 8000);
    guardarPasosDia('2026-10-13', 1234);
    expect(leerPasosDia('2026-10-12')).toBe(8000);
    expect(leerPasosDia('2026-10-13')).toBe(1234);
    expect(leerPasosDia('2026-10-14')).toBe(0);
  });

  it('meta por defecto de 10.000 pasos', () => {
    expect(leerMetaPasos()).toBe(10000);
  });
});

describe('métricas', () => {
  it('sin datos del usuario usa los valores de antes (0,78 m y 0,04 kcal/paso)', () => {
    const m = metricasPasos(10000);
    expect(m.km).toBe(7.8);
    expect(m.kcal).toBe(398);
    expect(m.minutosActivos).toBe(100);
  });

  it('ajusta la zancada a la altura y las calorías al peso', () => {
    const alto = metricasPasos(10000, { alturaCm: 190, pesoKg: 90 });
    const bajo = metricasPasos(10000, { alturaCm: 160, pesoKg: 55 });
    expect(alto.km).toBeGreaterThan(bajo.km);
    expect(alto.kcal).toBeGreaterThan(bajo.kcal);
    expect(alto.zancadaM).toBe(0.79);
  });

  it('ignora datos imposibles', () => {
    expect(metricasPasos(1000, { alturaCm: 20, pesoKg: 2 }).zancadaM).toBe(0.78);
  });
});
