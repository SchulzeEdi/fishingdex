// Preços do Pro por mercado (spec/monetization.md). Na loja, o preço final vem do Google Play
// Billing / RevenueCat (DT-05); isto é o que o paywall mostra até lá.
type Lang = 'pt' | 'es' | 'en';

const PRO_PRICES = {
  BRL: { symbol: 'R$', monthly: 19.9, yearly: 149 },
  USD: { symbol: 'US$', monthly: 6.99, yearly: 49.99 },
} as const;

/** Brasil paga em BRL; Argentina e EUA em USD (dois mercados). */
export function currencyFor(country: string | null | undefined): keyof typeof PRO_PRICES {
  return country === 'BR' ? 'BRL' : 'USD';
}

function money(symbol: string, value: number, lang: Lang): string {
  const fixed = Number.isInteger(value) ? String(value) : value.toFixed(2);
  return `${symbol} ${lang === 'en' ? fixed : fixed.replace('.', ',')}`;
}

/** { monthly: "R$ 19,90", yearly: "R$ 149" } no formato do idioma. */
export function proPriceLabels(country: string | null | undefined, lang: Lang) {
  const p = PRO_PRICES[currencyFor(country)];
  return { monthly: money(p.symbol, p.monthly, lang), yearly: money(p.symbol, p.yearly, lang) };
}
