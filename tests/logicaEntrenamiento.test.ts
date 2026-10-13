import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { calcularPuntuacion } from '../src/lib/puntuacionSesion';
import { calcularRachas } from '../src/lib/gamificacion';
import { displayToKg, formatPeso, kgToDisplay } from '../src/lib/unidades';
import { coincideFiltroMuscular } from '../src/lib/filtrosEjercicios';

describe('calcularPuntuacion', () => {
  it('sin series completadas puntúa 1', () => {
    expect(calcularPuntuacion({ ejercicios: [] })).toBe(1);
    expect(calcularPuntuacion({ ejercicios: [{ series: [{ kg: 100, reps: 10, completada: false }] }] })).toBe(1);
  });

  it('escala con la carga media por serie y se limita a 1-5', () => {
    const serie = (kg: number, reps: number) => ({ kg, reps, completada: true });
    // 600 kg·rep por serie → 3 puntos
    expect(calcularPuntuacion({ ejercicios: [{ series: [serie(60, 10), serie(60, 10)] }] })).toBe(3);
    expect(calcularPuntuacion({ ejercicios: [{ series: [serie(200, 20)] }] })).toBe(5);
    expect(calcularPuntuacion({ ejercicios: [{ series: [serie(10, 5)] }] })).toBe(1);
  });
});

describe('calcularRachas', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-13T12:00:00'));
  });
  afterEach(() => vi.useRealTimers());

  it('cuenta la racha activa hasta hoy', () => {
    const r = calcularRachas([{ fecha: '2026-10-11' }, { fecha: '2026-10-12' }, { fecha: '2026-10-13T08:00:00' }], 'es');
    expect(r.trainedToday).toBe(true);
    expect(r.rachaActual).toBe(3);
    expect(r.bestStreak).toBe(3);
    expect(r.uniqueDaysCount).toBe(3);
  });

  it('la racha sigue viva si se entrenó ayer', () => {
    const r = calcularRachas([{ fecha: '2026-10-11' }, { fecha: '2026-10-12' }], 'es');
    expect(r.trainedToday).toBe(false);
    expect(r.rachaActual).toBe(2);
  });

  it('se rompe tras un día sin entrenar y conserva la mejor racha', () => {
    const r = calcularRachas(
      [{ fecha: '2026-10-01' }, { fecha: '2026-10-02' }, { fecha: '2026-10-03' }, { fecha: '2026-10-03' }, { fecha: '2026-10-10' }],
      'es'
    );
    expect(r.rachaActual).toBe(0);
    expect(r.bestStreak).toBe(3);
    expect(r.uniqueDaysCount).toBe(4);
  });

  it('devuelve el tracker de los últimos 7 días', () => {
    const r = calcularRachas([{ fecha: '2026-10-13' }], 'es');
    expect(r.last7Days).toHaveLength(7);
    expect(r.last7Days[6]).toMatchObject({ dateStr: '2026-10-13', isToday: true, hasTrained: true });
  });
});

describe('unidades', () => {
  it('convierte kg ↔ lbs', () => {
    expect(kgToDisplay(100, false)).toBe(220.5);
    expect(displayToKg(220.5, false)).toBe(100);
    expect(kgToDisplay(80.04)).toBe(80);
    expect(formatPeso(100, true)).toMatch(/100 kg/);
  });
});

describe('coincideFiltroMuscular', () => {
  const ej = (grupo: string, nombre = 'Ejercicio') => ({ grupo, nombre, categoriaEjercicio: undefined, musculosPrimarios: [], musculosSecundarios: [] }) as any;
  it('filtra por grupo muscular en español e inglés', () => {
    expect(coincideFiltroMuscular(ej('Pecho'), 'Pecho')).toBe(true);
    expect(coincideFiltroMuscular(ej('chest'), 'Pecho')).toBe(true);
    expect(coincideFiltroMuscular(ej('Pecho'), 'Piernas')).toBe(false);
    expect(coincideFiltroMuscular(ej('', 'Burpee'), 'Cardio')).toBe(true);
    expect(coincideFiltroMuscular(ej('Cualquiera'), 'Todos')).toBe(true);
  });
});
