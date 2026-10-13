// Tests de la lógica compartida web ↔ app (src/lib, src/data). Ejecutar: npm test
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
