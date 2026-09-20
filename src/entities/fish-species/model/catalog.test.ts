import { describe, expect, it } from 'vitest';

import { speciesForRegion } from './catalog';
import { SPECIES_SEED } from './species.data';

describe('speciesForRegion', () => {
  it('retorna só espécies da região pedida', () => {
    const us = speciesForRegion(SPECIES_SEED, 'US');
    expect(us.length).toBeGreaterThan(0);
    expect(us.every((s) => s.regions.includes('US'))).toBe(true);
    expect(us.some((s) => s.id === 'black-bass')).toBe(true);
  });

  it('não traz espécie de outra região (Tucunaré só BR não aparece em US)', () => {
    const us = speciesForRegion(SPECIES_SEED, 'US');
    expect(us.some((s) => s.id === 'tucunare-acu')).toBe(false);
  });
});
