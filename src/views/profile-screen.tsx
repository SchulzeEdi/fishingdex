import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { CatchRow, biggestCatch, catchesThisMonth, sortByRecent, useMyCatches } from '@/entities/catch';
import { SPECIES_SEED, speciesName } from '@/entities/fish-species';
import { usePlan, useProfile } from '@/entities/user';
import { unlockedSpeciesIds } from '@/features/dex-collection';
import {
  FREE_MONTHLY_CATCH_LIMIT,
  PlanBadge,
  ProCta,
  QuotaMeter,
  canViewSocial,
  demoPurchase,
  isRealBillingEnabled,
  openManageSubscriptions,
} from '@/features/subscribe-pro';
import { deleteAccount, signOut } from '@/features/session';
import { CurrencyPicker, LanguagePicker } from '@/widgets/preferences';
import { formatRelativeTime, formatSize, useI18n } from '@/shared/i18n';
import {
  AppText,
  Avatar,
  Button,
  EmptyState,
  Flag,
  Screen,
  radius,
  spacing,
  useTheme,
} from '@/shared/ui';

import { TAB_BAR_SPACE } from './layout';

const SPECIES = new Map(SPECIES_SEED.map((s) => [s.id, s]));

function Stat({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <AppText variant="metric" tabular align="center">
        {value}
      </AppText>
      <AppText variant="caption" tone="textMuted" align="center">
        {label}
      </AppText>
    </View>
  );
}

export function ProfileScreen() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const profile = useProfile();
  const plan = usePlan();
  const catches = useMyCatches();
  const isPro = canViewSocial(plan);
  const record = biggestCatch(catches);
  const name = profile?.name ?? '';
  const [busy, setBusy] = useState<'signOut' | 'delete' | 'plan' | null>(null);

  const run = async (kind: 'signOut' | 'delete' | 'plan', action: () => Promise<unknown>) => {
    setBusy(kind);
    try {
      await action();
    } catch {
      Alert.alert(t('error.offlineTitle'), t('error.unknown'));
    } finally {
      setBusy(null);
    }
  };

  const confirmDelete = () =>
    Alert.alert(t('auth.deleteConfirmTitle'), t('auth.deleteConfirmMessage'), [
      { text: t('register.cancel'), style: 'cancel' },
      { text: t('auth.deleteConfirm'), style: 'destructive', onPress: () => run('delete', deleteAccount) },
    ]);

  return (
    <Screen scroll bottomInset={TAB_BAR_SPACE}>
      <View style={styles.top}>
        <Avatar name={name} size="lg" />
        <View style={styles.nameRow}>
          <AppText variant="heading" accessibilityRole="header">
            {name}
          </AppText>
          {profile?.country ? <Flag code={profile.country} /> : null}
        </View>
        {profile?.email ? (
          <AppText variant="caption" tone="textMuted">
            {profile.email}
          </AppText>
        ) : null}
        <PlanBadge plan={plan} />
      </View>

      <View style={styles.stats}>
        <Stat label={t('profile.catches')} value={String(catches.length)} />
        <Stat label={t('profile.species')} value={String(unlockedSpeciesIds(catches).size)} />
        <Stat label={t('profile.record')} value={record ? formatSize(locale, record.sizeCm) : '—'} />
      </View>

      {!isPro ? (
        <View style={styles.section}>
          <QuotaMeter used={catchesThisMonth(catches)} limit={FREE_MONTHLY_CATCH_LIMIT} />
          <ProCta country={profile?.country} />
        </View>
      ) : null}

      <View style={styles.section}>
        <AppText variant="heading">{t('prefs.title')}</AppText>
        <LanguagePicker />
        <CurrencyPicker />
      </View>

      <View style={styles.section}>
        <AppText variant="heading">{t('profile.myCatches')}</AppText>
        {catches.length === 0 ? (
          <EmptyState
            icon="camera"
            title={t('profile.emptyTitle')}
            message={t('feed.emptyMessage')}
            actionLabel={t('catch.register')}
            onAction={() => router.push('/register')}
          />
        ) : (
          <View>
            {sortByRecent(catches).map((c) => {
              const s = SPECIES.get(c.speciesId);
              const when = formatRelativeTime(locale, c.caughtAt);
              return (
                <CatchRow
                  key={c.id}
                  speciesName={s ? speciesName(s, locale) : c.speciesId}
                  sizeLabel={formatSize(locale, c.sizeCm)}
                  meta={!c.isPrivate && c.place ? `${when} · ${c.place}` : when}
                  photoUri={c.photoUrl}
                  onPress={() => router.push(`/species/${c.speciesId}`)}
                />
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <Button
          label={t('profile.edit')}
          variant="secondary"
          icon="user"
          block
          onPress={() => router.push('/profile-edit')}
        />
        <Button
          label={t('auth.signOut')}
          variant="secondary"
          block
          loading={busy === 'signOut'}
          onPress={() => run('signOut', signOut)}
        />
        {isPro && isRealBillingEnabled() ? (
          <Button
            label={t('paywall.manage')}
            variant="secondary"
            icon="star"
            block
            onPress={() => run('plan', () => openManageSubscriptions())}
          />
        ) : null}
        {isPro && !isRealBillingEnabled() ? (
          <Button
            label={t('profile.backToFree')}
            variant="ghost"
            loading={busy === 'plan'}
            onPress={() => run('plan', demoPurchase.cancel)}
            style={styles.center}
          />
        ) : null}
        <Button
          label={t('auth.deleteAccount')}
          variant="ghost"
          loading={busy === 'delete'}
          onPress={confirmDelete}
          style={styles.center}
        />
      </View>

      {isRealBillingEnabled() ? null : (
        <AppText variant="caption" tone="textMuted" align="center" style={styles.note}>
          {t('app.demoNote')}
        </AppText>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'center', gap: spacing.sm, paddingTop: spacing.xxl },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  stats: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  stat: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.lg, borderWidth: 1, gap: 2 },
  section: { gap: spacing.md, marginTop: spacing.xl },
  actions: { gap: spacing.sm, marginTop: spacing.xl },
  center: { alignSelf: 'center' },
  note: { marginTop: spacing.lg },
});
