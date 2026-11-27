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
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { catchStore } from '@/entities/catch';
import { sessionStore } from '@/entities/user';
import { seenStore } from '@/features/dex-collection';
import { I18nProvider, resolveLocale } from '@/shared/i18n';
import { configureStorage } from '@/shared/lib';
import { useTheme } from '@/shared/ui';

SplashScreen.preventAutoHideAsync().catch(() => undefined);
configureStorage(AsyncStorage);

const hydration = Promise.all([sessionStore.hydrate(), catchStore.hydrate(), seenStore.hydrate()]);

/** Idioma e região do aparelho (pt/es/en; fallback en — D-3). */
export function deviceLocale() {
  const first = getLocales()[0];
  return { locale: resolveLocale(first?.languageTag), region: first?.regionCode ?? null };
}

/**
 * Providers globais: fontes Sora/Inter (sem elas o app perde a identidade), estado salvo do
 * aparelho, idioma e tema. A splash só some quando tudo está pronto (nada de spinner).
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
  const [{ locale }] = useState(deviceLocale);
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
