// Webhook do RevenueCat: cada evento de assinatura (compra, renovação, expiração...) ajusta o
// plano do usuário. Autenticado pelo header Authorization configurado no painel do RevenueCat.
import { json, saveSubscription } from '../_shared/admin.ts';
import { planChangeFromEvent, type RevenueCatEvent } from '../_shared/revenuecat.ts';

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const secret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');
  const auth = req.headers.get('Authorization') ?? '';
  if (!secret || !timingSafeEqual(auth, `Bearer ${secret}`)) return json({ error: 'unauthorized' }, 401);

  let event: RevenueCatEvent;
  try {
    event = ((await req.json()) as { event: RevenueCatEvent }).event;
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  const change = planChangeFromEvent(event);
  if (!change) return json({ ok: true, ignored: event?.type ?? 'unknown' });

  try {
    await saveSubscription({ ...change, eventId: event.id ?? null });
  } catch (e) {
    console.error('revenuecat-webhook', e);
    // 500 = o RevenueCat tenta de novo depois.
    return json({ error: 'save_failed' }, 500);
  }
  return json({ ok: true, plan: change.plan, status: change.status });
});
