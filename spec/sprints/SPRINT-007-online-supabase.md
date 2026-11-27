# SPRINT-007: online-supabase

- **PRD:** PRD-V1-01 · **Início:** 2026-11-27 · **Status:** ativa

## Objetivo
Pôr o app online: contas reais, dados no servidor, feed e ranking entre usuários, e os
requisitos da Google Play para app com conta e conteúdo de usuário (exclusão de conta,
denúncia, termos).

## Tasks
| Task | Camada | Branch | Estado |
|------|--------|--------|--------|
| DT-03 — Supabase (Auth + RLS) | DB | feature/online-supabase | done |
| DT-04 — acesso a dados (ADR-0008: RLS + RPC no lugar de route handlers) | DB/Back | feature/online-supabase | done |
| DT-08 — feed/ranking reais (sai o exemplo local) | Front | feature/online-supabase | done |
| Preferências de idioma e moeda | Front | feature/online-supabase | done |
| APK online testado no emulador | Full | feature/online-supabase | em andamento |

## Entregue
- **Supabase** `fishingdex` (`mfikwhzvkwdthfraghad`, sa-east-1, org SchulzeTech) — projeto novo,
  separado dos projetos em produção. Migration `supabase/migrations/*` aplicada; Auth com senha
  mínima 8 e sem confirmação de e-mail (fase de testes); Storage `catch-photos`.
- **Regras no banco (autoridade):** teto plausível por espécie, cota Free 3/mês, data carimbada
  no servidor, desbloqueio da Dex, Free invisível aos outros, local privado escondido, moderação por
  denúncia (some com 3 / some para quem denunciou), plano só muda pelo servidor, exclusão de conta.
- **App:** login/cadastro (`features/session`), perfil no servidor (`entities/user/api`), capturas
  e foto no Storage (`features/register-catch/api`), feed/ranking/curtidas/denúncia via RPC,
  estados de carregando/erro/vazio, puxar para atualizar, sair e excluir conta.
- **Preferências:** idioma (aparelho/pt/es/en) e moeda (país/BRL/USD) em Perfil e no login.
- **Play:** termos de uso, política de privacidade e Data safety atualizados para a versão online.
- **Vercel:** web em modo SPA com as variáveis públicas do Supabase.

## Verificação
- `npm run db:test:supabase` (e no CI): migrations + regras + RLS num Postgres com shim do Supabase.
- `node --env-file=.env scripts/e2e/supabase-smoke.mjs`: 21 verificações contra o Supabase real
  (contas de teste criadas e excluídas).
- typecheck · lint FSD · 99 testes unitários · export Android/web.
