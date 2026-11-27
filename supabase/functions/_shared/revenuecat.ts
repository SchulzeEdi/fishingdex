// Regras de assinatura do RevenueCat → plano do fishingdex. TypeScript puro (sem Deno/Node):
// usado pelas Edge Functions e testado no vitest.

export type Plan = 'free' | 'pro';
export type SubscriptionStatus = 'active' | 'canceled' | 'billing_issue' | 'expired';

/** Entitlement que libera o Pro (mesmo nome no painel do RevenueCat e no app). */
export const PRO_ENTITLEMENT = 'pro';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** O appUserID é o id do Supabase; ids anônimos do RevenueCat ($RCAnonymousID) são ignorados. */
export function isSupabaseUserId(id: unknown): id is string {
  return typeof id === 'string' && UUID.test(id);
}

/** Evento do webhook do RevenueCat (só os campos usados). */
export interface RevenueCatEvent {
  id?: string;
  type: string;
  app_user_id?: string;
  original_app_user_id?: string;
  aliases?: string[];
  entitlement_ids?: string[] | null;
  product_id?: string;
  expiration_at_ms?: number | null;
  transferred_to?: string[];
  transferred_from?: string[];
}

export interface PlanChange {
  userId: string;
  plan: Plan | null;
  status: SubscriptionStatus | null;
  productId: string | null;
  periodEnd: string | null;
}

const GRANTS_PRO = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'UNCANCELLATION',
  'PRODUCT_CHANGE',
  'NON_RENEWING_PURCHASE',
  'SUBSCRIPTION_EXTENDED',
  'TEMPORARY_ENTITLEMENT_GRANT',
]);

function affectsPro(event: RevenueCatEvent): boolean {
  const ids = event.entitlement_ids;
  return !ids || ids.length === 0 || ids.includes(PRO_ENTITLEMENT);
}

/** Primeiro id do Supabase entre app_user_id, original e aliases. */
export function userIdOf(event: RevenueCatEvent): string | null {
  const candidates = [event.app_user_id, event.original_app_user_id, ...(event.aliases ?? [])];
  return candidates.find(isSupabaseUserId) ?? null;
}

/**
 * Traduz um evento em mudança de plano. Cancelar não tira o Pro na hora (vale até o fim do
 * período pago); quem tira é a EXPIRATION. Problema de cobrança mantém o Pro no período de
 * carência da Play.
 */
export function planChangeFromEvent(event: RevenueCatEvent): PlanChange | null {
  if (event.type === 'TEST' || !affectsPro(event)) return null;
  const userId = userIdOf(event);
  if (!userId) return null;
  const productId = event.product_id ?? null;
  const periodEnd = event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null;

  if (GRANTS_PRO.has(event.type)) return { userId, plan: 'pro', status: 'active', productId, periodEnd };
  if (event.type === 'EXPIRATION') return { userId, plan: 'free', status: 'expired', productId, periodEnd };
  if (event.type === 'CANCELLATION') return { userId, plan: null, status: 'canceled', productId, periodEnd };
  if (event.type === 'BILLING_ISSUE') return { userId, plan: null, status: 'billing_issue', productId, periodEnd };
  return null;
}

/** Entitlement da API REST do RevenueCat (GET /v1/subscribers/{id}). */
export interface RestEntitlement {
  expires_date: string | null;
  product_identifier?: string;
}

/** Pro ativo = entitlement existe e não expirou (null = vitalício). */
export function planFromEntitlement(entitlement: RestEntitlement | undefined, now: Date = new Date()): Plan {
  if (!entitlement) return 'free';
  if (entitlement.expires_date === null) return 'pro';
  return new Date(entitlement.expires_date).getTime() > now.getTime() ? 'pro' : 'free';
}
