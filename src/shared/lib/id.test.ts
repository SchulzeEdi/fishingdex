import { describe, expect, it } from 'vitest';

import { createId } from './id';

describe('createId', () => {
  it('usa o prefixo e é determinístico com relógio e sorteio fixos', () => {
    expect(createId('c', 1000, () => 0)).toBe(createId('c', 1000, () => 0));
    expect(createId('c', 1000, () => 0).startsWith('c_')).toBe(true);
  });

  it('gera ids diferentes em chamadas reais', () => {
    expect(createId()).not.toBe(createId());
  });
});
