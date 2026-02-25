// usePersistentTheme.js
import { modernDarkTheme, modernLightTheme } from "@/theme/modernTheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { vars } from "nativewind";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "APP_THEME"; // "light" | "dark"

export const themes = {
	light: vars({
		'--color-primary': '#5B7AFF',
		'--color-primaryContainer': '#E9EFFE',
		'--color-onPrimary': '#FFFFFF',
		'--color-onPrimaryContainer': '#2E3B9D',
		'--color-secondary': '#D54E7D',
		'--color-secondaryContainer': '#F8DDE8',
		'--color-onSecondary': '#FFFFFF',
		'--color-onSecondaryContainer': '#7D1B40',
		'--color-tertiary': '#7C5BA6',
		'--color-tertiaryContainer': '#F0E8FF',
		'--color-onTertiary': '#FFFFFF',
		'--color-onTertiaryContainer': '#42275E',
		'--color-error': '#C41E3A',
		'--color-onError': '#FFFFFF',
		'--color-errorContainer': '#F7D8DC',
		'--color-onErrorContainer': '#630A0F',
		'--color-background': '#FAFBFC',
		'--color-onBackground': '#1A202C',
		'--color-surface': '#FFFFFF',
		'--color-onSurface': '#1A202C',
		'--color-surfaceVariant': '#F1F3FB',
		'--color-onSurfaceVariant': '#5A5F73',
		'--color-outline': '#C4C7D0',
		'--color-outlineVariant': '#E2E4EA',
		'--color-elevation-level0': 'transparent',
		'--color-elevation-level1': '#F7F9FE',
		'--color-elevation-level2': '#EFF3FD',
		'--color-elevation-level3': '#E8ECFC',
		'--color-elevation-level4': '#E5EAFC',
		'--color-elevation-level5': '#E1E7FA',
		'--color-inverseOnSurface': '#F2F4F9',
		'--color-inverseSurface': '#1A202C',
	}),
	dark: vars({
		'--color-primary': '#A5B4FC', // Light indigo
		'--color-primaryContainer': '#312E81',
		'--color-onPrimary': '#1F1B4D',
		'--color-onPrimaryContainer': '#E0E7FF',
		'--color-secondary': '#F472B6', // Light pink
		'--color-secondaryContainer': '#831843',
		'--color-onSecondary': '#FFFFFF',
		'--color-onSecondaryContainer': '#FCE7F3',
		'--color-tertiary': '#D8B4FE', // Light violet
		'--color-tertiaryContainer': '#5B21B6',
		'--color-onTertiary': '#FFFFFF',
		'--color-onTertiaryContainer': '#F3E8FF',
		'--color-error': '#EF4444',
		'--color-onError': '#7F1D1D',
		'--color-errorContainer': '#7F1D1D',
		'--color-onErrorContainer': '#FFEBEE',
		'--color-background': '#0F172A',
		'--color-onBackground': '#E2E8F0',
		'--color-surface': '#1E293B',
		'--color-onSurface': '#E2E8F0',
		'--color-surfaceVariant': '#334155',
		'--color-onSurfaceVariant': '#CBD5E1',
		'--color-outline': '#64748B',
		'--color-outlineVariant': '#475569',
		'--color-elevation-level0': 'transparent',
		'--color-elevation-level1': '#1E293B',
		'--color-elevation-level2': '#334155',
		'--color-elevation-level3': '#475569',
		'--color-elevation-level4': '#64748B',
		'--color-elevation-level5': '#94A3B8',
		'--color-inverseOnSurface': '#334155',
		'--color-inverseSurface': '#E2E8F0',
	}),
}

type ThemeScheme = 'light' | 'dark';

interface ThemeContextValue {
	theme: typeof modernLightTheme;
	isDark: boolean;
	themeScheme: ThemeScheme;
	toggleTheme: () => void;
	ready: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
	children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
	const [isDark, setIsDark] = useState(false);
	const [ready, setReady] = useState(false);
	const [theme, setTheme] = useState(modernLightTheme);
	const [themeScheme, setThemeScheme] = useState<ThemeScheme>('light');

	// Load saved theme
	useEffect(() => {
		(async () => {
			try {
				const saved = await AsyncStorage.getItem(STORAGE_KEY);
				if (saved === 'dark') {
					setIsDark(true);
				}
			} finally {
				setReady(true);
			}
		})();
	}, []);

	// Persist theme
	useEffect(() => {
		if (!ready) return;
		AsyncStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
	}, [isDark, ready]);

	// Update theme object
	useEffect(() => {
		setTheme(isDark ? modernDarkTheme : modernLightTheme);
		setThemeScheme(isDark ? 'dark' : 'light');
	}, [isDark, ready]);

	const value: ThemeContextValue = {
		theme,
		isDark,
		themeScheme,
		toggleTheme: () => setIsDark(prev => !prev),
		ready,
	};

	return (
		<ThemeContext.Provider value={value}>
			{children}
		</ThemeContext.Provider>
	);
}
export function usePersistentTheme() {
	const context = useContext(ThemeContext);

	if (!context) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}

	return context;
}