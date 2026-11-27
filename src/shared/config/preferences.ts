import type { Locale } from '@/shared/i18n';
import { createPersistedStore, useStore } from '@/shared/lib';

/** Moedas dos dois mercados (USD + BRL — spec/monetization.md). */
export type Currency = 'BRL' | 'USD';
export const CURRENCIES: readonly Currency[] = ['BRL', 'USD'];

/** "auto" = segue o aparelho (idioma) ou o país do perfil (moeda). */
export type LocalePreference = 'auto' | Locale;
export type CurrencyPreference = 'auto' | Currency;

export const LOCALE_CHOICES: readonly Locale[] = ['pt', 'es', 'en'];
/** Nome de cada idioma no próprio idioma (não se traduz). */
export const LOCALE_NAMES: Record<Locale, string> = { pt: 'Português', es: 'Español', en: 'English' };

interface PreferencesState {
  locale: LocalePreference;
  currency: CurrencyPreference;
}

/** Preferências do aparelho (salvas localmente, valem antes mesmo do login). */
export const preferencesStore = createPersistedStore<PreferencesState>({
  key: 'fishingdex.preferences',
  version: 1,
  initial: { locale: 'auto', currency: 'auto' },
});

export const preferencesActions = {
  setLocale(locale: LocalePreference) {
    preferencesStore.setState((s) => (s.locale === locale ? s : { ...s, locale }));
  },
  setCurrency(currency: CurrencyPreference) {
    preferencesStore.setState((s) => (s.currency === currency ? s : { ...s, currency }));
  },
};

/** Idioma efetivo: o escolhido, ou o do aparelho. */
export function resolveLocalePreference(preference: LocalePreference, deviceLocale: Locale): Locale {
  return preference === 'auto' ? deviceLocale : preference;
}

export function useLocalePreference(): LocalePreference {
  return useStore(preferencesStore, (s) => s.locale);
}

export function useCurrencyPreference(): CurrencyPreference {
  return useStore(preferencesStore, (s) => s.currency);
}
