# RETRO-004: monetizacao

- **Sprint:** SPRINT-004 · **Fechada em:** 2026-09-20

## Entregue
- T-08: gating Free/Pro (`plan-limits`, D-9, unit 100%), `isProActive`, `SubscriptionDbRepository` (upsert sincroniza `users.plan`), `PaymentProvider` (interface) + `handleSubscriptionEvent` idempotente. PR #12.

## O que correu bem
- Monetização virou lógica pura testável + persistência, com fronteira pronta para os adapters reais.
- Webhook idempotente coberto por integração (ativa/idempotência/cancela).

## O que melhorar
- Adapters concretos RevenueCat/Stripe pendentes de contas (ADR-0004); paywall UI pendente.

## Débitos técnicos gerados
| ID | Descrição | Onde | Prioridade |
|----|-----------|------|-----------|
| DT-05 | Adapters RevenueCat/Stripe + checkout real | subscribe-pro/api | alta |

## Deploy de staging
- Commit: main @ PR #12 · CI verde.
