# RETRO-006: ui-design-system-android

- **Sprint:** SPRINT-006 · **Status da retro:** parcial (atualizar ao fechar, depois do 1º build EAS)

## Entregue
- Design system v2 (Claude Design) traduzido para React Native: tokens, tipografia Sora/Inter,
  20 ícones SVG próprios (zero emoji na interface), 14 componentes.
- Fluxos do MVP no app: onboarding, registrar captura (foto, espécie com busca, tamanho/peso
  validados contra o teto da espécie, local privado, cota Free), desbloqueio de espécie, Dex
  (3 colunas, "Nova", raridade), ficha da espécie, ranking (pódio + recortes), feed, perfil e
  paywall (conteúdo real desfocado).
- Expo SDK 51 → 58 (targetSdk 36), Android pronto para EAS (apk/aab), ícone adaptativo, splash,
  ficha da loja pt/es/en e política de privacidade.

## O que correu bem
- O domínio puro já existente (buildDex, plan-limits, isPlausibleCatch, periodCutoff) foi
  reaproveitado sem mudança de regra — a UI só compôs.
- Manter UI fora dos `index.ts` que os testes de domínio importam evitou carregar React Native no
  vitest (PlanBadge foi para `features/subscribe-pro`).
- Verificação visual no navegador pegou detalhes que os gates não pegam (silhueta desproporcional
  nas miniaturas, estado sem foto no desbloqueio).

## O que melhorar
- Upgrade de 7 SDKs de uma vez exigiu reinstalação limpa das dependências; próximos upgrades
  devem ser feitos a cada SDK.
- Ainda sem testes de componente (DT-01); a verificação de UI foi manual.

## Débitos técnicos gerados
| ID | Descrição | Onde | Prioridade |
|----|-----------|------|-----------|
| DT-07 | Compra Pro de demonstração → Google Play Billing via RevenueCat | `features/subscribe-pro/model/demo-purchase.ts` | alta |
| DT-08 | Exemplos locais da comunidade no feed/ranking → API | `entities/catch/model/sample-community.data.ts` | alta |
