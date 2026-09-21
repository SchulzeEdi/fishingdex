import { sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { UserDbRepository } from '@/entities/user/api/user.db-repository';
import { closeDb, getDb, type Db } from '@/shared/db/client';

import { FisheryRepository } from './fishery-repository';

let db: Db;
let repo: FisheryRepository;
let ownerId: string;
const tag = `fish-${Date.now()}`;

// São Paulo ~ (-23.55, -46.63). Um pesqueiro perto (~15km) e um longe (~400km, Rio).
beforeAll(async () => {
  db = getDb();
  repo = new FisheryRepository(db);
  ownerId = (await new UserDbRepository(db).create({ email: `${tag}@t.test`, name: 'Dono' })).id;
  await repo.create({ ownerId, name: `${tag}-perto`, lat: -23.45, lng: -46.65, listingActive: true, whatsapp: '+5511' });
  await repo.create({ ownerId, name: `${tag}-longe`, lat: -22.9, lng: -43.2, listingActive: true });
  await repo.create({ ownerId, name: `${tag}-inativo`, lat: -23.46, lng: -46.64, listingActive: false });
});

afterAll(async () => {
  await db.execute(sql`DELETE FROM fisheries WHERE owner_id = ${ownerId}`);
  await db.execute(sql`DELETE FROM users WHERE id = ${ownerId}`);
  await closeDb();
});

describe('FisheryRepository.listNearby (PostGIS)', () => {
  it('retorna só ativos dentro do raio, ordenados por distância', async () => {
    const near = await repo.listNearby({ lat: -23.55, lng: -46.63, radiusKm: 50 });
    const mine = near.filter((f) => f.name.startsWith(tag));
    expect(mine.length).toBe(1);
    expect(mine[0]?.name).toBe(`${tag}-perto`);
    expect(mine[0]?.distanceKm).toBeLessThan(50);
    expect(mine[0]?.whatsapp).toBe('+5511');
  });

  it('não traz pesqueiro fora do raio', async () => {
    const near = await repo.listNearby({ lat: -23.55, lng: -46.63, radiusKm: 50 });
    expect(near.some((f) => f.name === `${tag}-longe`)).toBe(false);
  });

  it('raio maior alcança o pesqueiro distante', async () => {
    const near = await repo.listNearby({ lat: -23.55, lng: -46.63, radiusKm: 600 });
    expect(near.some((f) => f.name === `${tag}-longe`)).toBe(true);
  });
});
