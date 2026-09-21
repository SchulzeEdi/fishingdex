import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { lightTheme } from '@/shared/ui';

// Abas do app (shell). Ícones em emoji por ora (troca por ícone real com o design).
function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return <Text style={{ fontSize: 20, color }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: lightTheme.primary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Feed', tabBarIcon: ({ color }) => <TabIcon emoji="🌊" color={color} /> }}
      />
      <Tabs.Screen
        name="ranking"
        options={{ title: 'Ranking', tabBarIcon: ({ color }) => <TabIcon emoji="🏆" color={color} /> }}
      />
      <Tabs.Screen
        name="dex"
        options={{ title: 'Dex', tabBarIcon: ({ color }) => <TabIcon emoji="🐟" color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Perfil', tabBarIcon: ({ color }) => <TabIcon emoji="👤" color={color} /> }}
      />
    </Tabs>
  );
}
