export type SubscriptionPlan = 'pro' | 'fishery_listing';
export type SubscriptionProvider = 'iap' | 'stripe';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due';

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  provider: SubscriptionProvider;
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
}

/** Assinatura Pro vigente: status active e período ainda não expirado. */
export function isProActive(sub: Pick<Subscription, 'plan' | 'status' | 'currentPeriodEnd'> | null, now: Date = new Date()): boolean {
  if (!sub || sub.plan !== 'pro' || sub.status !== 'active') return false;
  return sub.currentPeriodEnd === null || sub.currentPeriodEnd.getTime() > now.getTime();
}
