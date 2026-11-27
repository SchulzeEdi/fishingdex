import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from './theme';
import { textStyles, type Palette, type TextVariant } from './tokens';

export type TextTone = keyof Pick<
  Palette,
  | 'text'
  | 'textMuted'
  | 'primary'
  | 'primaryForeground'
  | 'accentInk'
  | 'highlightInk'
  | 'highlightForeground'
  | 'danger'
  | 'onStatus'
>;

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  tone?: TextTone;
  /** Algarismos tabulares para números que se comparam (tamanho, posição, contagem). */
  tabular?: boolean;
  align?: TextStyle['textAlign'];
}

/** Texto tipográfico do design system: Sora (display) para títulos/números, Inter no resto. */
export function AppText({
  variant = 'body',
  tone = 'text',
  tabular,
  align,
  style,
  ...rest
}: AppTextProps) {
  const { colors } = useTheme();
  return (
    <Text
      {...rest}
      style={[
        textStyles[variant],
        { color: colors[tone] },
        tabular && { fontVariant: ['tabular-nums'] },
        align && { textAlign: align },
        style,
      ]}
    />
  );
}
