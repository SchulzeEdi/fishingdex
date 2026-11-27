import { describe, expect, it } from 'vitest';

import type { FishSpecies } from '@/entities/fish-species';

import { validateCatchForm } from './catch-form';

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

describe('validateCatchForm', () => {
  it('aceita tamanho com vírgula e peso opcional', () => {
    expect(validateCatchForm({ speciesId: 'tilapia', size: '32,5', weight: '' }, tilapia)).toEqual({
      ok: true,
      sizeCm: 32.5,
    });
    expect(validateCatchForm({ speciesId: 'tilapia', size: '32', weight: '1.2' }, tilapia)).toEqual({
      ok: true,
      sizeCm: 32,
      weightKg: 1.2,
    });
  });

  it('exige espécie e tamanho válido', () => {
    const r = validateCatchForm({ speciesId: null, size: 'abc', weight: '' }, null);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.species?.key).toBe('register.speciesRequired');
      expect(r.errors.size?.key).toBe('register.sizeInvalid');
    }
  });

  it('barra tamanho e peso acima do plausível da espécie', () => {
    const big = validateCatchForm({ speciesId: 'tilapia', size: '240', weight: '' }, tilapia);
    expect(big).toEqual({ ok: false, errors: { size: { key: 'register.sizeTooBig', params: { max: 60 } } } });
    const heavy = validateCatchForm({ speciesId: 'tilapia', size: '40', weight: '9' }, tilapia);
    expect(heavy).toEqual({ ok: false, errors: { weight: { key: 'register.weightTooBig', params: { max: 5 } } } });
  });

  it('recusa peso inválido e tamanho zero', () => {
    const r = validateCatchForm({ speciesId: 'tilapia', size: '0', weight: 'x' }, tilapia);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.size?.key).toBe('register.sizeInvalid');
      expect(r.errors.weight?.key).toBe('register.weightInvalid');
    }
  });
});
