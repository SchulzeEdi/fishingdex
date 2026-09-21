import type { SubscriptionStatus } from '@/entities/subscription';

/** Evento normalizado vindo de um provider (RevenueCat/Stripe) — ver monetization.md. */
export interface SubscriptionEvent {
  eventId: string;
  userId: string;
  status: SubscriptionStatus;
  currentPeriodEnd?: Date | null;
}

/**
 * Contrato de provider de pagamento (PaymentProvider). Implementações reais:
 * RevenueCat (IAP, assinatura Pro) e Stripe (listagem). Aqui definimos só a fronteira;
 * os adapters concretos entram quando as contas existirem (ADR-0004).
 */
export interface PaymentProvider {
  readonly kind: 'iap' | 'stripe';
  /** Traduz o payload cru do webhook em um evento normalizado (ou null se ignorável). */
  parseWebhook(payload: unknown): SubscriptionEvent | null;
}
