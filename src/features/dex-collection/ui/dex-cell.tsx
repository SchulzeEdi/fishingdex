import { Pressable, StyleSheet, View } from 'react-native';

import type { Rarity } from '@/entities/fish-species';
import { useI18n } from '@/shared/i18n';
import { AppText, Icon, Photo, Skeleton, fonts, radius, spacing, useTheme } from '@/shared/ui';

import { formatDexNumber } from '../model/dex';
import { RarityBadge } from './rarity-badge';

interface DexCellProps {
  number: number;
  /** Nome no idioma atual. */
  name: string;
  rarity: Rarity;
  unlocked: boolean;
  /** Recém-desbloqueada: anel accent + selo "Nova" até abrir a ficha. */
  isNew?: boolean;
  photoUri?: string | null;
  onPress?: () => void;
}

/** Célula da coleção (grade de 3 colunas). Bloqueada é mistério (silhueta + ???), não erro. */
export function DexCell({ number, name, rarity, unlocked, isNew, photoUri, onPress }: DexCellProps) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const no = t('dex.number', { number: formatDexNumber(number) });

  if (!unlocked) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={t('dex.lockedCell', { number: formatDexNumber(number) })}
        style={({ pressed }) => [
          styles.cell,
          styles.locked,
          { backgroundColor: colors.surfaceMuted, borderColor: colors.borderStrong },
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.lock}>
          <Icon name="lock" size={14} color={colors.textMuted} />
        </View>
        <View style={styles.art}>
          <Icon name="fish-silhouette" width="62%" height="40%" color={colors.silhouette} />
        </View>
        <View style={styles.meta}>
          <AppText style={[styles.no, { color: colors.textMuted }]}>{no}</AppText>
          <AppText style={[styles.name, styles.mystery, { color: colors.textMuted }]}>???</AppText>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${no}, ${name}`}
      style={({ pressed }) => [
        styles.cell,
        { backgroundColor: colors.surface, borderColor: isNew ? colors.accent : colors.border },
        isNew && { boxShadow: `0px 0px 0px 2px ${colors.accent}` },
        pressed && styles.pressed,
      ]}
    >
      {photoUri ? (
        <Photo uri={photoUri} aspectRatio={1} rounded={0} accessibilityLabel={name} />
      ) : (
        <View style={[styles.art, { backgroundColor: colors.surfaceMuted }]}>
          <Icon name="fish-silhouette" width="62%" height="40%" color={colors.primary} />
        </View>
      )}
      {isNew ? (
        <View style={[styles.newTag, { backgroundColor: colors.accent }]}>
          <AppText variant="overline" style={[styles.newText, { color: colors.accentForeground }]}>
            {t('dex.new')}
          </AppText>
        </View>
      ) : null}
      <View style={styles.meta}>
        <AppText style={[styles.no, { color: colors.textMuted }]}>{no}</AppText>
        <AppText style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {name}
        </AppText>
        <RarityBadge rarity={rarity} />
      </View>
    </Pressable>
  );
}

export function DexCellSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={[styles.cell, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.art}>
        <Skeleton height="100%" rounded={0} />
      </View>
      <View style={[styles.meta, { gap: 6 }]}>
        <Skeleton width="40%" height={10} />
        <Skeleton width="80%" height={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: { flex: 1, borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden' },
  locked: { borderStyle: 'dashed' },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  art: { aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  meta: { paddingTop: spacing.sm, paddingHorizontal: 10, paddingBottom: 10, gap: 2 },
  no: { fontFamily: fonts.display600, fontSize: 11, lineHeight: 14, letterSpacing: 0.44, fontVariant: ['tabular-nums'] },
  name: { fontFamily: fonts.body600, fontSize: 14, lineHeight: 18 },
  mystery: { letterSpacing: 1.4 },
  lock: { position: 'absolute', top: spacing.sm, right: spacing.sm, zIndex: 1 },
  newTag: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: radius.full,
    justifyContent: 'center',
  },
  newText: { fontSize: 10, lineHeight: 12, letterSpacing: 0.6 },
});
