-- Assinatura Pro real (RevenueCat / Google Play Billing — ADR-0004, DT-07).
-- Uma linha por usuário e provedor, atualizada pelo webhook e pela função sync-subscription
-- (service role). O app só lê a própria (RLS já existente).
alter table public.subscriptions
  add column if not exists product_id text,
  add column if not exists last_event_id text,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists subscriptions_user_provider_uniq
  on public.subscriptions (user_id, provider);
