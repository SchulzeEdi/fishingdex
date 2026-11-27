import { describe, expect, it } from 'vitest';

import { currencyFor, proPriceLabels } from './prices';

describe('proPriceLabels', () => {
  it('Brasil em BRL com vírgula', () => {
    expect(proPriceLabels('BR', 'pt')).toEqual({ monthly: 'R$ 19,90', yearly: 'R$ 149' });
  });

  it('EUA/Argentina em USD, decimal conforme o idioma', () => {
    expect(proPriceLabels('US', 'en')).toEqual({ monthly: 'US$ 6.99', yearly: 'US$ 49.99' });
    expect(proPriceLabels('AR', 'es')).toEqual({ monthly: 'US$ 6,99', yearly: 'US$ 49,99' });
  });

  it('sem país cai em USD', () => {
    expect(currencyFor(null)).toBe('USD');
  });
});
