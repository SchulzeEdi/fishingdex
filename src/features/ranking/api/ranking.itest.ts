import { sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { UserDbRepository } from '@/entities/user/api/user.db-repository';
import { registerCatch } from '@/features/register-catch/api/register-catch';
import { closeDb, getDb, type Db } from '@/shared/db/client';

import { getRanking, reportCatch } from './ranking';

let db: Db;
let uBr: string;
let uUs: string;
const tag = `rank-${Date.now()}`;

async function addCatch(userId: string, sizeCm: number, opts: { photo?: boolean; priv?: boolean } = {}) {
  const res = await registerCatch(db, {
    userId,
    speciesId: 'tilapia',
    sizeCm,
    photoUrl: opts.photo === false ? undefined : 'https://x/p.jpg',
    isPrivate: opts.priv ?? false,
  });
  return res.catchId;
}

beforeAll(async () => {
  db = getDb();
  const users = new UserDbRepository(db);
  uBr = (await users.create({ email: `${tag}-br@t.test`, name: 'BR', country: 'BR' })).id;
  uUs = (await users.create({ email: `${tag}-us@t.test`, name: 'US', country: 'US' })).id;
});

afterAll(async () => {
  for (const u of [uBr, uUs]) {
    await db.execute(sql`DELETE FROM reports WHERE reporter_id = ${u}`);
    await db.execute(sql`DELETE FROM catches WHERE user_id = ${u}`);
    await db.execute(sql`DELETE FROM dex_unlocks WHERE user_id = ${u}`);
    await db.execute(sql`DELETE FROM users WHERE id = ${u}`);
  }
  await closeDb();
});

describe('getRanking (integração)', () => {
  it('ordena por tamanho desc e ignora privado/sem foto', async () => {
    const big = await addCatch(uBr, 55);
    await addCatch(uUs, 40);
    await addCatch(uBr, 58, { priv: true }); // privado não entra (mesmo sendo maior)
    await addCatch(uUs, 50, { photo: false }); // sem foto não entra

    const rank = await getRanking(db, { period: 'all' });
    const mine = rank.filter((r) => [uBr, uUs].includes(r.userId));
    expect(mine[0]?.catchId).toBe(big);
    expect(mine[0]?.sizeCm).toBe(55);
    expect(mine.every((r) => r.sizeCm <= 55)).toBe(true);
  });

  it('filtra por país', async () => {
    const rank = await getRanking(db, { period: 'all', country: 'US' });
    expect(rank.every((r) => r.country === 'US')).toBe(true);
  });

  it('oculta captura denunciada acima do limite', async () => {
    const target = await addCatch(uBr, 58);
    for (const reporter of [uBr, uUs]) {
      await reportCatch(db, { reporterId: reporter, catchId: target, reason: 'exagero' });
    }
    // 2 denúncias: ainda visível (limite 3)
    let rank = await getRanking(db, { period: 'all' });
    expect(rank.some((r) => r.catchId === target)).toBe(true);
    // 3ª denúncia oculta
    const u3 = (await new UserDbRepository(db).create({ email: `${tag}-3@t.test`, name: 'C3' })).id;
    await reportCatch(db, { reporterId: u3, catchId: target, reason: 'exagero' });
    rank = await getRanking(db, { period: 'all' });
    expect(rank.some((r) => r.catchId === target)).toBe(false);
    await db.execute(sql`DELETE FROM reports WHERE catch_id = ${target}`);
    await db.execute(sql`DELETE FROM users WHERE id = ${u3}`);
  });
});
