// Chamada pelo app logo depois de comprar/restaurar: confere a assinatura direto na API do
// RevenueCat (com a chave secreta) e grava o plano. O app nunca define o próprio plano.
import { adminClient, json, saveSubscription } from '../_shared/admin.ts';
import { PRO_ENTITLEMENT, planFromEntitlement, type RestEntitlement } from '../_shared/revenuecat.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return json({ ok: true });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const admin = adminClient();
  const { data: auth, error: authError } = await admin.auth.getUser(token);
  if (authError || !auth.user) return json({ error: 'unauthorized' }, 401);
  const userId = auth.user.id;

  const secret = Deno.env.get('REVENUECAT_SECRET_KEY');
  if (!secret) return json({ error: 'billing_not_configured' }, 503);

  const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) return json({ error: 'revenuecat_unavailable', status: res.status }, 502);
  const body = (await res.json()) as {
    subscriber?: { entitlements?: Record<string, RestEntitlement> };
  };
  const entitlement = body.subscriber?.entitlements?.[PRO_ENTITLEMENT];
  const plan = planFromEntitlement(entitlement);

  try {
    await saveSubscription({
      userId,
      plan,
      status: plan === 'pro' ? 'active' : entitlement ? 'expired' : null,
      productId: entitlement?.product_identifier ?? null,
      periodEnd: entitlement?.expires_date ?? null,
    });
  } catch (e) {
    console.error('sync-subscription', e);
    return json({ error: 'save_failed' }, 500);
  }
  return json({ plan });
});
