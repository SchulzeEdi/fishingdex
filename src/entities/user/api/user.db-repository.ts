import { eq } from 'drizzle-orm';

import type { Db } from '@/shared/db/client';
import { users } from '@/shared/db/schema';

import type { User } from '../model/user';

export interface CreateUserInput {
  email: string;
  name: string;
  passwordHash?: string;
  country?: string;
}

/** Acesso a dados de usuário (backend). Não é exportado no barril da entidade (Node-only). */
export class UserDbRepository {
  constructor(private readonly db: Db) {}

  async create(input: CreateUserInput): Promise<User> {
    const [row] = await this.db
      .insert(users)
      .values({
        email: input.email,
        name: input.name,
        passwordHash: input.passwordHash ?? null,
        country: input.country ?? null,
      })
      .returning();
    if (!row) throw new Error('falha ao criar usuário');
    return toUser(row);
  }

  async findByEmail(email: string): Promise<(User & { passwordHash: string | null }) | null> {
    const [row] = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!row) return null;
    return { ...toUser(row), passwordHash: row.passwordHash };
  }
}

function toUser(row: typeof users.$inferSelect): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatarUrl,
    country: row.country,
    plan: row.plan as User['plan'],
  };
}
