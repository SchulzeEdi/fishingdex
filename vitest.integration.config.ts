import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Testes de integração (*.itest.ts) — exigem Postgres/PostGIS (docker-compose ou CI service).
// Ficam fora do gate unitário (test/test:coverage) para não exigir DB no lint/typecheck.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.itest.ts'],
    hookTimeout: 30000,
    testTimeout: 30000,
    fileParallelism: false,
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
