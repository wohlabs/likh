import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

// Modern, classy color palette
const lightColors = {
  primary: '#6366F1', // Indigo
  primaryContainer: '#E0E7FF',
  secondary: '#EC4899', // Pink
  secondaryContainer: '#FCE7F3',
  tertiary: '#8B5CF6', // Violet
  tertiaryContainer: '#F3E8FF',
  error: '#DC2626',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceVariant: '#F3F4F6',
  outline: '#D1D5DB',
  outlineVariant: '#E5E7EB',
};

const darkColors = {
  primary: '#A5B4FC', // Light indigo
  primaryContainer: '#312E81',
  secondary: '#F472B6', // Light pink
  secondaryContainer: '#831843',
  tertiary: '#D8B4FE', // Light violet
  tertiaryContainer: '#5B21B6',
  error: '#EF4444',
  background: '#0F172A',
  surface: '#1E293B',
  surfaceVariant: '#334155',
  outline: '#64748B',
  outlineVariant: '#475569',
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
