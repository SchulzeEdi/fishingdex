import { sessionActions } from '@/entities/user';

/**
 * Compra de DEMONSTRAÇÃO: ativa o Pro só neste aparelho. Antes de publicar em produção,
 * trocar pelo fluxo do Google Play Billing via RevenueCat (ADR-0004, DT-05) — a Play exige
 * Billing para assinatura digital.
 */
export const demoPurchase = {
  async subscribe(): Promise<'purchased'> {
    sessionActions.setPlan('pro');
    return 'purchased';
  },
  /** Nada a restaurar sem loja: devolve "none". */
  async restore(): Promise<'none'> {
    return 'none';
  },
  cancel() {
    sessionActions.setPlan('free');
  },
};
