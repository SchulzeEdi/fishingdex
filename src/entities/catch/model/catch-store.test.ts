import { beforeEach, describe, expect, it } from 'vitest';

import { catchActions, catchStore } from './catch-store';

const entry = (id: string) => ({
  id,
  userId: 'u1',
  speciesId: 'tilapia',
  sizeCm: 30,
  caughtAt: '2026-11-27T10:00:00Z',
  isPrivate: false,
});

describe('catchActions', () => {
  beforeEach(async () => {
    await catchStore.reset();
  });

  it('carrega do servidor e marca o estado', () => {
    catchActions.loading();
    expect(catchStore.getState().status).toBe('loading');
    catchActions.loaded([entry('a')]);
    expect(catchStore.getState()).toMatchObject({ status: 'ready', mine: [{ id: 'a' }] });
    catchActions.failed();
    expect(catchStore.getState().status).toBe('error');
  });

  it('adiciona no topo sem duplicar, remove e limpa', () => {
    catchActions.add(entry('a'));
    catchActions.add(entry('b'));
    catchActions.add(entry('a'));
    expect(catchStore.getState().mine.map((c) => c.id)).toEqual(['a', 'b']);
    catchActions.remove('a');
    expect(catchStore.getState().mine.map((c) => c.id)).toEqual(['b']);
    catchActions.clear();
    expect(catchStore.getState()).toEqual({ status: 'idle', mine: [] });
  });
});
