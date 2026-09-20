# ADR-0002: ORM — Drizzle

- **Status:** aceito
- **Data:** 2026-09-20

## Contexto
Precisamos de acesso a Postgres (Supabase) type-safe, leve e com migrations versionadas, compatível com TS strict e FSD.

## Opções consideradas
1. **Drizzle** — SQL-first, type-safe, leve, migrations em código; ótimo com Supabase.
2. **Prisma** — DX ótima, porém runtime mais pesado e engine binária.
3. **supabase-js puro** — simples, mas sem tipos de schema fortes nem migrations estruturadas.

## Decisão
**Drizzle** como ORM/migrations, schema por entidade no segmento `entities/*/model` e client base em `shared/db`.

## Consequências
- Positivas: tipos fortes, bundle leve, SQL explícito.
- Negativas: menos "mágica" que Prisma; escrever mais SQL.
- Reavaliar se: time crescer e preferir DX do Prisma.
