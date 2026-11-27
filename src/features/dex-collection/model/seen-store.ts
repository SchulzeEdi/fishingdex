import { createPersistedStore, useStore } from '@/shared/lib';

interface SeenState {
  /** Espécies cuja ficha o usuário já abriu (some o selo "Nova"). */
  seen: string[];
}

const EMPTY: readonly string[] = [];

export const seenStore = createPersistedStore<SeenState>({
  key: 'fishingdex.dex-seen',
  version: 1,
  initial: { seen: [] },
});

export function markSpeciesSeen(speciesId: string): void {
  seenStore.setState((s) => (s.seen.includes(speciesId) ? s : { seen: [...s.seen, speciesId] }));
}

/** Recém-desbloqueada = desbloqueada e ainda não vista. */
export function isNewUnlock(unlocked: boolean, speciesId: string, seen: readonly string[]): boolean {
  return unlocked && !seen.includes(speciesId);
}

export function useSeenSpecies(): readonly string[] {
  return useStore(seenStore, (s) => s.seen ?? EMPTY);
}
