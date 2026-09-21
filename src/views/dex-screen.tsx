import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import type { Catch } from '@/entities/catch';
import {
  InMemorySpeciesRepository,
  type FishSpecies,
  type Habitat,
  type Region,
} from '@/entities/fish-species';
import { buildDex, type DexEntry } from '@/features/dex-collection';
import { resolveLocale, translate, type Locale } from '@/shared/i18n';
import { darkTheme, lightTheme, radius, spacing, type Theme } from '@/shared/ui';

const repository = new InMemorySpeciesRepository();

// Demo local até auth + backend (T-02/T-03): uma captura, pra mostrar bloqueada×desbloqueada.
const DEMO_CATCHES: readonly Catch[] = [
  { id: 'c1', userId: 'me', speciesId: 'tilapia', sizeCm: 32, caughtAt: '2026-09-20T09:00:00Z', isPrivate: false },
];

interface DexScreenProps {
  region?: Region;
  locale?: Locale;
}

export function DexScreen({ region = 'BR', locale }: DexScreenProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const lang = locale ?? resolveLocale('pt-BR');
  const styles = makeStyles(theme);

  const [species, setSpecies] = useState<FishSpecies[] | null>(null);
  const [habitat, setHabitat] = useState<Habitat>('freshwater');

  useEffect(() => {
    let active = true;
    repository.listByRegion(region).then((list) => {
      if (active) setSpecies(list);
    });
    return () => {
      active = false;
    };
  }, [region]);

  const dex = useMemo(
    () => (species ? buildDex(species, DEMO_CATCHES, habitat) : null),
    [species, habitat],
  );

  if (!dex) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{translate(lang, 'dex.title')}</Text>
      <Text style={styles.progress}>
        {translate(lang, 'dex.progress', { unlocked: dex.unlocked, total: dex.total })} · {dex.percent}%
      </Text>

      <View style={styles.tabs}>
        <HabitatTab label="🐟 doce" active={habitat === 'freshwater'} onPress={() => setHabitat('freshwater')} theme={theme} />
        <HabitatTab label="🌊 salgada" active={habitat === 'saltwater'} onPress={() => setHabitat('saltwater')} theme={theme} />
      </View>

      <FlatList
        data={dex.entries}
        keyExtractor={(e) => e.species.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <DexCell entry={item} theme={theme} lang={lang} />}
      />
    </View>
  );
}

function HabitatTab({
  label,
  active,
  onPress,
  theme,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  theme: Theme;
}) {
  const styles = makeStyles(theme);
  return (
    <Pressable onPress={onPress} style={[styles.tab, active && styles.tabActive]} accessibilityRole="tab">
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function DexCell({ entry, theme, lang }: { entry: DexEntry; theme: Theme; lang: Locale }) {
  const styles = makeStyles(theme);
  const { species, unlocked } = entry;
  return (
    <View style={[styles.cell, unlocked ? styles.cellUnlocked : styles.cellLocked]}>
      <Text style={styles.emoji}>{unlocked ? '🐟' : '🔒'}</Text>
      <Text style={styles.name} numberOfLines={1}>
        {unlocked ? species.namePt : translate(lang, 'dex.locked')}
      </Text>
    </View>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, padding: spacing.lg },
    center: { alignItems: 'center', justifyContent: 'center' },
    title: { color: theme.text, fontSize: 28, fontWeight: '700' },
    progress: { color: theme.textMuted, fontSize: 14, marginTop: spacing.xs, marginBottom: spacing.md },
    tabs: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
    tab: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.full,
      backgroundColor: theme.surfaceMuted,
    },
    tabActive: { backgroundColor: theme.primary },
    tabLabel: { color: theme.textMuted, fontWeight: '600' },
    tabLabelActive: { color: theme.primaryFg },
    list: { gap: spacing.md },
    row: { gap: spacing.md },
    cell: {
      flex: 1,
      aspectRatio: 1,
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    cellUnlocked: { backgroundColor: theme.surface },
    cellLocked: { backgroundColor: theme.surfaceMuted },
    emoji: { fontSize: 34 },
    name: { color: theme.text, marginTop: spacing.sm, fontWeight: '600' },
  });
}
