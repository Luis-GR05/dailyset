import { describe, expect, it } from 'vitest';
import { calcularRM, cargaPorcentaje, generarHTMLFicha1RM, generarTextoFicha1RM, getTablaZonas } from '../src/lib/calculadora1RM';

describe('calcularRM', () => {
  it('con 1 repetición el 1RM es el propio peso', () => {
    expect(calcularRM(100, 1, 'promedio')).toBe(100);
    expect(calcularRM(100, 1, 'epley')).toBe(100);
  });

  it('aplica cada fórmula científica', () => {
    expect(calcularRM(100, 10, 'epley')).toBe(133.3); // 100 * (1 + 10/30)
    expect(calcularRM(100, 10, 'brzycki')).toBe(133.3); // 100 * 36/27
    expect(calcularRM(100, 10, 'lander')).toBe(134.1); // 100*100 / (101.3 - 26.7123)
    expect(calcularRM(100, 10, 'lombardi')).toBe(125.9); // 100 * 10^0.1
  });

  it('el promedio es la media de las cuatro fórmulas', () => {
    const media = (133.333 + 133.333 + 134.07 + 125.893) / 4;
    expect(calcularRM(100, 10, 'promedio')).toBeCloseTo(media, 0);
  });

  it('devuelve 0 con datos inválidos', () => {
    expect(calcularRM(0, 5, 'epley')).toBe(0);
    expect(calcularRM(80, 0, 'epley')).toBe(0);
    expect(calcularRM(-10, 5, 'epley')).toBe(0);
  });
});

describe('tabla de zonas', () => {
  it('va del 100% al 50% con 10 zonas', () => {
    const zonas = getTablaZonas('es');
    expect(zonas).toHaveLength(10);
    expect(zonas[0].pct).toBe(100);
    expect(zonas[zonas.length - 1].pct).toBe(50);
    expect(getTablaZonas('en')[0].desc).toContain('Max Strength');
  });

  it('calcula la carga de cada porcentaje redondeada a 0,1', () => {
    expect(cargaPorcentaje(133.3, 80)).toBe(106.6);
    expect(cargaPorcentaje(100, 75)).toBe(75);
  });
});

describe('exportación de la ficha', () => {
  const datos = { locale: 'es', nombreEjercicioFinal: 'Sentadilla', unidad: 'kg' as const, peso: 100, reps: 5, formula: 'epley' as const };

  it('el texto incluye ejercicio, serie y 1RM', () => {
    const texto = generarTextoFicha1RM(datos);
    expect(texto).toContain('Sentadilla');
    expect(texto).toContain('100 kg × 5 reps');
    expect(texto).toContain(`${calcularRM(100, 5, 'epley')} kg`);
  });

  it('el HTML imprimible es un documento completo con la tabla', () => {
    const html = generarHTMLFicha1RM(datos);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Sentadilla');
    expect((html.match(/<tr>/g) || []).length).toBeGreaterThanOrEqual(10);
  });
});
