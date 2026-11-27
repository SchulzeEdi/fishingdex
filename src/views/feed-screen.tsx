import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { CatchCard, catchActions, type CatchCardChip } from '@/entities/catch';
import { SPECIES_SEED, speciesName } from '@/entities/fish-species';
import { usePlan, useProfile } from '@/entities/user';
import { canViewSocial, LockedContent } from '@/features/subscribe-pro';
import { formatRelativeTime, formatSize, formatWeight, useI18n, type Translate } from '@/shared/i18n';
import { EmptyState, Screen, ScreenHeader, columnStyle, spacing } from '@/shared/ui';
import { useCommunityFeed, useLeaderboard, type FeedItem } from '@/widgets/community';

import { TAB_BAR_SPACE } from './layout';

const SPECIES = new Map(SPECIES_SEED.map((s) => [s.id, s]));
const MONTH = { period: 'month' } as const;

function chipsOf(item: FeedItem, t: Translate, locale: 'pt' | 'es' | 'en'): CatchCardChip[] {
  const chips: CatchCardChip[] = [];
  if (item.bait) chips.push({ label: t('catch.bait'), value: item.bait });
  if (item.weightKg) chips.push({ label: t('register.weight'), value: formatWeight(locale, item.weightKg) });
  if (item.isPrivate) chips.push({ icon: 'lock', label: t('feed.privatePlace') });
  return chips;
}

export function FeedScreen() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const plan = usePlan();
  const profile = useProfile();
  const feed = useCommunityFeed();
  const monthRanking = useLeaderboard(MONTH);

  const podium = useMemo(
    () => new Map(monthRanking.filter((r) => r.position <= 3).map((r) => [r.id, r.position])),
    [monthRanking],
  );

  const renderCard = (item: FeedItem) => {
    const species = SPECIES.get(item.speciesId);
    const name = species ? speciesName(species, locale) : item.speciesId;
    const when = formatRelativeTime(locale, item.caughtAt);
    const meta = !item.isPrivate && item.place ? `${when} · ${item.place}` : when;
    const position = podium.get(item.id);
    return (
      <CatchCard
        authorName={item.isMine ? t('feed.you') : item.authorName}
        authorCountry={item.authorCountry}
        meta={meta}
        photoUri={item.photoUrl}
        speciesName={name}
        sizeLabel={formatSize(locale, item.sizeCm)}
        chips={chipsOf(item, t, locale)}
        likes={item.likes}
        liked={item.liked}
        rankTag={position ? t('feed.rankTag', { position }) : undefined}
        onToggleLike={() => catchActions.toggleLike(item.id)}
        onOpenSpecies={() => router.push(`/species/${item.speciesId}`)}
      />
    );
  };

  const header = <ScreenHeader title={t('feed.title')} subtitle={t('feed.subtitle')} />;

  if (!canViewSocial(plan)) {
    return (
      <Screen>
        <View style={styles.padded}>{header}</View>
        <View style={[styles.padded, styles.fill]}>
          <LockedContent
            icon="feed"
            title={t('paywall.feedTitle')}
            message={t('paywall.feedMessage')}
            country={profile?.country}
          >
            <View style={styles.list}>{feed.slice(0, 2).map((item) => <View key={item.id}>{renderCard(item)}</View>)}</View>
          </LockedContent>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={feed}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => renderCard(item)}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <EmptyState
            icon="camera"
            title={t('feed.emptyTitle')}
            message={t('feed.emptyMessage')}
            actionLabel={t('catch.register')}
            onAction={() => router.push('/register')}
          />
        }
        contentContainerStyle={[styles.padded, styles.list, columnStyle, { paddingBottom: TAB_BAR_SPACE }]}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  padded: { paddingHorizontal: spacing.lg },
  fill: { flex: 1 },
  list: { gap: spacing.md },
});
