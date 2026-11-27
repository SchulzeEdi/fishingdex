/** Id local curto e único o bastante para registros do aparelho (até a API gerar UUID). */
export function createId(prefix = 'loc', now: number = Date.now(), rand: () => number = Math.random): string {
  const r = Math.floor(rand() * 0xffffff)
    .toString(36)
    .padStart(5, '0');
  return `${prefix}_${now.toString(36)}${r}`;
}
