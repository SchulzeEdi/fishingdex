import { beforeEach, describe, expect, it } from 'vitest';

import { preferencesActions, preferencesStore, resolveLocalePreference } from './preferences';

describe('preferências', () => {
  beforeEach(async () => {
    await preferencesStore.reset();
  });

  it('começa automático', () => {
    expect(preferencesStore.getState()).toEqual({ locale: 'auto', currency: 'auto' });
  });

  it('troca idioma e moeda', () => {
    preferencesActions.setLocale('en');
    preferencesActions.setCurrency('USD');
    expect(preferencesStore.getState()).toEqual({ locale: 'en', currency: 'USD' });
    preferencesActions.setLocale('en');
    expect(preferencesStore.getState().locale).toBe('en');
  });

  it('auto segue o aparelho; escolha manual vence', () => {
    expect(resolveLocalePreference('auto', 'es')).toBe('es');
    expect(resolveLocalePreference('pt', 'en')).toBe('pt');
  });
});
