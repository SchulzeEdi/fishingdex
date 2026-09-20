import { describe, expect, it } from 'vitest';

import type { FishSpecies } from '@/entities/fish-species';

import { isPlausibleCatch } from './validate';

const tilapia: FishSpecies = {
  id: 'tilapia',
  namePt: 'Tilápia',
  nameEs: 'Tilapia',
  nameEn: 'Nile tilapia',
  scientificName: 'Oreochromis niloticus',
  habitat: 'freshwater',
  rarity: 'common',
  regions: ['BR'],
  maxPlausibleSizeCm: 60,
  maxPlausibleWeightKg: 5,
};

describe('isPlausibleCatch', () => {
  it('aceita uma captura dentro dos limites', () => {
    expect(isPlausibleCatch(tilapia, { sizeCm: 32, weightKg: 1.2 })).toEqual({ ok: true });
  });

  it('rejeita tamanho não positivo', () => {
    expect(isPlausibleCatch(tilapia, { sizeCm: 0 })).toEqual({ ok: false, reason: 'invalid_size' });
  });

  it('rejeita tamanho acima do teto da espécie (mentira de pescador)', () => {
    expect(isPlausibleCatch(tilapia, { sizeCm: 500 })).toEqual({
      ok: false,
      reason: 'size_exceeds_max',
    });
  });

  it('rejeita peso inválido', () => {
    expect(isPlausibleCatch(tilapia, { sizeCm: 30, weightKg: -1 })).toEqual({
      ok: false,
      reason: 'invalid_weight',
    });
  });

  it('rejeita peso acima do teto (2kg virando 50kg)', () => {
    expect(isPlausibleCatch(tilapia, { sizeCm: 30, weightKg: 50 })).toEqual({
      ok: false,
      reason: 'weight_exceeds_max',
    });
  });

  it('aceita sem peso informado', () => {
    expect(isPlausibleCatch(tilapia, { sizeCm: 30 })).toEqual({ ok: true });
  });
});
