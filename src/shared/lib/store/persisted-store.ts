/** Armazenamento chave-valor assíncrono (AsyncStorage no app; memória nos testes). */
export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem?(key: string): Promise<void>;
}

let defaultStorage: KeyValueStorage | null = null;

/** Configurado uma vez na inicialização do app (app-init). */
export function configureStorage(storage: KeyValueStorage): void {
  defaultStorage = storage;
}

export function memoryStorage(seed: Record<string, string> = {}): KeyValueStorage {
  const data = new Map(Object.entries(seed));
  return {
    getItem: async (key) => data.get(key) ?? null,
    setItem: async (key, value) => {
      data.set(key, value);
    },
    removeItem: async (key) => {
      data.delete(key);
    },
  };
}

export interface Store<T> {
  getState(): T;
  setState(updater: (state: T) => T): void;
  subscribe(listener: () => void): () => void;
  /** Lê o estado salvo (uma vez, antes da primeira tela). */
  hydrate(): Promise<void>;
  isHydrated(): boolean;
  /** Volta ao estado inicial e apaga o salvo. */
  reset(): Promise<void>;
}

interface Options<T> {
  key: string;
  /** Muda quando o formato salvo muda de forma incompatível (descarta o antigo). */
  version: number;
  initial: T;
  storage?: KeyValueStorage;
  /** false = só em memória (dados que vêm do servidor a cada sessão). */
  persist?: boolean;
}

interface Envelope<T> {
  v: number;
  state: T;
}

/**
 * Store mínimo (sem dependência externa) que persiste o estado inteiro como JSON.
 * Online-only é a regra da V1 (D-10); isto guarda só o que é do aparelho até a API existir.
 */
export function createPersistedStore<T extends object>({
  key,
  version,
  initial,
  storage,
  persist: shouldPersist = true,
}: Options<T>): Store<T> {
  let state = initial;
  let hydrated = false;
  const listeners = new Set<() => void>();
  const backend = () => (shouldPersist ? (storage ?? defaultStorage) : null);

  const emit = () => listeners.forEach((l) => l());
  const persist = () => {
    const s = backend();
    if (!s) return;
    const envelope: Envelope<T> = { v: version, state };
    s.setItem(key, JSON.stringify(envelope)).catch(() => undefined);
  };

  return {
    getState: () => state,
    setState(updater) {
      const next = updater(state);
      if (Object.is(next, state)) return;
      state = next;
      persist();
      emit();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    async hydrate() {
      const s = backend();
      if (s) {
        try {
          const raw = await s.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw) as Partial<Envelope<T>>;
            if (parsed.v === version && parsed.state !== undefined) {
              state = { ...initial, ...parsed.state };
            }
          }
        } catch {
          // Salvo corrompido: segue com o inicial.
        }
      }
      hydrated = true;
      emit();
    },
    isHydrated: () => hydrated,
    async reset() {
      state = initial;
      await backend()?.removeItem?.(key);
      emit();
    },
  };
}
