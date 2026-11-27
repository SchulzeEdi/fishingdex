import { beforeEach, describe, expect, it } from 'vitest';

import { sanitizeName, sessionActions, sessionStore } from './session-store';

describe('sanitizeName', () => {
  it('limpa espaços e recusa vazio', () => {
    expect(sanitizeName('  Rafael   Souza ')).toBe('Rafael Souza');
    expect(sanitizeName('   ')).toBeNull();
    expect(sanitizeName('x'.repeat(60))).toHaveLength(40);
  });
});

describe('sessionActions', () => {
  beforeEach(async () => {
    await sessionStore.reset();
  });

  it('começa sem perfil e no Free', () => {
    expect(sessionStore.getState()).toEqual({ profile: null, plan: 'free' });
  });

  it('salva perfil válido e ignora nome vazio', () => {
    sessionActions.saveProfile({ name: '  ', country: 'BR' });
    expect(sessionStore.getState().profile).toBeNull();
    sessionActions.saveProfile({ name: ' Ana ', country: 'AR' });
    expect(sessionStore.getState().profile).toEqual({ name: 'Ana', country: 'AR' });
  });

  it('troca o plano', () => {
    sessionActions.setPlan('pro');
    expect(sessionStore.getState().plan).toBe('pro');
    sessionActions.setPlan('pro');
    expect(sessionStore.getState().plan).toBe('pro');
  });
});
