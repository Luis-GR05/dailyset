import { describe, expect, it } from 'vitest';
import { calcularPlanMacros, generarTextoPlanMacros, type EntradaMacros } from '../src/lib/calculadoraMacros';

const base: EntradaMacros = {
  locale: 'es',
  genero: 'masculino',
  edad: 26,
  peso: 75,
  altura: 178,
  unidadPeso: 'kg',
  grasaCorporal: '',
  nivelActividad: 'moderado',
  objetivo: 'deficit_moderado',
  ratioProteina: 2,
  numComidas: 4,
};

describe('calcularPlanMacros', () => {
  it('BMR con Mifflin-St Jeor (hombre)', () => {
    // 10*75 + 6.25*178 - 5*26 + 5 = 1737.5
    expect(calcularPlanMacros(base).bmr).toBe(1738);
  });

  it('BMR con Mifflin-St Jeor (mujer)', () => {
    // 10*75 + 6.25*178 - 5*26 - 161 = 1571.5
    expect(calcularPlanMacros({ ...base, genero: 'femenino' }).bmr).toBe(1572);
  });

  it('con % de grasa usa Katch-McArdle', () => {
    // masa magra = 75 * 0.85 = 63.75 → 370 + 21.6 * 63.75 = 1747
    expect(calcularPlanMacros({ ...base, grasaCorporal: 15 }).bmr).toBe(1747);
  });

  it('TDEE y calorías objetivo según actividad y objetivo', () => {
    const plan = calcularPlanMacros(base);
    expect(plan.tdee).toBe(Math.round(1738 * 1.55));
    expect(plan.caloriasObjetivo).toBe(Math.round(plan.tdee * 0.85));
    expect(plan.cambioSemanalKg).toBeLessThan(0);
    expect(calcularPlanMacros({ ...base, objetivo: 'mantenimiento' }).cambioSemanalKg).toBe(0);
  });

  it('convierte libras a kilos', () => {
    const enLbs = calcularPlanMacros({ ...base, peso: 165.35, unidadPeso: 'lbs' });
    expect(enLbs.pesoKg).toBeCloseTo(75, 0);
  });

  it('los macros suman aproximadamente las calorías objetivo', () => {
    const p = calcularPlanMacros(base);
    expect(p.gramosProteina).toBe(150); // 75 kg * 2 g/kg
    const kcal = p.gramosProteina * 4 + p.gramosCarbos * 4 + p.gramosGrasas * 9;
    expect(Math.abs(kcal - p.caloriasObjetivo)).toBeLessThan(15);
    expect(p.pctRealProt + p.pctRealCarb + p.pctRealGras).toBe(100);
  });

  it('reparte por comida', () => {
    const p = calcularPlanMacros({ ...base, numComidas: 5 });
    expect(p.kcalPorComida).toBe(Math.round(p.caloriasObjetivo / 5));
  });

  it('el texto del plan contiene los datos clave', () => {
    const texto = generarTextoPlanMacros(base);
    expect(texto).toContain('PLAN NUTRICIONAL');
    expect(texto).toContain('1738 kcal');
  });
});
