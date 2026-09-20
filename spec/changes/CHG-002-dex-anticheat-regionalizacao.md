# CHG-002 — Dex (coleção), integridade do ranking e catálogo regionalizado

- **Data:** 2026-09-20
- **Artefato afetado:** PRD-V1-01 (novas decisões D-12, D-13, D-14) + `spec/architecture.md` + ADR-0007
- **Tipo:** emenda in-place
- **Origem da mudança:** evolução do produto no design (Dex) e feedback técnico do usuário na fase de scaffold (anti "mentira de pescador", PostGIS, seed regionalizado).

## O que muda
- **D-12 — Dex (Pokédex de peixes):** espécies começam bloqueadas e desbloqueiam na 1ª captura; progresso por habitat. Já refletido no design (`docs/design`) e implementado no domínio (`features/dex-collection`).
- **D-13 — Integridade do ranking:** cada espécie ganha `max_plausible_size_cm`/`max_plausible_weight_kg`; o registro valida contra esses tetos (`features/register-catch/isPlausibleCatch`) e a comunidade pode **denunciar** capturas (`reports`). Combate ao exagero típico da pesca.
- **D-14 — Catálogo regionalizado:** `fish_species.regions[]` filtra o catálogo por mercado (BR/AR/US) via `speciesForRegion` — evita lista gigante irrelevante.
- **PostGIS (ADR-0007):** extensão espacial ligada no dia 1 para queries de raio/mapa (`fisheries.geom`, `catches.geom`).

## Por que
Sem integridade, o ranking (feature central) perde credibilidade; sem regionalização, a UX do catálogo trava; sem PostGIS, as queries de mapa não escalam.

## Impacto
- **Tasks:** nenhuma reaberta (pré-sprint). Entram no backlog quando a Fase 6 (tasks) rodar.
- **Fases/gates:** PRD e Architecture permanecem aprovados (emenda in-place). ADR-0007 adicionado.
- **Supersede:** n/a.

## Artefatos atualizados
- [x] PRD-V1-01 (D-12, D-13, D-14)
- [x] `spec/architecture.md` (modelo de dados, API, PostGIS, moderação, regionalização)
- [x] `spec/adr/0007-postgis-dados-espaciais.md`
- [x] Código de domínio: `features/dex-collection`, `features/register-catch`, `entities/fish-species` (regions + limites)
- [x] `state.json` (changes[]) + STATUS (Emendas + índice de decisões)

## Aprovação
- Decidido por: Ederson (fundador)
- Data: 2026-09-20
