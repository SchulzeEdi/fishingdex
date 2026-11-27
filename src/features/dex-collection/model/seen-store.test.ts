import { beforeEach, describe, expect, it } from 'vitest';

import { isNewUnlock, markSpeciesSeen, seenStore } from './seen-store';

describe('seen-store', () => {
  beforeEach(async () => {
    await seenStore.reset();
  });

  it('marca como vista uma vez só', () => {
    markSpeciesSeen('tilapia');
    markSpeciesSeen('tilapia');
    expect(seenStore.getState().seen).toEqual(['tilapia']);
  });

  it('nova = desbloqueada e não vista', () => {
    expect(isNewUnlock(true, 'tilapia', [])).toBe(true);
    expect(isNewUnlock(true, 'tilapia', ['tilapia'])).toBe(false);
    expect(isNewUnlock(false, 'tilapia', [])).toBe(false);
  });
});
