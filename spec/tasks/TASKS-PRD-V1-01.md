# TASKS-PRD-V1-01: fishingdex MVP

> Quebra do PRD-V1-01 em tasks executáveis. Fatias verticais; ordem DB → Backend → Frontend.
> Stack: Expo (RN) + Vercel + Supabase, FSD, B2C. Ver architecture.md e ADRs.

## Convenção (bloco de metadados por task)
```
### [T-NN] <título>
- estado: todo | doing | done | blocked
- camada: DB | Back | Front | Full
- estimativa: P/M/G
- depende_de: [T-..]
- branch: feature/<slug>
- criterios_de_aceite: [ ] ...
- teste: <unidade/e2e>
- DoD: gates verdes + (se UI) usa design system + PR merge na main
```

---

## Milestone M0 — Walking skeleton (fundação)
### [T-01] Scaffold Expo + FSD + pipeline CI/Sonar
- estado: **done**
- camada: Full
- estimativa: M
- depende_de: []
- branch: chore/scaffold-expo-fsd (merge PR #1)
- criterios_de_aceite:
  - [x] App Expo sobe; estrutura FSD; ESLint com fronteiras; Vitest c/ cobertura
  - [x] CI (GitHub Actions) + SonarCloud verdes
- teste: unidade (domínio)
- DoD: ✅ mergeado na main

### [T-02] Supabase: projeto + schema base + PostGIS + RLS
- estado: todo
- camada: DB
- estimativa: M
- depende_de: [T-01]
- branch: feature/db-schema-base
- criterios_de_aceite:
  - [ ] Migrations Drizzle: users, fish_species, catches, dex_unlocks, follows, likes, fisheries, subscriptions, reports
  - [ ] Extensão PostGIS ligada; `geom` em catches/fisheries com índice GiST (ADR-0007)
  - [ ] RLS por dono (`auth.uid()`), privado não vaza (ADR-0005)
- teste: unidade (repos) + teste de isolamento A≠B
- DoD: gates verdes + PR merge

### [T-03] Auth (e-mail + Google + Apple)
- estado: todo
- camada: Full
- estimativa: M
- depende_de: [T-02]
- branch: feature/auth
- criterios_de_aceite:
  - [ ] Login/cadastro e-mail+senha, Google e Apple (Supabase Auth, ADR-0003)
  - [ ] Perfil público (nome, avatar, país); telas seguem design system
- teste: unidade + e2e login
- DoD: gates verdes + UI usa design system + PR merge

## Milestone M1 — MVP pagável (núcleo + receita)
### [T-04] Catálogo de espécies (regionalizado) + Dex
- estado: doing
- camada: Full
- estimativa: M
- depende_de: [T-02]
- branch: feature/dex-catalog
- criterios_de_aceite:
  - [x] Domínio da Dex (desbloqueio, progresso, regionalização) — feito no scaffold
  - [ ] Tela da Dex ligada ao backend (espécies por região; bloqueada×desbloqueada)
  - [ ] Catálogo/picker filtra doce/salgada e por região (D-14)
- teste: unidade (buildDex, speciesForRegion) ✅ + e2e da tela
- DoD: gates verdes + UI usa design system + PR merge

### [T-05] Registrar captura (foto + espécie + detalhes) + desbloqueio
- estado: todo
- camada: Full
- estimativa: G
- depende_de: [T-03, T-04]
- branch: feature/register-catch
- criterios_de_aceite:
  - [ ] Fluxo 3 passos (foto→espécie→detalhes); foto e espécie obrigatórias (RF-2)
  - [ ] Upload de foto (Supabase Storage); local com toggle privado
  - [ ] `isPlausibleCatch` barra valores absurdos (D-13) ✅ domínio
  - [ ] 1ª captura de espécie dispara desbloqueio na Dex (tela de sucesso)
- teste: unidade (validate) ✅ + e2e do fluxo
- DoD: gates verdes + UI usa design system + PR merge

### [T-06] Feed + seguir + curtir
- estado: todo
- camada: Full
- estimativa: M
- depende_de: [T-05]
- branch: feature/feed-social
- criterios_de_aceite:
  - [ ] Feed paginado (cursor) de quem sigo + destaques (RF-5); Pro-only (Free bloqueado)
  - [ ] Seguir/deixar de seguir; curtir/descurtir; sem comentários (D-7)
- teste: unidade + e2e
- DoD: gates verdes + UI usa design system + PR merge

### [T-07] Ranking (tamanho) + recortes + denúncia
- estado: todo
- camada: Full
- estimativa: M
- depende_de: [T-05]
- branch: feature/ranking
- criterios_de_aceite:
  - [ ] Ranking por tamanho (foto obrigatória) global/espécie/período/país (D-6); Pro-only
  - [ ] Botão "Denunciar captura" → `reports` (D-13)
- teste: unidade (ordenação/filtros) + e2e
- DoD: gates verdes + UI usa design system + PR merge

### [T-08] Assinatura Pro (RevenueCat/IAP) ← PRIMEIRA TASK DE RECEITA
- estado: todo
- camada: Full
- estimativa: G
- depende_de: [T-03]
- branch: feature/subscribe-pro
- criterios_de_aceite:
  - [ ] Paywall (RevenueCat) com preços USD e BRL; assinar libera recursos Pro (RF-7/8)
  - [ ] Webhook idempotente atualiza `subscriptions`; restaurar compra
- teste: unidade (estado da assinatura) + e2e paywall
- DoD: gates verdes + UI usa design system + PR merge

### [T-09] Marketplace de pesqueiros (mapa + listagem paga)
- estado: todo
- camada: Full
- estimativa: G
- depende_de: [T-02, T-03]
- branch: feature/fisheries
- criterios_de_aceite:
  - [ ] Mapa/lista por raio (PostGIS `ST_DWithin`); detalhe com "Falar no WhatsApp" (D-8)
  - [ ] Dono cadastra pesqueiro; listagem paga via Stripe USD + BRL/Pix (RF-6, monetization)
- teste: unidade (query de raio) + e2e
- DoD: gates verdes + UI usa design system + PR merge

### [T-10] i18n pt/es/en
- estado: todo
- camada: Front
- estimativa: P
- depende_de: [T-01]
- branch: feature/i18n
- criterios_de_aceite:
  - [ ] Strings em pt/es/en; troca de idioma; detecta locale do device (D-3, RF-9)
- teste: unidade (resolução de chave)
- DoD: gates verdes + PR merge

## Milestone M2 — Publicação
### [T-11] Build EAS + submissão às lojas
- estado: todo
- camada: Full
- estimativa: M
- depende_de: [T-05, T-08]
- branch: chore/eas-release
- criterios_de_aceite:
  - [ ] EAS build iOS+Android; canais preview/production; app aprovado nas lojas (critério de sucesso do PRD)
- teste: smoke em TestFlight/Play Internal
- DoD: builds gerados + checklist das lojas

---
**Gate:** PRD quebrado em fatias verticais com metadados, ordem DB→Back→Front, dependências e DoD.
