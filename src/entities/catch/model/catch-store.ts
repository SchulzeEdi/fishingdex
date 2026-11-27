import { createPersistedStore, useStore } from '@/shared/lib';

import type { Catch } from './catch';
import { toggleId } from './catch-log';

/** Id do dono local até a auth real (Supabase, DT-03). */
export const LOCAL_USER_ID = 'me';

interface CatchState {
  /** Capturas do usuário deste aparelho. */
  mine: Catch[];
  /** Capturas curtidas (ids). */
  liked: string[];
}

const EMPTY: readonly never[] = [];

export const catchStore = createPersistedStore<CatchState>({
  key: 'fishingdex.catches',
  version: 1,
  initial: { mine: [], liked: [] },
});

export const catchActions = {
  add(entry: Catch) {
    catchStore.setState((s) => ({ ...s, mine: [entry, ...s.mine] }));
  },
  remove(id: string) {
    catchStore.setState((s) => ({ ...s, mine: s.mine.filter((c) => c.id !== id) }));
  },
  toggleLike(id: string) {
    catchStore.setState((s) => ({ ...s, liked: toggleId(s.liked, id) }));
  },
};

export function useMyCatches(): readonly Catch[] {
  return useStore(catchStore, (s) => s.mine ?? EMPTY);
}

export function useLikedIds(): readonly string[] {
  return useStore(catchStore, (s) => s.liked ?? EMPTY);
}
