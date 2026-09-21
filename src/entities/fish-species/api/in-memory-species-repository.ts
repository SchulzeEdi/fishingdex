import { speciesForRegion } from '../model/catalog';
import type { FishSpecies, Region } from '../model/species';
import { SPECIES_SEED } from '../model/species.data';

import type { SpeciesRepository } from './species-repository';

/** Implementação em memória usando o seed regionalizado. Placeholder até o Supabase (T-02). */
export class InMemorySpeciesRepository implements SpeciesRepository {
  constructor(private readonly all: readonly FishSpecies[] = SPECIES_SEED) {}

  async listByRegion(region: Region): Promise<FishSpecies[]> {
    return speciesForRegion(this.all, region);
  }

  async getById(id: string): Promise<FishSpecies | null> {
    return this.all.find((s) => s.id === id) ?? null;
  }
}
