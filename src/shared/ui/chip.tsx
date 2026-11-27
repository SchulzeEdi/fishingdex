import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from './icon/icon';
import type { IconName } from './icon/icons';
import { AppText } from './text';
import { useTheme } from './theme';
import { radius, spacing, textStyles } from './tokens';

interface ChipProps {
  /** Rótulo em text-muted (ex.: "Isca"). */
  label?: string;
  /** Valor em destaque (ex.: "Zara"). */
  value?: string;
  icon?: IconName;
  /** data: setup/local privado. water: habitat (accent-ink). */
  variant?: 'data' | 'water';
}

/** Etiqueta compacta de dado. */
export function Chip({ label, value, icon, variant = 'data' }: ChipProps) {
  const { colors } = useTheme();
  const water = variant === 'water';
  const fg = water ? colors.accentInk : colors.textMuted;
  return (
    <View
      style={[
        styles.chip,
        water
          ? { borderColor: colors.accentInk, borderWidth: 1 }
          : { backgroundColor: colors.surfaceMuted },
      ]}
    >
      {icon ? <Icon name={icon} size={14} color={fg} /> : null}
      {label ? (
        <AppText variant="caption" style={{ color: fg }}>
          {label}
        </AppText>
      ) : null}
      {value ? (
        <AppText variant="caption" style={[styles.value, { color: colors.text }]}>
          {value}
        </AppText>
      ) : null}
    </View>
  );
}

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

/** Filtro tocável (ranking): ativo inverte para text sobre background. */
export function FilterChip({ label, selected, onPress }: FilterChipProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.filter,
        selected
          ? { backgroundColor: colors.text, borderColor: colors.text }
          : { backgroundColor: colors.surface, borderColor: colors.borderStrong },
        pressed && { opacity: 0.85 },
      ]}
    >
      <AppText variant="label" style={{ color: selected ? colors.background : colors.text }}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
  },
  value: { fontFamily: textStyles.bodyStrong.fontFamily },
  filter: {
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    justifyContent: 'center',
  },
});
