import type { Plan } from '@/entities/user';

/** Free registra até 3 capturas/mês (D-9). */
export const FREE_MONTHLY_CATCH_LIMIT = 3;

/** Free é isolado: não vê feed nem ranking (D-9). Só Pro tem o social. */
export function canViewSocial(plan: Plan): boolean {
  return plan === 'pro';
}

/** Free não aparece pros outros nem vê os outros. */
export function isVisibleToOthers(plan: Plan): boolean {
  return plan === 'pro';
}

/** Pode registrar mais uma captura neste mês? Pro é ilimitado; Free até o limite. */
export function canRegisterCatch(plan: Plan, catchesThisMonth: number): boolean {
  if (plan === 'pro') return true;
  return catchesThisMonth < FREE_MONTHLY_CATCH_LIMIT;
}

/** Quantas capturas ainda restam no mês (Infinity para Pro). */
export function remainingCatches(plan: Plan, catchesThisMonth: number): number {
  if (plan === 'pro') return Number.POSITIVE_INFINITY;
  return Math.max(0, FREE_MONTHLY_CATCH_LIMIT - catchesThisMonth);
}
