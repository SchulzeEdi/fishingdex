import { Stack } from 'expo-router';

import { AppProviders } from '@/app-init';
import { useTheme } from '@/shared/ui';

// Roteamento fino (Expo Router). Inicialização em src/app-init; telas em src/views (FSD).
function RootStack() {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="register" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="species/[id]" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <RootStack />
    </AppProviders>
  );
}
