import { StyleSheet, View } from 'react-native';

import type { Rarity } from '@/entities/fish-species';
import { useI18n } from '@/shared/i18n';
import { AppText, Pips, useTheme, type Palette } from '@/shared/ui';

const PIPS: Record<Rarity, number> = { common: 1, uncommon: 2, rare: 3, legendary: 4 };

const COLOR: Record<Rarity, keyof Palette> = {
  common: 'rarityCommon',
  uncommon: 'rarityUncommon',
  rare: 'rarityRare',
  legendary: 'rarityLegendary',
};

/** Raridade sempre com pips (1–4) + nome — a cor nunca é a única pista. */
export function RarityBadge({ rarity }: { rarity: Rarity }) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const color = colors[COLOR[rarity]];
  return (
    <View style={styles.row}>
      <Pips filled={PIPS[rarity]} color={color} />
      <AppText variant="overline" style={{ color }} numberOfLines={1}>
        {t(`rarity.${rarity}`)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
