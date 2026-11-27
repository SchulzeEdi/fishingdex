import { StyleSheet, View } from 'react-native';

import { useI18n } from '@/shared/i18n';
import { AppText, Avatar, Flag, fonts, radius, spacing, textStyles, useTheme } from '@/shared/ui';

export interface PodiumSpot {
  position: 1 | 2 | 3;
  name: string;
  country?: string | null;
  speciesName: string;
  sizeLabel: string;
}

const HEIGHT = { 1: 96, 2: 72, 3: 56 } as const;

/** Pódio dos 3 primeiros: 1º em highlight (laranja = competição), 2º e 3º em surface-muted. */
export function Podium({ spots }: { spots: PodiumSpot[] }) {
  const byPos = (p: 1 | 2 | 3) => spots.find((s) => s.position === p);
  // Ordem visual 2 · 1 · 3.
  const order = [byPos(2), byPos(1), byPos(3)];
  return (
    <View style={styles.podium}>
      {order.map((spot, i) =>
        spot ? <Spot key={spot.position} spot={spot} /> : <View key={`empty-${i}`} style={styles.spotCol} />,
      )}
    </View>
  );
}

function Spot({ spot }: { spot: PodiumSpot }) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const first = spot.position === 1;
  return (
    <View
      style={[styles.spotCol, first && styles.firstCol]}
      accessible
      accessibilityLabel={`${t('ranking.position', { n: spot.position })}: ${spot.name}, ${spot.speciesName}, ${spot.sizeLabel}`}
    >
      <Avatar name={spot.name} size={first ? 'podium' : 'md'} />
      <View style={styles.nameRow}>
        <AppText style={styles.name} numberOfLines={1}>
          {spot.name.split(' ')[0]}
        </AppText>
        {spot.country ? <Flag code={spot.country} /> : null}
      </View>
      <AppText variant="caption" tone="textMuted" numberOfLines={1} align="center">
        {spot.speciesName}
      </AppText>
      <AppText
        tabular
        style={[styles.size, first && styles.firstSize, { color: first ? colors.highlightInk : colors.text }]}
      >
        {spot.sizeLabel}
      </AppText>
      <View
        style={[
          styles.block,
          { height: HEIGHT[spot.position], backgroundColor: first ? colors.highlight : colors.surfaceMuted },
        ]}
      >
        <AppText
          tabular
          style={[styles.blockNum, { color: first ? colors.highlightForeground : colors.text }]}
        >
          {spot.position}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  podium: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  spotCol: { flex: 1, alignItems: 'center', gap: spacing.xs },
  firstCol: { flex: 1.15 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: '100%' },
  name: { fontFamily: textStyles.bodyStrong.fontFamily, fontSize: 14, lineHeight: 18, flexShrink: 1 },
  size: { fontFamily: fonts.display700, fontSize: 18, lineHeight: 24 },
  firstSize: { fontSize: 22, lineHeight: 28 },
  block: {
    width: '100%',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
  },
  blockNum: { ...textStyles.rankNumber },
});
