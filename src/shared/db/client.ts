import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema';

// Client Postgres (backend/Node apenas — o app mobile nunca importa este módulo).
// A URL vem do ambiente; localmente aponta para o Postgres do docker-compose.
export type Db = NodePgDatabase<typeof schema>;

let pool: Pool | undefined;

export function getPool(connectionString = process.env.DATABASE_URL): Pool {
  if (!connectionString) {
    throw new Error('DATABASE_URL não definida — ver .env.example');
  }
  if (!pool) {
    pool = new Pool({ connectionString });
  }
  return pool;
}

export function getDb(connectionString?: string): Db {
  return drizzle(getPool(connectionString), { schema });
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}

export { schema };
