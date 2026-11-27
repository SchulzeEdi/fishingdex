import { Linking, Platform } from 'react-native';
import Purchases, { PACKAGE_TYPE, type PurchasesPackage } from 'react-native-purchases';

import { sessionActions, type Plan } from '@/entities/user';
import { AppError, getSupabase, toAppError } from '@/shared/api';
import { env } from '@/shared/config';

/** Entitlement do RevenueCat que libera o Pro (mesmo nome no painel). */
export const PRO_ENTITLEMENT = 'pro';
const PACKAGE_NAME = 'com.schulzeedi.fishingdex';

export type ProPeriod = 'monthly' | 'yearly';

export interface ProOffer {
  period: ProPeriod;
  /** Preço da loja, já na moeda da conta Google Play ("R$ 19,90"). */
  priceLabel: string;
  productId: string;
  pkg: PurchasesPackage;
}

let connectedUser: string | null = null;

/**
 * Cobrança real (Google Play Billing via RevenueCat — ADR-0004) só no Android e com a chave
 * pública configurada no build. Sem ela, o app segue com a compra de demonstração.
 */
export function isRealBillingEnabled(): boolean {
  return Platform.OS === 'android' && env.revenueCatAndroidKey.length > 0;
}

/** Liga o RevenueCat ao usuário logado (appUserID = id do Supabase, usado pelo webhook). */
export async function connectBilling(userId: string): Promise<void> {
  if (!isRealBillingEnabled() || connectedUser === userId) return;
  if (connectedUser === null && !(await Purchases.isConfigured())) {
    Purchases.configure({ apiKey: env.revenueCatAndroidKey, appUserID: userId });
  } else {
    await Purchases.logIn(userId);
  }
  connectedUser = userId;
}

export async function disconnectBilling(): Promise<void> {
  if (!connectedUser) return;
  connectedUser = null;
  await Purchases.logOut().catch(() => undefined);
}

/** Planos à venda (oferta atual do painel do RevenueCat: mensal e anual). */
export async function fetchProOffers(): Promise<ProOffer[]> {
  const offerings = await Purchases.getOfferings();
  const packages = offerings.current?.availablePackages ?? [];
  const offers: ProOffer[] = [];
  for (const pkg of packages) {
    const period: ProPeriod | null =
      pkg.packageType === PACKAGE_TYPE.MONTHLY ? 'monthly' : pkg.packageType === PACKAGE_TYPE.ANNUAL ? 'yearly' : null;
    if (period) {
      offers.push({ period, priceLabel: pkg.product.priceString, productId: pkg.product.identifier, pkg });
    }
  }
  return offers.sort((a, b) => (a.period === 'monthly' ? -1 : b.period === 'monthly' ? 1 : 0));
}

/**
 * Pede ao servidor para conferir a assinatura no RevenueCat e gravar o plano (o app nunca
 * troca o próprio plano). Devolve o plano atualizado.
 */
export async function syncSubscription(): Promise<Plan> {
  const { data, error } = await getSupabase().functions.invoke<{ plan: Plan }>('sync-subscription', {
    method: 'POST',
  });
  if (error || !data) throw toAppError(error ?? new Error('sync_failed'));
  sessionActions.patchProfile({ plan: data.plan });
  return data.plan;
}

/** Compra o plano escolhido na Google Play. "cancelled" quando a pessoa fecha a tela da loja. */
export async function purchaseProOffer(offer: ProOffer): Promise<'purchased' | 'cancelled'> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(offer.pkg);
    if (customerInfo.entitlements.active[PRO_ENTITLEMENT]) sessionActions.patchProfile({ plan: 'pro' });
  } catch (e) {
    const err = e as { userCancelled?: boolean | null; code?: string };
    if (err.userCancelled || err.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      return 'cancelled';
    }
    throw toAppError(e);
  }
  // O webhook também atualiza; aqui garantimos na hora. Se falhar, o webhook resolve.
  await syncSubscription().catch(() => undefined);
  return 'purchased';
}

/** Restaurar compra (obrigatório nas lojas): reativa uma assinatura feita em outro aparelho. */
export async function restoreProPurchase(): Promise<'restored' | 'none'> {
  const info = await Purchases.restorePurchases();
  const plan = await syncSubscription().catch(() => null);
  return info.entitlements.active[PRO_ENTITLEMENT] || plan === 'pro' ? 'restored' : 'none';
}

/**
 * Confere na abertura do app se a assinatura mudou (renovou, expirou, foi cancelada fora do
 * app) e alinha o plano pelo servidor.
 */
export async function reconcileSubscription(currentPlan: Plan): Promise<void> {
  if (!isRealBillingEnabled()) return;
  const info = await Purchases.getCustomerInfo();
  const storePlan: Plan = info.entitlements.active[PRO_ENTITLEMENT] ? 'pro' : 'free';
  if (storePlan !== currentPlan) await syncSubscription();
}

/** Gerenciar/cancelar na Google Play (exigência da política de assinaturas). */
export async function openManageSubscriptions(productId?: string): Promise<void> {
  const sku = productId ? `sku=${encodeURIComponent(productId)}&` : '';
  const url = `https://play.google.com/store/account/subscriptions?${sku}package=${PACKAGE_NAME}`;
  if (!(await Linking.canOpenURL(url))) throw new AppError('unknown', 'play_unavailable');
  await Linking.openURL(url);
}
