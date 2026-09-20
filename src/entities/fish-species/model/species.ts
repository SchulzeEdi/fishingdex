export type Habitat = 'freshwater' | 'saltwater';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';

/** Mercados/regiões do catálogo — usado para regionalizar o seed (evita lista de 800 nomes). */
export type Region = 'BR' | 'AR' | 'US';

/** Espécie do catálogo mestre (curado). Nomes nos 3 idiomas do app (D-3). */
export interface FishSpecies {
  id: string;
  namePt: string;
  nameEs: string;
  nameEn: string;
  scientificName: string;
  habitat: Habitat;
  rarity: Rarity;
  /** Regiões onde a espécie é comum — filtra o catálogo por mercado. */
  regions: Region[];
  /** Teto plausível de tamanho (cm) — barra "mentira de pescador" no ranking. */
  maxPlausibleSizeCm: number;
  /** Teto plausível de peso (kg), quando informado. */
  maxPlausibleWeightKg?: number;
}
