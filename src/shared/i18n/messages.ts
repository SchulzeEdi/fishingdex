export type Locale = 'pt' | 'es' | 'en';

/** Chaves de mensagem do app. Manter as 3 traduções em sincronia. */
export interface Messages {
  'app.tagline': string;
  'dex.title': string;
  'dex.progress': string; // usa {unlocked} de {total}
  'dex.locked': string;
  'catch.register': string;
  'catch.sizeRequired': string;
  'ranking.title': string;
  'paywall.cta': string;
}

export const MESSAGES: Record<Locale, Messages> = {
  pt: {
    'app.tagline': 'Seu diário de pesca',
    'dex.title': 'Coleção',
    'dex.progress': '{unlocked} de {total} espécies',
    'dex.locked': 'Bloqueada',
    'catch.register': 'Registrar captura',
    'catch.sizeRequired': 'Informe o tamanho para entrar no ranking',
    'ranking.title': 'Ranking do maior peixe',
    'paywall.cta': 'Assinar Pro',
  },
  es: {
    'app.tagline': 'Tu diario de pesca',
    'dex.title': 'Colección',
    'dex.progress': '{unlocked} de {total} especies',
    'dex.locked': 'Bloqueada',
    'catch.register': 'Registrar captura',
    'catch.sizeRequired': 'Indica el tamaño para entrar al ranking',
    'ranking.title': 'Ranking del pez más grande',
    'paywall.cta': 'Suscribirse a Pro',
  },
  en: {
    'app.tagline': 'Your fishing log',
    'dex.title': 'Collection',
    'dex.progress': '{unlocked} of {total} species',
    'dex.locked': 'Locked',
    'catch.register': 'Log a catch',
    'catch.sizeRequired': 'Enter the size to join the ranking',
    'ranking.title': 'Biggest catch ranking',
    'paywall.cta': 'Go Pro',
  },
};
