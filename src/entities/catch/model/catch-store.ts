import { createPersistedStore, useStore } from '@/shared/lib';

import type { Catch } from './catch';

export type CatchesStatus = 'idle' | 'loading' | 'ready' | 'error';

interface CatchState {
  status: CatchesStatus;
  /** Capturas do usuário logado (espelho do servidor nesta sessão). */
  mine: Catch[];
}

const EMPTY: readonly Catch[] = [];

export const catchStore = createPersistedStore<CatchState>({
  key: 'fishingdex.catches',
  version: 2,
  initial: { status: 'idle', mine: [] },
  persist: false,
});

export const catchActions = {
  loading() {
    catchStore.setState((s) => ({ ...s, status: 'loading' }));
  },
  loaded(list: Catch[]) {
    catchStore.setState(() => ({ status: 'ready', mine: list }));
  },
  failed() {
    catchStore.setState((s) => ({ ...s, status: 'error' }));
  },
  add(entry: Catch) {
    catchStore.setState((s) => ({ ...s, mine: [entry, ...s.mine.filter((c) => c.id !== entry.id)] }));
  },
  remove(id: string) {
    catchStore.setState((s) => ({ ...s, mine: s.mine.filter((c) => c.id !== id) }));
  },
  clear() {
    catchStore.setState(() => ({ status: 'idle', mine: [] }));
  },
};

export function useMyCatches(): readonly Catch[] {
  return useStore(catchStore, (s) => s.mine ?? EMPTY);
}

export function useMyCatchesStatus(): CatchesStatus {
  return useStore(catchStore, (s) => s.status);
}
