# RETRO-007: online-supabase

- **Sprint:** SPRINT-007 · **Status da retro:** parcial (fechar depois do teste do APK online)

## Entregue
App online no Supabase com regras no banco, login, feed/ranking reais, exclusão de conta,
denúncia, termos e preferências de idioma/moeda.

## O que correu bem
- Escrever as regras como triggers/RPC e testá-las num Postgres com shim do Supabase pegou os
  problemas antes do servidor real; o smoke test contra o Supabase passou de primeira (21/21).
- Reaproveitar as regras de domínio em TS para a validação imediata na UI.

## O que melhorar
- `supabase db push` sem `--remote` mira a stack **local** — nesta máquina ela é de outro projeto.
  A migration falhou e foi revertida (transação), sem alterar nada, mas o comando certo é sempre
  `supabase db push --remote` com `--dry-run` antes.
- O modo de web "static" do Expo vazava memória com o cliente do Supabase no servidor de
  desenvolvimento; o web passou para SPA ("single").

## Débitos técnicos gerados
| ID | Descrição | Onde | Prioridade |
|----|-----------|------|-----------|
| DT-09 | E-mail próprio (SMTP, ex.: Resend) para ligar a confirmação de cadastro e "esqueci a senha" | Supabase Auth | alta (antes da produção) |
| DT-10 | Seguir pescadores (o feed hoje é da comunidade Pro, não de quem você segue — D-7) | app + `follows` | média |
| DT-11 | Login com Google/Apple (D-5) | Supabase Auth + app | média |
