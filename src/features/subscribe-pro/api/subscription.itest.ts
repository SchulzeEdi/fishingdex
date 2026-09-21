import { eq, sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { UserDbRepository } from '@/entities/user/api/user.db-repository';
import { closeDb, getDb, type Db } from '@/shared/db/client';
import { users } from '@/shared/db/schema';

import { handleSubscriptionEvent } from './handle-subscription-event';

let db: Db;
let userId: string;
const email = `sub-${Date.now()}@t.test`;

async function planOf(id: string): Promise<string> {
  const [row] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, id)).limit(1);
  return row!.plan;
}

beforeAll(async () => {
  db = getDb();
  userId = (await new UserDbRepository(db).create({ email, name: 'Sub' })).id;
});

afterAll(async () => {
  await db.execute(sql`DELETE FROM subscriptions WHERE user_id = ${userId}`);
  await db.execute(sql`DELETE FROM users WHERE id = ${userId}`);
  await closeDb();
});

describe('assinatura Pro (integração)', () => {
  it('ativa o Pro do usuário ao receber evento active', async () => {
    await handleSubscriptionEvent(db, 'iap', {
      eventId: 'e1',
      userId,
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 864e5),
    });
    expect(await planOf(userId)).toBe('pro');
  });

  it('é idempotente (reaplicar o mesmo evento mantém Pro e não duplica)', async () => {
    await handleSubscriptionEvent(db, 'iap', { eventId: 'e1', userId, status: 'active' });
    const rows = await db.execute(sql`SELECT count(*) AS n FROM subscriptions WHERE user_id = ${userId} AND plan = 'pro'`);
    expect(Number((rows.rows[0] as { n: number }).n)).toBe(1);
    expect(await planOf(userId)).toBe('pro');
  });

  it('expira o Pro ao receber cancelamento', async () => {
    await handleSubscriptionEvent(db, 'iap', { eventId: 'e2', userId, status: 'canceled' });
    expect(await planOf(userId)).toBe('free');
  });
});
