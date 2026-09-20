# STATUS — fishingdex

> **Fonte da verdade** do estado atual, do comeco ao fim do projeto.
> Toda skill atualiza este arquivo ao concluir (ver `reference/documentation-standards.md`).
> Fase atual: monetize · Ultima atualizacao: 2026-09-20

<!-- AUTO:START — gerado por scripts/render-status.mjs (state.json e a verdade da maquina); nao editar a mao -->
<!-- AUTO:END -->

## Resumo executivo
- **Fase atual:** monetize
- **Proximo passo:** Fase 5 — rodar `sdd-monetize`
- **Saude da doc:** ok
- **Arquitetura:** Feature-Sliced Design (FSD) — ver `docs/architecture/feature-sliced-design.md` e `CLAUDE.md` (override do default Modular Monolith do harness).
- **Deploy/infra:** Vercel + Postgres gerenciado (Supabase/Neon) — `profile.cloud = none` (nao-AWS). Cobertura de dominio: 80%.

## Fases concluidas
- **Fase 0 — Opportunity:** ✅ aprovada (go). Veredito: **vale a pena seguir**. Diario+rede social de pesca com IA de identificacao de especie, ranking e marketplace de pesqueiros. Modelo hibrido freemium (Pro US$ 6,99 / R$ 19,90 mes) + listagem B2B (US$ 29 / R$ 79 mes). Dois mercados (USD+BRL). Artefato: `spec/opportunity.md`.
- **Fase 1 — Constitution:** ✅ aprovada (emendada por CHG-001). Regras inegociaveis: TS strict, 80% cobertura de dominio, ADR obrigatorio, design system, seguranca, cobranca USD+BRL, git branch-per-feature, doc gate, **arquitetura FSD com lint de fronteiras** e **plataforma React Native + Expo** (app nas lojas; backend em Vercel/Supabase; i18n pt/es/en). Artefato: `spec/constitution.md`.
- **Fase 2 — PRD:** ✅ PRD-V1-01 aprovado (D-1..D-11). Artefato: `spec/prds/PRD-V1-01.md`.
- **Fase 3 — Design:** ✅ aprovada. Identidade "Aguas Profundas" (2 temas), tokens, playbook e prototipo (Claude Design em `docs/design/prototype/`). Artefatos: `spec/design-system.md`, `spec/design-tokens.json`.
- **Fase 4 — Architect:** ✅ aprovada. App Expo + backend Vercel + Supabase, FSD, B2C (nao multi-tenant). 6 ADRs. Artefato: `spec/architecture.md`.

## PRDs
| PRD | Titulo | Status |
|-----|--------|--------|
| PRD-V1-01 | fishingdex MVP (diario + ranking + marketplace) | aprovado |

## Sprint atual
- **SPRINT-NNN** (<slug>) — objetivo: ...
- Tasks: <T-NN doing>, <T-NN todo> ...
- Criterio de "sprint pronta": ...

## Historico de sprints
| Sprint | Retro | Resultado | Debitos gerados |
|--------|-------|-----------|-----------------|
| SPRINT-001 | RETRO-001 | ... | DT-.. |

## Indice de decisoes (ADRs + D-N)
> Toda decisao de arquitetura vira ADR e aparece aqui. Decisoes de produto (D-N) do PRD entram quando relevantes.

| ID | Decisao | Origem | Status |
|----|---------|--------|--------|
| ADR-0001 | Hospedagem Vercel + Supabase (nao AWS) | architect | aceito |
| ADR-0002 | ORM Drizzle | architect | aceito |
| ADR-0003 | Auth Supabase (e-mail+Google+Apple) | architect | aceito |
| ADR-0004 | Pagamentos IAP (RevenueCat) p/ Pro + Stripe p/ listagem | architect | aceito |
| ADR-0005 | B2C sem multi-tenant; isolamento por dono + RLS | architect | aceito |
| ADR-0006 | CI/CD GitHub Actions + SonarCloud + Vercel/EAS | architect | aceito |
| D-1 | Plataforma React Native + Expo (app nas lojas) | PRD-V1-01 / CHG-001 | vigente |
| D-2 | Identificacao de especie manual na V1 (IA depois) | PRD-V1-01 | vigente |
| D-3 | App trilingue pt/es/en desde a V1 | PRD-V1-01 | vigente |
| D-4 | Escopo V1 amplo, entrega faseada | PRD-V1-01 | vigente |
| D-5 | Login e-mail+senha, Google, Apple | PRD-V1-01 | vigente |
| D-6 | Ranking por tamanho (foto obrigatoria); recortes global/especie/periodo/pais | PRD-V1-01 | vigente |
| D-7 | Social = seguir + curtir, sem comentarios | PRD-V1-01 | vigente |
| D-8 | Marketplace so contato WhatsApp, sem agendamento interno na V1 | PRD-V1-01 | vigente |
| D-9 | Free = 3 capturas/mes isolado; Pro = tudo; listagem de pesqueiro paga desde a V1 | PRD-V1-01 | vigente |
| D-10 | Online-only na V1 (sem offline/sync) | PRD-V1-01 | vigente |
| D-11 | Catalogo de especies por curadoria posterior | PRD-V1-01 | vigente |

## Bugs
**Em aberto:**
- BUG-NNN: <descricao> (origem: SPRINT-NNN / T-NN · severidade)

**Resolvidos:**
- BUG-NNN: <descricao> (corrigido em SPRINT-NNN · fix/<slug>)

## Debitos tecnicos
| ID | Descricao | Origem | Prioridade |
|----|-----------|--------|-----------|
| DT-NN | ... | SPRINT-NNN | alta / media / baixa |

## Deploys
| Deploy | Data | Ambiente | Commit | Resultado |
|--------|------|----------|--------|-----------|
| DEPLOY-001 | <ISO> | staging / producao | <sha> | ok / rollback |

## Load tests
| Teste | Data | Ambiente | p95 | RPS | Erro % | Metas batidas |
|-------|------|----------|-----|-----|--------|---------------|
| LOAD-001 | <ISO> | staging | | | | sim / nao |

## Emendas (change requests)
| ID | Artefato alterado | Motivo | Impacto |
|----|-------------------|--------|---------|
| CHG-001 | constitution (P4/P5/P12/aditivos) | Stack de UI/deploy: Next.js web -> React Native + Expo (app nas lojas) | Sem tasks reabertas (Fase 2); Fase 4 nasce com stack Expo. Ver `spec/changes/CHG-001-*.md` |

## Logbook (resumo acumulado)
> Detalhe por interacao em `spec/logbook/`. Aqui so o agregado, para o TCC.

| Metrica | Acumulado |
|---------|-----------|
| Interacoes registradas | 0 |
| Tokens de entrada | 0 |
| Tokens de saida | 0 |
| Custo (USD) | 0.00 |
| Tempo total | 0h00 |

## Experimentos (vibe coding x SDD)
| ID | Feature | Vencedor | Link |
|----|---------|----------|------|
| EXP-001 | ... | vibe / SDD / empate | spec/experiments/EXP-001-*.md |
