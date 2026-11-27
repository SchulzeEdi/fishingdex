import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Animated, KeyboardAvoidingView, StyleSheet, View } from 'react-native';

import {
  LOCAL_USER_ID,
  catchActions,
  catchesThisMonth,
  useMyCatches,
  type Catch,
} from '@/entities/catch';
import { SPECIES_SEED, speciesForRegion, speciesName, type FishSpecies } from '@/entities/fish-species';
import { usePlan, useProfile } from '@/entities/user';
import { buildDex, formatDexNumber, isFirstCatchOfSpecies } from '@/features/dex-collection';
import {
  SpeciesPicker,
  pickCatchPhoto,
  validateCatchForm,
  type CatchFormErrors,
  type FieldError,
  type PhotoSource,
} from '@/features/register-catch';
import { FREE_MONTHLY_CATCH_LIMIT, PaywallCard, QuotaMeter, canRegisterCatch } from '@/features/subscribe-pro';
import { useI18n } from '@/shared/i18n';
import { createId } from '@/shared/lib';
import {
  AppText,
  Button,
  Icon,
  Photo,
  ProgressBar,
  Screen,
  ScreenHeader,
  TextField,
  ToggleRow,
  radius,
  spacing,
  useReduceMotion,
  useTheme,
} from '@/shared/ui';

type Saved = { entry: Catch; species: FishSpecies; unlocked: boolean };

/** Momento de desbloqueio: a silhueta revela a foto (respeita "reduzir movimento"). */
function UnlockMoment({ saved, onDex, onDone }: { saved: Saved; onDex: () => void; onDone: () => void }) {
  const { colors } = useTheme();
  const { t, locale } = useI18n();
  const profile = useProfile();
  const catches = useMyCatches();
  const reduceMotion = useReduceMotion();
  const [reveal] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduceMotion) {
      reveal.setValue(1);
      return;
    }
    Animated.timing(reveal, { toValue: 1, duration: 600, delay: 250, useNativeDriver: true }).start();
  }, [reveal, reduceMotion]);

  const regional = speciesForRegion(SPECIES_SEED, profile?.country ?? 'BR');
  const dex = buildDex(regional, catches, saved.species.habitat);
  const entry = buildDex(regional, catches).entries.find((e) => e.species.id === saved.species.id);
  const name = speciesName(saved.species, locale);

  return (
    <Screen scroll edges={['top', 'bottom']}>
      <View style={styles.moment}>
        <AppText variant="heading" tone="accentInk" align="center" accessibilityRole="header">
          {saved.unlocked ? t('unlock.title') : t('register.savedTitle')}
        </AppText>

        <View style={[styles.revealFrame, { backgroundColor: colors.surfaceMuted, borderColor: colors.accent }]}>
          <Animated.View style={[StyleSheet.absoluteFill, styles.center, { opacity: Animated.subtract(1, reveal) }]}>
            <Icon name="fish-silhouette" width="62%" height="40%" color={colors.silhouette} />
          </Animated.View>
          <Animated.View
            style={[StyleSheet.absoluteFill, { opacity: reveal, transform: [{ scale: Animated.add(0.94, Animated.multiply(reveal, 0.06)) }] }]}
          >
            {saved.entry.photoUrl ? (
              <Photo uri={saved.entry.photoUrl} aspectRatio={1} rounded={radius.xl} accessibilityLabel={name} />
            ) : (
              <View style={[StyleSheet.absoluteFill, styles.center]} accessibilityLabel={name}>
                <Icon name="fish-silhouette" width="62%" height="40%" color={colors.primary} />
              </View>
            )}
          </Animated.View>
        </View>

        {entry ? (
          <AppText variant="label" tone="textMuted" tabular align="center">
            {t('dex.number', { number: formatDexNumber(entry.number) })}
          </AppText>
        ) : null}
        <AppText variant="title" align="center">
          {name}
        </AppText>
        {saved.unlocked ? (
          <View style={styles.progress}>
            <AppText variant="label" tone="textMuted" align="center">
              {t('dex.progress', { unlocked: dex.unlocked, total: dex.total })}
            </AppText>
            <ProgressBar percent={dex.percent} now={dex.unlocked} max={dex.total} accessibilityLabel={t('dex.title')} />
          </View>
        ) : (
          <AppText tone="textMuted" align="center">
            {t('register.savedMessage')}
          </AppText>
        )}

        <View style={styles.momentActions}>
          {saved.unlocked ? <Button label={t('unlock.viewDex')} block onPress={onDex} /> : null}
          <Button
            label={t('unlock.continue')}
            variant={saved.unlocked ? 'ghost' : 'primary'}
            block={!saved.unlocked}
            onPress={onDone}
            style={saved.unlocked ? styles.centerSelf : undefined}
          />
        </View>
      </View>
    </Screen>
  );
}

