import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from './icon/icon';
import type { IconName } from './icon/icons';
import { AppText } from './text';
import { useTheme } from './theme';
import { radius, spacing, textStyles } from './tokens';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: IconName;
  /** Contador tabular (ex.: "12/48"). */
  count?: string;
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
  /** Ocupa a largura toda, dividindo igualmente. */
  stretch?: boolean;
}

/** Alternância entre 2–4 visões da mesma lista. Trilho surface-muted, ativo em primary. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  stretch,
}: SegmentedControlProps<T>) {
  const { colors, shadow } = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.track,
        { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
        stretch ? styles.stretch : styles.inline,
      ]}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        const fg = active ? colors.primaryForeground : colors.textMuted;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[
              styles.option,
              stretch && styles.optionStretch,
              active && { backgroundColor: colors.primary, boxShadow: shadow.sm },
            ]}
          >
            {opt.icon ? <Icon name={opt.icon} size={18} color={fg} /> : null}
            <AppText
              variant="label"
              numberOfLines={1}
              style={[{ color: fg }, active && { fontFamily: textStyles.bodyStrong.fontFamily }]}
            >
              {opt.label}
            </AppText>
            {opt.count ? (
              <AppText variant="label" tabular style={{ color: fg, opacity: 0.8 }}>
                {opt.count}
              </AppText>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: 3,
    gap: 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  inline: { alignSelf: 'flex-start' },
  stretch: { alignSelf: 'stretch' },
  option: {
    height: 38,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  optionStretch: { flex: 1, paddingHorizontal: spacing.sm },
});
