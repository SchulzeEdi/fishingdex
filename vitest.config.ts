import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Testes de domínio (TypeScript puro, sem React Native) — rodam em Node e geram
// coverage/lcov.info para o SonarCloud. UI em React Native é testada à parte.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.ts'],
      // Cobertura unitária mira o domínio (model/). Exclui testes, barris, dados (seed),
      // UI kit e a camada de dados (api/ + shared/db), que é validada por testes de integração.
      exclude: [
        'src/**/*.test.ts',
        'src/**/index.ts',
        'src/**/*.data.ts',
        'src/shared/ui/**',
        'src/shared/db/**',
        'src/**/api/**',
      ],
      // Gate de 80% de cobertura do domínio (regra da constitution).
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
