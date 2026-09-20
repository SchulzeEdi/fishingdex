# CHG-001 — Stack de UI/deploy: Next.js web -> React Native + Expo

- **Data:** 2026-09-19
- **Artefato afetado:** constitution (principios 4, 5, 12 e aditivos) + `docs/architecture/feature-sliced-design.md` + `CLAUDE.md`
- **Tipo:** emenda in-place
- **Origem da mudanca:** descoberta na Fase 2 (PRD) — o usuario confirmou que quer que as pessoas BAIXEM o app nas lojas (App Store / Play Store), nao um PWA web. Decisao registrada como D-1 no PRD.

## O que muda
- **Antes:** UI em Next.js (App Router) web, deploy do app na Vercel, experiencia PWA instalavel pelo navegador. FSD adaptado ao Next.js App Router (camada de roteamento = `src/app/` do Next; `app-init/` + `views/`).
- **Depois:** UI em **React Native + Expo** (um codigo TypeScript p/ iOS + Android), roteamento via **Expo Router**, publicacao nas lojas via **EAS**. **Backend/API, banco, cobranca e arquitetura FSD continuam** — backend em Vercel + Postgres gerenciado (Supabase/Neon). Camera nativa de verdade.
- FSD mantido, mas a camada de roteamento passa a ser Expo Router (pasta `app/` do Expo, fina) em vez do Next App Router. Doc de arquitetura e CLAUDE.md atualizados.

## Por que
- O requisito real do produto e presenca nas lojas com experiencia de app nativo (camera, notificacoes, icone) — PWA nao entrega isso e nao aparece nas lojas.
- Expo mantem as regras inegociaveis ja aprovadas: TypeScript strict e Feature-Sliced Design, com um unico codebase (evita o custo de Swift+Kotlin separados, que quebraria a constitution).

## Impacto
- **Tasks:** nenhuma reaberta (ainda nao ha tasks — estamos na Fase 2).
- **Sprints:** nenhuma (nao ha sprints).
- **Fases/gates:** constitution permanece aprovada (emenda in-place registrada, nao reabre gate). Fase 4 (architect) ja nascera com a stack Expo — ADRs de UI/deploy/OTA sairao la. Novos custos (Apple US$ 99/ano, Google Play US$ 25 unico) viram risco no PRD.
- **Supersede:** n/a (nao havia ADR; a decisao de web era so da constitution, agora emendada).

## Artefatos atualizados
- [x] `spec/constitution.md` editado (principios 4, 5, 12 + aditivos)
- [x] `docs/architecture/feature-sliced-design.md` (secao Next.js -> Expo Router)
- [x] `CLAUDE.md` (resumo do contrato FSD com Expo)
- [x] `state.json` (`changes[]`, `profile`)
- [x] STATUS (secao Emendas)
- [x] Cross-links criados (D-1 do PRD <-> CHG-001)

## Aprovacao
- Decidido por: Ederson (fundador)
- Data: 2026-09-19
