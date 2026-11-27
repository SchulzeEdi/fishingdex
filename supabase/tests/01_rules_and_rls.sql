-- Testes das regras e do RLS (rodar depois do shim + migrations). Falha = exceção.
-- A = Free (BR), B = Pro (US), C = conta que será excluída.
\set ON_ERROR_STOP 1
\set a '11111111-1111-1111-1111-111111111111'
\set b '22222222-2222-2222-2222-222222222222'
\set c '33333333-3333-3333-3333-333333333333'

insert into auth.users (id, email, raw_user_meta_data) values
  (:'a', 'a@test.dev', '{"name":"Ana","country":"BR"}'),
  (:'b', 'b@test.dev', '{"name":"Bob","country":"US"}'),
  (:'c', 'c@test.dev', '{}');
update public.users set plan = 'pro' where id = :'b';

-- Perfil criado pelo trigger, com fallback de nome pelo e-mail.
do $$ begin
  assert (select name from public.users where id = '11111111-1111-1111-1111-111111111111') = 'Ana';
  assert (select country from public.users where id = '11111111-1111-1111-1111-111111111111') = 'BR';
  assert (select name from public.users where id = '33333333-3333-3333-3333-333333333333') = 'c';
end $$;

-- ===================== Como A (Free) =====================
begin;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', :'a')::text, true);

insert into public.catches (species_id, size_cm, photo_url) values ('tilapia', 32.5, 'https://x/a1.jpg');

do $$ begin
  -- desbloqueou a Dex
  assert (select count(*) from public.dex_unlocks) = 1, 'dex não desbloqueou';
  -- anti "mentira de pescador"
  begin
    insert into public.catches (species_id, size_cm) values ('tilapia', 240);
    raise exception 'esperava size_exceeds_max';
  exception when others then
    if sqlerrm <> 'size_exceeds_max' then raise; end if;
  end;
  begin
    insert into public.catches (species_id, size_cm, weight_kg) values ('tilapia', 30, 9);
    raise exception 'esperava weight_exceeds_max';
  exception when others then
    if sqlerrm <> 'weight_exceeds_max' then raise; end if;
  end;
  begin
    insert into public.catches (species_id, size_cm) values ('nao-existe', 30);
    raise exception 'esperava species_not_found';
  exception when others then
    if sqlerrm <> 'species_not_found' then raise; end if;
  end;
  -- não consegue registrar em nome de outro
  begin
    insert into public.catches (user_id, species_id, size_cm) values ('22222222-2222-2222-2222-222222222222', 'tilapia', 30);
    raise exception 'esperava violação de RLS';
  exception when insufficient_privilege then null;
  end;
end $$;

-- cota Free: 3 por mês
insert into public.catches (species_id, size_cm) values ('dourado', 50);
insert into public.catches (species_id, size_cm) values ('tilapia', 40);
do $$ begin
  begin
    insert into public.catches (species_id, size_cm) values ('traira', 30);
    raise exception 'esperava free_limit_reached';
  exception when others then
    if sqlerrm <> 'free_limit_reached' then raise; end if;
  end;
  assert (select count(*) from public.dex_unlocks) = 2, 'dex deveria ter 2 espécies';
  -- não troca o próprio plano direto
  begin
    update public.users set plan = 'pro' where id = auth.uid();
    raise exception 'esperava permission denied no plano';
  exception when insufficient_privilege then null;
  end;
  -- feed/ranking são do Pro
  begin
    perform * from public.get_feed();
    raise exception 'esperava pro_required';
  exception when others then
    if sqlerrm <> 'pro_required' then raise; end if;
  end;
end $$;

update public.users set name = 'Ana Souza' where id = auth.uid();

-- Storage: só na própria pasta
insert into storage.objects (bucket_id, name) values ('catch-photos', :'a' || '/f1.jpg');
do $$ begin
  begin
    insert into storage.objects (bucket_id, name) values ('catch-photos', '22222222-2222-2222-2222-222222222222/x.jpg');
    raise exception 'esperava RLS no storage';
  exception when insufficient_privilege then null;
  end;
end $$;
commit;

-- ===================== Como B (Pro) =====================
begin;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', :'b')::text, true);

