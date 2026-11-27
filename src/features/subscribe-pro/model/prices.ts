import type { Currency, CurrencyPreference } from '@/shared/config';

// Preços do Pro por moeda (spec/monetization.md). Na loja, o preço final vem do Google Play
// Billing / RevenueCat (DT-05/DT-07), já na moeda da conta da Play; isto é o que o paywall
// mostra até lá.
type Lang = 'pt' | 'es' | 'en';

const PRO_PRICES: Record<Currency, { symbol: string; monthly: number; yearly: number }> = {
  BRL: { symbol: 'R$', monthly: 19.9, yearly: 149 },
  USD: { symbol: 'US$', monthly: 6.99, yearly: 49.99 },
};

/** Moeda do país: Brasil em BRL; Argentina e EUA em USD (dois mercados). */
export function currencyFor(country: string | null | undefined): Currency {
  return country === 'BR' ? 'BRL' : 'USD';
}

/** Moeda efetiva: a escolhida pelo usuário, ou a do país do perfil. */
export function resolveCurrency(preference: CurrencyPreference, country: string | null | undefined): Currency {
  return preference === 'auto' ? currencyFor(country) : preference;
}

function money(symbol: string, value: number, lang: Lang): string {
  const fixed = Number.isInteger(value) ? String(value) : value.toFixed(2);
  return `${symbol} ${lang === 'en' ? fixed : fixed.replace('.', ',')}`;
}

/** { monthly: "R$ 19,90", yearly: "R$ 149" } na moeda pedida, com o decimal do idioma. */
export function proPriceLabels(currency: Currency, lang: Lang) {
  const p = PRO_PRICES[currency];
  return { monthly: money(p.symbol, p.monthly, lang), yearly: money(p.symbol, p.yearly, lang) };
}
