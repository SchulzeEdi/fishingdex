import { beforeEach, describe, expect, it } from 'vitest';

import { sessionStore } from '@/entities/user';

import { demoPurchase } from './demo-purchase';

describe('demoPurchase', () => {
  beforeEach(async () => {
    await sessionStore.reset();
  });

  it('assinar ativa o Pro e cancelar volta ao Free', async () => {
    expect(await demoPurchase.subscribe()).toBe('purchased');
    expect(sessionStore.getState().plan).toBe('pro');
    demoPurchase.cancel();
    expect(sessionStore.getState().plan).toBe('free');
  });

  it('restaurar não acha compra', async () => {
    expect(await demoPurchase.restore()).toBe('none');
  });
});
