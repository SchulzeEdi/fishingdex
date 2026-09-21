# RETRO-002: backend-fundacao

- **Sprint:** SPRINT-002 · **Fechada em:** 2026-09-20

## Entregue
- T-02: docker-compose PostGIS (senha), schema Drizzle (todas as entidades), migration com PostGIS/geom/GiST/trigger, seed regionalizado. PR #8.
- T-03: auth local bcrypt+JWT atrás de interface. PR #9.
- T-05 (backend): `registerCatch` (transação captura + desbloqueio Dex + anti-cheat).

## O que correu bem
- Testes de integração contra Postgres real; job `integration` no CI com serviço PostGIS.
- TS strict pegou vários `undefined` antes do runtime.

## O que melhorar
- RLS por `auth.uid()` não aplicado no Postgres local (entra com Supabase Auth).

## Débitos técnicos gerados
| ID | Descrição | Onde | Prioridade |
|----|-----------|------|-----------|
| DT-03 | RLS/políticas por dono no Postgres | shared/db + Supabase | media |

## Deploy de staging
- Commit: main @ PR #8/#9 · CI verde (gates + integration + Sonar).
