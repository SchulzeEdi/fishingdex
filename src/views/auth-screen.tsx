import { useState } from 'react';
import { KeyboardAvoidingView, Linking, Pressable, StyleSheet, View } from 'react-native';

import { COUNTRIES, type Country } from '@/entities/user';
import { signIn, signUp, validateCredentials, type CredentialsError } from '@/features/session';
import { toAppError } from '@/shared/api';
import { isBackendConfigured, links } from '@/shared/config';
import { useI18n } from '@/shared/i18n';
import { AppText, Button, FilterChip, Icon, Screen, TextField, fonts, radius, spacing, useTheme } from '@/shared/ui';
import { LanguagePicker } from '@/widgets/preferences';

type Mode = 'signIn' | 'signUp';
type Field = 'email' | 'password' | 'name';

function guessCountry(region: string | null | undefined): Country {
  return COUNTRIES.find((c) => c === region) ?? 'BR';
}

/** Entrar / criar conta (Supabase Auth, e-mail e senha — D-5; Google/Apple depois). */
export function AuthScreen({ deviceRegion }: { deviceRegion?: string | null }) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>('signUp');
  const [name, setName] = useState('');
  const [country, setCountry] = useState<Country>(guessCountry(deviceRegion));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Partial<Record<Field, CredentialsError>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const configured = isBackendConfigured();

  const clear = (field: Field) => {
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
    if (formError) setFormError(null);
  };

  const submit = async () => {
    const found = validateCredentials({ mode, email, password, name });
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0) return;
    setBusy(true);
    try {
      if (mode === 'signUp') await signUp({ email, password, name: name.trim(), country });
      else await signIn(email, password);
    } catch (e) {
      const code = toAppError(e).code;
      const known = ['invalid_credentials', 'email_taken', 'weak_password', 'invalid_email', 'rate_limited', 'network'] as const;
      setFormError(t(`error.${(known as readonly string[]).includes(code) ? (code as (typeof known)[number]) : 'unknown'}`));
    } finally {
      setBusy(false);
    }
  };

  const fieldError = (f: Field) => (errors[f] ? t(`error.${errors[f]}`) : undefined);

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
          <AppText variant="heading">{mode === 'signUp' ? t('auth.signUpTitle') : t('auth.signInTitle')}</AppText>

          {mode === 'signUp' ? (
            <>
              <TextField
                label={t('onboarding.name')}
                value={name}
                onChangeText={(v) => {
                  setName(v);
                  clear('name');
                }}
                placeholder={t('onboarding.namePlaceholder')}
                autoCapitalize="words"
                maxLength={40}
                error={fieldError('name')}
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
            </>
          ) : null}

          <TextField
            label={t('auth.email')}
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              clear('email');
            }}
            placeholder={t('auth.emailPlaceholder')}
            keyboardType="email-address"
            autoCapitalize="none"
            error={fieldError('email')}
          />
          <TextField
            label={t('auth.password')}
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              clear('password');
            }}
            secureTextEntry
            autoCapitalize="none"
            help={mode === 'signUp' ? t('auth.passwordHelp') : undefined}
            error={fieldError('password')}
            returnKeyType="done"
          />

          {formError || !configured ? (
            <View style={[styles.alert, { borderColor: colors.danger }]} accessibilityLiveRegion="polite">
              <Icon name="alert" size={18} color={colors.danger} />
              <AppText variant="label" tone="danger" style={styles.alertText}>
                {configured ? formError : t('error.notConfigured')}
              </AppText>
            </View>
          ) : null}

          <Button
            label={mode === 'signUp' ? t('auth.signUp') : t('auth.signIn')}
            block
            loading={busy}
            disabled={!configured}
            onPress={submit}
          />
          {mode === 'signUp' ? (
            <AppText variant="caption" tone="textMuted" align="center">
              {t('auth.termsPrefix')}{' '}
              <AppText variant="caption" tone="primary" onPress={() => Linking.openURL(links.terms)}>
                {t('auth.terms')}
              </AppText>{' '}
              {t('auth.and')}{' '}
              <AppText variant="caption" tone="primary" onPress={() => Linking.openURL(links.privacyPolicy)}>
                {t('auth.privacy')}
              </AppText>
              .
            </AppText>
          ) : null}
          <Pressable
            onPress={() => {
              setMode(mode === 'signUp' ? 'signIn' : 'signUp');
              setErrors({});
              setFormError(null);
            }}
            accessibilityRole="button"
            style={styles.switch}
          >
            <AppText variant="label" tone="primary" align="center">
              {mode === 'signUp' ? t('auth.toSignIn') : t('auth.toSignUp')}
            </AppText>
          </Pressable>
          <LanguagePicker compact />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  brand: { gap: spacing.sm, paddingTop: spacing.xxl },
  // Motivo da capa "Águas Profundas": placa primary, bloco de água, disco do prêmio.
  marks: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, marginBottom: spacing.lg },
  slab: { width: 44, height: 56, borderRadius: radius.lg },
  water: { width: 32, height: 32, borderRadius: radius.md },
  prize: { width: 14, height: 14, borderRadius: radius.full, marginBottom: 38 },
  wordmark: { fontFamily: fonts.display700, fontSize: 44, lineHeight: 48, letterSpacing: -1.3 },
  form: { gap: spacing.lg, marginTop: spacing.xl },
  field: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  alertText: { flex: 1 },
  switch: { minHeight: 44, justifyContent: 'center' },
});
