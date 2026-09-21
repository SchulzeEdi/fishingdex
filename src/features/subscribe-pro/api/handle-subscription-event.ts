import { SubscriptionDbRepository } from '@/entities/subscription/api/subscription.db-repository';
import type { SubscriptionProvider } from '@/entities/subscription';
import type { Db } from '@/shared/db/client';

import type { SubscriptionEvent } from './payment-provider';

/**
 * Aplica um evento de assinatura Pro (idempotente por natureza: o upsert reflete o último
 * estado do provider). Ativa/expira o Pro do usuário. Ver monetization.md.
 */
export async function handleSubscriptionEvent(
  db: Db,
  provider: SubscriptionProvider,
  event: SubscriptionEvent,
): Promise<void> {
  const repo = new SubscriptionDbRepository(db);
  await repo.upsert({
    userId: event.userId,
    plan: 'pro',
    provider,
    status: event.status,
    currentPeriodEnd: event.currentPeriodEnd ?? null,
  });
}
