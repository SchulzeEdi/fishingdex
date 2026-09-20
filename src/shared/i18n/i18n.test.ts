import { describe, expect, it } from 'vitest';

import { MESSAGES, type Messages } from './messages';
import { DEFAULT_LOCALE, resolveLocale, SUPPORTED_LOCALES, translate } from './i18n';

describe('resolveLocale', () => {
  it('mapeia variantes regionais (pt-BR, es-AR) para a base', () => {
    expect(resolveLocale('pt-BR')).toBe('pt');
    expect(resolveLocale('es-AR')).toBe('es');
    expect(resolveLocale('en-US')).toBe('en');
  });

  it('faz fallback para o default quando indefinido ou não suportado', () => {
    expect(resolveLocale(undefined)).toBe(DEFAULT_LOCALE);
    expect(resolveLocale('fr')).toBe(DEFAULT_LOCALE);
    expect(resolveLocale('')).toBe(DEFAULT_LOCALE);
  });
});

describe('translate', () => {
  it('traduz nos 3 idiomas', () => {
    expect(translate('pt', 'paywall.cta')).toBe('Assinar Pro');
    expect(translate('es', 'paywall.cta')).toBe('Suscribirse a Pro');
    expect(translate('en', 'paywall.cta')).toBe('Go Pro');
  });

  it('interpola parâmetros', () => {
    expect(translate('pt', 'dex.progress', { unlocked: 2, total: 6 })).toBe('2 de 6 espécies');
    expect(translate('en', 'dex.progress', { unlocked: 2, total: 6 })).toBe('2 of 6 species');
  });

  it('mantém o placeholder quando o parâmetro falta', () => {
    expect(translate('en', 'dex.progress', { unlocked: 1 })).toContain('{total}');
  });
});

describe('cobertura de mensagens', () => {
  it('todas as chaves existem nos 3 locales', () => {
    const keys = Object.keys(MESSAGES.en) as (keyof Messages)[];
    for (const locale of SUPPORTED_LOCALES) {
      for (const key of keys) {
        expect(MESSAGES[locale][key], `${locale}.${key}`).toBeTruthy();
      }
    }
  });
});
