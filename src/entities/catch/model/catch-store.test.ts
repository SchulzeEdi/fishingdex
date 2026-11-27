import { beforeEach, describe, expect, it } from 'vitest';

import { catchActions, catchStore, LOCAL_USER_ID } from './catch-store';

const entry = (id: string) => ({
  id,
  userId: LOCAL_USER_ID,
  speciesId: 'tilapia',
  sizeCm: 30,
  caughtAt: '2026-11-27T10:00:00Z',
  isPrivate: false,
});

describe('catchActions', () => {
  beforeEach(async () => {
    await catchStore.reset();
  });

  it('adiciona no topo e remove', () => {
    catchActions.add(entry('a'));
    catchActions.add(entry('b'));
    expect(catchStore.getState().mine.map((c) => c.id)).toEqual(['b', 'a']);
    catchActions.remove('a');
    expect(catchStore.getState().mine.map((c) => c.id)).toEqual(['b']);
  });

  it('curte e descurte', () => {
    catchActions.toggleLike('x');
    expect(catchStore.getState().liked).toEqual(['x']);
    catchActions.toggleLike('x');
    expect(catchStore.getState().liked).toEqual([]);
  });
});
