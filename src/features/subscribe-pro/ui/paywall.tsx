import { useState, type ReactNode } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';

import { useCurrencyPreference } from '@/shared/config';
import { useI18n } from '@/shared/i18n';
import { useAsync } from '@/shared/lib';
import { AppText, Button, Icon, SegmentedControl, radius, spacing, useTheme, type IconName } from '@/shared/ui';

import {
  fetchProOffers,
  isRealBillingEnabled,
  purchaseProOffer,
  restoreProPurchase,
  type ProPeriod,
} from '../api/billing';
import { demoPurchase } from '../api/purchase.client';
import { proPriceLabels, resolveCurrency } from '../model/prices';

interface PaywallCardProps {
  icon: IconName;
  title: string;
  message: string;
  /** País do usuário (define moeda do preço). */
  country?: string | null;
}

/** CTA de demonstração (sem chave do RevenueCat no build): ativa o Pro sem cobrança. */
function DemoProCta({ country }: { country?: string | null }) {
  const { t, locale } = useI18n();
  const [busy, setBusy] = useState(false);
  // Moeda escolhida em Perfil › Preferências (ou a do país).
  const price = proPriceLabels(resolveCurrency(useCurrencyPreference(), country), locale);

  const subscribe = async () => {
    setBusy(true);
    try {
      await demoPurchase.subscribe();
    } catch {
      Alert.alert(t('paywall.cta'), t('error.unknown'));
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    const result = await demoPurchase.restore();
    if (result === 'none') Alert.alert(t('paywall.restore'), t('paywall.restoreNone'));
  };

  return (
    <View>
      <Button label={t('paywall.cta')} variant="pro" icon="star-fill" block loading={busy} onPress={subscribe} />
      <AppText variant="caption" tone="textMuted" align="center" style={styles.price}>
        {t('paywall.price', price)}
      </AppText>
      <Button label={t('paywall.restore')} variant="ghost" onPress={restore} style={styles.restore} />
    </View>
  );
}

/** CTA real: planos e preços da Google Play (RevenueCat), compra e restaurar. */
function StoreProCta() {
  const { t } = useI18n();
  const offers = useAsync(fetchProOffers, 'pro-offers');
  const [period, setPeriod] = useState<ProPeriod>('monthly');
  const [busy, setBusy] = useState<'buy' | 'restore' | null>(null);
  const list = offers.data ?? [];
  const selected = list.find((o) => o.period === period) ?? list[0];

  const subscribe = async () => {
    if (!selected) return;
    setBusy('buy');
    try {
      await purchaseProOffer(selected);
    } catch {
      Alert.alert(t('paywall.cta'), t('paywall.purchaseFailed'));
    } finally {
      setBusy(null);
    }
  };

  const restore = async () => {
    setBusy('restore');
    try {
      const result = await restoreProPurchase();
      Alert.alert(t('paywall.restore'), t(result === 'restored' ? 'paywall.restored' : 'paywall.restoreNone'));
    } catch {
      Alert.alert(t('paywall.restore'), t('error.unknown'));
    } finally {
      setBusy(null);
    }
  };

  if (offers.status === 'error' || (offers.status === 'ready' && list.length === 0)) {
    return (
      <View style={styles.storeCta}>
        <AppText variant="label" tone="textMuted" align="center">
          {t('paywall.unavailable')}
        </AppText>
        <Button label={t('error.retry')} variant="secondary" block onPress={offers.refresh} />
      </View>
    );
  }

  return (
    <View style={styles.storeCta}>
      {list.length > 1 ? (
        <SegmentedControl
          accessibilityLabel={t('paywall.plan')}
          stretch
          value={period}
          onChange={setPeriod}
          options={list.map((o) => ({
            value: o.period,
            label: t(o.period === 'monthly' ? 'paywall.monthly' : 'paywall.yearly'),
          }))}
        />
      ) : null}
      <Button
        label={t('paywall.cta')}
        variant="pro"
        icon="star-fill"
        block
        loading={busy === 'buy' || !selected}
        disabled={!selected}
        onPress={subscribe}
      />
      <AppText variant="caption" tone="textMuted" align="center">
        {selected
          ? t(selected.period === 'monthly' ? 'paywall.perMonth' : 'paywall.perYear', { price: selected.priceLabel })
          : ' '}
      </AppText>
      <AppText variant="caption" tone="textMuted" align="center">
        {t('paywall.renewNote')}
      </AppText>
      <Button
        label={t('paywall.restore')}
        variant="ghost"
        loading={busy === 'restore'}
        onPress={restore}
        style={styles.restore}
      />
    </View>
  );
}

/** CTA do Pro: "Assinar Pro" (laranja reservado), preço logo abaixo e "Restaurar compra". */
export function ProCta({ country }: { country?: string | null }) {
  return isRealBillingEnabled() ? <StoreProCta /> : <DemoProCta country={country} />;
}

/**
 * Card de venda do Pro: marca, título, frase, 3 benefícios e o CTA (único laranja da tela
 * fora do ranking).
 */
export function PaywallCard({ icon, title, message, country }: PaywallCardProps) {
  const { colors, shadow } = useTheme();
  const { t } = useI18n();

  return (
    <View
      accessibilityRole="summary"
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border, boxShadow: shadow.lg },
      ]}
    >
      <View style={[styles.mark, { backgroundColor: colors.primary }]}>
        <Icon name={icon} size={24} color={colors.primaryForeground} />
      </View>
      <AppText variant="heading" align="center" accessibilityRole="header">
        {title}
      </AppText>
      <AppText variant="label" tone="textMuted" align="center" style={styles.message}>
        {message}
      </AppText>
      <View style={styles.perks}>
        {(['paywall.perkRanking', 'paywall.perkFeed', 'paywall.perkUnlimited'] as const).map((k) => (
          <View key={k} style={styles.perk}>
            <Icon name="check" size={18} color={colors.accentInk} />
            <AppText variant="label" style={styles.perkText}>
              {t(k)}
            </AppText>
          </View>
        ))}
      </View>
      <ProCta country={country} />
    </View>
  );
}

