import { and, eq, sql } from 'drizzle-orm';

import type { Db } from '@/shared/db/client';
import { follows, likes } from '@/shared/db/schema';

export interface FeedItem {
  catchId: string;
  userId: string;
  userName: string;
  speciesId: string;
  speciesNamePt: string;
  sizeCm: number;
  photoUrl: string | null;
  caughtAt: string;
  likeCount: number;
}

export async function follow(db: Db, followerId: string, followeeId: string): Promise<void> {
  if (followerId === followeeId) throw new Error('não é possível seguir a si mesmo');
  await db.insert(follows).values({ followerId, followeeId }).onConflictDoNothing();
}

export async function unfollow(db: Db, followerId: string, followeeId: string): Promise<void> {
  await db
    .delete(follows)
    .where(and(eq(follows.followerId, followerId), eq(follows.followeeId, followeeId)));
}

export async function like(db: Db, userId: string, catchId: string): Promise<void> {
  await db.insert(likes).values({ userId, catchId }).onConflictDoNothing();
}

export async function unlike(db: Db, userId: string, catchId: string): Promise<void> {
  await db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.catchId, catchId)));
}

/**
 * Feed do usuário: capturas públicas de quem ele segue, mais recentes primeiro.
 * Paginação por cursor (caughtAt ISO). Recurso Pro (o gate de plano é aplicado na borda).
 */
export async function getFeed(
  db: Db,
  userId: string,
  opts: { limit?: number; before?: string } = {},
): Promise<FeedItem[]> {
  const limit = opts.limit ?? 20;
  const cursor = opts.before ? sql`AND c.caught_at < ${opts.before}` : sql``;
  const rows = await db.execute(sql`
    SELECT c.id AS catch_id, c.user_id, u.name AS user_name, c.species_id,
           s.name_pt AS species_name_pt, c.size_cm, c.photo_url, c.caught_at,
           (SELECT count(*) FROM likes l WHERE l.catch_id = c.id) AS like_count
    FROM catches c
    JOIN users u ON u.id = c.user_id
    JOIN fish_species s ON s.id = c.species_id
    WHERE c.is_private = false
      AND c.user_id IN (SELECT followee_id FROM follows WHERE follower_id = ${userId})
      ${cursor}
    ORDER BY c.caught_at DESC
    LIMIT ${limit}
  `);
  return rows.rows.map((r) => {
    const row = r as Record<string, unknown>;
    return {
      catchId: String(row.catch_id),
      userId: String(row.user_id),
      userName: String(row.user_name),
      speciesId: String(row.species_id),
      speciesNamePt: String(row.species_name_pt),
      sizeCm: Number(row.size_cm),
      photoUrl: (row.photo_url as string | null) ?? null,
      caughtAt: new Date(row.caught_at as string).toISOString(),
      likeCount: Number(row.like_count),
    };
  });
}
