# RETRO-003: nucleo-social

- **Sprint:** SPRINT-003 · **Fechada em:** 2026-09-20

## Entregue
- T-07: ranking por tamanho (recortes período/espécie/país; só público+foto; oculta denunciadas ≥3) + reportCatch. PR #10.
- T-06: feed de quem sigo (sem privadas) + follow/like idempotentes. PR #11.
- T-09: pesqueiros por raio (PostGIS ST_DWithin/ST_Distance) + CRUD/listagem. PR #11.

## O que correu bem
- PostGIS entregou busca por raio correta; 12 testes de integração cobrindo os fluxos.
- Moderação da comunidade (D-13) e privacidade do feed validadas por teste.

## O que melhorar
- Falta a camada HTTP (route handlers) expondo as funções para o app.

## Débitos técnicos gerados
| ID | Descrição | Onde | Prioridade |
|----|-----------|------|-----------|
| DT-04 | Route handlers / API HTTP | backend (Vercel) | alta |

## Deploy de staging
- Commit: main @ PR #10/#11 · CI verde.
