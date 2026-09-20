import type { FishSpecies, Region } from './species';

/** Catálogo filtrado por região — evita rolar 800 nomes pra achar um "Tambaqui". */
export function speciesForRegion(
  species: readonly FishSpecies[],
  region: Region,
): FishSpecies[] {
  return species.filter((s) => s.regions.includes(region));
}
