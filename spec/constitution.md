# Constitution: fishingdex

> Regras inegociaveis de engenharia. Toda fase seguinte obedece a isto.

## Principios
1. **Tipos:** TypeScript strict, sempre.
2. **Testes:** toda feature nasce com teste do dominio. Cobertura minima do dominio: **80%**. Fluxos de receita (assinatura Pro, listagem de pesqueiro) cobertos por e2e (Playwright).
3. **Decisoes:** nenhuma decisao de arquitetura sem ADR em `spec/adr/`.
4. **Ambientes:** nada sobe pra producao sem passar verde no ambiente local. **App:** local (Expo Go / dev build) -> preview (EAS build interno / TestFlight + Play Internal) -> producao (App Store + Play Store), via **EAS**. **Backend/API + banco:** local (Docker + Postgres) -> preview (Vercel) -> producao (Vercel), mesma config parametrizada. Ver CHG-001.
5. **Design:** toda UI (React Native) consulta `spec/design-system.md` + `spec/design-tokens.json`. Sem cores/spacings "magicos"; estados de erro/vazio/carregando sempre presentes; acessibilidade nativa (labels, contraste AA).
6. **Seguranca:** secrets nunca no codigo; inputs validados (Zod) nas bordas; deps sem CVE critico (`scripts/sdd/security-scan.sh`).
7. **Monetizacao:** cobranca em **USD e BRL desde o MVP** (Stripe no USD; Pix/Stripe no BRL).
8. **Ordem de build:** por fatia, **Banco -> Backend -> Frontend** — e essa ordem acontece DENTRO da slice FSD (ver principio 12).
9. **Git:** uma branch por feature/fix (`feature/<slug>`, `fix/<slug>`, `chore/<slug>`). Nunca commitar direto na `main`. Commit + push na branch -> PR -> merge na `main` -> apagar branch.
10. **Observabilidade:** Sentry (erros) + PostHog (produto) desde o dia 1.
11. **Fonte da verdade:** `spec/STATUS.md` reflete sempre o estado real; atualizado a cada fase/task/sprint (doc gate).
12. **Arquitetura — Feature-Sliced Design (FSD), inegociavel:** todo o codigo e organizado em FSD (camadas `app-init -> views -> widgets -> features -> entities -> shared`, slices por dominio, segmentos `ui/model/api/lib/config` + `index.ts` publico). **SOBRESCREVE** o default Modular Monolith do harness. Fonte da verdade: `docs/architecture/feature-sliced-design.md` e `CLAUDE.md`. **Uma fatia vertical do harness = uma slice FSD.**
13. **Plataforma — React Native + Expo (ver CHG-001):** app publicado nas lojas (App Store + Play Store), um unico codebase TypeScript p/ iOS + Android, roteamento via Expo Router. Backend/API separado (Vercel + Postgres gerenciado).

## Aditivos deste projeto
- **Lint de fronteiras como gate:** import que viole a regra FSD (camada acima->abaixo, so via `index.ts` da slice) quebra o build. Configurar ESLint (`@feature-sliced/eslint-config` ou `eslint-plugin-boundaries`). PR com violacao de fronteira nao mergeia.
- **Expo Router:** a pasta `app/` do Expo fica fina (so roteamento) para nao colidir com a camada FSD; inicializacao FSD em `src/app-init/`, composicao de telas em `src/views/`. Ver doc de arquitetura.
- **Deploy:** app via EAS (preview interno/TestFlight/Play Internal + producao nas lojas). Backend/API na Vercel (preview por PR + producao). Postgres gerenciado (Supabase/Neon — decidir via ADR na Fase 4). `profile.cloud = "none"` (nao-AWS). Storage de fotos e provedor de IA de identificacao de especie: decidir via ADR.
- **i18n:** app trilingue desde a V1 — portugues, espanhol e ingles (mercados Brasil, Argentina e internacional).
- **Multi-tenancy / privacidade:** dados de captura tem visibilidade controlada (publico vs privado — ex.: lagoa privada nao expoe localizacao exata). Toda query de dominio respeita o dono/escopo; teste de isolamento por feature de dados.

---
**Gate:** cobre tipos, testes (80%), ADRs, ambientes, design, seguranca, monetizacao, ordem de build, Git, STATUS, arquitetura FSD e plataforma (Expo).

> Emendas: CHG-001 (2026-09-19) — stack de UI/deploy migrada de Next.js web para React Native + Expo.
