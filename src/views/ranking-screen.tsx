import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { SPECIES_SEED, speciesName } from '@/entities/fish-species';
import { COUNTRIES, usePlan, useProfile } from '@/entities/user';
import {
  Podium,
  RankingRow,
  RankingRowSkeleton,
  fetchRanking,
  type LeaderboardRow,
  type PodiumSpot,
  type RankingPeriod,
} from '@/features/ranking';
import { canViewSocial, LockedContent } from '@/features/subscribe-pro';
import { formatSize, useI18n } from '@/shared/i18n';
import { useAsync } from '@/shared/lib';
import {
  EmptyState,
  FilterChip,
  Screen,
  ScreenHeader,
  SegmentedControl,
  columnStyle,
  spacing,
  useTheme,
} from '@/shared/ui';

import { TAB_BAR_SPACE } from './layout';

const SPECIES = new Map(SPECIES_SEED.map((s) => [s.id, s]));

function SkeletonRows({ count }: { count: number }) {
  return (
    <View>
      {Array.from({ length: count }, (_, i) => (
        <RankingRowSkeleton key={i} />
      ))}
    </View>
  );
}

export function RankingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t, locale } = useI18n();
  const plan = usePlan();
  const profile = useProfile();
  const isPro = canViewSocial(plan);
  const [period, setPeriod] = useState<RankingPeriod>('year');
  const [country, setCountry] = useState<string | undefined>(undefined);
  const ranking = useAsync(
    () => fetchRanking({ period, country }),
    `ranking:${profile?.id}:${period}:${country ?? 'global'}`,
    isPro,
  );
  const rows = ranking.data ?? [];

  const nameOf = (r: LeaderboardRow) => (r.userId === profile?.id ? t('feed.you') : r.authorName);
  const speciesOf = (id: string) => {
    const s = SPECIES.get(id);
    return s ? speciesName(s, locale) : id;
  };

  const podium: PodiumSpot[] = rows.slice(0, 3).map((r) => ({
    position: r.position as 1 | 2 | 3,
    name: nameOf(r),
    avatarName: r.authorName,
    country: r.country,
    speciesName: speciesOf(r.speciesId),
    sizeLabel: formatSize(locale, r.sizeCm),
  }));
  const rest = rows.slice(3);

  const renderRow = (r: LeaderboardRow) => (
    <RankingRow
      position={r.position}
      name={nameOf(r)}
      country={r.country}
      speciesName={speciesOf(r.speciesId)}
      sizeLabel={formatSize(locale, r.sizeCm)}
      photoUri={r.photoUrl}
      isMe={r.userId === profile?.id}
    />
  );

  if (!isPro) {
    return (
      <Screen>
        <View style={[styles.padded, styles.fill]}>
          <ScreenHeader title={t('ranking.title')} subtitle={t('ranking.subtitle')} />
          <LockedContent
            icon="trophy"
            title={t('paywall.rankingTitle')}
            message={t('paywall.rankingMessage')}
            country={profile?.country}
          >
            <SkeletonRows count={8} />
          </LockedContent>
        </View>
      </Screen>
    );
  }

  const header = (
    <View>
      <ScreenHeader title={t('ranking.title')} subtitle={t('ranking.subtitle')} />
      <View style={styles.controls}>
        <SegmentedControl
          accessibilityLabel={t('ranking.period')}
          stretch
          value={period}
          onChange={setPeriod}
          options={[
            { value: 'month', label: t('ranking.periodMonth') },
            { value: 'year', label: t('ranking.periodYear') },
            { value: 'all', label: t('ranking.periodAll') },
          ]}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <FilterChip label={t('ranking.global')} selected={!country} onPress={() => setCountry(undefined)} />
          {COUNTRIES.map((c) => (
            <FilterChip key={c} label={t(`country.${c}`)} selected={country === c} onPress={() => setCountry(c)} />
          ))}
        </ScrollView>
      </View>
      {podium.length > 0 ? (
        <View style={styles.podium}>
          <Podium spots={podium} />
        </View>
      ) : null}
    </View>
  );

  const firstLoad = ranking.status === 'loading' && ranking.data === null;

  return (
    <Screen>
      <FlatList
        data={rest}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => renderRow(item)}
        ListHeaderComponent={header}
        refreshControl={
          <RefreshControl
            refreshing={ranking.status === 'loading' && ranking.data !== null}
            onRefresh={ranking.refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          firstLoad ? (
            <SkeletonRows count={6} />
          ) : ranking.status === 'error' ? (
            <EmptyState
              icon="wifi-off"
              title={t('error.offlineTitle')}
              message={t('error.loadRanking')}
              actionLabel={t('error.retry')}
              actionVariant="secondary"
              onAction={ranking.refresh}
            />
          ) : podium.length === 0 ? (
            <EmptyState
              icon="trophy"
              title={t('ranking.emptyTitle')}
              message={t('ranking.emptyMessage')}
              actionLabel={t('catch.register')}
              onAction={() => router.push('/register')}
            />
          ) : undefined
        }
        contentContainerStyle={[styles.padded, columnStyle, { paddingBottom: TAB_BAR_SPACE }]}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  padded: { paddingHorizontal: spacing.lg },
  fill: { flex: 1 },
  controls: { gap: spacing.md, marginBottom: spacing.xl },
  chips: { gap: spacing.sm },
  podium: { marginBottom: spacing.lg },
});
