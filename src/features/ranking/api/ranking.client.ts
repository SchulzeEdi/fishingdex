import { getSupabase, toAppError } from '@/shared/api';

import type { LeaderboardRow, LeaderboardScope } from '../model/leaderboard';

interface RankingRow {
  rank_position: number;
  catch_id: string;
  user_id: string;
  user_name: string;
  user_country: string | null;
  species_id: string;
  size_cm: number;
  photo_url: string | null;
  caught_at: string;
}

/**
 * Ranking do servidor (Pro) — mesma regra de buildLeaderboard/getRanking: pública, com foto,
 * sem denúncias acima do limite, recortes de período/país/espécie.
 */
export async function fetchRanking(scope: LeaderboardScope, limit = 50): Promise<LeaderboardRow[]> {
  const { data, error } = await getSupabase().rpc('get_ranking', {
    p_period: scope.period,
    p_country: scope.country ?? null,
    p_species: scope.speciesId ?? null,
    p_limit: limit,
  });
  if (error) throw toAppError(error);
  return ((data ?? []) as RankingRow[]).map((r) => ({
    position: Number(r.rank_position),
    id: r.catch_id,
    userId: r.user_id,
    authorName: r.user_name,
    country: r.user_country,
    speciesId: r.species_id,
    sizeCm: Number(r.size_cm),
    caughtAt: r.caught_at,
    photoUrl: r.photo_url,
  }));
}
