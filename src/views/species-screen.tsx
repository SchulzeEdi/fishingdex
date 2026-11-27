import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { biggestCatch, useMyCatches } from '@/entities/catch';
import { SPECIES_SEED, speciesForRegion, speciesName } from '@/entities/fish-species';
import { useProfile } from '@/entities/user';
import { RarityBadge, buildDex, formatDexNumber, markSpeciesSeen } from '@/features/dex-collection';
import { formatSize, formatWeight, useI18n } from '@/shared/i18n';
import {
  AppText,
  Button,
  Chip,
  EmptyState,
  Icon,
  Photo,
  Screen,
  radius,
  size,
  spacing,
  useTheme,
} from '@/shared/ui';

function BackButton({ onPress, label }: { onPress: () => void; label: string }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [styles.back, pressed && { opacity: 0.6 }]}
    >
      <View style={{ transform: [{ rotate: '180deg' }] }}>
        <Icon name="chevron-right" size={24} color={colors.text} />
      </View>
      <AppText variant="label">{label}</AppText>
    </Pressable>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <AppText variant="caption" tone="textMuted">
        {label}
      </AppText>
      <AppText variant="metric" tabular>
        {value}
      </AppText>
    </View>
  );
}

/** Ficha da espécie: revelada depois da primeira captura; antes disso, mistério. */
export function SpeciesScreen({ speciesId }: { speciesId: string }) {
  const router = useRouter();
  const { colors } = useTheme();
  const { t, locale } = useI18n();
  const profile = useProfile();
  const catches = useMyCatches();

  const regional = useMemo(() => speciesForRegion(SPECIES_SEED, profile?.country ?? 'BR'), [profile?.country]);
  const entry = useMemo(
    () => buildDex(regional, catches).entries.find((e) => e.species.id === speciesId),
    [regional, catches, speciesId],
  );
  const species = entry?.species ?? SPECIES_SEED.find((s) => s.id === speciesId);
  const unlocked = entry?.unlocked ?? catches.some((c) => c.speciesId === speciesId);
  const mine = catches.filter((c) => c.speciesId === speciesId);
  const best = biggestCatch(mine);

  useEffect(() => {
    if (unlocked) markSpeciesSeen(speciesId);
  }, [unlocked, speciesId]);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/dex'));

  if (!species) {
    return (
      <Screen>
        <View style={styles.padded}>
          <BackButton onPress={goBack} label={t('species.back')} />
          <EmptyState icon="alert" title={t('species.lockedTitle')} message={t('species.lockedMessage')} />
        </View>
      </Screen>
    );
  }

  const no = entry ? t('dex.number', { number: formatDexNumber(entry.number) }) : null;
  const habitatChip = (
    <Chip
      variant="water"
      icon={species.habitat === 'freshwater' ? 'fish' : 'feed'}
      label={t(species.habitat === 'freshwater' ? 'habitat.freshwater' : 'habitat.saltwater')}
    />
  );

  return (
    <Screen scroll>
      <BackButton onPress={goBack} label={t('species.back')} />

      {unlocked ? (
        <Photo uri={best?.photoUrl} aspectRatio={1} rounded={radius.lg} accessibilityLabel={speciesName(species, locale)} />
      ) : (
        <View
          style={[styles.mystery, { backgroundColor: colors.surfaceMuted, borderColor: colors.borderStrong }]}
          accessibilityLabel={t('dex.locked')}
        >
          <Icon name="fish-silhouette" width="62%" height="40%" color={colors.silhouette} />
          <View style={styles.mysteryLock}>
            <Icon name="lock" size={18} color={colors.textMuted} />
          </View>
        </View>
      )}

      <View style={styles.titleBlock}>
        {no ? (
          <AppText variant="label" tone="textMuted" tabular>
            {no}
          </AppText>
        ) : null}
        <AppText variant="title" accessibilityRole="header">
          {unlocked ? speciesName(species, locale) : '???'}
        </AppText>
        {unlocked ? (
          <AppText variant="label" tone="textMuted">
            {t('species.scientific')}: {species.scientificName}
          </AppText>
        ) : null}
        <View style={styles.tags}>
          {habitatChip}
          {unlocked ? <RarityBadge rarity={species.rarity} /> : null}
        </View>
      </View>

      {unlocked ? (
        <>
          {best ? (
            <View style={styles.hero}>
              <AppText variant="label" tone="textMuted">
                {t('species.best')}
              </AppText>
              <AppText variant="display" tabular>
                {formatSize(locale, best.sizeCm)}
              </AppText>
              {best.weightKg ? (
                <AppText variant="body" tone="textMuted">
                  {formatWeight(locale, best.weightKg)}
                </AppText>
              ) : null}
            </View>
          ) : null}
          <View style={styles.stats}>
            <Stat label={t('species.catchCount')} value={String(mine.length)} />
            <Stat label={t('species.maxSize')} value={formatSize(locale, species.maxPlausibleSizeCm)} />
          </View>
        </>
      ) : (
        <View style={styles.locked}>
          <AppText variant="heading">{t('species.lockedTitle')}</AppText>
          <AppText tone="textMuted">{t('species.lockedMessage')}</AppText>
        </View>
      )}

      <Button
        label={t('catch.register')}
        icon="camera"
        block
        onPress={() => router.push({ pathname: '/register', params: { species: species.id } })}
        style={styles.cta}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  padded: { paddingHorizontal: spacing.lg },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: size.touchMin,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  mystery: {
    aspectRatio: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mysteryLock: { position: 'absolute', top: spacing.md, right: spacing.md },
  titleBlock: { gap: spacing.xs, marginTop: spacing.lg },
  tags: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  hero: { marginTop: spacing.xl },
  stats: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  stat: { flex: 1, gap: spacing.xs, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1 },
  locked: { gap: spacing.xs, marginTop: spacing.xl },
  cta: { marginTop: spacing.xl },
});
