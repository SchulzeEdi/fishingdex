import type { FishSpecies } from '../model/species';
import type { Region } from '../model/species';

/**
 * Fronteira de acesso a dados de espécies (pertence à entidade — FSD).
 * A UI depende só desta interface; a implementação em memória troca por Supabase depois.
 */
export interface SpeciesRepository {
  listByRegion(region: Region): Promise<FishSpecies[]>;
  getById(id: string): Promise<FishSpecies | null>;
}
