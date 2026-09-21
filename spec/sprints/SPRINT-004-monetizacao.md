# SPRINT-004: monetizacao

- **PRD:** PRD-V1-01 · **Início/Fim:** 2026-09-20 · **Status:** fechada

## Objetivo
Regras de negócio da monetização: gating Free/Pro e ciclo de vida da assinatura.

## Tasks
| Task | Camada | Branch | Estado |
|------|--------|--------|--------|
| T-08 | Full | feature/subscribe-pro | done (PR #12) |

## RETRO (embutido)
- **Entregue:** `plan-limits` (D-9: Free 3 capturas/mês, sem social; Pro ilimitado) unit 100%; `isProActive`; `SubscriptionDbRepository` (upsert sincroniza `users.plan`); `PaymentProvider` (interface) + `handleSubscriptionEvent` idempotente. 3 testes de integração (ativa/idempotência/cancela).
- **Bem:** monetização virou lógica pura testável + persistência; fronteira pronta pros adapters reais.
- **Melhorar:** adapters concretos RevenueCat/Stripe pendentes de contas (ADR-0004). DT-05.
- **Débitos:** DT-05 (adapters RevenueCat/Stripe + checkout real — pendente contas do fundador).

## Sprint pronta
- [x] Tasks done · [x] merge na main · [x] CI verde
