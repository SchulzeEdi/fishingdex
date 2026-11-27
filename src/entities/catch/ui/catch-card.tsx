import { useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { useI18n } from '@/shared/i18n';
import {
  AppText,
  Avatar,
  Chip,
  Flag,
  Icon,
  IconButton,
  Photo,
  Skeleton,
  radius,
  spacing,
  textStyles,
  useReduceMotion,
  useTheme,
  type IconName,
} from '@/shared/ui';

export interface CatchCardChip {
  label?: string;
  value?: string;
  icon?: IconName;
}

interface CatchCardProps {
  authorName: string;
  authorCountry?: string | null;
  /** "há 2 h · Rio Araguaia, GO" (sem local se privado). */
  meta: string;
  photoUri?: string | null;
  speciesName: string;
  sizeLabel: string;
  chips: CatchCardChip[];
  likes: number;
  liked: boolean;
  onToggleLike?: () => void;
  onOpenSpecies?: () => void;
  /** Selo sobre a foto (ex.: "2º no ranking"). */
  rankTag?: string;
}

/** Card de captura do feed: autor, foto 4:3 de borda a borda, espécie + tamanho, setup, curtir. */
export function CatchCard({
  authorName,
  authorCountry,
  meta,
  photoUri,
  speciesName,
  sizeLabel,
  chips,
  likes,
  liked,
  onToggleLike,
  onOpenSpecies,
  rankTag,
}: CatchCardProps) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const reduceMotion = useReduceMotion();
  const [pulse] = useState(() => new Animated.Value(1));

  const like = () => {
    if (!liked && !reduceMotion) {
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.25, duration: 120, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 130, useNativeDriver: true }),
      ]).start();
    }
    onToggleLike?.();
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.head}>
        <Avatar name={authorName} />
        <View style={styles.who}>
          <View style={styles.nameRow}>
            <AppText variant="bodyStrong" numberOfLines={1} style={styles.name}>
              {authorName}
            </AppText>
            {authorCountry ? <Flag code={authorCountry} /> : null}
          </View>
          <AppText variant="caption" tone="textMuted" numberOfLines={1}>
            {meta}
          </AppText>
        </View>
      </View>

      <Photo uri={photoUri} rounded={0} accessibilityLabel={t('feed.photoOf', { species: speciesName })}>
        {rankTag ? (
          <View style={[styles.tag, { backgroundColor: colors.scrim }]}>
            <Icon name="trophy" size={14} color="#ffffff" />
            <AppText variant="caption" style={styles.tagText}>
              {rankTag}
            </AppText>
          </View>
        ) : null}
      </Photo>

      <View style={styles.body}>
        <View style={styles.title}>
          <AppText variant="heading" style={styles.species} numberOfLines={2}>
            {speciesName}
          </AppText>
          <AppText variant="metric" tabular>
            {sizeLabel}
          </AppText>
        </View>
        {chips.length > 0 ? (
          <View style={styles.chips}>
            {chips.map((c, i) => (
              <Chip key={i} label={c.label} value={c.value} icon={c.icon} />
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.foot}>
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <IconButton
            icon={liked ? 'heart-fill' : 'heart'}
            color={liked ? colors.danger : colors.textMuted}
            accessibilityLabel={t('feed.like')}
            selected={liked}
            count={likes}
            onPress={like}
          />
        </Animated.View>
        {onOpenSpecies ? (
          <IconButton icon="chevron-right" accessibilityLabel={t('feed.viewSpecies')} onPress={onOpenSpecies} />
        ) : null}
      </View>
    </View>
  );
}

/** Esqueleto com o layout real do card (nunca spinner em tela cheia). */
export function CatchCardSkeleton() {
  const { colors } = useTheme();
  return (
    <View
      accessibilityLabel="…"
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.head}>
        <Skeleton width={36} height={36} rounded={radius.full} />
        <View style={[styles.who, { gap: 6 }]}>
          <Skeleton width="40%" height={12} />
          <Skeleton width="25%" height={10} />
        </View>
      </View>
      <Skeleton height={180} rounded={0} />
      <View style={styles.body}>
        <Skeleton width="55%" height={16} />
      </View>
    </View>
  );
}

/** Linha compacta de captura (perfil). */
export function CatchRow({
  speciesName,
  sizeLabel,
  meta,
  photoUri,
  onPress,
}: {
  speciesName: string;
  sizeLabel: string;
  meta: string;
  photoUri?: string | null;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, { borderBottomColor: colors.border }, pressed && { opacity: 0.85 }]}
    >
      <Photo
        uri={photoUri}
        aspectRatio={1}
        rounded={radius.sm}
        placeholderWidth="50%"
        accessibilityLabel={speciesName}
        style={styles.thumb}
      />
      <View style={styles.who}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {speciesName}
        </AppText>
        <AppText variant="caption" tone="textMuted" numberOfLines={1}>
          {meta}
        </AppText>
      </View>
      <AppText variant="metric" tabular>
        {sizeLabel}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: radius.lg, overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  who: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 15, lineHeight: 20, flexShrink: 1 },
  tag: {
    position: 'absolute',
    left: spacing.sm,
    bottom: spacing.sm,
    height: 24,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tagText: { color: '#ffffff', fontFamily: textStyles.bodyStrong.fontFamily },
  body: { padding: spacing.md, gap: spacing.sm },
  title: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.md },
  species: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: spacing.xs,
    paddingRight: spacing.xs,
    paddingBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  thumb: { width: 44, height: 44 },
});
