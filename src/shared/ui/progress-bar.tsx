import { StyleSheet, View } from 'react-native';

import { useTheme } from './theme';
import { radius } from './tokens';

interface ProgressBarProps {
  /** 0–100. */
  percent: number;
  accessibilityLabel: string;
  max?: number;
  now?: number;
}

/** Barra 8px: trilho surface-muted, preenchimento primary. */
export function ProgressBar({ percent, accessibilityLabel, max = 100, now }: ProgressBarProps) {
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max, now: now ?? clamped }}
      style={[styles.track, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}
    >
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: colors.primary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, borderRadius: radius.full, overflow: 'hidden', borderWidth: 1 },
  fill: { height: '100%', borderRadius: radius.full },
});