interface LockedContentProps extends PaywallCardProps {
  /** Conteúdo real, desfocado e sem interação por trás do card. */
  children: ReactNode;
}

/** Bloqueado é estado nativo: o conteúdo real aparece desfocado atrás do paywall. */
export function LockedContent({ children, ...card }: LockedContentProps) {
  const { scheme } = useTheme();
  return (
    <View style={styles.locked}>
      <View
        pointerEvents="none"
        aria-hidden
        style={[styles.lockedContent, Platform.OS !== 'ios' && styles.blur]}
      >
        {children}
      </View>
      <View
        style={[
          styles.veil,
          { backgroundColor: scheme === 'dark' ? 'rgba(7, 21, 25, 0.55)' : 'rgba(247, 245, 240, 0.55)' },
        ]}
      >
        <PaywallCard {...card} />
      </View>
    </View>
  );
}

/** Pips da cota grátis do mês (perfil e registrar). */
export function QuotaMeter({ used, limit }: { used: number; limit: number }) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const shown = Math.min(used, limit);
  return (
    <View
      accessible
      accessibilityLabel={t('quota.used', { used: shown, limit })}
      style={[styles.quota, { backgroundColor: colors.surfaceMuted }]}
    >
      <View style={styles.pips}>
        {Array.from({ length: limit }, (_, i) => (
          <View
            key={i}
            style={[
              styles.pip,
              { borderColor: colors.primary, backgroundColor: i < shown ? colors.primary : 'transparent' },
            ]}
          />
        ))}
      </View>
      <AppText variant="label" style={styles.quotaText}>
        {t('quota.used', { used: shown, limit })}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: 'stretch',
  },
  mark: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  message: { marginTop: spacing.xs, marginBottom: spacing.lg },
  perks: { gap: spacing.sm, marginBottom: spacing.lg },
  perk: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  perkText: { flex: 1 },
  price: { marginTop: spacing.sm },
  storeCta: { gap: spacing.sm },
  restore: { alignSelf: 'center', marginTop: spacing.xs },
  locked: { flex: 1, overflow: 'hidden', borderRadius: radius.lg },
  lockedContent: { opacity: 0.7 },
  blur: { filter: [{ blur: 6 }] },
  veil: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  quota: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  pips: { flexDirection: 'row', gap: spacing.xxs },
  pip: { width: 10, height: 10, borderRadius: radius.full, borderWidth: 1.5 },
  quotaText: { flex: 1 },
});
