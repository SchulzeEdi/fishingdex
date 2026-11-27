// Tokens do design system "Águas Profundas" (espelho de spec/design-tokens.json, revisão do
// Claude Design). Fonte de verdade dos valores: spec/design-tokens.json. Aqui só os valores
// prontos para React Native — composição fica nos componentes.

export type ColorScheme = 'light' | 'dark';

export interface Palette {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  /** Contorno de controle (input, segmented, botão secundário): ≥3:1. */
  borderStrong: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  /** Accent legível como texto pequeno. */
  accentInk: string;
  /** Laranja da competição — só como FUNDO (ranking e "Assinar Pro"). */
  highlight: string;
  highlightForeground: string;
  /** Laranja como texto (tamanho no ranking). */
  highlightInk: string;
  success: string;
  warning: string;
  danger: string;
  onStatus: string;
  silhouette: string;
  rarityCommon: string;
  rarityUncommon: string;
  rarityRare: string;
  rarityLegendary: string;
  whatsapp: string;
  scrim: string;
  /** Primitivos só para estado desabilitado. */
  disabledBg: string;
  disabledFg: string;
}

export const palettes: Record<ColorScheme, Palette> = {
  light: {
    background: '#f7f5f0',
    surface: '#ffffff',
    surfaceMuted: '#efede6',
    border: '#e2dfd6',
    borderStrong: '#8f8a7e',
    text: '#0b1f24',
    textMuted: '#5a564c',
    primary: '#0e4d5c',
    primaryForeground: '#ffffff',
    accent: '#21c0a8',
    accentForeground: '#06231e',
    accentInk: '#0a7364',
    highlight: '#ff7a1a',
    highlightForeground: '#221200',
    highlightInk: '#b34a00',
    success: '#16a34a',
    warning: '#d97706',
    danger: '#dc2626',
    onStatus: '#ffffff',
    silhouette: '#2a3f47',
    rarityCommon: '#5a564c',
    rarityUncommon: '#0a7364',
    rarityRare: '#1f5fb8',
    rarityLegendary: '#8a5a00',
    whatsapp: '#25d366',
    scrim: 'rgba(11, 31, 36, 0.48)',
    disabledBg: '#cbc7bb',
    disabledFg: '#5a564c',
  },
  dark: {
    background: '#071519',
    surface: '#0e2229',
    surfaceMuted: '#13303a',
    border: '#1e3d47',
    borderStrong: '#5c7d87',
    text: '#eaf2f1',
    textMuted: '#9db3b3',
    primary: '#2fa6bc',
    primaryForeground: '#04222a',
    accent: '#21c0a8',
    accentForeground: '#04221d',
    accentInk: '#21c0a8',
    highlight: '#ff8a33',
    highlightForeground: '#1a0e00',
    highlightInk: '#ff8a33',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#f87171',
    onStatus: '#04140a',
    silhouette: '#5b8390',
    rarityCommon: '#9db3b3',
    rarityUncommon: '#21c0a8',
    rarityRare: '#7fb2ff',
    rarityLegendary: '#e8b64a',
    whatsapp: '#25d366',
    scrim: 'rgba(0, 0, 0, 0.6)',
    disabledBg: '#cbc7bb',
    disabledFg: '#5a564c',
  },
};

/** Sombras (CSS box-shadow, suportado pelo RN na nova arquitetura). Só no que flutua. */
export const shadows: Record<ColorScheme, { sm: string; md: string; lg: string }> = {
  light: {
    sm: '0px 1px 3px rgba(11, 31, 36, 0.06)',
    md: '0px 3px 8px rgba(11, 31, 36, 0.10)',
    lg: '0px 8px 18px rgba(11, 31, 36, 0.14)',
  },
  dark: {
    sm: '0px 1px 3px rgba(0, 0, 0, 0.4)',
    md: '0px 3px 8px rgba(0, 0, 0, 0.5)',
    lg: '0px 8px 18px rgba(0, 0, 0, 0.6)',
  },
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  '3xl': 48,
  '4xl': 64,
} as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 } as const;

export const size = {
  touchMin: 44,
  controlHeight: 48,
  tabbarHeight: 64,
  fabSize: 56,
  contentMax: 480,
} as const;

/**
 * Famílias carregadas com @expo-google-fonts. No Android o peso vem da família (não use
 * fontWeight junto), por isso cada peso tem o seu nome.
 */
export const fonts = {
  display600: 'Sora_600SemiBold',
  display700: 'Sora_700Bold',
  body400: 'Inter_400Regular',
  body500: 'Inter_500Medium',
  body600: 'Inter_600SemiBold',
  body700: 'Inter_700Bold',
} as const;

export interface TextStyleToken {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
  textTransform?: 'uppercase';
}

export const textStyles = {
  /** Número herói: recorde, % da Dex, desbloqueio. */
  display: { fontFamily: fonts.display700, fontSize: 48, lineHeight: 52, letterSpacing: -0.96 },
  rankNumber: { fontFamily: fonts.display700, fontSize: 36, lineHeight: 40 },
  /** Um por tela. */
  title: { fontFamily: fonts.display700, fontSize: 30, lineHeight: 36, letterSpacing: -0.3 },
  heading: { fontFamily: fonts.display600, fontSize: 20, lineHeight: 26 },
  metric: { fontFamily: fonts.display700, fontSize: 18, lineHeight: 24 },
  button: { fontFamily: fonts.display600, fontSize: 16, lineHeight: 20 },
  bodyLg: { fontFamily: fonts.body400, fontSize: 18, lineHeight: 26 },
  body: { fontFamily: fonts.body400, fontSize: 16, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.body600, fontSize: 16, lineHeight: 22 },
  label: { fontFamily: fonts.body500, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.body500, fontSize: 12, lineHeight: 16 },
  overline: {
    fontFamily: fonts.body700,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.88,
    textTransform: 'uppercase',
  },
} satisfies Record<string, TextStyleToken>;

export type TextVariant = keyof typeof textStyles;

/** Movimento: 150–250ms, ease-out. */
export const motion = { fast: 150, base: 200, slow: 250 } as const;
