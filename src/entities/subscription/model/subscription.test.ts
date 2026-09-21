import { describe, expect, it } from 'vitest';

import { isProActive } from './subscription';

const now = new Date('2026-09-20T00:00:00Z');

describe('isProActive', () => {
  it('false para nulo ou plano/status não-pro', () => {
    expect(isProActive(null, now)).toBe(false);
    expect(isProActive({ plan: 'fishery_listing', status: 'active', currentPeriodEnd: null }, now)).toBe(false);
    expect(isProActive({ plan: 'pro', status: 'canceled', currentPeriodEnd: null }, now)).toBe(false);
  });

  it('true para pro active sem expiração ou com período futuro', () => {
    expect(isProActive({ plan: 'pro', status: 'active', currentPeriodEnd: null }, now)).toBe(true);
    expect(isProActive({ plan: 'pro', status: 'active', currentPeriodEnd: new Date('2026-10-20T00:00:00Z') }, now)).toBe(true);
  });

  it('false para período expirado', () => {
    expect(isProActive({ plan: 'pro', status: 'active', currentPeriodEnd: new Date('2026-08-20T00:00:00Z') }, now)).toBe(false);
  });
});
