import type { Catch } from './catch';

/** Capturas no mês corrente (UTC) — base da cota do Free (D-9). */
export function catchesThisMonth(catches: readonly Catch[], now: Date = new Date()): number {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  return catches.filter((c) => {
    const d = new Date(c.caughtAt);
    return d.getUTCFullYear() === y && d.getUTCMonth() === m;
  }).length;
}

/** Maior captura (por tamanho), opcionalmente de uma espécie. */
export function biggestCatch(catches: readonly Catch[], speciesId?: string): Catch | null {
  let best: Catch | null = null;
  for (const c of catches) {
    if (speciesId && c.speciesId !== speciesId) continue;
    if (!best || c.sizeCm > best.sizeCm) best = c;
  }
  return best;
}

/** Mais recentes primeiro (não muta a entrada). */
export function sortByRecent<T extends Catch>(catches: readonly T[]): T[] {
  return [...catches].sort((a, b) => b.caughtAt.localeCompare(a.caughtAt));
}

/** Liga/desliga um id numa lista (curtidas). */
export function toggleId(ids: readonly string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
}
