# RETRO-005: app-shell

- **Sprint:** SPRINT-005 · **Fechada em:** 2026-09-20

## Entregue
- Navegação por abas (Expo Router): Feed, Ranking, Dex, Perfil. PR #14.
- Telas com design system (tema claro/escuro) + i18n; Perfil com gating Free/Pro + CTA Assinar Pro.

## O que correu bem
- App passou a "existir" visualmente e o build (expo export) valida a compilação.
- Reuso dos tokens/temas e das regras de plano puras (plan-limits) na UI.

## O que melhorar
- Telas Feed/Ranking/Perfil usam mock; faltam a API HTTP e os testes de UI.

## Débitos técnicos gerados
| ID | Descrição | Onde | Prioridade |
|----|-----------|------|-----------|
| DT-06 | Ligar telas à API/HTTP (route handlers) | app/ + views/ | alta |

## Deploy de staging
- Commit: main @ PR #14 · CI verde (build inclui export web).
