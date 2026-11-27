-- fishingdex — schema de produção no Supabase (ADR-0005 RLS, ADR-0007 PostGIS, ADR-0008).
-- Espelha src/shared/db/migrations/0001_init.sql (Postgres local dos testes de integração) e
-- liga os usuários ao Supabase Auth. Regras de domínio que o app valida na UI (anti "mentira
-- de pescador", cota Free, desbloqueio da Dex, Free invisível aos outros) são reforçadas aqui:
-- o banco é a autoridade, o app não consegue burlar.

create extension if not exists postgis with schema extensions;

-- ---------------------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  name text not null check (char_length(name) between 1 and 40),
  avatar_url text,
  country text check (country in ('BR', 'AR', 'US')),
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz not null default now()
);

create table public.fish_species (
  id text primary key,
  name_pt text not null,
  name_es text not null,
  name_en text not null,
  scientific_name text not null,
  habitat text not null check (habitat in ('freshwater', 'saltwater')),
  rarity text not null check (rarity in ('common', 'uncommon', 'rare', 'legendary')),
  regions text[] not null,
  max_plausible_size_cm integer not null,
  max_plausible_weight_kg real
);

create table public.catches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.users (id) on delete cascade,
  species_id text not null references public.fish_species (id),
  photo_url text,
  size_cm real not null,
  weight_kg real,
  caught_at timestamptz not null default now(),
  lat double precision,
  lng double precision,
  geom extensions.geometry (Point, 4326),
  is_private boolean not null default false,
  place text check (char_length(place) <= 60),
  bait text check (char_length(bait) <= 40),
  rod text,
  reel text,
  line text
);
create index catches_user_idx on public.catches (user_id, caught_at desc);
create index catches_species_idx on public.catches (species_id);
create index catches_size_idx on public.catches (size_cm desc);
create index catches_geom_gix on public.catches using gist (geom);

create table public.dex_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  species_id text not null references public.fish_species (id),
  first_catch_id uuid references public.catches (id) on delete set null,
  unlocked_at timestamptz not null default now(),
  unique (user_id, species_id)
);

create table public.follows (
  follower_id uuid not null references public.users (id) on delete cascade,
  followee_id uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

create table public.likes (
  user_id uuid not null default auth.uid() references public.users (id) on delete cascade,
  catch_id uuid not null references public.catches (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, catch_id)
);
create index likes_catch_idx on public.likes (catch_id);

create table public.fisheries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  lat double precision not null,
  lng double precision not null,
  geom extensions.geometry (Point, 4326),
  species text[] not null default '{}',
  photos text[] not null default '{}',
  whatsapp text,
  description text,
  listing_active boolean not null default false,
  created_at timestamptz not null default now()
);
create index fisheries_geom_gix on public.fisheries using gist (geom);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  plan text not null,
  provider text not null,
  status text not null,
  current_period_end timestamptz
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null default auth.uid() references public.users (id) on delete cascade,
  catch_id uuid not null references public.catches (id) on delete cascade,
  reason text not null check (char_length(reason) <= 200),
  created_at timestamptz not null default now(),
  unique (reporter_id, catch_id)
);
create index reports_catch_idx on public.reports (catch_id);

-- Configuração do servidor (lida só por funções security definer).
create table public.app_settings (
  key text primary key,
  value jsonb not null
);
-- Compra Pro de DEMONSTRAÇÃO (DT-07): desligar quando o Google Play Billing entrar.
insert into public.app_settings (key, value) values ('demo_purchases', 'true');

-- ---------------------------------------------------------------------------------------
-- Usuário: cria o perfil público quando a conta é criada no Supabase Auth
-- ---------------------------------------------------------------------------------------
create function public.handle_new_auth_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_name text := nullif(trim(new.raw_user_meta_data ->> 'name'), '');
  v_country text := new.raw_user_meta_data ->> 'country';
