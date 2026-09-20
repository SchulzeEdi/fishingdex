// ESLint — gates da constitution + fronteiras do Feature-Sliced Design.
// Regra FSD: uma camada só importa de camadas ABAIXO (via alias @/<camada>).
// Ordem (alta -> baixa): app-init > views > widgets > features > entities > shared.

/** Bloqueia imports de camadas iguais/acima para a camada informada. */
const forbid = (layers) => ({
  'no-restricted-imports': [
    'error',
    {
      patterns: layers.map((l) => ({
        group: [`@/${l}`, `@/${l}/*`],
        message: `Violação FSD: esta camada não pode importar de "${l}" (só de camadas abaixo, via index.ts da slice).`,
      })),
    },
  ],
});

module.exports = {
  root: true,
  extends: ['expo', 'prettier'],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.expo/',
    'coverage/',
    'docs/design/prototype/**',
    'scripts/**',
  ],
  overrides: [
    { files: ['src/shared/**/*.{ts,tsx}'], rules: forbid(['app-init', 'views', 'widgets', 'features', 'entities']) },
    { files: ['src/entities/**/*.{ts,tsx}'], rules: forbid(['app-init', 'views', 'widgets', 'features']) },
    { files: ['src/features/**/*.{ts,tsx}'], rules: forbid(['app-init', 'views', 'widgets']) },
    { files: ['src/widgets/**/*.{ts,tsx}'], rules: forbid(['app-init', 'views']) },
    { files: ['src/views/**/*.{ts,tsx}'], rules: forbid(['app-init']) },
  ],
};
