import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';

import { LOCAL_USER_ID } from '@/entities/catch';
import { SPECIES_SEED, speciesName } from '@/entities/fish-species';
import { COUNTRIES, usePlan, useProfile } from '@/entities/user';
import {
  Podium,
  RankingRow,
  type LeaderboardRow,
  type PodiumSpot,
  type RankingPeriod,
} from '@/features/ranking';
import { canViewSocial, LockedContent } from '@/features/subscribe-pro';
import { formatSize, useI18n } from '@/shared/i18n';
import {
  EmptyState,
  FilterChip,
  Screen,
  ScreenHeader,
  SegmentedControl,
  columnStyle,
  spacing,
} from '@/shared/ui';
import { useLeaderboard } from '@/widgets/community';

import { TAB_BAR_SPACE } from './layout';

const SPECIES = new Map(SPECIES_SEED.map((s) => [s.id, s]));

export function RankingScreen() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const plan = usePlan();
  const profile = useProfile();
  const [period, setPeriod] = useState<RankingPeriod>('year');
  const [country, setCountry] = useState<string | undefined>(undefined);
  const scope = useMemo(() => ({ period, country }), [period, country]);
  const rows = useLeaderboard(scope);

  const nameOf = (r: LeaderboardRow) => (r.userId === LOCAL_USER_ID ? t('feed.you') : r.authorName);
  const speciesOf = (id: string) => {
    const s = SPECIES.get(id);
    return s ? speciesName(s, locale) : id;
  };

  const podium: PodiumSpot[] = rows.slice(0, 3).map((r) => ({
    position: r.position as 1 | 2 | 3,
    name: nameOf(r),
    country: r.country,
    speciesName: speciesOf(r.speciesId),
    sizeLabel: formatSize(locale, r.sizeCm),
  }));
  const rest = rows.slice(3);

  const controls = (
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
  );

  const header = (
    <View>
      <ScreenHeader title={t('ranking.title')} subtitle={t('ranking.subtitle')} />
      {controls}
      {podium.length > 0 ? (
        <View style={styles.podium}>
          <Podium spots={podium} />
        </View>
      ) : null}
    </View>
  );

  const renderRow = (r: LeaderboardRow) => (
    <RankingRow
      position={r.position}
      name={nameOf(r)}
      country={r.country}
      speciesName={speciesOf(r.speciesId)}
      sizeLabel={formatSize(locale, r.sizeCm)}
      photoUri={r.photoUrl}
      isMe={r.userId === LOCAL_USER_ID}
    />
  );

  if (!canViewSocial(plan)) {
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
            {podium.length > 0 ? <Podium spots={podium} /> : null}
            {rest.slice(0, 6).map((r) => (
              <View key={r.id}>{renderRow(r)}</View>
            ))}
          </LockedContent>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={rest}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => renderRow(item)}
        ListHeaderComponent={header}
        ListEmptyComponent={
          podium.length === 0 ? (
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
