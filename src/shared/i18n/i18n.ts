import { MESSAGES, type Locale, type Messages } from './messages';

export const SUPPORTED_LOCALES: readonly Locale[] = ['pt', 'es', 'en'];
export const DEFAULT_LOCALE: Locale = 'en';

/** Resolve o locale do device (ex.: "pt-BR", "es-AR") para um dos suportados. */
export function resolveLocale(deviceLocale: string | undefined | null): Locale {
  if (!deviceLocale) return DEFAULT_LOCALE;
  const base = deviceLocale.toLowerCase().split(/[-_]/)[0] ?? '';
  return (SUPPORTED_LOCALES as readonly string[]).includes(base)
    ? (base as Locale)
    : DEFAULT_LOCALE;
}

/**
 * Traduz uma chave no locale dado, interpolando {param}.
 * Faz fallback para o DEFAULT_LOCALE se a chave faltar no locale.
 */
export function translate(
  locale: Locale,
  key: keyof Messages,
  params?: Record<string, string | number>,
): string {
  const table = MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE];
  const template = table[key] ?? MESSAGES[DEFAULT_LOCALE][key];
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}
