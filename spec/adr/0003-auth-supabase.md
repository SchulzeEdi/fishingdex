# ADR-0003: Auth — Supabase Auth (e-mail + Google + Apple)

- **Status:** aceito
- **Data:** 2026-09-20

## Contexto
D-5 exige login por e-mail+senha, Google e Apple (Apple é obrigatório na App Store quando há outros social logins). Já usamos Supabase para o banco.

## Opções consideradas
1. **Supabase Auth** — e-mail + OAuth Google/Apple, JWT integrado ao RLS do Postgres, sem custo extra.
2. **Clerk** — DX excelente, mas custo e mais um fornecedor.
3. **Auth.js** — flexível, mas mais trabalho de integração no Expo.

## Decisão
**Supabase Auth** com e-mail/senha + Google + Apple. O JWT alimenta as políticas RLS (`auth.uid()`).

## Consequências
- Positivas: integra nativamente com RLS e o resto do Supabase; um fornecedor só.
- Negativas: acoplamento ao Supabase.
- Reavaliar se: precisar de SSO corporativo/organizações.
