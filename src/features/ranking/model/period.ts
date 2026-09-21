export type RankingPeriod = 'month' | 'year' | 'all';

/** Nº de capturas denunciadas para ocultar do ranking (moderação da comunidade — D-13). */
export const REPORT_HIDE_THRESHOLD = 3;

/**
 * Início do período para o recorte do ranking (calendário). Retorna null para 'all'.
 * 'month' = 1º dia do mês corrente; 'year' = 1º de janeiro do ano corrente (UTC).
 */
export function periodCutoff(period: RankingPeriod, now: Date = new Date()): Date | null {
  switch (period) {
    case 'month':
      return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    case 'year':
      return new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
    case 'all':
      return null;
  }
}
