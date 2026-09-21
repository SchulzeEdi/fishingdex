# RETRO-001: dex-catalogo

- **Sprint:** SPRINT-001 · **Fechada em:** 2026-09-20

## Entregue
- **T-10 (i18n):** mensagens pt/es/en, `resolveLocale` (pt-BR→pt) e `translate` com interpolação/fallback — base trilíngue do app (D-3). PR #5.
- **T-04 (Dex/catálogo):** `SpeciesRepository` (fronteira pronta pra Supabase) + `InMemorySpeciesRepository` (seed regionalizado), e a tela da Dex com abas água doce/salgada, progresso i18n e carregamento assíncrono (D-12/D-14). PR #6.
- Valor: a mecânica-âncora (coleção estilo Pokédex) já é navegável no app, com o catálogo filtrado por região e idioma.

## O que correu bem
- Domínio 100% coberto; gates verdes em todos os PRs; SonarCloud passando.
- A regra de fronteiras FSD do ESLint pegou (mentalmente) o repositório mal-colocado em `shared/api` — movido para `entities/fish-species/api`, mantendo a arquitetura limpa.
- Sessão autônoma fluiu com branch→PR→merge sem intervenção.

## O que melhorar
- Falta teste de componente/e2e da tela (só domínio coberto) — a UI RN não é testada em Node. Débito DT-01.
- Dados ainda em memória; a troca por Supabase (T-02/T-03) é a dependência crítica da próxima sprint.

## Débitos técnicos gerados
| ID | Descrição | Onde | Prioridade |
|----|-----------|------|-----------|
| DT-01 | Sem testes de UI (componente/e2e) das telas RN | views/ | média |
| DT-02 | Deploy Vercel não-bloqueante (token sem escopo do time) | .github/workflows/ci.yml | média |

## Bugs abertos nesta sprint
- Nenhum.

## Deploy de staging
- Commit: main @ merge do PR #6 · Resultado: CI verde (gates + SonarCloud). Deploy Vercel pendente (DT-02).

---
Próxima: **SPRINT-002** — T-02 (Supabase/schema/PostGIS/RLS) + T-03 (Auth). Requer provisionamento do Supabase pelo fundador.
