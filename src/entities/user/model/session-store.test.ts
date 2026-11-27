import { beforeEach, describe, expect, it } from 'vitest';

import { sanitizeName, sessionActions, sessionStore, toCountry, type Profile } from './session-store';

const ana: Profile = { id: 'u1', email: 'ana@x.dev', name: 'Ana', country: 'AR', plan: 'free' };

describe('sanitizeName', () => {
  it('limpa espaços e recusa vazio', () => {
    expect(sanitizeName('  Rafael   Souza ')).toBe('Rafael Souza');
    expect(sanitizeName('   ')).toBeNull();
    expect(sanitizeName('x'.repeat(60))).toHaveLength(40);
  });
});

describe('toCountry', () => {
  it('aceita só os mercados do app', () => {
    expect(toCountry('BR')).toBe('BR');
    expect(toCountry('FR')).toBeNull();
    expect(toCountry(null)).toBeNull();
  });
});

describe('sessionActions', () => {
  beforeEach(async () => {
    await sessionStore.reset();
  });

  it('começa carregando, sem perfil', () => {
    expect(sessionStore.getState()).toEqual({ status: 'loading', profile: null });
  });

  it('entra, atualiza o perfil e sai', () => {
    sessionActions.signedIn(ana);
    expect(sessionStore.getState().status).toBe('signedIn');
    sessionActions.patchProfile({ plan: 'pro', name: 'Ana Ruiz' });
    expect(sessionStore.getState().profile).toMatchObject({ plan: 'pro', name: 'Ana Ruiz', id: 'u1' });
    sessionActions.signedOut();
    expect(sessionStore.getState()).toEqual({ status: 'signedOut', profile: null });
  });

  it('patch sem perfil não faz nada', () => {
    sessionActions.patchProfile({ plan: 'pro' });
    expect(sessionStore.getState().profile).toBeNull();
  });
});
