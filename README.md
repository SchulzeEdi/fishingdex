# fishingdex

App de pesca esportiva: diário de capturas, **coleção de espécies estilo Pokédex**, ranking de maior peixe e marketplace de pesqueiros. Construído com **Spec-Driven Development** (ver `spec/`).

## Stack
- **App:** React Native + Expo (Expo Router) — iOS/Android/web.
- **Arquitetura:** Feature-Sliced Design (ver `docs/architecture/feature-sliced-design.md` e `CLAUDE.md`).
- **Backend/infra:** Vercel + Supabase (Postgres/Auth/Storage) — ver `spec/architecture.md` e ADRs.
- **Qualidade:** TypeScript strict, ESLint (com fronteiras FSD), Prettier, Vitest (cobertura).
- **CI/CD:** GitHub Actions + SonarCloud (scanner) + deploy Vercel — ver `docs/ci/sonarcloud-setup.md`.

## Estrutura (FSD)
```
app/                 # Expo Router (roteamento fino)
src/
├── app-init/        # providers, tema, i18n
├── views/           # composição de telas
├── widgets/         # blocos compostos
├── features/        # ações do usuário (ex.: dex-collection)
├── entities/        # entidades (fish-species, catch, ...)
└── shared/          # ui/theme, config, libs
```

## Scripts
```bash
npm install
npm run start          # Expo dev
npm run typecheck      # tsc --noEmit
npm run lint           # ESLint (inclui fronteiras FSD)
npm run test:coverage  # Vitest + cobertura (coverage/lcov.info p/ Sonar)
npm run build          # expo export web -> dist/
```

## SDD
O processo e o estado do projeto ficam em `spec/` — comece por `spec/STATUS.md`.
