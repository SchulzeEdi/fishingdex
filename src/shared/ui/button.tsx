import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from './icon/icon';
import type { IconName } from './icon/icons';
import { AppText } from './text';
import { useTheme } from './theme';
import { radius, size, spacing, textStyles, type Palette } from './tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'pro' | 'whatsapp';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  /** primary: no máximo um por tela. pro: só "Assinar Pro". whatsapp: só contato de pesqueiro. */
  variant?: ButtonVariant;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  /** Ocupa a largura do container. */
  block?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

function paint(variant: ButtonVariant, c: Palette) {
  switch (variant) {
    case 'primary':
      return { bg: c.primary, fg: c.primaryForeground, border: 'transparent' };
    case 'secondary':
      return { bg: c.surface, fg: c.text, border: c.borderStrong };
    case 'ghost':
      return { bg: 'transparent', fg: c.primary, border: 'transparent' };
    case 'danger':
      return { bg: c.danger, fg: c.onStatus, border: 'transparent' };
    case 'pro':
      return { bg: c.highlight, fg: c.highlightForeground, border: 'transparent' };
    case 'whatsapp':
      return { bg: c.whatsapp, fg: '#0b1f24', border: 'transparent' };
  }
}

/** Botão do design system: altura control-height, raio radius-md, rótulo Sora 600. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  loading,
  block,
  accessibilityHint,
  style,
}: ButtonProps) {
  const { colors } = useTheme();
  const p = disabled
    ? { bg: colors.disabledBg, fg: colors.disabledFg, border: 'transparent' }
    : paint(variant, colors);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      style={[
        styles.base,
        variant === 'ghost' && styles.ghost,
        { backgroundColor: p.bg, borderColor: p.border },
        block && styles.block,
        style,
      ]}
    >
      {({ pressed }) => (
        <>
          <View style={[styles.content, loading && styles.hidden]}>
            {icon ? <Icon name={icon} size={18} color={p.fg} /> : null}
            <AppText variant="button" style={{ color: p.fg }} numberOfLines={1}>
              {label}
            </AppText>
          </View>
          {loading ? <ActivityIndicator style={StyleSheet.absoluteFill} color={p.fg} /> : null}
          {/* RN não tem hover: pressionado escurece 8%. */}
          {pressed ? <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.pressed]} /> : null}
        </>
      )}
    </Pressable>
  );
}

interface IconButtonProps {
  icon: IconName;
  accessibilityLabel: string;
  onPress?: () => void;
  color?: string;
  /** Contador ao lado do ícone (ex.: curtidas). */
  count?: number;
  selected?: boolean;
}

/** Ação só com ícone, alvo ≥ touch-min. */
export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  color,
  count,
  selected,
}: IconButtonProps) {
  const { colors } = useTheme();
  const tint = color ?? colors.textMuted;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={selected !== undefined ? { selected } : undefined}
      hitSlop={4}
      style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
    >
      <Icon name={icon} size={24} color={tint} />
      {count !== undefined ? (
        <AppText variant="label" tabular style={[styles.count, { color: tint }]}>
          {count}
        </AppText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: size.controlHeight,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  ghost: { paddingHorizontal: spacing.md },
  block: { alignSelf: 'stretch' },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  hidden: { opacity: 0 },
  pressed: { backgroundColor: '#000', opacity: 0.08 },
  iconBtn: {
    minWidth: size.touchMin,
    height: size.touchMin,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.full,
  },
  count: { fontFamily: textStyles.bodyStrong.fontFamily },
});
