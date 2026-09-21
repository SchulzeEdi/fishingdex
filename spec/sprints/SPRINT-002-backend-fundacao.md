# SPRINT-002: backend-fundacao

- **PRD:** PRD-V1-01 · **Início/Fim:** 2026-09-20 · **Status:** fechada

## Objetivo
Fundação de backend: banco local (Postgres/PostGIS via Docker), schema de todas as entidades, e autenticação.

## Tasks
| Task | Camada | Branch | Estado |
|------|--------|--------|--------|
| T-02 | DB | feature/db-schema-base | done (PR #8) |
| T-03 | Full | feature/auth | done (PR #9) |
| T-05 | Full | (entregue junto do T-02 — `registerCatch`) | done |

## RETRO (embutido)
- **Entregue:** docker-compose PostGIS com senha; schema Drizzle (users, fish_species, catches, dex_unlocks, follows, likes, fisheries, subscriptions, reports); migration com PostGIS/geom/GiST/trigger; seed regionalizado; `registerCatch` (transação captura + desbloqueio Dex + anti-cheat); auth local (bcrypt+JWT). Job `integration` no CI com serviço PostGIS.
- **Bem:** testes de integração contra DB real; strict pegou vários `undefined`; CI verde com DB.
- **Melhorar:** RLS por `auth.uid()` ainda não aplicado (adaptado ao ambiente local; entra com Supabase). DT-03.
- **Débitos:** DT-03 (RLS/políticas por dono no Postgres — pendente Supabase).

## Sprint pronta
- [x] Tasks done · [x] merge na main · [x] CI verde (gates + integration + Sonar)
