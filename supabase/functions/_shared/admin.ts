// Cliente com a service role (só no servidor) e gravação do plano/assinatura.
import { createClient } from 'npm:@supabase/supabase-js@2';

import type { Plan, SubscriptionStatus } from './revenuecat.ts';

export function adminClient() {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function saveSubscription(input: {
  userId: string;
  plan: Plan | null;
  status: SubscriptionStatus | null;
  productId: string | null;
  periodEnd: string | null;
  eventId?: string | null;
}): Promise<void> {
  const admin = adminClient();
  if (input.status) {
    const { error } = await admin.from('subscriptions').upsert(
      {
        user_id: input.userId,
        provider: 'revenuecat',
        plan: 'pro',
        status: input.status,
        product_id: input.productId,
        current_period_end: input.periodEnd,
        last_event_id: input.eventId ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,provider' },
    );
    if (error) throw error;
  }
  if (input.plan) {
    const { error } = await admin.from('users').update({ plan: input.plan }).eq('id', input.userId);
    if (error) throw error;
  }
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    },
  });
}
