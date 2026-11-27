import { describe, expect, it, vi } from 'vitest';

import { configureStorage, createPersistedStore, memoryStorage } from './persisted-store';

interface S {
  count: number;
  name: string;
}
const initial: S = { count: 0, name: 'x' };

describe('createPersistedStore', () => {
  it('atualiza o estado e avisa os inscritos', () => {
    const store = createPersistedStore({ key: 'k', version: 1, initial, storage: memoryStorage() });
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.setState((s) => ({ ...s, count: 1 }));
    expect(store.getState().count).toBe(1);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    store.setState((s) => ({ ...s, count: 2 }));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('não avisa quando o updater devolve o mesmo estado', () => {
    const store = createPersistedStore({ key: 'k', version: 1, initial, storage: memoryStorage() });
    const listener = vi.fn();
    store.subscribe(listener);
    store.setState((s) => s);
    expect(listener).not.toHaveBeenCalled();
  });

  it('persiste e reidrata o estado salvo', async () => {
    const storage = memoryStorage();
    const a = createPersistedStore({ key: 'k', version: 1, initial, storage });
    a.setState((s) => ({ ...s, count: 5 }));
    await Promise.resolve();
    const b = createPersistedStore({ key: 'k', version: 1, initial, storage });
    expect(b.isHydrated()).toBe(false);
    await b.hydrate();
    expect(b.isHydrated()).toBe(true);
    expect(b.getState()).toEqual({ count: 5, name: 'x' });
  });

  it('descarta salvo de outra versão e JSON corrompido', async () => {
    const old = memoryStorage({ k: JSON.stringify({ v: 0, state: { count: 9 } }) });
    const s1 = createPersistedStore({ key: 'k', version: 1, initial, storage: old });
    await s1.hydrate();
    expect(s1.getState()).toEqual(initial);

    const broken = memoryStorage({ k: '{nope' });
    const s2 = createPersistedStore({ key: 'k', version: 1, initial, storage: broken });
    await s2.hydrate();
    expect(s2.getState()).toEqual(initial);
  });

  it('mescla campos novos do inicial com o salvo', async () => {
    const storage = memoryStorage({ k: JSON.stringify({ v: 1, state: { count: 3 } }) });
    const store = createPersistedStore({ key: 'k', version: 1, initial, storage });
    await store.hydrate();
    expect(store.getState()).toEqual({ count: 3, name: 'x' });
  });

  it('reset volta ao inicial e apaga o salvo', async () => {
    const storage = memoryStorage();
    const store = createPersistedStore({ key: 'k', version: 1, initial, storage });
    store.setState((s) => ({ ...s, count: 7 }));
    await store.reset();
    expect(store.getState()).toEqual(initial);
    expect(await storage.getItem('k')).toBeNull();
  });

  it('persist: false fica só em memória', async () => {
    const storage = memoryStorage();
    const store = createPersistedStore({ key: 'm', version: 1, initial, storage, persist: false });
    store.setState((s) => ({ ...s, count: 2 }));
    await store.hydrate();
    expect(store.getState().count).toBe(2);
    expect(store.isHydrated()).toBe(true);
    expect(await storage.getItem('m')).toBeNull();
  });

  it('usa o storage padrão configurado e funciona sem nenhum', async () => {
    const none = createPersistedStore({ key: 'z', version: 1, initial });
    await none.hydrate();
    none.setState((s) => ({ ...s, count: 1 }));
    expect(none.getState().count).toBe(1);

    const storage = memoryStorage();
    configureStorage(storage);
    const store = createPersistedStore({ key: 'd', version: 1, initial });
    store.setState((s) => ({ ...s, name: 'y' }));
    await Promise.resolve();
    expect(await storage.getItem('d')).toContain('"name":"y"');
  });
});
