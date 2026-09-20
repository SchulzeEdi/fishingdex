import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, useColorScheme, View } from 'react-native';

import type { Catch } from '@/entities/catch';
import { SPECIES_SEED } from '@/entities/fish-species';
import { buildDex, type DexEntry } from '@/features/dex-collection';
import { darkTheme, lightTheme, radius, spacing, type Theme } from '@/shared/ui';

// Demo local até o backend existir: só uma captura, pra mostrar bloqueada x desbloqueada.
const DEMO_CATCHES: readonly Catch[] = [
  {
    id: 'c1',
    userId: 'me',
    speciesId: 'tilapia',
    sizeCm: 32,
    caughtAt: '2026-09-20T09:00:00Z',
    isPrivate: false,
  },
];

export function DexScreen() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const dex = useMemo(() => buildDex(SPECIES_SEED, DEMO_CATCHES), []);
  const styles = makeStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dex 🎣</Text>
      <Text style={styles.progress}>
        {dex.unlocked} de {dex.total} espécies · {dex.percent}%
      </Text>
      <FlatList
        data={dex.entries}
        keyExtractor={(e) => e.species.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <DexCell entry={item} theme={theme} />}
      />
    </View>
  );
}

function DexCell({ entry, theme }: { entry: DexEntry; theme: Theme }) {
  const styles = makeStyles(theme);
  const { species, unlocked } = entry;
  return (
    <View style={[styles.cell, unlocked ? styles.cellUnlocked : styles.cellLocked]}>
      <Text style={styles.emoji}>{unlocked ? '🐟' : '🔒'}</Text>
      <Text style={styles.name} numberOfLines={1}>
        {unlocked ? species.namePt : '???'}
      </Text>
    </View>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, padding: spacing.lg },
    title: { color: theme.text, fontSize: 28, fontWeight: '700' },
    progress: { color: theme.textMuted, fontSize: 14, marginTop: spacing.xs, marginBottom: spacing.lg },
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
