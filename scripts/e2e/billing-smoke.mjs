// Smoke test da cobrança no servidor: simula eventos do RevenueCat no webhook e confere o plano.
// Uso: node --env-file=.env --env-file=secrets/revenuecat.env scripts/e2e/billing-smoke.mjs
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;
const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
if (!url || !key || !secret) throw new Error('Defina .env e secrets/revenuecat.env');

const fn = (name) => `${url}/functions/v1/${name}`;
let failures = 0;
const check = (ok, label) => {
  console.log(`${ok ? '✓' : '✗'} ${label}`);
  if (!ok) failures++;
};

const stamp = Date.now().toString(36);
const sb = createClient(url, key, { auth: { persistSession: false } });
const { data: signed, error } = await sb.auth.signUp({
  email: `fd-billing-${stamp}@fishingdex.dev`,
  password: `Teste-${stamp}-ok`,
  options: { data: { name: 'Billing', country: 'BR' } },
});
if (error) throw error;
const uid = signed.user.id;
const plan = async () => (await sb.from('users').select('plan').single()).data?.plan;

const send = (type, auth = `Bearer ${secret}`) =>
  fetch(fn('revenuecat-webhook'), {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: {
        id: `evt-${type}-${stamp}`,
        type,
        app_user_id: uid,
        entitlement_ids: ['pro'],
        product_id: 'fishingdex_pro:monthly',
        expiration_at_ms: Date.now() + 30 * 86_400_000,
      },
    }),
  });

check((await send('INITIAL_PURCHASE', 'Bearer errado')).status === 401, 'webhook recusa segredo errado');
check(await plan() === 'free', 'começa no Free');
check((await send('INITIAL_PURCHASE')).ok, 'webhook aceita a compra');
check(await plan() === 'pro', 'compra → Pro');
const { data: sub } = await sb.from('subscriptions').select('status, product_id').single();
check(sub?.status === 'active' && sub?.product_id === 'fishingdex_pro:monthly', 'assinatura registrada (o usuário lê a própria)');
await send('CANCELLATION');
check(await plan() === 'pro', 'cancelar mantém o Pro até o fim do período');
await send('EXPIRATION');
check(await plan() === 'free', 'expiração → Free');

const sync = await sb.functions.invoke('sync-subscription', { method: 'POST' });
const syncStatus = sync.error?.context?.status;
check(sync.data?.plan !== undefined || syncStatus === 503, `sync-subscription responde (${sync.data ? `plano ${sync.data.plan}` : `HTTP ${syncStatus}: falta a chave secreta do RevenueCat`})`);
const anon = await fetch(fn('sync-subscription'), { method: 'POST', headers: { Authorization: 'Bearer x' } });
check(anon.status === 401, 'sync-subscription exige login');

await sb.rpc('delete_my_account');
console.log(failures === 0 ? '\nOK: cobrança no servidor' : `\nFALHOU: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
