# ADR-0005: B2C sem multi-tenant — isolamento por dono + RLS

- **Status:** aceito
- **Data:** 2026-09-20

## Contexto
O default do harness assume SaaS **multi-tenant** com coluna `tenant_id` e repositório que injeta o tenant. O fishingdex é um **app de consumidor (B2C)**: não há organizações/tenants — há usuários individuais e visibilidade pública/privada.

## Opções consideradas
1. **Multi-tenant com `tenant_id`** — desnecessário; adiciona complexidade sem valor no B2C.
2. **Isolamento por dono (`user_id`) + visibilidade + RLS** — modela a realidade (minhas capturas, privado/público, Free não vê social).

## Decisão
Sem `tenant_id`. Isolamento por **dono** (`user_id`/`owner_id`) e **regras de visibilidade** (público/privado; recursos sociais só Pro), com **RLS do Supabase** (`auth.uid()`) como defesa em profundidade. Teste de isolamento: usuário A não acessa dado privado de B.

## Consequências
- Positivas: modelo simples e fiel ao produto; RLS no banco protege mesmo com bug na API.
- Negativas: desvia do scaffold multi-tenant do harness (documentado aqui).
- Reavaliar se: surgir um produto B2B (ex.: clubes/torneios como organizações).
