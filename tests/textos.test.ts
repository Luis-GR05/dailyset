import { describe, expect, it } from 'vitest';
import type { Diccionario } from '../src/lib/textos';

// Todos los diccionarios compartidos web ↔ app (src/data/textos/*.ts)
const modulos = import.meta.glob('../src/data/textos/*.ts', { eager: true }) as Record<string, Record<string, Diccionario<any>>>;

describe('diccionarios de textos', () => {
  const dics = Object.entries(modulos).flatMap(([ruta, mod]) => Object.entries(mod).map(([nombre, dic]) => [`${ruta}:${nombre}`, dic] as const));

  it('existen diccionarios', () => {
    expect(dics.length).toBeGreaterThan(0);
  });

  it.each(dics)('%s tiene las mismas claves en español e inglés y ningún texto vacío', (_n, dic) => {
    expect(Object.keys(dic.en).sort()).toEqual(Object.keys(dic.es).sort());
    for (const idioma of ['es', 'en'] as const) {
      for (const [clave, valor] of Object.entries(dic[idioma])) {
        if (typeof valor === 'string') expect(valor.trim(), `${idioma}.${clave}`).not.toBe('');
      }
    }
  });
});
