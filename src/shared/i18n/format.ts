import { translate } from './i18n';
import type { Locale } from './messages';

/**
 * Número com no máximo `maxFraction` casas, sem zeros à direita. Vírgula decimal em pt/es,
 * ponto em en (regra de conteúdo do design system).
 */
export function formatNumber(locale: Locale, value: number, maxFraction = 1): string {
  const factor = 10 ** maxFraction;
  const rounded = Math.round(value * factor) / factor;
  const text = String(rounded);
  return locale === 'en' ? text : text.replace('.', ',');
}

/** "62 cm" — medida sempre com espaço e unidade. */
export function formatSize(locale: Locale, cm: number): string {
  return `${formatNumber(locale, cm)} cm`;
}

/** "3,4 kg". */
export function formatWeight(locale: Locale, kg: number): string {
  return `${formatNumber(locale, kg)} kg`;
}

/** Aceita "62", "62,5" e "62.5". Devolve null se não for número. */
export function parseDecimal(input: string): number | null {
  const normalized = input.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const pad = (n: number) => String(n).padStart(2, '0');

/** Data numérica curta: dd/mm/aaaa (pt/es) ou mm/dd/yyyy (en). */
export function formatDate(locale: Locale, date: Date): string {
  const d = pad(date.getDate());
  const m = pad(date.getMonth() + 1);
  const y = date.getFullYear();
  return locale === 'en' ? `${m}/${d}/${y}` : `${d}/${m}/${y}`;
}

/** "há 2 h", "ontem", "há 3 dias"; além de 30 dias, a data. */
export function formatRelativeTime(locale: Locale, iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const diff = Math.max(0, now.getTime() - then.getTime());
  if (diff < MINUTE) return translate(locale, 'time.now');
  if (diff < HOUR) return translate(locale, 'time.minutes', { n: Math.floor(diff / MINUTE) });
  if (diff < DAY) return translate(locale, 'time.hours', { n: Math.floor(diff / HOUR) });
  if (diff < 2 * DAY) return translate(locale, 'time.yesterday');
  if (diff < 30 * DAY) return translate(locale, 'time.days', { n: Math.floor(diff / DAY) });
  return formatDate(locale, then);
}
