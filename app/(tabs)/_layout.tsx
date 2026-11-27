import { Redirect, useRouter } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { useProfile } from '@/entities/user';
import { useI18n } from '@/shared/i18n';
import { useTheme } from '@/shared/ui';
import { TabBar, type TabItem } from '@/widgets/tab-bar';

// Abas do app. A barra é o widget TabBar (ícones do design system + FAB "Registrar").
export default function TabsLayout() {
  const router = useRouter();
  const { t } = useI18n();
  const { colors } = useTheme();
  const profile = useProfile();

  if (!profile) return <Redirect href="/onboarding" />;

  const tabs: TabItem[] = [
    { route: 'index', label: t('tab.feed'), icon: 'feed' },
    { route: 'ranking', label: t('tab.ranking'), icon: 'trophy' },
    { route: 'dex', label: t('tab.dex'), icon: 'fish' },
    { route: 'profile', label: t('tab.profile'), icon: 'user' },
  ];

  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background } }}
      tabBar={({ state, navigateToTab, insets }) => (
        <TabBar
          tabs={tabs}
          activeRoute={state.routes[state.index]?.name}
          onSelect={(name) => {
            const route = state.routes.find((r) => r.name === name);
            if (route) navigateToTab(route.key);
          }}
          onRegister={() => router.push('/register')}
          insets={insets}
        />
      )}
    >
      <Tabs.Screen name="index" options={{ title: t('tab.feed') }} />
      <Tabs.Screen name="ranking" options={{ title: t('tab.ranking') }} />
      <Tabs.Screen name="dex" options={{ title: t('tab.dex') }} />
      <Tabs.Screen name="profile" options={{ title: t('tab.profile') }} />
    </Tabs>
  );
}
