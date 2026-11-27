import { describe, expect, it } from 'vitest';

import { bestRowOf, buildLeaderboard, isRankingEligible, type LeaderboardEntry } from './leaderboard';

const now = new Date('2026-11-27T12:00:00Z');
const e = (id: string, sizeCm: number, caughtAt: string, extra: Partial<LeaderboardEntry> = {}): LeaderboardEntry => ({
  id,
  userId: `u-${id}`,
  authorName: id,
  country: 'BR',
  speciesId: 'tilapia',
  sizeCm,
  caughtAt,
  ...extra,
});

const entries = [
  e('a', 50, '2026-11-20T10:00:00Z'),
  e('b', 70, '2026-03-01T10:00:00Z', { country: 'US', speciesId: 'black-bass' }),
  e('c', 70, '2026-02-01T10:00:00Z'),
  e('d', 90, '2025-05-01T10:00:00Z'),
];

describe('buildLeaderboard', () => {
  it('ordena por tamanho e desempata por quem pegou antes', () => {
    const rows = buildLeaderboard(entries, { period: 'all' }, now);
    expect(rows.map((r) => r.id)).toEqual(['d', 'c', 'b', 'a']);
    expect(rows.map((r) => r.position)).toEqual([1, 2, 3, 4]);
  });

  it('recorta por período', () => {
    expect(buildLeaderboard(entries, { period: 'month' }, now).map((r) => r.id)).toEqual(['a']);
    expect(buildLeaderboard(entries, { period: 'year' }, now).map((r) => r.id)).toEqual(['c', 'b', 'a']);
  });

  it('recorta por país e espécie', () => {
    expect(buildLeaderboard(entries, { period: 'all', country: 'US' }, now).map((r) => r.id)).toEqual(['b']);
    expect(
      buildLeaderboard(entries, { period: 'all', speciesId: 'tilapia' }, now).map((r) => r.id),
    ).toEqual(['d', 'c', 'a']);
  });
});

describe('isRankingEligible', () => {
  it('exige foto e captura pública', () => {
    expect(isRankingEligible({ isPrivate: false, photoUrl: 'file://x.jpg' })).toBe(true);
    expect(isRankingEligible({ isPrivate: true, photoUrl: 'file://x.jpg' })).toBe(false);
    expect(isRankingEligible({ isPrivate: false, photoUrl: null })).toBe(false);
  });
});

describe('bestRowOf', () => {
  it('acha a melhor linha do usuário', () => {
    const rows = buildLeaderboard(entries, { period: 'all' }, now);
    expect(bestRowOf(rows, 'u-b')?.position).toBe(3);
    expect(bestRowOf(rows, 'ninguem')).toBeNull();
  });
});
