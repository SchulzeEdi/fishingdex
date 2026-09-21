import { FlatList, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { resolveLocale, translate } from '@/shared/i18n';
import { darkTheme, lightTheme, radius, spacing, type Theme } from '@/shared/ui';

// Dados mock até a API HTTP (DT-04). Estrutura espelha FeedItem do backend.
const MOCK = [
  { id: '1', user: 'Rafael', species: 'Tucunaré-açu', sizeCm: 62, likes: 24 },
  { id: '2', user: 'Ana', species: 'Dourado', sizeCm: 58, likes: 12 },
  { id: '3', user: 'Mike', species: 'Largemouth bass', sizeCm: 71, likes: 40 },
];

export function FeedScreen() {
  const theme = useColorScheme() === 'dark' ? darkTheme : lightTheme;
  const lang = resolveLocale('pt-BR');
  const s = makeStyles(theme);
  return (
    <View style={s.container}>
      <Text style={s.title}>Feed 🌊</Text>
      <Text style={s.sub}>{translate(lang, 'app.tagline')}</Text>
      <FlatList
        data={MOCK}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ gap: spacing.md, paddingTop: spacing.md }}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.photo}>
              <Text style={{ fontSize: 40 }}>🐟</Text>
            </View>
            <View style={s.row}>
              <Text style={s.name}>{item.user}</Text>
              <Text style={s.muted}>❤️ {item.likes}</Text>
            </View>
            <Text style={s.catch}>
              {item.species} · {item.sizeCm} cm
            </Text>
          </View>
        )}
      />
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.background, padding: spacing.lg },
    title: { color: t.text, fontSize: 28, fontWeight: '700' },
    sub: { color: t.textMuted, fontSize: 14, marginTop: spacing.xs },
    card: {
      backgroundColor: t.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: t.border,
      overflow: 'hidden',
      padding: spacing.md,
    },
    photo: {
      height: 140,
      borderRadius: radius.md,
      backgroundColor: t.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    name: { color: t.text, fontWeight: '700', fontSize: 15 },
    muted: { color: t.textMuted, fontSize: 13 },
    catch: { color: t.text, fontSize: 16, fontWeight: '600', marginTop: spacing.xs },
  });
}
