import { describe, expect, it } from 'vitest';

import { InMemorySpeciesRepository } from './in-memory-species-repository';

describe('InMemorySpeciesRepository', () => {
  const repo = new InMemorySpeciesRepository();

  it('lista espécies por região', async () => {
    const br = await repo.listByRegion('BR');
    expect(br.length).toBeGreaterThan(0);
    expect(br.every((s) => s.regions.includes('BR'))).toBe(true);
  });

  it('busca por id', async () => {
    const s = await repo.getById('tilapia');
    expect(s?.namePt).toBe('Tilápia');
  });

  it('retorna null quando o id não existe', async () => {
    expect(await repo.getById('inexistente')).toBeNull();
  });
});
