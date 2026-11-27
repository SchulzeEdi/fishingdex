// Smoke test ponta a ponta contra o Supabase real, com a mesma biblioteca e chave pública do
// app. Cria 2 contas de teste, exercita as regras e apaga as contas no fim.
// Uso: node --env-file=.env scripts/e2e/supabase-smoke.mjs
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;
if (!url || !key) throw new Error('Defina EXPO_PUBLIC_SUPABASE_URL/KEY (.env)');

const stamp = Date.now().toString(36);
const password = `Teste-${stamp}-ok`;
const client = () => createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
let failures = 0;
const check = (ok, label) => {
  console.log(`${ok ? '✓' : '✗'} ${label}`);
  if (!ok) failures++;
};
const errMsg = (e) => (e ? e.message : '');

async function signUp(name, country) {
  const sb = client();
  const email = `fd-smoke-${name.toLowerCase()}-${stamp}@fishingdex.dev`;
  const { data, error } = await sb.auth.signUp({ email, password, options: { data: { name, country } } });
  if (error) throw error;
  return { sb, uid: data.user.id, session: data.session };
}

const a = await signUp('Ana', 'BR');
const b = await signUp('Bob', 'US');
check(!!a.session && !!b.session, 'cadastro sem confirmação de e-mail devolve sessão');

const { data: profA } = await a.sb.from('users').select('name, country, plan').single();
check(profA?.name === 'Ana' && profA?.country === 'BR' && profA?.plan === 'free', 'perfil criado pelo trigger (Free, BR)');

// Foto no Storage (pasta do próprio usuário) e captura com a URL pública
const jpeg = Uint8Array.from(atob('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q=='), (c) => c.charCodeAt(0));
const path = `${a.uid}/smoke-${stamp}.jpg`;
const up = await a.sb.storage.from('catch-photos').upload(path, jpeg, { contentType: 'image/jpeg' });
check(!up.error, `upload da foto (${errMsg(up.error) || 'ok'})`);
const photoUrl = a.sb.storage.from('catch-photos').getPublicUrl(path).data.publicUrl;
const pub = await fetch(photoUrl);
check(pub.ok, 'foto acessível pela URL pública');
const intrude = await a.sb.storage.from('catch-photos').upload(`${b.uid}/x-${stamp}.jpg`, jpeg, { contentType: 'image/jpeg' });
check(!!intrude.error, 'não grava foto na pasta de outro usuário');

const ins = await a.sb.from('catches').insert({ species_id: 'tilapia', size_cm: 32.5, photo_url: photoUrl }).select().single();
check(!ins.error, `registra captura (${errMsg(ins.error) || 'ok'})`);
const big = await a.sb.from('catches').insert({ species_id: 'tilapia', size_cm: 240 });
check(errMsg(big.error).includes('size_exceeds_max'), 'barra tamanho acima do plausível');
const dex = await a.sb.from('dex_unlocks').select('species_id');
check(dex.data?.length === 1 && dex.data[0].species_id === 'tilapia', 'desbloqueou a espécie na Dex');

await a.sb.from('catches').insert({ species_id: 'dourado', size_cm: 50 });
await a.sb.from('catches').insert({ species_id: 'traira', size_cm: 30 });
const fourth = await a.sb.from('catches').insert({ species_id: 'pacu', size_cm: 40 });
check(errMsg(fourth.error).includes('free_limit_reached'), 'cota Free: 4ª captura do mês barrada');

const planHack = await a.sb.from('users').update({ plan: 'pro' }).eq('id', a.uid);
check(!!planHack.error, 'app não consegue se dar Pro direto');
const feedFree = await a.sb.rpc('get_feed');
check(errMsg(feedFree.error).includes('pro_required'), 'feed bloqueado para Free');

// B vira Pro (demo) e publica
check(!(await b.sb.rpc('set_demo_plan', { p_plan: 'pro' })).error, 'assinatura de demonstração ativa o Pro');
await b.sb.from('catches').insert({ species_id: 'black-bass', size_cm: 61, photo_url: photoUrl, place: 'Lake Fork, TX' });
const feedB1 = await b.sb.rpc('get_feed');
check(!feedB1.error && !feedB1.data.some((c) => c.user_id === a.uid), 'Free (Ana) não aparece no feed dos outros');

// A vira Pro: passa a aparecer, curte e denuncia
await a.sb.rpc('set_demo_plan', { p_plan: 'pro' });
const feedB2 = await b.sb.rpc('get_feed');
check(feedB2.data?.some((c) => c.user_id === a.uid), 'Pro aparece no feed dos outros');
// O servidor pode ter capturas reais: olha só as das contas de teste.
const rank = await b.sb.rpc('get_ranking', { p_period: 'all' });
const ours = (rank.data ?? []).filter((r) => r.user_id === a.uid || r.user_id === b.uid);
check(
  !rank.error && ours.length === 2 && ours[0].size_cm === 61 && ours[0].rank_position < ours[1].rank_position,
  'ranking: só com foto, maior primeiro',
);
const bass = feedB2.data.find((c) => c.species_id === 'black-bass');
await a.sb.from('likes').upsert({ catch_id: bass.catch_id }, { onConflict: 'user_id,catch_id', ignoreDuplicates: true });
const feedA = await a.sb.rpc('get_feed');
const liked = feedA.data.find((c) => c.catch_id === bass.catch_id);
check(liked?.like_count === 1 && liked?.liked_by_me === true, 'curtida contada');
await a.sb.from('reports').insert({ catch_id: bass.catch_id, reason: 'smoke' });
const feedA2 = await a.sb.rpc('get_feed');
check(!feedA2.data.some((c) => c.catch_id === bass.catch_id), 'denunciada some do feed de quem denunciou');

const anon = client();
const anonCatches = await anon.from('catches').select('id');
const anonSpecies = await anon.from('fish_species').select('id');
check((anonCatches.data ?? []).length === 0 && anonSpecies.data?.length >= 113, 'sem login: só o catálogo de espécies (113+)');

// Limpeza: fotos + contas (a exclusão em cascata apaga capturas, curtidas, denúncias)
await a.sb.storage.from('catch-photos').remove([path]);
for (const u of [a, b]) {
  const del = await u.sb.rpc('delete_my_account');
  check(!del.error, `exclusão de conta (${errMsg(del.error) || 'ok'})`);
}
const relogin = await client().auth.signInWithPassword({ email: `fd-smoke-ana-${stamp}@fishingdex.dev`, password });
check(!!relogin.error, 'conta excluída não entra mais');

console.log(failures === 0 ? '\nOK: smoke test passou' : `\nFALHOU: ${failures} verificação(ões)`);
process.exit(failures === 0 ? 0 : 1);
