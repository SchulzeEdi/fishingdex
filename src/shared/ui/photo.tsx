import type { ReactNode } from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from './icon/icon';
import { useTheme } from './theme';
import { radius } from './tokens';

interface PhotoProps {
  uri?: string | null;
  /** 4:3 no feed, 1:1 na Dex. */
  aspectRatio?: number;
  rounded?: number;
  /** Largura da silhueta no placeholder (30% na foto; maior em miniaturas). */
  placeholderWidth?: `${number}%`;
  accessibilityLabel: string;
  /** Sobreposição (ex.: selo "2º no ranking"). */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Foto da captura — a estrela. Sem foto: placeholder neutro com a silhueta do peixe. */
export function Photo({
  uri,
  aspectRatio = 4 / 3,
  rounded = radius.md,
  placeholderWidth = '30%',
  accessibilityLabel,
  children,
  style,
}: PhotoProps) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={[styles.frame, { aspectRatio, borderRadius: rounded, backgroundColor: colors.surfaceMuted }, style]}
    >
      {uri ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <View style={[styles.placeholder, { width: placeholderWidth }]}>
          <Icon name="fish-silhouette" width="100%" height="100%" color={colors.borderStrong} />
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center', width: '100%' },
  // Silhueta proporcional ao quadro (30% como no design system).
  placeholder: { aspectRatio: 64 / 40, opacity: 0.55 },
});