begin
  insert into public.users (id, email, name, country)
  values (
    new.id,
    new.email,
    left(coalesce(v_name, split_part(coalesce(new.email, 'pescador'), '@', 1)), 40),
    case when v_country in ('BR', 'AR', 'US') then v_country else null end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ---------------------------------------------------------------------------------------
-- Capturas: validação (autoridade), cota Free e desbloqueio da Dex
-- ---------------------------------------------------------------------------------------
create function public.sync_geom() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.lat is not null and new.lng is not null then
    new.geom := extensions.st_setsrid(extensions.st_makepoint(new.lng, new.lat), 4326);
  end if;
  return new;
end;
$$;

create trigger catches_geom_sync before insert or update on public.catches
  for each row execute function public.sync_geom();
create trigger fisheries_geom_sync before insert or update on public.fisheries
  for each row execute function public.sync_geom();

-- Mesmas regras de features/register-catch (isPlausibleCatch) e subscribe-pro (plan-limits).
-- Erros levantam a mesma chave que o app usa (size_exceeds_max, free_limit_reached...).
create function public.validate_catch() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_species public.fish_species%rowtype;
  v_plan text;
  v_month_count integer;
begin
  select * into v_species from public.fish_species where id = new.species_id;
  if not found then
    raise exception 'species_not_found' using errcode = 'P0001';
  end if;
  if new.size_cm is null or new.size_cm <= 0 then
    raise exception 'invalid_size' using errcode = 'P0001';
  end if;
  if new.size_cm > v_species.max_plausible_size_cm then
    raise exception 'size_exceeds_max' using errcode = 'P0001';
  end if;
  if new.weight_kg is not null then
    if new.weight_kg <= 0 then
      raise exception 'invalid_weight' using errcode = 'P0001';
    end if;
    if v_species.max_plausible_weight_kg is not null and new.weight_kg > v_species.max_plausible_weight_kg then
      raise exception 'weight_exceeds_max' using errcode = 'P0001';
    end if;
  end if;

  -- D-9: Free registra até 3 capturas por mês (UTC). Pro é ilimitado.
  select plan into v_plan from public.users where id = new.user_id;
  if coalesce(v_plan, 'free') = 'free' then
    select count(*) into v_month_count
    from public.catches
    where user_id = new.user_id
      and caught_at >= date_trunc('month', now() at time zone 'utc') at time zone 'utc';
    if v_month_count >= 3 then
      raise exception 'free_limit_reached' using errcode = 'P0001';
    end if;
  end if;

  -- A data da captura é a do servidor (não aceita "pesquei ontem" para furar a cota).
  new.caught_at := now();
  return new;
end;
$$;

create trigger catches_validate before insert on public.catches
  for each row execute function public.validate_catch();

-- D-12: a 1ª captura de uma espécie desbloqueia na Dex (idempotente).
create function public.unlock_dex() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.dex_unlocks (user_id, species_id, first_catch_id)
  values (new.user_id, new.species_id, new.id)
  on conflict (user_id, species_id) do nothing;
  return new;
end;
$$;

create trigger catches_unlock_dex after insert on public.catches
  for each row execute function public.unlock_dex();

-- ---------------------------------------------------------------------------------------
-- RLS: cada um só lê/escreve o que é seu; o social passa pelas funções abaixo
-- ---------------------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.fish_species enable row level security;
alter table public.catches enable row level security;
alter table public.dex_unlocks enable row level security;
alter table public.follows enable row level security;
alter table public.likes enable row level security;
alter table public.fisheries enable row level security;
alter table public.subscriptions enable row level security;
alter table public.reports enable row level security;
alter table public.app_settings enable row level security;

create policy "users: lê o próprio perfil" on public.users
  for select to authenticated using (id = (select auth.uid()));
create policy "users: edita o próprio perfil" on public.users
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
-- O plano só muda pelo servidor (assinatura): o app edita apenas nome, país e avatar.
revoke update on public.users from anon, authenticated;
grant update (name, country, avatar_url) on public.users to authenticated;
revoke insert, delete on public.users from anon, authenticated;

create policy "species: catálogo público" on public.fish_species
  for select to anon, authenticated using (true);
revoke insert, update, delete on public.fish_species from anon, authenticated;

create policy "catches: lê as próprias" on public.catches
  for select to authenticated using (user_id = (select auth.uid()));
create policy "catches: registra as próprias" on public.catches
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "catches: apaga as próprias" on public.catches
  for delete to authenticated using (user_id = (select auth.uid()));
revoke update on public.catches from anon, authenticated;

create policy "dex: lê a própria" on public.dex_unlocks
  for select to authenticated using (user_id = (select auth.uid()));
revoke insert, update, delete on public.dex_unlocks from anon, authenticated;

create policy "follows: vê as suas" on public.follows
  for select to authenticated using ((select auth.uid()) in (follower_id, followee_id));
create policy "follows: segue" on public.follows
  for insert to authenticated with check (follower_id = (select auth.uid()));
create policy "follows: deixa de seguir" on public.follows
  for delete to authenticated using (follower_id = (select auth.uid()));

create policy "likes: vê as suas" on public.likes
  for select to authenticated using (user_id = (select auth.uid()));
create policy "likes: curte" on public.likes
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "likes: descurte" on public.likes
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "fisheries: listagens ativas são públicas" on public.fisheries
  for select to anon, authenticated using (listing_active or owner_id = (select auth.uid()));
create policy "fisheries: dono cadastra" on public.fisheries
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "fisheries: dono edita" on public.fisheries
  for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

create policy "subscriptions: vê a sua" on public.subscriptions
  for select to authenticated using (user_id = (select auth.uid()));
revoke insert, update, delete on public.subscriptions from anon, authenticated;

create policy "reports: denuncia" on public.reports
  for insert to authenticated with check (reporter_id = (select auth.uid()));

revoke all on public.app_settings from anon, authenticated;

-- ---------------------------------------------------------------------------------------
-- Funções (RPC) do social — security definer, checam o plano do chamador
-- ---------------------------------------------------------------------------------------
create function public.caller_plan() returns text
language sql stable security definer set search_path = '' as $$
  select coalesce((select plan from public.users where id = auth.uid()), 'free');
$$;

-- Feed (Pro): capturas recentes de pescadores Pro (Free não aparece pros outros, D-9) + as
-- próprias. Local privado aparece sem o lugar. Denunciadas somem (moderação, D-13).
create function public.get_feed(p_limit integer default 20, p_before timestamptz default null)
returns table (
  catch_id uuid, user_id uuid, user_name text, user_country text, species_id text,
  size_cm real, weight_kg real, photo_url text, caught_at timestamptz, is_private boolean,
  place text, bait text, like_count bigint, liked_by_me boolean
)
language plpgsql stable security definer set search_path = '' as $$
begin
  if public.caller_plan() <> 'pro' then
    raise exception 'pro_required' using errcode = 'P0001';
  end if;
  return query
    select c.id, c.user_id, u.name, u.country, c.species_id, c.size_cm, c.weight_kg,
           c.photo_url, c.caught_at, c.is_private,
           case when c.is_private then null else c.place end,
           c.bait,
           (select count(*) from public.likes l where l.catch_id = c.id),
           exists (select 1 from public.likes l where l.catch_id = c.id and l.user_id = auth.uid())
    from public.catches c
    join public.users u on u.id = c.user_id
    where (u.plan = 'pro' or c.user_id = auth.uid())
      and (p_before is null or c.caught_at < p_before)
      -- Moderação (política de UGC da Play): some com 3 denúncias e some para quem denunciou.
      and (select count(*) from public.reports r where r.catch_id = c.id) < 3
      and not exists (select 1 from public.reports r where r.catch_id = c.id and r.reporter_id = auth.uid())
    order by c.caught_at desc
    limit least(greatest(p_limit, 1), 50);
end;
$$;

-- Ranking (Pro), mesma regra de features/ranking/api/getRanking (D-6, D-13): pública, com foto,
-- sem denúncias acima do limite; recortes por período, país e espécie.
create function public.get_ranking(
  p_period text default 'all', p_country text default null, p_species text default null,
  p_limit integer default 50
)
returns table (
  rank_position bigint, catch_id uuid, user_id uuid, user_name text, user_country text,
  species_id text, size_cm real, photo_url text, caught_at timestamptz
)
language plpgsql stable security definer set search_path = '' as $$
declare
  v_cutoff timestamptz := case p_period
    when 'month' then date_trunc('month', now() at time zone 'utc') at time zone 'utc'
    when 'year' then date_trunc('year', now() at time zone 'utc') at time zone 'utc'
    else null end;
begin
  if public.caller_plan() <> 'pro' then
    raise exception 'pro_required' using errcode = 'P0001';
  end if;
  return query
    select row_number() over (order by c.size_cm desc, c.caught_at asc),
           c.id, c.user_id, u.name, u.country, c.species_id, c.size_cm, c.photo_url, c.caught_at
    from public.catches c
    join public.users u on u.id = c.user_id
    where c.is_private = false
      and c.photo_url is not null
      and (u.plan = 'pro' or c.user_id = auth.uid())
      and (v_cutoff is null or c.caught_at >= v_cutoff)
      and (p_country is null or u.country = p_country)
      and (p_species is null or c.species_id = p_species)
      and (select count(*) from public.reports r where r.catch_id = c.id) < 3
    order by c.size_cm desc, c.caught_at asc
    limit least(greatest(p_limit, 1), 100);
end;
$$;

-- Assinatura de DEMONSTRAÇÃO (DT-07): só funciona com app_settings.demo_purchases = true.
create function public.set_demo_plan(p_plan text) returns text
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;
  if p_plan not in ('free', 'pro') then
    raise exception 'invalid_plan' using errcode = 'P0001';
  end if;
  if coalesce((select (value)::text::boolean from public.app_settings where key = 'demo_purchases'), false) is not true then
    raise exception 'demo_purchases_disabled' using errcode = 'P0001';
  end if;
  update public.users set plan = p_plan where id = auth.uid();
  return p_plan;
end;
$$;

-- Exclusão de conta pelo app (exigência da Google Play): apaga a conta e, em cascata, perfil,
-- capturas, curtidas e desbloqueios. As fotos são apagadas pelo app antes (Storage API).
create function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.get_feed(integer, timestamptz) from public, anon;
revoke execute on function public.get_ranking(text, text, text, integer) from public, anon;
revoke execute on function public.set_demo_plan(text) from public, anon;
revoke execute on function public.delete_my_account() from public, anon;
revoke execute on function public.caller_plan() from public, anon;
revoke execute on function public.handle_new_auth_user() from public, anon, authenticated;
revoke execute on function public.validate_catch() from public, anon, authenticated;
revoke execute on function public.unlock_dex() from public, anon, authenticated;
grant execute on function public.get_feed(integer, timestamptz) to authenticated;
grant execute on function public.get_ranking(text, text, text, integer) to authenticated;
grant execute on function public.set_demo_plan(text) to authenticated;
grant execute on function public.delete_my_account() to authenticated;
grant execute on function public.caller_plan() to authenticated;

-- ---------------------------------------------------------------------------------------
-- Storage: fotos das capturas (leitura pública; cada um grava só na sua pasta)
-- ---------------------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('catch-photos', 'catch-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do nothing;

create policy "catch-photos: envia na própria pasta" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'catch-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "catch-photos: apaga da própria pasta" on storage.objects
  for delete to authenticated
  using (bucket_id = 'catch-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "catch-photos: lista a própria pasta" on storage.objects
  for select to authenticated
  using (bucket_id = 'catch-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
