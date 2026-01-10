import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

// Modern, classy color palette
const lightColors = {
  primary: '#5B7AFF', // Rich indigo-blue
  primaryContainer: '#E9EFFE',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#2E3B9D',
  secondary: '#D54E7D', // Sophisticated mauve-pink
  secondaryContainer: '#F8DDE8',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#7D1B40',
  tertiary: '#7C5BA6', // Muted purple
  tertiaryContainer: '#F0E8FF',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#42275E',
  error: '#C41E3A',
  onError: '#FFFFFF',
  errorContainer: '#F7D8DC',
  onErrorContainer: '#630A0F',
  background: '#FAFBFC',
  onBackground: '#1A202C',
  surface: '#FFFFFF',
  onSurface: '#1A202C',
  surfaceVariant: '#F1F3FB',
  onSurfaceVariant: '#5A5F73',
  outline: '#C4C7D0',
  outlineVariant: '#E2E4EA',
  elevation: {
    level0: 'transparent',
    level1: '#F7F9FE',
    level2: '#EFF3FD',
    level3: '#E8ECFC',
    level4: '#E5EAFC',
    level5: '#E1E7FA',
  },
  inverseOnSurface: '#F2F4F9',
  inverseSurface: '#1A202C',
};

const darkColors = {
  primary: '#A5B4FC', // Light indigo
  primaryContainer: '#312E81',
  onPrimary: '#1F1B4D',
  onPrimaryContainer: '#E0E7FF',
  secondary: '#F472B6', // Light pink
  secondaryContainer: '#831843',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#FCE7F3',
  tertiary: '#D8B4FE', // Light violet
  tertiaryContainer: '#5B21B6',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#F3E8FF',
  error: '#EF4444',
  onError: '#7F1D1D',
  errorContainer: '#7F1D1D',
  onErrorContainer: '#FFEBEE',
  background: '#0F172A',
  onBackground: '#E2E8F0',
  surface: '#1E293B',
  onSurface: '#E2E8F0',
  surfaceVariant: '#334155',
  onSurfaceVariant: '#CBD5E1',
  outline: '#64748B',
  outlineVariant: '#475569',
  elevation: {
    level0: 'transparent',
    level1: '#1E293B',
    level2: '#334155',
    level3: '#475569',
    level4: '#64748B',
    level5: '#94A3B8',
  },
  inverseOnSurface: '#334155',
  inverseSurface: '#E2E8F0',
};

export const modernLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...lightColors,
  },
};

export const modernDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkColors,
  },
};

// Design system constants
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 20,
  round: 999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const typography = {
  displayLarge: {
    fontSize: 57,
    lineHeight: 64,
    fontWeight: '700' as const,
    letterSpacing: 0,
  },
  displayMedium: {
    fontSize: 45,
    lineHeight: 52,
    fontWeight: '700' as const,
    letterSpacing: 0,
  },
  displaySmall: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '700' as const,
    letterSpacing: 0,
  },
  headlineLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
  titleLarge: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
  titleMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  titleSmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
  },
  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
};
