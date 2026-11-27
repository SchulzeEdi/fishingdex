import { describe, expect, it } from 'vitest';

import {
  formatDate,
  formatNumber,
  formatRelativeTime,
  formatSize,
  formatWeight,
  parseDecimal,
} from './format';

describe('formatNumber / formatSize / formatWeight', () => {
  it('usa vírgula decimal em pt/es e ponto em en', () => {
    expect(formatWeight('pt', 3.4)).toBe('3,4 kg');
    expect(formatWeight('es', 3.4)).toBe('3,4 kg');
    expect(formatWeight('en', 3.4)).toBe('3.4 kg');
  });

  it('não mostra zeros à direita e arredonda', () => {
    expect(formatSize('pt', 62)).toBe('62 cm');
    expect(formatSize('pt', 62.04)).toBe('62 cm');
    expect(formatNumber('en', 1.256, 2)).toBe('1.26');
  });
});

describe('parseDecimal', () => {
  it('aceita vírgula ou ponto', () => {
    expect(parseDecimal('62')).toBe(62);
    expect(parseDecimal(' 62,5 ')).toBe(62.5);
    expect(parseDecimal('62.5')).toBe(62.5);
  });

  it('recusa o que não é número', () => {
    expect(parseDecimal('')).toBeNull();
    expect(parseDecimal('abc')).toBeNull();
    expect(parseDecimal('-3')).toBeNull();
    expect(parseDecimal('1,2,3')).toBeNull();
  });
});

describe('formatRelativeTime', () => {
  const now = new Date('2026-11-27T12:00:00Z');
  const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();

  it('cobre agora, minutos, horas, ontem e dias', () => {
    expect(formatRelativeTime('pt', ago(10_000), now)).toBe('agora');
    expect(formatRelativeTime('pt', ago(5 * 60_000), now)).toBe('há 5 min');
    expect(formatRelativeTime('es', ago(2 * 3_600_000), now)).toBe('hace 2 h');
    expect(formatRelativeTime('en', ago(30 * 3_600_000), now)).toBe('yesterday');
    expect(formatRelativeTime('pt', ago(3 * 86_400_000), now)).toBe('há 3 dias');
  });

  it('mostra a data depois de 30 dias e trata data futura como agora', () => {
    const old = ago(40 * 86_400_000);
    expect(formatRelativeTime('pt', old, now)).toBe(formatDate('pt', new Date(old)));
    expect(formatRelativeTime('pt', new Date(now.getTime() + 60_000).toISOString(), now)).toBe('agora');
  });
});

describe('formatDate', () => {
  it('ordena dia/mês conforme o idioma', () => {
    const d = new Date(2026, 8, 20);
    expect(formatDate('pt', d)).toBe('20/09/2026');
    expect(formatDate('en', d)).toBe('09/20/2026');
  });
});
