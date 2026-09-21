# STATUS — fishingdex

> **Fonte da verdade** do estado atual, do comeco ao fim do projeto.
> Toda skill atualiza este arquivo ao concluir (ver `reference/documentation-standards.md`).
> Fase atual: loop de entrega (SPRINT-001) · Ultima atualizacao: 2026-09-20

<!-- AUTO:START — gerado por scripts/render-status.mjs (state.json e a verdade da maquina); nao editar a mao -->
<!-- AUTO:END -->

## Resumo executivo
- **Fase atual:** loop de entrega — SPRINT-001 (dex-catalogo)
- **Proximo passo:** UI do app (telas RN dos fluxos) + integrações externas (Supabase, RevenueCat/Stripe, EAS/lojas). **Backend do MVP completo e testado.**
- **Saude da doc:** ok
- **Arquitetura:** Feature-Sliced Design (FSD) — ver `docs/architecture/feature-sliced-design.md` e `CLAUDE.md` (override do default Modular Monolith do harness).
- **Deploy/infra:** Vercel + Postgres gerenciado (Supabase/Neon) — `profile.cloud = none` (nao-AWS). Cobertura de dominio: 80%.

## Fases concluidas
- **Fase 0 — Opportunity:** ✅ aprovada (go). Veredito: **vale a pena seguir**. Diario+rede social de pesca com IA de identificacao de especie, ranking e marketplace de pesqueiros. Modelo hibrido freemium (Pro US$ 6,99 / R$ 19,90 mes) + listagem B2B (US$ 29 / R$ 79 mes). Dois mercados (USD+BRL). Artefato: `spec/opportunity.md`.
- **Fase 1 — Constitution:** ✅ aprovada (emendada por CHG-001). Regras inegociaveis: TS strict, 80% cobertura de dominio, ADR obrigatorio, design system, seguranca, cobranca USD+BRL, git branch-per-feature, doc gate, **arquitetura FSD com lint de fronteiras** e **plataforma React Native + Expo** (app nas lojas; backend em Vercel/Supabase; i18n pt/es/en). Artefato: `spec/constitution.md`.
- **Fase 2 — PRD:** ✅ PRD-V1-01 aprovado (D-1..D-11). Artefato: `spec/prds/PRD-V1-01.md`.
- **Fase 3 — Design:** ✅ aprovada. Identidade "Aguas Profundas" (2 temas), tokens, playbook e prototipo (Claude Design em `docs/design/prototype/`). Artefatos: `spec/design-system.md`, `spec/design-tokens.json`.
- **Fase 4 — Architect:** ✅ aprovada. App Expo + backend Vercel + Supabase, FSD, B2C (nao multi-tenant). 7 ADRs. Artefato: `spec/architecture.md`.
- **Fase 5 — Monetize:** ✅ aprovada. Tiers USD/BRL; RevenueCat/IAP p/ Pro + Stripe (USD e BRL/Pix) p/ listagem; camada `PaymentProvider`. Artefato: `spec/monetization.md`.
- **Fase 6 — Tasks:** ✅ aprovada. PRD quebrado em T-01..T-11 (M0 fundação, M1 MVP pagável, M2 publicação). Artefato: `spec/tasks/TASKS-PRD-V1-01.md`.
- **Infra do trabalho:** repo GitHub + pipeline GitHub Actions (gates) + SonarCloud (scanner) verdes; deploy Vercel não-bloqueante (pendência: escopo do token — ver `docs/ci/sonarcloud-setup.md`).

## PRDs
| PRD | Titulo | Status |
|-----|--------|--------|
| PRD-V1-01 | fishingdex MVP (diario + ranking + marketplace) | aprovado |

## Sprint atual
- Nenhuma ativa. Backend do MVP concluído (SPRINT-001..004). Restam UI + integrações externas.

## Estado do backend (tudo com teste automatizado)
- **Banco:** Postgres 16 + PostGIS local (Docker, `docker-compose up`); `npm run db:reset` (migrate+seed).
- **Testes:** `npm test` (unidade/domínio) e `npm run test:integration` (contra o DB). ~33 unidade + 22 integração.
- **Features:** auth local (bcrypt+JWT) · registrar captura + desbloqueio Dex + anti-cheat · ranking + denúncia · feed/seguir/curtir · pesqueiros por raio (PostGIS) · gating Free/Pro + assinatura.
- **CI:** gates + job `integration` (serviço PostGIS) + SonarCloud, todos verdes.

## Historico de sprints
| Sprint | Retro | Resultado | Debitos gerados |
|--------|-------|-----------|-----------------|
| SPRINT-001 (dex-catalogo) | RETRO-001 | ✅ T-04 + T-10 done, merge na main, CI verde | DT-01, DT-02 |
| SPRINT-002 (backend-fundacao) | embutido | ✅ T-02/T-03/T-05 (DB+auth+captura) | DT-03 |
| SPRINT-003 (nucleo-social) | embutido | ✅ T-06/T-07/T-09 (feed/ranking/pesqueiros) | DT-04 |
| SPRINT-004 (monetizacao) | embutido | ✅ T-08 (Free/Pro + assinatura) | DT-05 |
| SPRINT-005 (app-shell) | RETRO-005 | ✅ abas + telas (Feed/Ranking/Dex/Perfil) | DT-06 |

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
| ADR-0007 | PostGIS para dados espaciais (raio/mapa) | architect / CHG-002 | aceito |
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
| D-12 | Colecao de especies (Dex/Pokedex) | PRD-V1-01 / CHG-002 | vigente |
| D-13 | Integridade do ranking: tetos por especie + denuncia | PRD-V1-01 / CHG-002 | vigente |
| D-14 | Catalogo regionalizado (regions[] por mercado) | PRD-V1-01 / CHG-002 | vigente |

## Bugs
**Em aberto:**
- BUG-NNN: <descricao> (origem: SPRINT-NNN / T-NN · severidade)

**Resolvidos:**
- BUG-NNN: <descricao> (corrigido em SPRINT-NNN · fix/<slug>)

## Debitos tecnicos
| ID | Descricao | Origem | Prioridade |
|----|-----------|--------|-----------|
| DT-01 | Sem testes de UI (componente/e2e) das telas RN | SPRINT-001 | media |
| DT-02 | Deploy Vercel não-bloqueante (token sem escopo do time) | SPRINT-001 | media |
| DT-03 | RLS por auth.uid() no Postgres (entra com Supabase) | SPRINT-002 | media |
| DT-04 | Camada HTTP (route handlers) expondo as features | SPRINT-003 | alta |
| DT-05 | Adapters RevenueCat/Stripe + checkout real | SPRINT-004 | alta |
| DT-06 | UI dos fluxos (registrar, feed, ranking, pesqueiros, paywall) | SPRINT-003/004 | alta |

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
| CHG-002 | PRD-V1-01 (D-12/D-13/D-14) + architecture + ADR-0007 | Dex, integridade do ranking (anti "mentira de pescador"), catálogo regionalizado, PostGIS | Backlog da Fase 6 cobre; refletido no scaffold. Ver `spec/changes/CHG-002-*.md` |

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
