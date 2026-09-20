import type { Catch } from '@/entities/catch';
import type { FishSpecies, Habitat } from '@/entities/fish-species';

/** Uma célula da Dex: a espécie e se o usuário já a desbloqueou. */
export interface DexEntry {
  species: FishSpecies;
  unlocked: boolean;
}

/** Progresso da coleção (estilo Pokédex): total, desbloqueadas, % e as células. */
export interface DexProgress {
  total: number;
  unlocked: number;
  percent: number;
  entries: DexEntry[];
}

/** IDs de espécies que o usuário já capturou ao menos uma vez. */
export function unlockedSpeciesIds(catches: readonly Catch[]): Set<string> {
  return new Set(catches.map((c) => c.speciesId));
}

/**
 * Uma captura desbloqueia a espécie quando é a PRIMEIRA daquela espécie.
 * Usado no momento de registrar para disparar a tela de desbloqueio (tela 26c).
 */
export function isFirstCatchOfSpecies(
  existingCatches: readonly Catch[],
  speciesId: string,
): boolean {
  return !existingCatches.some((c) => c.speciesId === speciesId);
}

/**
 * Monta a Dex: cada espécie marcada como desbloqueada ou não, com o progresso.
 * `habitat` opcional filtra por água doce/salgada (as abas da tela da Dex).
 */
export function buildDex(
  species: readonly FishSpecies[],
  catches: readonly Catch[],
  habitat?: Habitat,
): DexProgress {
  const unlocked = unlockedSpeciesIds(catches);
  const scope = habitat ? species.filter((s) => s.habitat === habitat) : species;

  const entries: DexEntry[] = scope.map((s) => ({
    species: s,
    unlocked: unlocked.has(s.id),
  }));

  const unlockedCount = entries.filter((e) => e.unlocked).length;
  const total = entries.length;
  const percent = total === 0 ? 0 : Math.round((unlockedCount / total) * 100);

  return { total, unlocked: unlockedCount, percent, entries };
}
