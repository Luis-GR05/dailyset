export const KG_TO_LBS = 2.20462;

export function kgToDisplay(pesoKg: number, unidadesKg: boolean = true): number {
  if (unidadesKg) return Math.round(pesoKg * 10) / 10;
  return Math.round(pesoKg * KG_TO_LBS * 10) / 10;
}

export function displayToKg(pesoDisplay: number, unidadesKg: boolean = true): number {
  if (unidadesKg) return pesoDisplay;
  return Math.round((pesoDisplay / KG_TO_LBS) * 10) / 10;
}

export function getUnidadPeso(unidadesKg: boolean = true): 'kg' | 'lbs' {
  return unidadesKg ? 'kg' : 'lbs';
}

export function formatPeso(
  pesoKg: number,
  unidadesKg: boolean = true,
  incluirUnidad: boolean = true
): string {
  const val = kgToDisplay(pesoKg, unidadesKg);
  const formatted = val.toLocaleString();
  return incluirUnidad ? `${formatted} ${getUnidadPeso(unidadesKg)}` : formatted;
}
