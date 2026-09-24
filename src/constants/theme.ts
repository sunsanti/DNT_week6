import { useColorScheme } from 'react-native';

// Palette from the ui-ux-pro-max design-system search ("campus study room booking
// productivity utility" --design-system): Minimalism & Swiss Style, focus blue + session green.
export const lightColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E4ECFC',
  text: '#0F172A',
  textMuted: '#475569',
  primary: '#2563EB',
  onPrimary: '#FFFFFF',
  accent: '#059669',
  accentBg: '#DCFCE7',
  destructive: '#DC2626',
  destructiveBg: '#FEE2E2',
  disabled: '#CBD5E1',
  ring: '#2563EB',
} as const;

export const darkColors = {
  background: '#0F172A',
  surface: '#1E293B',
  border: '#334155',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
  primary: '#3B82F6',
  onPrimary: '#0F172A',
  accent: '#34D399',
  accentBg: '#064E3B',
  destructive: '#F87171',
  destructiveBg: '#450A0A',
  disabled: '#475569',
  ring: '#3B82F6',
} as const;

export interface ThemeColors {
  background: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  accent: string;
  accentBg: string;
  destructive: string;
  destructiveBg: string;
  disabled: string;
  ring: string;
}

export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkColors : lightColors;
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
} as const;

// Inter, per the design-system search result. Loaded via @expo-google-fonts/inter in App.tsx.
export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

// 44x44 (iOS) / 48x48 (Android) minimum touch target, per pro-rules.md.
export const minTouchTarget = 44;
