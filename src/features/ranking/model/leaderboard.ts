import { periodCutoff, type RankingPeriod } from './period';

/** Uma captura candidata ao ranking (já com autor). */
export interface LeaderboardEntry {
  id: string;
  userId: string;
  authorName: string;
  country: string | null;
  speciesId: string;
  sizeCm: number;
  caughtAt: string;
  photoUrl?: string | null;
}

export interface LeaderboardRow extends LeaderboardEntry {
  position: number;
}

export interface LeaderboardScope {
  period: RankingPeriod;
  country?: string;
  speciesId?: string;
}

/**
 * Mesma regra do backend (getRanking, D-6): só captura pública e com foto (comprovação).
 * Aplicar às capturas locais; as da API já chegam filtradas.
 */
export function isRankingEligible(c: { isPrivate: boolean; photoUrl?: string | null }): boolean {
  return !c.isPrivate && !!c.photoUrl;
}

/**
 * Ordena por tamanho (maior primeiro; empate = quem pegou antes) dentro do recorte de
 * período/país/espécie e numera as posições.
 */
export function buildLeaderboard(
  entries: readonly LeaderboardEntry[],
  scope: LeaderboardScope,
  now: Date = new Date(),
): LeaderboardRow[] {
  const cutoff = periodCutoff(scope.period, now);
  return entries
    .filter((e) => !cutoff || new Date(e.caughtAt) >= cutoff)
    .filter((e) => !scope.country || e.country === scope.country)
    .filter((e) => !scope.speciesId || e.speciesId === scope.speciesId)
    .sort((a, b) => b.sizeCm - a.sizeCm || a.caughtAt.localeCompare(b.caughtAt))
    .map((e, i) => ({ ...e, position: i + 1 }));
}

/** Melhor posição de um usuário no ranking (para fixar "Você" no fim da lista). */
export function bestRowOf(rows: readonly LeaderboardRow[], userId: string): LeaderboardRow | null {
  return rows.find((r) => r.userId === userId) ?? null;
}