insert into public.catches (species_id, size_cm, photo_url, place) values ('black-bass', 61, 'https://x/b1.jpg', 'Lake Fork, TX');
insert into public.catches (species_id, size_cm, photo_url, place, is_private) values ('robalo', 80, 'https://x/b2.jpg', 'Segredo', true);
insert into public.catches (species_id, size_cm) values ('tilapia', 20);
insert into public.catches (species_id, size_cm) values ('carpa', 70);

do $$ begin
  -- Pro não tem cota
  assert (select count(*) from public.catches) = 4, 'B deveria ver só as 4 dele';
  -- feed: Free (A) não aparece pros outros; privado aparece sem o lugar
  assert (select count(*) from public.get_feed()) = 4, 'feed deveria ter só as de B';
  assert (select place from public.get_feed() where species_id = 'robalo') is null, 'privado não pode expor o lugar';
  assert (select place from public.get_feed() where species_id = 'black-bass') = 'Lake Fork, TX';
  -- ranking: só pública e com foto
  assert (select count(*) from public.get_ranking('all')) = 1, 'ranking deveria ter 1';
  assert (select size_cm from public.get_ranking('all') where rank_position = 1) = 61;
  assert (select count(*) from public.get_ranking('all', 'BR')) = 0, 'recorte de país';
end $$;
commit;

-- ===================== A assina o Pro (demo) =====================
begin;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', :'a')::text, true);
select public.set_demo_plan('pro');
do $$ begin
  assert (select plan from public.users where id = auth.uid()) = 'pro';
  assert (select count(*) from public.get_ranking('all')) = 2, 'agora A (com foto) entra no ranking';
  -- curte a captura de B; não curte em nome de outro
  insert into public.likes (catch_id) select catch_id from public.get_feed() where species_id = 'black-bass';
  assert (select like_count from public.get_feed() where species_id = 'black-bass') = 1;
  assert (select liked_by_me from public.get_feed() where species_id = 'black-bass');
  begin
    insert into public.likes (user_id, catch_id) select '22222222-2222-2222-2222-222222222222', catch_id from public.get_feed() limit 1;
    raise exception 'esperava RLS em likes';
  exception when insufficient_privilege then null;
  end;
  -- denúncia: a captura some do feed de quem denunciou
  insert into public.reports (catch_id, reason) select catch_id, 'foto imprópria' from public.get_feed() where species_id = 'carpa';
  assert not exists (select 1 from public.get_feed() where species_id = 'carpa'), 'denunciada deveria sumir';
  begin
    insert into public.reports (reporter_id, catch_id, reason) select '22222222-2222-2222-2222-222222222222', catch_id, 'x' from public.get_feed() limit 1;
    raise exception 'esperava RLS em reports';
  exception when insufficient_privilege then null;
  end;
end $$;
commit;

-- Demo desligada no servidor bloqueia a "compra"
update public.app_settings set value = 'false' where key = 'demo_purchases';
begin;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', :'c')::text, true);
do $$ begin
  begin
    perform public.set_demo_plan('pro');
    raise exception 'esperava demo_purchases_disabled';
  exception when others then
    if sqlerrm <> 'demo_purchases_disabled' then raise; end if;
  end;
end $$;
-- Exclusão de conta pelo app
select public.delete_my_account();
commit;
update public.app_settings set value = 'true' where key = 'demo_purchases';

do $$ begin
  assert not exists (select 1 from auth.users where id = '33333333-3333-3333-3333-333333333333');
  assert not exists (select 1 from public.users where id = '33333333-3333-3333-3333-333333333333');
end $$;

-- anon não lê nada além do catálogo
begin;
set local role anon;
do $$ begin
  assert (select count(*) from public.fish_species) = 37, 'anon lê o catálogo';
  assert (select count(*) from public.catches) = 0, 'anon não lê capturas';
  assert (select count(*) from public.users) = 0, 'anon não lê usuários';
  begin
    perform * from public.get_feed();
    raise exception 'anon não executa get_feed';
  exception when insufficient_privilege then null;
  end;
end $$;
commit;

\echo 'OK: regras e RLS passaram'