export function RegisterCatchScreen({ initialSpeciesId }: { initialSpeciesId?: string }) {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useI18n();
  const profile = useProfile();
  const plan = usePlan();
  const mine = useMyCatches();

  const regional = useMemo(() => speciesForRegion(SPECIES_SEED, profile?.country ?? 'BR'), [profile?.country]);
  const [species, setSpecies] = useState<FishSpecies | null>(
    () => regional.find((s) => s.id === initialSpeciesId) ?? null,
  );
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [size, setSize] = useState('');
  const [weight, setWeight] = useState('');
  const [bait, setBait] = useState('');
  const [place, setPlace] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [errors, setErrors] = useState<CatchFormErrors>({});
  const [saved, setSaved] = useState<Saved | null>(null);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const msg = (e?: FieldError) => (e ? t(e.key, e.params) : undefined);
  const usedThisMonth = catchesThisMonth(mine);

  if (saved) {
    return (
      <UnlockMoment
        saved={saved}
        onDex={() => router.dismissTo('/dex')}
        onDone={close}
      />
    );
  }

  if (!canRegisterCatch(plan, usedThisMonth)) {
    return (
      <Screen scroll edges={['top', 'bottom']}>
        <ScreenHeader title={t('catch.register')} right={<Button label={t('register.cancel')} variant="ghost" onPress={close} />} />
        <View style={styles.gap}>
          <QuotaMeter used={usedThisMonth} limit={FREE_MONTHLY_CATCH_LIMIT} />
          <PaywallCard
            icon="camera"
            title={t('paywall.limitTitle')}
            message={t('paywall.limitMessage')}
            country={profile?.country}
          />
        </View>
      </Screen>
    );
  }

  const choosePhoto = async (source: PhotoSource) => {
    const result = await pickCatchPhoto(source);
    if (result.status === 'ok') setPhotoUri(result.uri);
    if (result.status === 'denied') Alert.alert(t('register.photoAdd'), t('register.photoDenied'));
  };

  const save = () => {
    const result = validateCatchForm({ speciesId: species?.id ?? null, size, weight }, species);
    if (!result.ok || !species) {
      setErrors(result.ok ? {} : result.errors);
      return;
    }
    const entry: Catch = {
      id: createId('c'),
      userId: LOCAL_USER_ID,
      speciesId: species.id,
      sizeCm: result.sizeCm,
      weightKg: result.weightKg,
      caughtAt: new Date().toISOString(),
      isPrivate,
      photoUrl: photoUri,
      bait: bait.trim() || undefined,
      place: place.trim() || undefined,
    };
    const unlocked = isFirstCatchOfSpecies(mine, species.id);
    catchActions.add(entry);
    setSaved({ entry, species, unlocked });
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.fill}>
      <Screen scroll edges={['top', 'bottom']} keyboardShouldPersistTaps="handled">
        <ScreenHeader
          title={t('catch.register')}
          subtitle={t('register.subtitle')}
          right={<Button label={t('register.cancel')} variant="ghost" onPress={close} />}
        />

        <View style={styles.gap}>
          <View style={styles.photoBlock}>
            <Photo uri={photoUri} accessibilityLabel={photoUri ? t('register.photoChange') : t('register.photoAdd')}>
              {!photoUri ? (
                <View style={[styles.photoHint, { backgroundColor: colors.surface }]}>
                  <Icon name="camera" size={18} color={colors.primary} />
                  <AppText variant="label" tone="primary">
                    {t('register.photoAdd')}
                  </AppText>
                </View>
              ) : null}
            </Photo>
            <View style={styles.photoActions}>
              <Button
                label={t('register.photoCamera')}
                variant="secondary"
                icon="camera"
                onPress={() => choosePhoto('camera')}
                style={styles.flexBtn}
              />
              <Button
                label={t('register.photoLibrary')}
                variant="secondary"
                icon="plus"
                onPress={() => choosePhoto('library')}
                style={styles.flexBtn}
              />
            </View>
            <AppText variant="caption" tone="textMuted">
              {t('register.photoHelp')}
            </AppText>
          </View>

          <SpeciesPicker
            species={regional}
            value={species}
            onChange={(s) => {
              setSpecies(s);
              setErrors((e) => ({ ...e, species: undefined, size: undefined, weight: undefined }));
            }}
            error={msg(errors.species)}
          />

          <View style={styles.pair}>
            <View style={styles.flexBtn}>
              <TextField
                label={t('register.size')}
                value={size}
                onChangeText={(v) => {
                  setSize(v);
                  if (errors.size) setErrors((e) => ({ ...e, size: undefined }));
                }}
                placeholder="0"
                unit="cm"
                keyboardType="decimal-pad"
                help={t('catch.sizeRequired')}
                error={msg(errors.size)}
                maxLength={6}
              />
            </View>
            <View style={styles.flexBtn}>
              <TextField
                label={t('register.weight')}
                value={weight}
                onChangeText={(v) => {
                  setWeight(v);
                  if (errors.weight) setErrors((e) => ({ ...e, weight: undefined }));
                }}
                placeholder={t('register.optional')}
                unit="kg"
                keyboardType="decimal-pad"
                error={msg(errors.weight)}
                maxLength={6}
              />
            </View>
          </View>

          <TextField
            label={t('catch.bait')}
            value={bait}
            onChangeText={setBait}
            placeholder={t('register.baitPlaceholder')}
            maxLength={40}
          />
          <TextField
            label={t('register.place')}
            value={place}
            onChangeText={setPlace}
            placeholder={t('register.placePlaceholder')}
            icon="map-pin"
            maxLength={60}
          />
          <ToggleRow
            label={t('feed.privatePlace')}
            description={t('register.privateHelp')}
            icon="lock"
            value={isPrivate}
            onValueChange={setIsPrivate}
          />

          {plan === 'free' ? <QuotaMeter used={usedThisMonth} limit={FREE_MONTHLY_CATCH_LIMIT} /> : null}

          <Button label={t('register.save')} block icon="check" onPress={save} />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  gap: { gap: spacing.lg },
  photoBlock: { gap: spacing.sm },
  photoHint: {
    position: 'absolute',
    bottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    height: 32,
    borderRadius: radius.full,
  },
  photoActions: { flexDirection: 'row', gap: spacing.sm },
  flexBtn: { flex: 1 },
  pair: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  moment: { alignItems: 'stretch', gap: spacing.md, paddingTop: spacing.xxl },
  revealFrame: {
    aspectRatio: 1,
    width: '78%',
    alignSelf: 'center',
    borderRadius: radius.xl,
    borderWidth: 2,
    overflow: 'hidden',
    marginVertical: spacing.lg,
  },
  center: { alignItems: 'center', justifyContent: 'center' },
  progress: { gap: spacing.sm, marginTop: spacing.sm },
  momentActions: { gap: spacing.sm, marginTop: spacing.xl },
  centerSelf: { alignSelf: 'center' },
});
