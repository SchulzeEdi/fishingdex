import { sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { UserDbRepository } from '@/entities/user/api/user.db-repository';
import { closeDb, getDb, type Db } from '@/shared/db/client';

import { registerCatch, RegisterCatchError } from './register-catch';

let db: Db;
let userId: string;

beforeAll(async () => {
  db = getDb();
  const users = new UserDbRepository(db);
  const user = await users.create({
    email: `t-${Date.now()}@fishingdex.test`,
    name: 'Teste',
    country: 'BR',
  });
  userId = user.id;
});

afterAll(async () => {
  await db.execute(sql`DELETE FROM catches WHERE user_id = ${userId}`);
  await db.execute(sql`DELETE FROM dex_unlocks WHERE user_id = ${userId}`);
  await db.execute(sql`DELETE FROM users WHERE id = ${userId}`);
  await closeDb();
});

describe('registerCatch (integração)', () => {
  it('registra captura, desbloqueia a espécie e sincroniza geom via PostGIS', async () => {
    const res = await registerCatch(db, {
      userId,
      speciesId: 'tilapia',
      sizeCm: 34,
      weightKg: 1.2,
      lat: -23.5,
      lng: -47.3,
    });
    expect(res.catchId).toBeTruthy();
    expect(res.dexUnlockedSpeciesId).toBe('tilapia');

    const geom = await db.execute(
      sql`SELECT ST_X(geom) AS lng, ST_Y(geom) AS lat FROM catches WHERE id = ${res.catchId}`,
    );
    expect(Number((geom.rows[0] as { lng: number }).lng)).toBeCloseTo(-47.3, 3);
  });

  it('não desbloqueia de novo na 2ª captura da mesma espécie', async () => {
    const res = await registerCatch(db, { userId, speciesId: 'tilapia', sizeCm: 40 });
    expect(res.dexUnlockedSpeciesId).toBeNull();
  });

  it('rejeita tamanho absurdo (anti mentira de pescador)', async () => {
    await expect(registerCatch(db, { userId, speciesId: 'tilapia', sizeCm: 500 })).rejects.toThrow(
      RegisterCatchError,
    );
  });

  it('rejeita espécie inexistente', async () => {
    await expect(
      registerCatch(db, { userId, speciesId: 'nao-existe', sizeCm: 10 }),
    ).rejects.toThrow(RegisterCatchError);
  });
});
