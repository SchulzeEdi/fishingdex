import { Image, StyleSheet, View } from 'react-native';

import { AppText } from './text';
import { useTheme } from './theme';
import { fonts, radius } from './tokens';

interface AvatarProps {
  name: string;
  uri?: string | null;
  /** md: 36px em listas/cards. lg: 88px com anel primary (topo do perfil). podium: 48px. */
  size?: 'md' | 'podium' | 'lg';
}

const DIM = { md: 36, podium: 48, lg: 88 } as const;
const FONT = { md: 14, podium: 18, lg: 32 } as const;

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : (parts[0]?.[1] ?? '');
  return (first + second).toUpperCase();
}

/** Foto ou iniciais do pescador em círculo (substitui o emoji 🎣). */
export function Avatar({ name, uri, size = 'md' }: AvatarProps) {
  const { colors } = useTheme();
  const dim = DIM[size];
  const lg = size === 'lg';
  const circle = {
    width: dim,
    height: dim,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    borderColor: lg ? colors.surface : colors.border,
    borderWidth: lg ? 3 : 1,
  };
  const body = uri ? (
    <Image source={{ uri }} style={[circle, styles.img]} accessibilityIgnoresInvertColors />
  ) : (
    <View style={[circle, styles.center]}>
      <AppText style={{ fontFamily: fonts.display700, fontSize: FONT[size], lineHeight: FONT[size] * 1.2, color: colors.primary }}>
        {initialsOf(name)}
      </AppText>
    </View>
  );
  if (!lg) return body;
  // Anel primary de 2px por fora (box-shadow 0 0 0 2px).
  return <View style={[styles.ring, { borderColor: colors.primary }]}>{body}</View>;
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  img: { resizeMode: 'cover' },
  ring: { borderWidth: 2, borderRadius: radius.full, padding: 0 },
});
