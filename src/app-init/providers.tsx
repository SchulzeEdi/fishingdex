import 'react-native-url-polyfill/auto';

// Só os pesos usados (importar a raiz do pacote embutiria todos no app).
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { Sora_600SemiBold } from '@expo-google-fonts/sora/600SemiBold';
import { Sora_700Bold } from '@expo-google-fonts/sora/700Bold';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { getLocales } from 'expo-localization';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { seenStore } from '@/features/dex-collection';
import { startSession } from '@/features/session';
import { configureSupabase, getSupabase } from '@/shared/api';
import {
  isBackendConfigured,
  preferencesStore,
  resolveLocalePreference,
  useLocalePreference,
} from '@/shared/config';
import { I18nProvider, resolveLocale } from '@/shared/i18n';
import { configureStorage } from '@/shared/lib';
import { useTheme } from '@/shared/ui';

SplashScreen.preventAutoHideAsync().catch(() => undefined);
configureStorage(AsyncStorage);
configureSupabase(AsyncStorage);

// Preferências do aparelho (selo "Nova" da Dex) + login salvo no Supabase Auth.
const hydration = Promise.all([preferencesStore.hydrate(), seenStore.hydrate(), startSession()]);

// O token do Supabase só se renova com o app em primeiro plano (recomendação do supabase-js).
if (isBackendConfigured()) {
  AppState.addEventListener('change', (state) => {
    const auth = getSupabase().auth;
    if (state === 'active') auth.startAutoRefresh();
    else auth.stopAutoRefresh();
  });
}

/** Idioma e região do aparelho (pt/es/en; fallback en — D-3). */
export function deviceLocale() {
  const first = getLocales()[0];
  return { locale: resolveLocale(first?.languageTag), region: first?.regionCode ?? null };
}

/**
 * Providers globais: fontes Sora/Inter (sem elas o app perde a identidade), sessão do
 * Supabase, idioma e tema. A splash só some quando tudo está pronto (nada de spinner).
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const { colors, scheme } = useTheme();
  const [fontsLoaded, fontError] = useFonts({
    Sora_600SemiBold,
    Sora_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [hydrated, setHydrated] = useState(false);
  const [device] = useState(deviceLocale);
  // Idioma escolhido em Perfil › Preferências, ou o do aparelho.
  const locale = resolveLocalePreference(useLocalePreference(), device.locale);
  const ready = (fontsLoaded || !!fontError) && hydrated;

  useEffect(() => {
    hydration.finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => undefined);
  }, [colors.background]);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <I18nProvider locale={locale}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        {children}
      </I18nProvider>
    </SafeAreaProvider>
  );
}
