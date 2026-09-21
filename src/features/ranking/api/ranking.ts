import { sql } from 'drizzle-orm';

import type { Db } from '@/shared/db/client';
import { reports } from '@/shared/db/schema';

import { periodCutoff, REPORT_HIDE_THRESHOLD, type RankingPeriod } from '../model/period';

export interface RankingScope {
  period: RankingPeriod;
  speciesId?: string;
  country?: string;
}

export interface RankingEntry {
  position: number;
  catchId: string;
  userId: string;
  userName: string;
  country: string | null;
  speciesId: string;
  speciesNamePt: string;
  sizeCm: number;
  photoUrl: string | null;
}

/**
 * Ranking por tamanho (D-6). Só capturas públicas com foto (comprovação). Exclui capturas
 * denunciadas acima do limite (D-13). Recortes: período, espécie e país.
 */
export async function getRanking(db: Db, scope: RankingScope, limit = 50): Promise<RankingEntry[]> {
  const cutoff = periodCutoff(scope.period);
  const conditions = [
    sql`c.is_private = false`,
    sql`c.photo_url IS NOT NULL`,
    sql`c.id NOT IN (SELECT catch_id FROM reports GROUP BY catch_id HAVING count(*) >= ${REPORT_HIDE_THRESHOLD})`,
  ];
  if (cutoff) conditions.push(sql`c.caught_at >= ${cutoff.toISOString()}`);
  if (scope.speciesId) conditions.push(sql`c.species_id = ${scope.speciesId}`);
  if (scope.country) conditions.push(sql`u.country = ${scope.country}`);

  const where = sql.join(conditions, sql` AND `);
  const rows = await db.execute(sql`
    SELECT c.id AS catch_id, c.user_id, u.name AS user_name, u.country,
           c.species_id, s.name_pt AS species_name_pt, c.size_cm, c.photo_url
    FROM catches c
    JOIN users u ON u.id = c.user_id
    JOIN fish_species s ON s.id = c.species_id
    WHERE ${where}
    ORDER BY c.size_cm DESC, c.caught_at ASC
    LIMIT ${limit}
  `);

  return rows.rows.map((r, i) => {
    const row = r as Record<string, unknown>;
    return {
      position: i + 1,
      catchId: String(row.catch_id),
      userId: String(row.user_id),
      userName: String(row.user_name),
      country: (row.country as string | null) ?? null,
      speciesId: String(row.species_id),
      speciesNamePt: String(row.species_name_pt),
      sizeCm: Number(row.size_cm),
      photoUrl: (row.photo_url as string | null) ?? null,
    };
  });
}

/** Denúncia da comunidade contra uma captura (moderação — D-13). */
export async function reportCatch(
  db: Db,
  input: { reporterId: string; catchId: string; reason: string },
): Promise<void> {
  await db.insert(reports).values({
    reporterId: input.reporterId,
    catchId: input.catchId,
    reason: input.reason,
  });
}
