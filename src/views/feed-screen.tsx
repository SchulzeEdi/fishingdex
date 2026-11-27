import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import {
  CatchCard,
  CatchCardSkeleton,
  fetchFeed,
  reportCatch,
  setLike,
  type CatchCardChip,
  type FeedItem,
} from '@/entities/catch';
import { SPECIES_SEED, speciesName } from '@/entities/fish-species';
import { usePlan, useProfile } from '@/entities/user';
import { fetchRanking } from '@/features/ranking';
import { canViewSocial, LockedContent } from '@/features/subscribe-pro';
import { useI18n, formatRelativeTime, formatSize, formatWeight, type Locale, type Translate } from '@/shared/i18n';
import { useAsync } from '@/shared/lib';
import { EmptyState, Screen, ScreenHeader, columnStyle, spacing, useTheme } from '@/shared/ui';

import { TAB_BAR_SPACE } from './layout';

const SPECIES = new Map(SPECIES_SEED.map((s) => [s.id, s]));

function chipsOf(item: FeedItem, t: Translate, locale: Locale): CatchCardChip[] {
  const chips: CatchCardChip[] = [];
  if (item.bait) chips.push({ label: t('catch.bait'), value: item.bait });
  if (item.weightKg) chips.push({ label: t('register.weight'), value: formatWeight(locale, item.weightKg) });
  if (item.isPrivate) chips.push({ icon: 'lock', label: t('feed.privatePlace') });
  return chips;
}

/** Recarrega quando a aba volta a ficar visível (ex.: depois de registrar uma captura). */
function useRefreshOnFocus(refresh: () => void) {
  const first = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (first.current) {
        first.current = false;
        return;
      }
      refresh();
    }, [refresh]),
  );
}

export function FeedScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t, locale } = useI18n();
  const plan = usePlan();
  const profile = useProfile();
  const isPro = canViewSocial(plan);
  const feed = useAsync(() => fetchFeed(), `feed:${profile?.id}`, isPro);
  const top = useAsync(() => fetchRanking({ period: 'month' }, 3), `top:${profile?.id}`, isPro);
  useRefreshOnFocus(feed.refresh);

  const podium = useMemo(() => new Map((top.data ?? []).map((r) => [r.id, r.position])), [top.data]);

  const toggleLike = (item: FeedItem) => {
    const liked = !item.liked;
    const apply = (value: boolean) =>
      feed.mutate((list) =>
        list.map((c) => (c.id === item.id ? { ...c, liked: value, likes: c.likes + (value ? 1 : -1) } : c)),
      );
    apply(liked);
    setLike(item.id, liked).catch(() => apply(!liked));
  };

  const report = (item: FeedItem) =>
    Alert.alert(t('feed.reportTitle'), t('feed.reportMessage'), [
      { text: t('register.cancel'), style: 'cancel' },
      {
        text: t('feed.report'),
        style: 'destructive',
        onPress: () => {
          feed.mutate((list) => list.filter((c) => c.id !== item.id));
          reportCatch(item.id, 'reported_in_app').catch(() => feed.refresh());
        },
      },
    ]);

  const renderCard = (item: FeedItem) => {
    const species = SPECIES.get(item.speciesId);
    const name = species ? speciesName(species, locale) : item.speciesId;
    const when = formatRelativeTime(locale, item.caughtAt);
    const meta = !item.isPrivate && item.place ? `${when} · ${item.place}` : when;
    const position = podium.get(item.id);
    return (
      <CatchCard
        authorName={item.userId === profile?.id ? t('feed.you') : item.authorName}
        authorCountry={item.authorCountry}
        meta={meta}
        photoUri={item.photoUrl}
        speciesName={name}
        sizeLabel={formatSize(locale, item.sizeCm)}
        chips={chipsOf(item, t, locale)}
        likes={item.likes}
        liked={item.liked}
        rankTag={position ? t('feed.rankTag', { position }) : undefined}
        onToggleLike={() => toggleLike(item)}
        onOpenSpecies={() => router.push(`/species/${item.speciesId}`)}
        onReport={item.userId === profile?.id ? undefined : () => report(item)}
      />
    );
  };

  const header = <ScreenHeader title={t('feed.title')} subtitle={t('feed.subtitle')} />;

  if (!isPro) {
    return (
      <Screen>
        <View style={[styles.padded, styles.fill]}>
          {header}
          <LockedContent
            icon="feed"
            title={t('paywall.feedTitle')}
            message={t('paywall.feedMessage')}
            country={profile?.country}
          >
            <View style={styles.list}>
              <CatchCardSkeleton />
              <CatchCardSkeleton />
            </View>
          </LockedContent>
        </View>
      </Screen>
    );
  }

  const items = feed.data ?? [];
  const firstLoad = feed.status === 'loading' && feed.data === null;

  return (
    <Screen>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => renderCard(item)}
        ListHeaderComponent={header}
        refreshControl={
          <RefreshControl
            refreshing={feed.status === 'loading' && feed.data !== null}
            onRefresh={() => {
              feed.refresh();
              top.refresh();
            }}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          firstLoad ? (
            <View style={styles.list}>
              <CatchCardSkeleton />
              <CatchCardSkeleton />
            </View>
          ) : feed.status === 'error' ? (
            <EmptyState
              icon="wifi-off"
              title={t('error.offlineTitle')}
              message={t('error.loadFeed')}
              actionLabel={t('error.retry')}
              actionVariant="secondary"
              onAction={feed.refresh}
            />
          ) : (
            <EmptyState
              icon="camera"
              title={t('feed.emptyTitle')}
              message={t('feed.emptyMessage')}
              actionLabel={t('catch.register')}
              onAction={() => router.push('/register')}
            />
          )
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
