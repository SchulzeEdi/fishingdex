import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';

import { biggestCatch, useMyCatches } from '@/entities/catch';
import { SPECIES_SEED, speciesForRegion, speciesName, type Habitat } from '@/entities/fish-species';
import { useProfile } from '@/entities/user';
import { DexCell, DexProgressBar, buildDex, isNewUnlock, useSeenSpecies } from '@/features/dex-collection';
import { useI18n } from '@/shared/i18n';
import { Screen, ScreenHeader, SegmentedControl, columnStyle, spacing } from '@/shared/ui';

import { TAB_BAR_SPACE } from './layout';

export function DexScreen() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const profile = useProfile();
  const catches = useMyCatches();
  const seen = useSeenSpecies();
  const { fontScale } = useWindowDimensions();
  const [habitat, setHabitat] = useState<Habitat>('freshwater');

  const regional = useMemo(() => speciesForRegion(SPECIES_SEED, profile?.country ?? 'BR'), [profile?.country]);
  const fresh = useMemo(() => buildDex(regional, catches, 'freshwater'), [regional, catches]);
  const salt = useMemo(() => buildDex(regional, catches, 'saltwater'), [regional, catches]);
  const dex = habitat === 'freshwater' ? fresh : salt;

  // 3 colunas no celular; 2 só com fonte ampliada.
  const columns = fontScale > 1.3 ? 2 : 3;

  const header = (
    <View style={styles.header}>
      <ScreenHeader title={t('dex.title')} subtitle={t('dex.subtitle')} />
      <DexProgressBar unlocked={dex.unlocked} total={dex.total} percent={dex.percent} />
      <SegmentedControl
        accessibilityLabel={t('dex.habitat')}
        stretch
        value={habitat}
        onChange={setHabitat}
        options={[
          {
            value: 'freshwater',
            label: t('habitat.freshwater'),
            icon: 'fish',
            count: `${fresh.unlocked}/${fresh.total}`,
          },
          {
            value: 'saltwater',
            label: t('habitat.saltwater'),
            icon: 'feed',
            count: `${salt.unlocked}/${salt.total}`,
          },
        ]}
      />
    </View>
  );

  return (
    <Screen>
      <FlatList
        key={columns}
        data={dex.entries}
        keyExtractor={(e) => e.species.id}
        numColumns={columns}
        ListHeaderComponent={header}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[styles.list, columnStyle, { paddingBottom: TAB_BAR_SPACE }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const best = item.unlocked ? biggestCatch(catches, item.species.id) : null;
          return (
            <View style={[styles.cellWrap, { maxWidth: `${100 / columns}%` }]}>
              <DexCell
                number={item.number}
                name={speciesName(item.species, locale)}
                rarity={item.species.rarity}
                unlocked={item.unlocked}
                isNew={isNewUnlock(item.unlocked, item.species.id, seen)}
                photoUri={best?.photoUrl}
                onPress={() => router.push(`/species/${item.species.id}`)}
              />
            </View>
          );
        }}
      />
    </Screen>
  );
}

const GAP = spacing.md;

const styles = StyleSheet.create({
  header: { gap: spacing.lg, marginBottom: spacing.lg, paddingHorizontal: GAP / 2 },
  list: { paddingHorizontal: spacing.lg - GAP / 2 },
  row: { marginBottom: GAP },
  cellWrap: { flex: 1, paddingHorizontal: GAP / 2 },
});
