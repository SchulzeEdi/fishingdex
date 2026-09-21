import { sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { closeDb, getDb, type Db } from '@/shared/db/client';

import { verifyToken } from '../model/token';
import { AuthError, AuthService } from './auth-service';

let db: Db;
let auth: AuthService;
const email = `auth-${Date.now()}@fishingdex.test`;
const SECRET = 'itest_secret';

beforeAll(() => {
  db = getDb();
  auth = new AuthService(db, SECRET);
});

afterAll(async () => {
  await db.execute(sql`DELETE FROM users WHERE email = ${email}`);
  await closeDb();
});

describe('AuthService (integração)', () => {
  it('registra e emite token verificável', async () => {
    const res = await auth.register({ email, name: 'Ana', password: 'segredo123', country: 'AR' });
    expect(res.user.id).toBeTruthy();
    expect(verifyToken(res.token, SECRET).email).toBe(email);
  });

  it('recusa e-mail duplicado', async () => {
    await expect(auth.register({ email, name: 'X', password: 'segredo123' })).rejects.toThrow(AuthError);
  });

  it('faz login com senha correta', async () => {
    const res = await auth.login({ email, password: 'segredo123' });
    expect(res.user.email).toBe(email);
  });

  it('recusa login com senha errada', async () => {
    await expect(auth.login({ email, password: 'errada000' })).rejects.toThrow(AuthError);
  });
});
