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
        // Composição de telas e init do app (sem regra de domínio) — UI testada à parte (DT-01).
        'src/app-init/**',
        'src/views/**',
        'src/widgets/**',
        // Adaptadores de dispositivo (câmera/arquivos) e hooks React.
        'src/features/register-catch/lib/**',
        'src/shared/lib/store/use-store.ts',
      ],
      // Gate de 80% de cobertura do domínio (regra da constitution).
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
  // JSX dos providers/contextos importados por testes de domínio.
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
