# SPRINT-001: dex-catalogo

- **PRD:** PRD-V1-01 · **Início:** 2026-09-20 · **Status:** fechada (ver RETRO-001)
- **Objetivo da sprint:** entregar a mecânica-âncora (Dex/coleção) e o catálogo regionalizado navegáveis no app, mais i18n pt/es/en — fatias de domínio+UI que não dependem do backend externo (Supabase), mantendo o pipeline verde.

## Tasks incluídas
| Task | Camada | Branch | Estado |
|------|--------|--------|--------|
| T-04 | Full (front+domínio) | feature/dex-catalog | done (PR #6) |
| T-10 | Front | feature/i18n | done (PR #5) |

> T-02/T-03 (Supabase, Auth) ficam para a SPRINT-002 — exigem provisionamento de serviço externo e credenciais do fundador. Nesta sprint, a Dex/catálogo usam o seed local (`SPECIES_SEED`) e um repositório em memória, com a fronteira `shared/api` pronta para trocar por Supabase depois.

## Critério de "sprint pronta"
- [ ] T-04 e T-10 `done`
- [ ] Tudo mergeado na `main` via PR
- [ ] Pipeline verde (gates + SonarCloud); cobertura de domínio ≥ 80%

## Notas de execução
- Sessão autônoma (fundador ausente): sem novas perguntas; decisões default documentadas aqui e nos ADRs.
- Backend real (Supabase) adiado por dependência externa — não bloqueia o valor desta sprint.

---
Ao fechar: gerar `RETRO-001-dex-catalogo.md` e atualizar `spec/STATUS.md`.
