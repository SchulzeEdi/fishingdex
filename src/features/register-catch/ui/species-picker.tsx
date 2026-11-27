import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { searchSpecies, speciesName, type FishSpecies } from '@/entities/fish-species';
import { useI18n } from '@/shared/i18n';
import { AppText, Button, Icon, TextField, radius, spacing, useTheme } from '@/shared/ui';

interface SpeciesPickerProps {
  /** Catálogo da região do usuário. */
  species: readonly FishSpecies[];
  value: FishSpecies | null;
  onChange: (species: FishSpecies | null) => void;
  error?: string;
}

const MAX_RESULTS = 6;

/** Escolha manual da espécie (D-2) com busca sem acento no catálogo regional. */
export function SpeciesPicker({ species, value, onChange, error }: SpeciesPickerProps) {
  const { colors } = useTheme();
  const { t, locale } = useI18n();
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchSpecies(species, query).slice(0, MAX_RESULTS), [species, query]);

  if (value) {
    return (
      <View style={styles.field}>
        <AppText variant="label">{t('register.species')}</AppText>
        <View style={[styles.selected, { borderColor: colors.primary, backgroundColor: colors.surface }]}>
          <Icon name="fish" size={18} color={colors.primary} />
          <View style={styles.selectedText}>
            <AppText variant="bodyStrong" numberOfLines={1}>
              {speciesName(value, locale)}
            </AppText>
            <AppText variant="caption" tone="textMuted" numberOfLines={1}>
              {value.scientificName}
            </AppText>
          </View>
          <Button label={t('register.speciesChange')} variant="ghost" onPress={() => onChange(null)} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.field}>
      <TextField
        label={t('register.species')}
        value={query}
        onChangeText={setQuery}
        placeholder={t('register.speciesSearch')}
        icon="search"
        help={t('register.speciesHelp')}
        error={error}
        autoCapitalize="none"
        returnKeyType="search"
      />
      <View style={[styles.list, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        {results.length === 0 ? (
          <AppText variant="label" tone="textMuted" style={styles.none}>
            {t('register.speciesNone')}
          </AppText>
        ) : (
          results.map((s, i) => (
            <Pressable
              key={s.id}
              onPress={() => {
                onChange(s);
                setQuery('');
              }}
              accessibilityRole="button"
              accessibilityLabel={speciesName(s, locale)}
              style={({ pressed }) => [
                styles.option,
                i > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
                pressed && { backgroundColor: colors.surfaceMuted },
              ]}
            >
              <View style={styles.selectedText}>
                <AppText variant="body" numberOfLines={1}>
                  {speciesName(s, locale)}
                </AppText>
                <AppText variant="caption" tone="textMuted" numberOfLines={1}>
                  {t(s.habitat === 'freshwater' ? 'habitat.freshwater' : 'habitat.saltwater')} · {s.scientificName}
                </AppText>
              </View>
              <Icon name="chevron-right" size={18} color={colors.textMuted} />
            </Pressable>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  selected: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  selectedText: { flex: 1, minWidth: 0 },
  list: { borderWidth: 1, borderRadius: radius.md, overflow: 'hidden' },
  option: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  none: { padding: spacing.md },
});
