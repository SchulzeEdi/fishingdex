import { describe, expect, it } from 'vitest';

import { SPECIES_SEED } from '../model/species.data';
import { normalizeForSearch, searchSpecies, speciesName } from './species-name';

const tucunare = SPECIES_SEED.find((s) => s.id === 'tucunare-acu')!;

describe('speciesName', () => {
  it('devolve o nome no idioma pedido', () => {
    expect(speciesName(tucunare, 'pt')).toBe('Tucunaré-açu');
    expect(speciesName(tucunare, 'es')).toBe('Tucunaré');
    expect(speciesName(tucunare, 'en')).toBe('Speckled peacock bass');
  });
});

describe('searchSpecies', () => {
  it('ignora acento e caixa', () => {
    expect(normalizeForSearch('  Tucunaré-AÇU ')).toBe('tucunare-acu');
    expect(searchSpecies(SPECIES_SEED, 'tucunare').map((s) => s.id)).toContain('tucunare-acu');
  });

  it('acha por nome em outro idioma e pelo científico', () => {
    expect(searchSpecies(SPECIES_SEED, 'mahi').map((s) => s.id)).toEqual(['dourado-do-mar']);
    expect(searchSpecies(SPECIES_SEED, 'arapaima').map((s) => s.id)).toEqual(['pirarucu']);
  });

  it('busca vazia devolve tudo', () => {
    expect(searchSpecies(SPECIES_SEED, '  ')).toHaveLength(SPECIES_SEED.length);
  });
});

describe('SPECIES_SEED', () => {
  it('ids únicos e tetos positivos', () => {
    const ids = new Set(SPECIES_SEED.map((s) => s.id));
    expect(ids.size).toBe(SPECIES_SEED.length);
    expect(SPECIES_SEED.every((s) => s.maxPlausibleSizeCm > 0 && s.regions.length > 0)).toBe(true);
  });

  it('água doce vem antes da salgada (ordem define o Nº da Dex)', () => {
    const firstSalt = SPECIES_SEED.findIndex((s) => s.habitat === 'saltwater');
    expect(SPECIES_SEED.slice(firstSalt).every((s) => s.habitat === 'saltwater')).toBe(true);
  });
});
