import { describe, expect, it } from 'vitest';

import { currencyFor, proPriceLabels, resolveCurrency } from './prices';

describe('proPriceLabels', () => {
  it('BRL com vírgula em pt', () => {
    expect(proPriceLabels('BRL', 'pt')).toEqual({ monthly: 'R$ 19,90', yearly: 'R$ 149' });
  });

  it('USD com o decimal do idioma', () => {
    expect(proPriceLabels('USD', 'en')).toEqual({ monthly: 'US$ 6.99', yearly: 'US$ 49.99' });
    expect(proPriceLabels('USD', 'es')).toEqual({ monthly: 'US$ 6,99', yearly: 'US$ 49,99' });
  });
});

describe('moeda', () => {
  it('pelo país: Brasil em BRL, o resto em USD', () => {
    expect(currencyFor('BR')).toBe('BRL');
    expect(currencyFor('AR')).toBe('USD');
    expect(currencyFor(null)).toBe('USD');
  });

  it('a escolha do usuário vence o país', () => {
    expect(resolveCurrency('auto', 'BR')).toBe('BRL');
    expect(resolveCurrency('USD', 'BR')).toBe('USD');
    expect(resolveCurrency('BRL', 'US')).toBe('BRL');
  });
});
