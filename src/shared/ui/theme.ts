import { useColorScheme } from 'react-native';

import { palettes, shadows, type ColorScheme, type Palette } from './tokens';

export interface Theme {
  scheme: ColorScheme;
  colors: Palette;
  shadow: { sm: string; md: string; lg: string };
}

const themes: Record<ColorScheme, Theme> = {
  light: { scheme: 'light', colors: palettes.light, shadow: shadows.light },
  dark: { scheme: 'dark', colors: palettes.dark, shadow: shadows.dark },
};

/** Tema do sistema (claro é o padrão). */
export function useTheme(): Theme {
  return themes[useColorScheme() === 'dark' ? 'dark' : 'light'];
}

export function getTheme(scheme: ColorScheme): Theme {
  return themes[scheme];
}
