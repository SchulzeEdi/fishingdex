import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, View } from 'react-native';

import {
  COUNTRIES,
  sanitizeName,
  sessionActions,
  updateProfile,
  useProfile,
  type Country,
} from '@/entities/user';
import { toAppError } from '@/shared/api';
import { useI18n } from '@/shared/i18n';
import { AppText, Button, FilterChip, Screen, ScreenHeader, TextField, spacing } from '@/shared/ui';

/** Editar nome e país (o país define o catálogo regional da Dex). */
export function ProfileEditScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const profile = useProfile();
  const [name, setName] = useState(profile?.name ?? '');
  const [country, setCountry] = useState<Country>(profile?.country ?? 'BR');
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/profile'));

  const submit = async () => {
    const clean = sanitizeName(name);
    if (!clean) {
      setError(t('onboarding.nameRequired'));
      return;
    }
    if (!profile) return;
    setBusy(true);
    try {
      const updated = await updateProfile(profile.id, { name: clean, country });
      sessionActions.patchProfile({ name: updated.name, country: updated.country });
      close();
    } catch (e) {
      setError(t(toAppError(e).code === 'network' ? 'error.network' : 'error.unknown'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.fill}>
      <Screen scroll edges={['top', 'bottom']} keyboardShouldPersistTaps="handled">
        <ScreenHeader
          title={t('profile.edit')}
          right={<Button label={t('register.cancel')} variant="ghost" onPress={close} />}
        />
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
          <Button label={t('onboarding.save')} block loading={busy} onPress={submit} />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  form: { gap: spacing.xl, marginTop: spacing.md },
  field: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
