import { describe, expect, it } from 'vitest';

import {
  canRegisterCatch,
  canViewSocial,
  FREE_MONTHLY_CATCH_LIMIT,
  isVisibleToOthers,
  remainingCatches,
} from './plan-limits';

describe('plan-limits (D-9)', () => {
  it('só Pro vê o social e é visível', () => {
    expect(canViewSocial('free')).toBe(false);
    expect(canViewSocial('pro')).toBe(true);
    expect(isVisibleToOthers('free')).toBe(false);
    expect(isVisibleToOthers('pro')).toBe(true);
  });

  it('Free registra até o limite mensal; Pro ilimitado', () => {
    expect(canRegisterCatch('free', FREE_MONTHLY_CATCH_LIMIT - 1)).toBe(true);
    expect(canRegisterCatch('free', FREE_MONTHLY_CATCH_LIMIT)).toBe(false);
    expect(canRegisterCatch('pro', 9999)).toBe(true);
  });

  it('remainingCatches: conta pro Free, infinito pro Pro', () => {
    expect(remainingCatches('free', 1)).toBe(FREE_MONTHLY_CATCH_LIMIT - 1);
    expect(remainingCatches('free', 5)).toBe(0);
    expect(remainingCatches('pro', 100)).toBe(Number.POSITIVE_INFINITY);
  });
});
