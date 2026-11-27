import { describe, expect, it } from 'vitest';

import type { Catch } from './catch';
import { biggestCatch, catchesThisMonth, sortByRecent, toggleId } from './catch-log';

const mk = (id: string, speciesId: string, sizeCm: number, caughtAt: string): Catch => ({
  id,
  userId: 'me',
  speciesId,
  sizeCm,
  caughtAt,
  isPrivate: false,
});

const list = [
  mk('a', 'tilapia', 30, '2026-11-02T10:00:00Z'),
  mk('b', 'dourado', 62, '2026-11-20T10:00:00Z'),
  mk('c', 'tilapia', 41, '2026-10-30T10:00:00Z'),
];

describe('catchesThisMonth', () => {
  it('conta só o mês corrente', () => {
    expect(catchesThisMonth(list, new Date('2026-11-27T00:00:00Z'))).toBe(2);
    expect(catchesThisMonth(list, new Date('2026-12-01T00:00:00Z'))).toBe(0);
  });
});

describe('biggestCatch', () => {
  it('acha a maior no geral e por espécie', () => {
    expect(biggestCatch(list)?.id).toBe('b');
    expect(biggestCatch(list, 'tilapia')?.id).toBe('c');
    expect(biggestCatch(list, 'pirarucu')).toBeNull();
    expect(biggestCatch([])).toBeNull();
  });
});

describe('sortByRecent', () => {
  it('ordena do mais novo pro mais velho sem mutar', () => {
    const sorted = sortByRecent(list);
    expect(sorted.map((c) => c.id)).toEqual(['b', 'a', 'c']);
    expect(list[0]?.id).toBe('a');
  });
});

describe('toggleId', () => {
  it('adiciona e remove', () => {
    expect(toggleId(['x'], 'y')).toEqual(['x', 'y']);
    expect(toggleId(['x', 'y'], 'x')).toEqual(['y']);
  });
});
