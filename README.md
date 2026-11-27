# fishingdex

App de pesca esportiva: diário de capturas, **coleção de espécies estilo Pokédex**, ranking de maior peixe e marketplace de pesqueiros. Construído com **Spec-Driven Development** (ver `spec/`).

## Stack
- **App:** React Native 0.88 + Expo SDK 58 (Expo Router) — Android (Google Play, targetSdk 36), iOS e web. Node ≥ 22.13.
- **Design system:** "Águas Profundas" v2 — tokens em `spec/design-tokens.json` (espelho em `src/shared/ui/tokens.ts`), referência completa em `docs/design/design-system-v2/`.
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

# Android / Google Play (EAS Build) — guia: docs/release/android-play-store.md
npm run build:apk      # APK para instalar no celular
npm run build:aab      # AAB para a Play Store
npm run submit:android # envia o AAB para o teste interno da Play
```

## Estado do app
Online no **Supabase** (`fishingdex`, São Paulo): contas por e-mail/senha, capturas e fotos no
servidor, feed e ranking entre usuários, curtidas, denúncia e exclusão de conta. As regras ficam no
banco (RLS + triggers + RPC — ADR-0008). "Assinar Pro" ainda é de demonstração (sem cobrança) até o
Google Play Billing entrar (DT-07).

```bash
cp .env.example .env            # preencher EXPO_PUBLIC_SUPABASE_URL/KEY (valores públicos)
npm run db:test:supabase        # migrations + regras + RLS num Postgres descartável (Docker)
node --env-file=.env scripts/e2e/supabase-smoke.mjs   # smoke test contra o Supabase real
npx supabase db push --remote --dry-run               # conferir antes de aplicar migrations
```

## SDD
O processo e o estado do projeto ficam em `spec/` — comece por `spec/STATUS.md`.
