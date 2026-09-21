# SPRINT-003: nucleo-social

- **PRD:** PRD-V1-01 · **Início/Fim:** 2026-09-20 · **Status:** fechada

## Objetivo
Núcleo social e competitivo: ranking, feed/seguir/curtir e marketplace de pesqueiros com busca geoespacial.

## Tasks
| Task | Camada | Branch | Estado |
|------|--------|--------|--------|
| T-07 | Full | feature/ranking | done (PR #10) |
| T-06 | Full | feature/fisheries-feed | done (PR #11) |
| T-09 | Full | feature/fisheries-feed | done (PR #11) |

## RETRO (embutido)
- **Entregue:** ranking por tamanho (recortes período/espécie/país; só público+foto; oculta capturas denunciadas ≥3 — D-13); `reportCatch`; feed de quem sigo (sem privadas) + follow/like idempotentes; pesqueiros com `ST_DWithin`/`ST_Distance` (raio) e listagem ativa.
- **Bem:** PostGIS entregou busca por raio correta e testada; 12 testes de integração cobrindo os fluxos.
- **Melhorar:** falta a camada HTTP (route handlers) expondo essas funções; hoje são chamadas diretas testadas por integração. DT-04.
- **Débitos:** DT-04 (route handlers/API HTTP — entram com o backend na Vercel).

## Sprint pronta
- [x] Tasks done · [x] merge na main · [x] CI verde
