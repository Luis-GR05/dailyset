// src/hooks/useTextos.ts
// Devuelve el diccionario de textos (src/data/textos/*) en el idioma activo.
import { useI18n } from '../context/I18nContext';
import { textosDe, type Diccionario } from '../lib/textos';

export function useTextos<T extends Record<string, string | ((...args: any[]) => string)>>(dic: Diccionario<T>): T {
  const { locale } = useI18n();
  return textosDe(dic, locale);
}
