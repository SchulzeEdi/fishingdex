import { describe, expect, it } from 'vitest';

import { periodCutoff } from './period';

const now = new Date(Date.UTC(2026, 8, 20)); // 2026-09-20

describe('periodCutoff', () => {
  it('month = início do mês corrente (UTC)', () => {
    expect(periodCutoff('month', now)?.toISOString()).toBe('2026-09-01T00:00:00.000Z');
  });

  it('year = início do ano corrente (UTC)', () => {
    expect(periodCutoff('year', now)?.toISOString()).toBe('2026-01-01T00:00:00.000Z');
  });

  it('all = sem corte', () => {
    expect(periodCutoff('all', now)).toBeNull();
  });
});
