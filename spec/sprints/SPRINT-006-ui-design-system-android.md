# SPRINT-006: ui-design-system-android

- **PRD:** PRD-V1-01 · **Início:** 2026-11-27 · **Status:** fechada (PR #16)

## Objetivo
Aplicar o design system v2 (Claude Design) em todas as telas, completar os fluxos do MVP no app
(registrar captura, Dex, ranking, feed, perfil, paywall) e deixar o Android pronto para a Google
Play (APK/AAB via EAS).

## Tasks
| Task | Camada | Branch | Estado |
|------|--------|--------|--------|
| UI-ds — design system v2 + fluxos | Front | feature/ui-aguas-profundas | review |
| T-11 (Android) — EAS build + ficha da loja | Full | feature/ui-aguas-profundas | em andamento (builds EAS disparados) |

## Entregue até aqui
- Expo SDK 58 (RN 0.88, targetSdk 36). CI em Node 22.
- UI kit `shared/ui`: tokens, Sora/Inter, 20 ícones SVG, Button, Badge/Flag/Pips, Chip/FilterChip,
  Avatar, SegmentedControl, TextField, EmptyState, Skeleton, Photo, ProgressBar, ToggleRow.
- Slices: `entities/catch` (CatchCard, store local), `entities/user` (perfil/plano locais),
  `features/dex-collection` (DexCell, raridade, progresso, "Nova"), `features/ranking` (pódio,
  linhas, leaderboard), `features/subscribe-pro` (Paywall, cota, preços BRL/USD),
  `features/register-catch` (formulário validado, foto), `widgets/tab-bar` (FAB), `widgets/community`.
- Telas: onboarding, Feed, Ranking, Dex, Ficha da espécie, Registrar (+ desbloqueio), Perfil.
- Android: ícone adaptativo/monocromático, splash, permissões mínimas, `eas.json` (apk/aab), arte e
  textos da loja (pt/es/en), política de privacidade.
- Gates: lint (fronteiras FSD) · typecheck · 89 testes (cobertura de domínio 99%) · export web e Android.

## Pendente para fechar
- [x] `eas login` + `eas init` — projeto `@ederson.schulze/fishingdex` (keystore gerado e guardado no EAS)
- [ ] primeiro build APK (perfil preview) e AAB (perfil production, versionCode 2) concluídos
- [ ] review + PR + merge na main · CI verde
- [ ] RETRO-006
