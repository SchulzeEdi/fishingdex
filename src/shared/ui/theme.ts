// Tokens do design system "Águas Profundas" (espelho de spec/design-tokens.json).
// Fonte de verdade dos valores: spec/design-tokens.json.

export interface Theme {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryFg: string;
  accent: string;
  highlight: string;
  highlightFg: string;
}

export const lightTheme: Theme = {
  background: '#F7F5F0',
  surface: '#FFFFFF',
  surfaceMuted: '#EFEDE6',
  border: '#E2DFD6',
  text: '#0B1F24',
  textMuted: '#5A564C',
  primary: '#0E4D5C',
  primaryFg: '#FFFFFF',
  accent: '#21C0A8',
  highlight: '#FF7A1A',
  highlightFg: '#221200',
};

export const darkTheme: Theme = {
  background: '#071519',
  surface: '#0E2229',
  surfaceMuted: '#13303A',
  border: '#1E3D47',
  text: '#EAF2F1',
  textMuted: '#9DB3B3',
  primary: '#2FA6BC',
  primaryFg: '#04222A',
  accent: '#21C0A8',
  highlight: '#FF8A33',
  highlightFg: '#1A0E00',
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 24 } as const;
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
