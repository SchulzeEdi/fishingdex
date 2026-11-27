import { sessionActions } from '@/entities/user';
import { getSupabase, toAppError } from '@/shared/api';

/**
 * Compra de DEMONSTRAÇÃO: o servidor ativa o Pro sem cobrança enquanto
 * app_settings.demo_purchases = true. Antes da produção, trocar pelo Google Play Billing via
 * RevenueCat (ADR-0004, DT-07) — a Play exige Billing para assinatura digital.
 */
async function setPlan(plan: 'free' | 'pro'): Promise<void> {
  const { error } = await getSupabase().rpc('set_demo_plan', { p_plan: plan });
  if (error) throw toAppError(error);
  sessionActions.patchProfile({ plan });
}

export const demoPurchase = {
  async subscribe(): Promise<'purchased'> {
    await setPlan('pro');
    return 'purchased';
  },
  /** Nada a restaurar sem loja: devolve "none". */
  async restore(): Promise<'none'> {
    return 'none';
  },
  async cancel(): Promise<void> {
    await setPlan('free');
  },
};
