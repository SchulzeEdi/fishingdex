import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { DEFAULT_LOCALE, translate } from './i18n';
import type { Locale, Messages } from './messages';

export type Translate = (key: keyof Messages, params?: Record<string, string | number>) => string;

interface I18nValue {
  locale: Locale;
  t: Translate;
}

const I18nContext = createContext<I18nValue>({
  locale: DEFAULT_LOCALE,
  t: (key, params) => translate(DEFAULT_LOCALE, key, params),
});

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo<I18nValue>(
    () => ({ locale, t: (key, params) => translate(locale, key, params) }),
    [locale],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Idioma atual (do aparelho) e a função de tradução. */
export function useI18n(): I18nValue {
  return useContext(I18nContext);
}
