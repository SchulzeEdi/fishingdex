import { StyleSheet, View } from 'react-native';

import {
  CURRENCIES,
  LOCALE_CHOICES,
  LOCALE_NAMES,
  preferencesActions,
  useCurrencyPreference,
  useLocalePreference,
} from '@/shared/config';
import { useI18n } from '@/shared/i18n';
import { AppText, FilterChip, spacing } from '@/shared/ui';

/** Idioma do app: do aparelho, ou fixo em português, espanhol ou inglês (D-3). */
export function LanguagePicker({ compact }: { compact?: boolean }) {
  const { t } = useI18n();
  const value = useLocalePreference();
  return (
    <View style={styles.field}>
      {compact ? null : <AppText variant="label">{t('prefs.language')}</AppText>}
      <View style={[styles.chips, compact && styles.center]} accessibilityLabel={t('prefs.language')}>
        {compact ? null : (
          <FilterChip
            label={t('prefs.languageAuto')}
            selected={value === 'auto'}
            onPress={() => preferencesActions.setLocale('auto')}
          />
        )}
        {LOCALE_CHOICES.map((l) => (
          <FilterChip
            key={l}
            label={LOCALE_NAMES[l]}
            selected={value === l}
            onPress={() => preferencesActions.setLocale(l)}
          />
        ))}
      </View>
    </View>
  );
}

/** Moeda dos preços: pelo país do perfil, ou fixa em real ou dólar. */
export function CurrencyPicker() {
  const { t } = useI18n();
  const value = useCurrencyPreference();
  return (
    <View style={styles.field}>
      <AppText variant="label">{t('prefs.currency')}</AppText>
      <View style={styles.chips} accessibilityLabel={t('prefs.currency')}>
        <FilterChip
          label={t('prefs.currencyAuto')}
          selected={value === 'auto'}
          onPress={() => preferencesActions.setCurrency('auto')}
        />
        {CURRENCIES.map((c) => (
          <FilterChip
            key={c}
            label={t(`currency.${c}`)}
            selected={value === c}
            onPress={() => preferencesActions.setCurrency(c)}
          />
        ))}
      </View>
      <AppText variant="caption" tone="textMuted">
        {t('prefs.currencyHelp')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  center: { justifyContent: 'center' },
});
