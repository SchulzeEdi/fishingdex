import { StyleSheet, Switch, View } from 'react-native';

import { Icon } from './icon/icon';
import type { IconName } from './icon/icons';
import { AppText } from './text';
import { useTheme } from './theme';
import { radius, size, spacing } from './tokens';

interface ToggleRowProps {
  label: string;
  description?: string;
  icon?: IconName;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

/** Linha com chave liga/desliga (ex.: "Local privado"). */
export function ToggleRow({ label, description, icon, value, onValueChange }: ToggleRowProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {icon ? <Icon name={icon} size={18} color={colors.textMuted} /> : null}
      <View style={styles.text}>
        <AppText variant="bodyStrong">{label}</AppText>
        {description ? (
          <AppText variant="caption" tone="textMuted">
            {description}
          </AppText>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        accessibilityLabel={label}
        trackColor={{ false: colors.borderStrong, true: colors.primary }}
        thumbColor={colors.surface}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: size.controlHeight + spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  text: { flex: 1, gap: 2 },
});
