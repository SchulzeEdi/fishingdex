import { useState } from 'react';
import { StyleSheet, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { Icon } from './icon/icon';
import type { IconName } from './icon/icons';
import { AppText } from './text';
import { useTheme } from './theme';
import { radius, size, spacing, textStyles } from './tokens';

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  /** Unidade à direita (cm, kg). */
  unit?: string;
  /** Ícone à esquerda (busca). */
  icon?: IconName;
  help?: string;
  /** Mensagem de erro: borda danger + ícone alert (nunca só a cor). */
  error?: string;
  disabled?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words';
  maxLength?: number;
  returnKeyType?: 'done' | 'next' | 'search';
  secureTextEntry?: boolean;
}

/** Campo com label sempre visível. Foco: borda primary + halo accent. */
export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  unit,
  icon,
  help,
  error,
  disabled,
  keyboardType,
  autoCapitalize,
  maxLength,
  returnKeyType,
  secureTextEntry,
}: TextFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.danger : focused ? colors.primary : colors.borderStrong;

  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      <View
        style={[
          styles.halo,
          { borderColor: focused && !error ? colors.accent + '73' : 'transparent' },
        ]}
      >
        <View
          style={[
            styles.input,
            { borderColor, backgroundColor: disabled ? colors.surfaceMuted : colors.surface },
          ]}
        >
          {icon ? <Icon name={icon} size={18} color={colors.textMuted} /> : null}
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            editable={!disabled}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            maxLength={maxLength}
            returnKeyType={returnKeyType}
            secureTextEntry={secureTextEntry}
            autoComplete={secureTextEntry ? 'password' : keyboardType === 'email-address' ? 'email' : undefined}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            accessibilityLabel={label}
            accessibilityHint={error ?? help}
            style={[styles.native, { color: disabled ? colors.textMuted : colors.text }]}
          />
          {unit ? (
            <AppText variant="label" style={[styles.unit, { color: colors.textMuted }]}>
              {unit}
            </AppText>
          ) : null}
        </View>
      </View>
      {error ? (
        <View style={styles.help} accessibilityLiveRegion="polite">
          <Icon name="alert" size={14} color={colors.danger} />
          <AppText variant="caption" tone="danger" style={styles.helpText}>
            {error}
          </AppText>
        </View>
      ) : help ? (
        <AppText variant="caption" tone="textMuted">
          {help}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  halo: { borderWidth: 3, borderRadius: radius.md + 3, margin: -3 },
  input: {
    height: size.controlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  native: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 0,
    fontFamily: textStyles.body.fontFamily,
    fontSize: textStyles.body.fontSize,
  },
  unit: { fontFamily: textStyles.bodyStrong.fontFamily },
  help: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  helpText: { flexShrink: 1 },
});
