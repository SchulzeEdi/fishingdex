import { Pressable, StyleSheet, View } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';

import { useI18n } from '@/shared/i18n';
import { AppText, Icon, columnStyle, radius, size, spacing, textStyles, useTheme, type IconName } from '@/shared/ui';

export interface TabItem {
  /** Nome da rota (arquivo em app/(tabs)). */
  route: string;
  label: string;
  icon: IconName;
}

interface TabBarProps {
  tabs: readonly TabItem[];
  activeRoute: string | undefined;
  onSelect: (route: string) => void;
  /** FAB central "Registrar". */
  onRegister: () => void;
  insets: EdgeInsets;
}

/**
 * Navegação inferior com 5 posições e o FAB "Registrar" no centro (ícones do design system,
 * nunca emoji). Altura tabbar-height + safe area, fundo surface, shadow-md.
 */
export function TabBar({ tabs, activeRoute, onSelect, onRegister, insets }: TabBarProps) {
  const { colors, shadow } = useTheme();
  const { t } = useI18n();
  const half = Math.ceil(tabs.length / 2);
  const left = tabs.slice(0, half);
  const right = tabs.slice(half);

  const renderTab = (tab: TabItem) => {
    const active = tab.route === activeRoute;
    const color = active ? colors.primary : colors.textMuted;
    return (
      <Pressable
        key={tab.route}
        onPress={() => onSelect(tab.route)}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        accessibilityLabel={tab.label}
        style={styles.tab}
      >
        <View style={active && styles.activeIcon}>
          <Icon name={tab.icon} size={24} color={color} />
        </View>
        <AppText
          variant="caption"
          numberOfLines={1}
          style={[{ color }, active && { fontFamily: textStyles.bodyStrong.fontFamily }]}
        >
          {tab.label}
        </AppText>
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          boxShadow: shadow.md,
          paddingBottom: insets.bottom,
          height: size.tabbarHeight + insets.bottom,
        },
      ]}
    >
      <View accessibilityRole="tablist" style={[styles.row, columnStyle]}>
        {left.map(renderTab)}
        <View style={styles.fabSlot}>
          <Pressable
            onPress={onRegister}
            accessibilityRole="button"
            accessibilityLabel={t('catch.register')}
            style={({ pressed }) => [
              styles.fab,
              {
                backgroundColor: colors.primary,
                borderColor: colors.background,
                boxShadow: shadow.lg,
              },
              pressed && styles.fabPressed,
            ]}
          >
            <Icon name="plus" size={28} color={colors.primaryForeground} />
          </Pressable>
        </View>
        {right.map(renderTab)}
      </View>
    </View>
  );
}

const FAB_RING = 4;

const styles = StyleSheet.create({
  bar: { borderTopWidth: 1 },
  row: { flex: 1, flexDirection: 'row', alignItems: 'stretch' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, minHeight: size.touchMin },
  activeIcon: { transform: [{ translateY: -1 }] },
  fabSlot: { flex: 1, alignItems: 'center' },
  fab: {
    width: size.fabSize + FAB_RING * 2,
    height: size.fabSize + FAB_RING * 2,
    marginTop: -spacing.lg - FAB_RING,
    borderRadius: radius.full,
    borderWidth: FAB_RING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabPressed: { transform: [{ scale: 0.96 }] },
});
