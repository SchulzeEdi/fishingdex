import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, View } from 'react-native';

import { COUNTRIES, sanitizeName, sessionActions, useProfile, type Country } from '@/entities/user';
import { useI18n } from '@/shared/i18n';
import { AppText, Button, FilterChip, Screen, TextField, fonts, radius, spacing, useTheme } from '@/shared/ui';

/** Detecta o país pela região do aparelho; cai no Brasil. */
function guessCountry(region: string | null | undefined): Country {
  return COUNTRIES.find((c) => c === region) ?? 'BR';
}

/** Primeiro acesso (perfil local até a auth real) e edição do perfil. */
export function OnboardingScreen({ editing, deviceRegion }: { editing?: boolean; deviceRegion?: string | null }) {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useI18n();
  const profile = useProfile();
  const [name, setName] = useState(profile?.name ?? '');
  const [country, setCountry] = useState<Country>(profile?.country ?? guessCountry(deviceRegion));
  const [error, setError] = useState<string | undefined>();

  const submit = () => {
    if (!sanitizeName(name)) {
      setError(t('onboarding.nameRequired'));
      return;
    }
    sessionActions.saveProfile({ name, country });
    if (editing && router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.fill}>
      <Screen scroll edges={['top', 'bottom']} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <View style={styles.marks} aria-hidden>
            <View style={[styles.slab, { backgroundColor: colors.primary }]} />
            <View style={[styles.water, { backgroundColor: colors.accent }]} />
            <View style={[styles.prize, { backgroundColor: colors.highlight }]} />
          </View>
          <AppText style={[styles.wordmark, { color: colors.text }]} accessibilityRole="header">
            fishingdex
          </AppText>
          <AppText variant="bodyLg" tone="textMuted">
            {t('onboarding.tagline')}
          </AppText>
        </View>

        <View style={styles.form}>
          <TextField
            label={t('onboarding.name')}
            value={name}
            onChangeText={(v) => {
              setName(v);
              if (error) setError(undefined);
            }}
            placeholder={t('onboarding.namePlaceholder')}
            autoCapitalize="words"
            maxLength={40}
            error={error}
            returnKeyType="done"
          />

          <View style={styles.field}>
            <AppText variant="label">{t('onboarding.country')}</AppText>
            <View style={styles.chips}>
              {COUNTRIES.map((c) => (
                <FilterChip key={c} label={t(`country.${c}`)} selected={country === c} onPress={() => setCountry(c)} />
              ))}
            </View>
            <AppText variant="caption" tone="textMuted">
              {t('onboarding.countryHelp')}
            </AppText>
          </View>

          <Button label={editing ? t('onboarding.save') : t('onboarding.start')} block onPress={submit} />
          {editing ? (
            <Button label={t('register.cancel')} variant="ghost" onPress={() => router.back()} style={styles.center} />
          ) : null}
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  brand: { gap: spacing.sm, paddingTop: spacing['3xl'] },
  // Motivo da capa "Águas Profundas": placa primary, bloco de água, disco do prêmio.
  marks: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, marginBottom: spacing.xl },
  slab: { width: 56, height: 72, borderRadius: radius.lg },
  water: { width: 40, height: 40, borderRadius: radius.lg },
  prize: { width: 16, height: 16, borderRadius: radius.full, marginBottom: 48 },
  wordmark: { fontFamily: fonts.display700, fontSize: 48, lineHeight: 52, letterSpacing: -1.4 },
  form: { gap: spacing.xl, marginTop: spacing.xxl },
  field: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  center: { alignSelf: 'center' },
});
