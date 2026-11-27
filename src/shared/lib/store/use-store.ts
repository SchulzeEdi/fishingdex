import { useSyncExternalStore } from 'react';

import type { Store } from './persisted-store';

/** Lê uma fatia do store e re-renderiza quando ela muda. O seletor deve devolver valor estável. */
export function useStore<T, R>(store: Store<T>, selector: (state: T) => R): R {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState()),
  );
}
