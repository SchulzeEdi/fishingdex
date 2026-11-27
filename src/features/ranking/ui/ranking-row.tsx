import { StyleSheet, View } from 'react-native';

import { useI18n } from '@/shared/i18n';
import { AppText, Flag, Photo, Skeleton, fonts, radius, spacing, textStyles, useTheme } from '@/shared/ui';

interface RankingRowProps {
  position: number;
  name: string;
  country?: string | null;
  speciesName: string;
  sizeLabel: string;
  photoUri?: string | null;
  /** Posição do usuário, fixa no fim da lista (contorno primary). */
  isMe?: boolean;
}

/** Linha do ranking a partir do 4º. Tamanho em highlight-ink (highlight como texto dá 2,4:1). */
export function RankingRow({ position, name, country, speciesName, sizeLabel, photoUri, isMe }: RankingRowProps) {
  const { colors } = useTheme();
  const { t } = useI18n();
  return (
    <View
      accessible
      accessibilityLabel={`${t('ranking.position', { n: position })}: ${name}, ${speciesName}, ${sizeLabel}`}
      style={[
        styles.row,
        { borderBottomColor: colors.border },
        isMe && [styles.me, { backgroundColor: colors.surface, borderColor: colors.primary }],
      ]}
    >
      <AppText tabular style={[styles.pos, { color: colors.textMuted }]}>
        {position}
      </AppText>
      <Photo
        uri={photoUri}
        aspectRatio={1}
        rounded={radius.sm}
        placeholderWidth="50%"
        accessibilityLabel={speciesName}
        style={styles.thumb}
      />
      <View style={styles.who}>
        <View style={styles.nameRow}>
          <AppText style={styles.name} numberOfLines={1}>
            {name}
          </AppText>
          {country ? <Flag code={country} /> : null}
        </View>
        <AppText variant="caption" tone="textMuted" numberOfLines={1}>
          {speciesName}
        </AppText>
      </View>
      <AppText tabular style={[styles.size, { color: colors.highlightInk }]}>
        {sizeLabel}
      </AppText>
    </View>
  );
}

export function RankingRowSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Skeleton width={28} height={20} />
      <Skeleton width={44} height={44} />
      <View style={[styles.who, { gap: 6 }]}>
        <Skeleton width="50%" height={12} />
        <Skeleton width="30%" height={10} />
      </View>
      <Skeleton width={48} height={18} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  me: {
    marginHorizontal: -spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  pos: { width: 28, textAlign: 'center', fontFamily: fonts.display700, fontSize: 20, lineHeight: 24 },
  thumb: { width: 44, height: 44 },
  who: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontFamily: textStyles.bodyStrong.fontFamily, fontSize: 15, lineHeight: 20, flexShrink: 1 },
  size: { fontFamily: fonts.display700, fontSize: 18, lineHeight: 24 },
});
