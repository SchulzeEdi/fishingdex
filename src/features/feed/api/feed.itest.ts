import { sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { UserDbRepository } from '@/entities/user/api/user.db-repository';
import { registerCatch } from '@/features/register-catch/api/register-catch';
import { closeDb, getDb, type Db } from '@/shared/db/client';

import { follow, getFeed, like, unfollow, unlike } from './feed';

let db: Db;
let me: string;
let other: string;
const tag = `feed-${Date.now()}`;
let otherCatchId: string;

beforeAll(async () => {
  db = getDb();
  const users = new UserDbRepository(db);
  me = (await users.create({ email: `${tag}-me@t.test`, name: 'Eu' })).id;
  other = (await users.create({ email: `${tag}-ot@t.test`, name: 'Outro' })).id;
  otherCatchId = (await registerCatch(db, { userId: other, speciesId: 'tilapia', sizeCm: 30, photoUrl: 'p' })).catchId;
  await registerCatch(db, { userId: other, speciesId: 'dourado', sizeCm: 40, photoUrl: 'p', isPrivate: true });
});

afterAll(async () => {
  for (const u of [me, other]) {
    await db.execute(sql`DELETE FROM likes WHERE user_id = ${u}`);
    await db.execute(sql`DELETE FROM follows WHERE follower_id = ${u} OR followee_id = ${u}`);
    await db.execute(sql`DELETE FROM catches WHERE user_id = ${u}`);
    await db.execute(sql`DELETE FROM dex_unlocks WHERE user_id = ${u}`);
    await db.execute(sql`DELETE FROM users WHERE id = ${u}`);
  }
  await closeDb();
});

describe('feed / follow / like (integração)', () => {
  it('feed vazio antes de seguir', async () => {
    expect((await getFeed(db, me)).length).toBe(0);
  });

  it('mostra capturas públicas de quem sigo (sem as privadas)', async () => {
    await follow(db, me, other);
    const feed = await getFeed(db, me);
    expect(feed.length).toBe(1);
    expect(feed[0]?.catchId).toBe(otherCatchId);
  });

  it('curtir/descurtir reflete no likeCount', async () => {
    await like(db, me, otherCatchId);
    await like(db, me, otherCatchId); // idempotente
    let feed = await getFeed(db, me);
    expect(feed[0]?.likeCount).toBe(1);
    await unlike(db, me, otherCatchId);
    feed = await getFeed(db, me);
    expect(feed[0]?.likeCount).toBe(0);
  });

  it('deixar de seguir esvazia o feed', async () => {
    await unfollow(db, me, other);
    expect((await getFeed(db, me)).length).toBe(0);
  });

  it('não deixa seguir a si mesmo', async () => {
    await expect(follow(db, me, me)).rejects.toThrow();
  });
});
