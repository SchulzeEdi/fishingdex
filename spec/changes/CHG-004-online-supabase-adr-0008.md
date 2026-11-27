# CHG-004 — App online no Supabase (ADR-0008) e ajustes de feed/moderação

- **Data:** 2026-11-27
- **Artefato afetado:** `spec/architecture.md` (camada de API) + ADR-0008 + PRD-V1-01 (D-7 na prática)
- **Tipo:** emenda in-place

## O que muda
- **Acesso a dados:** o app fala direto com o Supabase (Auth, tabelas com RLS, RPC, Storage) em
  vez de uma API própria no Vercel (ADR-0008). Vercel fica com a web e os webhooks de pagamento.
- **Feed:** na V1 online o feed mostra as capturas recentes da **comunidade Pro** (não só de quem
  você segue), porque o app ainda não tem a tela de seguir. D-7 (seguir + curtir) continua o
  objetivo — DT-10.
- **Moderação (D-13):** além do teto por espécie, capturas denunciadas somem para quem denunciou e
  para todos com 3 denúncias (feed e ranking) — exigência da política de UGC da Google Play.
- **Conta:** exclusão de conta no app (exigência da Play); termos de uso no cadastro.

## Por que
Pôr o app online com menos peças e com a segurança aplicada no banco; cumprir as políticas da
Google Play para app com conta e conteúdo gerado pelo usuário.

## Impacto
- DT-03, DT-04 e DT-08 resolvidos. Novos: DT-09 (SMTP), DT-10 (seguir), DT-11 (Google/Apple).
- Fases/gates: Architecture permanece aprovada (emenda in-place + ADR-0008).

## Aprovação
- Decidido por: Ederson (fundador) — "faz tudo, deixa 100% funcional" (2026-11-27)
- Data: 2026-11-27
