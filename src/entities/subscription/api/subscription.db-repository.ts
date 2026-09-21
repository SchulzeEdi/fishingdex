import { and, eq } from 'drizzle-orm';

import type { Db } from '@/shared/db/client';
import { subscriptions, users } from '@/shared/db/schema';

import type {
  Subscription,
  SubscriptionPlan,
  SubscriptionProvider,
  SubscriptionStatus,
} from '../model/subscription';
import { isProActive } from '../model/subscription';

export interface UpsertSubscriptionInput {
  userId: string;
  plan: SubscriptionPlan;
  provider: SubscriptionProvider;
  status: SubscriptionStatus;
  currentPeriodEnd?: Date | null;
}

/** Persistência de assinatura. Sincroniza users.plan quando a assinatura Pro muda. */
export class SubscriptionDbRepository {
  constructor(private readonly db: Db) {}

  /** Upsert idempotente por (user, plan): reflete o último estado do provider (webhook). */
  async upsert(input: UpsertSubscriptionInput): Promise<Subscription> {
    const existing = await this.findByUserAndPlan(input.userId, input.plan);
    const values = {
      userId: input.userId,
      plan: input.plan,
      provider: input.provider,
      status: input.status,
      currentPeriodEnd: input.currentPeriodEnd ?? null,
    };

    let row;
    if (existing) {
      [row] = await this.db
        .update(subscriptions)
        .set(values)
        .where(eq(subscriptions.id, existing.id))
        .returning();
    } else {
      [row] = await this.db.insert(subscriptions).values(values).returning();
    }
    if (!row) throw new Error('falha ao gravar assinatura');

    if (input.plan === 'pro') {
      const pro = isProActive({
        plan: 'pro',
        status: input.status,
        currentPeriodEnd: input.currentPeriodEnd ?? null,
      });
      await this.db
        .update(users)
        .set({ plan: pro ? 'pro' : 'free' })
        .where(eq(users.id, input.userId));
    }
    return toSubscription(row);
  }

  async findByUserAndPlan(userId: string, plan: SubscriptionPlan): Promise<Subscription | null> {
    const [row] = await this.db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.plan, plan)))
      .limit(1);
    return row ? toSubscription(row) : null;
  }
}

function toSubscription(row: typeof subscriptions.$inferSelect): Subscription {
  return {
    id: row.id,
    userId: row.userId,
    plan: row.plan as SubscriptionPlan,
    provider: row.provider as SubscriptionProvider,
    status: row.status as SubscriptionStatus,
    currentPeriodEnd: row.currentPeriodEnd,
  };
}
