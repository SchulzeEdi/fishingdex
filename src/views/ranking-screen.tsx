import { FlatList, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { resolveLocale, translate } from '@/shared/i18n';
import { darkTheme, lightTheme, spacing, type Theme } from '@/shared/ui';

// Mock até a API HTTP (DT-04). Espelha RankingEntry do backend (ordenado por tamanho).
const MOCK = [
  { pos: 1, user: 'Mike', species: 'Largemouth bass', sizeCm: 71, country: '🇺🇸' },
  { pos: 2, user: 'Rafael', species: 'Tucunaré', sizeCm: 62, country: '🇧🇷' },
  { pos: 3, user: 'Ana', species: 'Dourado', sizeCm: 58, country: '🇦🇷' },
  { pos: 4, user: 'João', species: 'Pintado', sizeCm: 54, country: '🇧🇷' },
];

export function RankingScreen() {
  const theme = useColorScheme() === 'dark' ? darkTheme : lightTheme;
  const lang = resolveLocale('pt-BR');
  const s = makeStyles(theme);
  return (
    <View style={s.container}>
      <Text style={s.title}>🏆 {translate(lang, 'ranking.title')}</Text>
      <FlatList
        data={MOCK}
        keyExtractor={(i) => String(i.pos)}
        contentContainerStyle={{ paddingTop: spacing.md }}
        renderItem={({ item }) => (
          <View style={s.row}>
            <Text style={[s.pos, item.pos === 1 && s.first]}>{item.pos}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>
                {item.user} {item.country}
              </Text>
              <Text style={s.muted}>{item.species}</Text>
            </View>
            <Text style={s.size}>{item.sizeCm} cm</Text>
          </View>
        )}
      />
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.background, padding: spacing.lg },
    title: { color: t.text, fontSize: 24, fontWeight: '700' },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
    },
    pos: { color: t.text, fontSize: 26, fontWeight: '700', width: 34, textAlign: 'center' },
    first: { color: t.highlight },
    name: { color: t.text, fontWeight: '700', fontSize: 15 },
    muted: { color: t.textMuted, fontSize: 12 },
    size: { color: t.highlight, fontSize: 18, fontWeight: '700' },
  });
}
