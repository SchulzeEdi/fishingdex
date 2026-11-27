# CHG-003 — Design system v2 (Claude Design) aplicado ao app + preparação Android/Play

- **Data:** 2026-11-27
- **Artefato afetado:** `spec/design-tokens.json` (Fase 3) + `spec/architecture.md` (versão do Expo) — sem mudar decisões de produto
- **Tipo:** emenda in-place
- **Origem da mudança:** o fundador entregou a revisão do design system feita no Claude Design
  (`fishingdex.zip`: tokens, 14 componentes, 20 ícones) e pediu o app rodando na Google Play.

## O que muda
- **Tokens (aditivo):** `border-strong`, `accent-ink`, `highlight-ink`, `silhouette`, `rarity-*`,
  `whatsapp`, `scrim` nos dois temas — corrigem contraste (AA) de contorno de controle, laranja/
  accent como texto e o selo FREE invisível. Nenhum token existente mudou de valor.
- **Regras de UI novas** (README do design system v2): sem emoji na interface (ícones próprios em
  SVG + selo de país `BR/AR/US`), laranja só no ranking e no "Assinar Pro", raridade sempre com
  pips + nome, todo estado (vazio/erro/carregando/bloqueado) com componente próprio.
- **Plataforma:** Expo SDK 51 → **58** (React Native 0.88, React 19.3). Motivo: a Play exige
  `targetSdk 36` para app novo desde 31/08/2026; o SDK 51 gera 34 e seria recusado.
  Node mínimo 22.13 (CI atualizado).
- **Catálogo:** seed ampliado de 6 para 37 espécies (BR/AR/US, doce e salgada), ordem = Nº da Dex.
  Continua sendo seed (D-11 segue: curadoria completa depois).

## Por que
O design v2 resolve problemas de acessibilidade do v1 e define os componentes que faltavam para
os fluxos (registrar, paywall, pódio, Dex). O upgrade do SDK é pré-requisito para publicar.

## Impacto
- **Tasks:** DT-06 (UI dos fluxos) atendido com dados locais; T-11 (EAS) com build Android
  configurado. Nenhuma task reaberta.
- **Débitos novos:** DT-07 (compra Pro de demonstração — trocar por Play Billing/RevenueCat
  antes da produção) e DT-08 (exemplos de comunidade no feed/ranking até a API).
- **Fases/gates:** Design e Architecture permanecem aprovados (emenda in-place).

## Artefatos atualizados
- [x] `spec/design-tokens.json` (tokens novos) + referência completa em `docs/design/design-system-v2/`
- [x] `src/shared/ui/tokens.ts` (espelho) e UI kit `src/shared/ui/*`
- [x] `docs/release/android-play-store.md`, `docs/release/store-listing.md`, `docs/legal/privacy-policy.md`
- [x] `state.json` (changes[], sprints[]) + STATUS

## Aprovação
- Decidido por: Ederson (fundador) — pedido de 2026-11-27 ("desenvolve esse frontend… quero ela rodando na Play Store")
- Data: 2026-11-27
