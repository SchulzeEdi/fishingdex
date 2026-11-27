import type { FishSpecies } from '../model/species';

type Lang = 'pt' | 'es' | 'en';

/** Nome da espécie no idioma do app (D-3). */
export function speciesName(species: FishSpecies, locale: Lang): string {
  switch (locale) {
    case 'pt':
      return species.namePt;
    case 'es':
      return species.nameEs;
    case 'en':
      return species.nameEn;
  }
}

/** Normaliza para busca sem acento/caixa ("tucunare" acha "Tucunaré-açu"). */
export function normalizeForSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** Busca por nome em qualquer idioma ou pelo nome científico. */
export function searchSpecies(
  species: readonly FishSpecies[],
  query: string,
): FishSpecies[] {
  const q = normalizeForSearch(query);
  if (!q) return [...species];
  return species.filter((s) =>
    [s.namePt, s.nameEs, s.nameEn, s.scientificName].some((n) => normalizeForSearch(n).includes(q)),
  );
}
