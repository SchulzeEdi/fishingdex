# ADR-0008: App fala direto com o Supabase (RLS + RPC); Vercel fica para web e webhooks

- **Status:** aceito
- **Data:** 2026-11-27
- **Supersede parcialmente:** a camada "Route Handlers no Vercel" de `spec/architecture.md` (DT-04)

## Contexto
A arquitetura previa o app chamando uma API própria no Vercel, que por sua vez falaria com o
Postgres do Supabase. Para pôr o app online na Google Play (SPRINT-007) era preciso escolher como
o app acessa os dados. O Supabase já entrega Auth, banco com RLS (ADR-0005) e Storage, e expõe o
banco via API (PostgREST) com o token do usuário.

## Opções consideradas
1. **API própria no Vercel** (route handlers reaproveitando os repositórios Drizzle). Exige
   empacotar funções serverless, validar o JWT do Supabase na API, connection pooler para o
   serverless (gargalo #1 da arquitetura) e o plano Pro da Vercel para uso comercial. Mais um
   salto de rede por requisição.
2. **App direto no Supabase**: Auth e Storage pelo SDK; leitura/escrita do que é do usuário pelas
   tabelas com **RLS**; regras de domínio como **triggers** (autoridade no banco) e o social
   (feed, ranking) como **funções RPC `security definer`** que checam o plano do chamador.

## Decisão
Opção 2. O banco é a fronteira de segurança:
- RLS em todas as tabelas: cada um só lê/escreve o que é seu; `anon` só lê o catálogo.
- Triggers: anti "mentira de pescador" (tetos da espécie, D-13), cota Free de 3/mês (D-9), data
  da captura carimbada no servidor, desbloqueio da Dex (D-12).
- RPC: `get_feed`, `get_ranking` (só Pro; Free não aparece para os outros), `set_demo_plan`
  (compra de demonstração, desligável em `app_settings`), `delete_my_account` (exigência da Play).
- O plano (`users.plan`) não é editável pelo app (privilégio de coluna).
- As mesmas regras continuam em TypeScript no domínio (validação imediata na UI e testes
  unitários); o banco é quem decide.

O **Vercel** continua hospedando a versão web e receberá os **webhooks** de pagamento
(RevenueCat/Stripe, DT-07) — ali sim é preciso um servidor com segredo.

## Consequências
- Positivas: menos peças (sem funções serverless no caminho de cada tela), uma conexão a menos,
  segurança aplicada no banco mesmo que o app seja adulterado, custo zero no começo.
- Negativas: parte da lógica vive em SQL (duplicada da versão TS); exige testes de banco — feitos
  em `supabase/tests/` e rodando no CI contra um Postgres com shim do Supabase.
- Os repositórios Drizzle (SPRINT-002..004) seguem úteis para jobs/webhooks no servidor.
- Reavaliar se: surgir lógica que precise de segredo de terceiros por requisição (aí entra uma
  função no Vercel ou Edge Function).
