import { StyleSheet, View } from 'react-native';

import { Icon } from './icon/icon';
import type { IconName } from './icon/icons';
import { AppText } from './text';
import { useTheme } from './theme';
import { radius, spacing, textStyles } from './tokens';

interface BadgeProps {
  label: string;
  /** muted: Free (contorno border-strong). primary: Pro. */
  tone?: 'muted' | 'primary';
  icon?: IconName;
}

/** Selo curto em caixa alta (plano). */
export function Badge({ label, tone = 'muted', icon }: BadgeProps) {
  const { colors } = useTheme();
  const isPrimary = tone === 'primary';
  const fg = isPrimary ? colors.primaryForeground : colors.textMuted;
  return (
    <View
      style={[
        styles.badge,
        isPrimary
          ? { backgroundColor: colors.primary, borderColor: colors.primary }
          : { backgroundColor: colors.surfaceMuted, borderColor: colors.borderStrong },
      ]}
    >
      {icon ? <Icon name={icon} size={14} color={fg} /> : null}
      <AppText variant="overline" style={{ color: fg }}>
        {label}
      </AppText>
    </View>
  );
}

/** Código do país (BR, AR, US) no lugar do emoji de bandeira. */
export function Flag({ code }: { code: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.flag, { borderColor: colors.borderStrong }]} accessibilityLabel={code}>
      <AppText style={[styles.flagText, { color: colors.textMuted }]}>{code}</AppText>
    </View>
  );
}

interface PipsProps {
  filled: number;
  total?: number;
  color: string;
  size?: number;
}

/** Pips (bolinhas) de raridade/cota: a cor nunca é a única pista. */
export function Pips({ filled, total = 4, color, size = 6 }: PipsProps) {
  return (
    <View style={styles.pips}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: radius.full,
            borderWidth: 1.5,
            borderColor: color,
            backgroundColor: i < filled ? color : 'transparent',
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    height: 22,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  flag: {
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
  },
  flagText: { fontFamily: textStyles.overline.fontFamily, fontSize: 10, lineHeight: 12, letterSpacing: 0.6 },
  pips: { flexDirection: 'row', gap: spacing.xxs, alignItems: 'center' },
});
