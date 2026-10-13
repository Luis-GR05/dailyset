// src/lib/textos.ts
// Diccionarios de textos compartidos web ↔ app (src/data/textos/*).
// Sustituyen a los `locale === 'es' ? '...' : '...'` escritos dentro de los componentes:
// un único sitio con el texto en cada idioma, idéntico en la web y en la app.
//
//   export const textosX = definirTextos({ titulo: 'Hola' }, { titulo: 'Hello' });
//   const tx = useTextos(textosX);   →   tx.titulo
import type { Locale } from '../context/I18nContext';

type Valor = string | ((...args: any[]) => string);
export type Diccionario<T extends Record<string, Valor>> = Record<Locale, T>;

/** Define un diccionario: el inglés debe tener exactamente las mismas claves que el español. */
export function definirTextos<T extends Record<string, Valor>>(
  es: T,
  en: { [K in keyof T]: T[K] extends string ? string : T[K] }
): Diccionario<T> {
  return { es, en: en as unknown as T };
}

export function textosDe<T extends Record<string, Valor>>(dic: Diccionario<T>, locale: Locale): T {
  return dic[locale] ?? dic.es;
}
