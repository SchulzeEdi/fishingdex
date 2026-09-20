# ADR-0001: Hospedagem — Vercel + Supabase (não AWS)

- **Status:** aceito
- **Data:** 2026-09-20

## Contexto
O harness default é AWS. O projeto é dev solo e também entrega acadêmica (rubrica pede AWS/EC2). O usuário optou por simplicidade de operação. `profile.cloud = "none"`.

## Opções consideradas
1. **AWS (EC2/ECS + RDS)** — atende a rubrica; muito setup/operação p/ dev solo.
2. **Vercel + Supabase** — deploy trivial, Postgres+Auth+Storage gerenciados; roda sobre AWS por baixo, mas não é "provisionar EC2".
3. Render/Fly.io — meio-termo; menos integrado ao Next/Expo.

## Decisão
**Vercel** (backend/API) + **Supabase** (Postgres, Auth, Storage). App via EAS.

## Consequências
- Positivas: velocidade de entrega, menos ops, preview por PR nativo.
- Negativas / trade-offs aceitos: **risco na correção do trabalho** — a rubrica pede AWS/EC2 explicitamente; ver memória do projeto. Menos controle de infra.
- Reavaliar se: exigência formal de AWS, ou custo/escala pedir infra própria.
