// usePersistentTheme.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { vars } from "nativewind";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "APP_THEME"; // "light" | "dark"

// theme/theme-vars.ts
export type ThemeVars = {
	'--color-primary': string;
	'--color-primaryContainer': string;
	'--color-onPrimary': string;
	'--color-onPrimaryContainer': string;
	'--color-secondary': string;
	'--color-secondaryContainer': string;
	'--color-onSecondary': string;
	'--color-onSecondaryContainer': string;
	'--color-tertiary': string;
	'--color-tertiaryContainer': string;
	'--color-onTertiary': string;
	'--color-onTertiaryContainer': string;
	'--color-statusError': string;
	'--color-onStatusError': string;
	'--color-statusErrorContainer': string;
	'--color-onStatusErrorContainer': string;
	'--color-background': string;
	'--color-onBackground': string;
	'--color-surface': string;
	'--color-onSurface': string;
	'--color-surfaceVariant': string;
	'--color-onSurfaceVariant': string;
	'--color-outline': string;
	'--color-outlineVariant': string;
	'--color-elevation-level0': string;
	'--color-elevation-level1': string;
	'--color-elevation-level2': string;
	'--color-elevation-level3': string;
	'--color-elevation-level4': string;
	'--color-elevation-level5': string;
	'--color-inverseOnSurface': string;
	'--color-inverseSurface': string;
	'--color-disabledBackground': string;
	'--color-onDisabledBackground': string;
};

export const themes: { light: ThemeVars, dark: ThemeVars} = {
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
		'--color-statusError': '#C41E3A',
		'--color-onStatusError': '#FFFFFF',
		'--color-statusErrorContainer': '#F7D8DC',
		'--color-onStatusErrorContainer': '#630A0F',
		'--color-background': '#FAFBFC',
		'--color-onBackground': '#1A202C',
		'--color-surface': '#FFFFFF',
		'--color-onSurface': '#1A202C',
		'--color-surfaceVariant': '#EEEFF7',
		'--color-onSurfaceVariant': '#404453',
		'--color-outline': '#C4C7D0',
		'--color-outlineVariant': '#E2E4EA',
		'--color-elevation-level0': 'transparent',
		'--color-elevation-level1': '#F7F9FE',
		'--color-elevation-level2': '#EFF3FD',
		'--color-elevation-level3': '#E8ECFC',
		'--color-elevation-level4': '#D9E0F2',
		'--color-elevation-level5': '#D3DDF0',
		'--color-inverseOnSurface': '#F2F4F9',
		'--color-inverseSurface': '#1A202C',
		'--color-disabledBackground': '#e3e3e4',
		'--color-onDisabledBackground': '#989799'
	}) as ThemeVars,
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
		'--color-statusError': '#EF4444',
		'--color-onStatusError': '#7F1D1D',
		'--color-statusErrorContainer': '#7F1D1D',
		'--color-onStatusErrorContainer': '#FFEBEE',
		'--color-background': '#0F172A',
		'--color-onBackground': '#E2E8F0',
		'--color-surface': '#1E293B',
		'--color-onSurface': '#E2E8F0',
		'--color-surfaceVariant': '#334155',
		'--color-onSurfaceVariant': '#dce3ec',
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
		'--color-disabledBackground': '#363f50',
		'--color-onDisabledBackground': '#787d89'
	}) as ThemeVars,
}

type ThemeScheme = 'light' | 'dark';

interface ThemeContextValue {
	theme: ThemeVars;
	themeScheme: ThemeScheme;
	toggleTheme: () => void;
	ready: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
	children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) 
{
	const [ready, setReady] = useState(false);
	const [theme, setTheme] = useState<ThemeVars>(themes['light']);
	const [themeScheme, setThemeScheme] = useState<ThemeScheme>('light');

	// Load saved theme
	useEffect(() => 
	{
		(async () => 
		{
			try 
			{
				const saved = await AsyncStorage.getItem(STORAGE_KEY);
				if (saved === 'light' || saved === 'dark')
				{
					setThemeScheme(saved);
				}
				else
				{
					setThemeScheme('light');
				}
			}
			finally 
			{
				setReady(true);
			}
		})();
	}, []);

	// Persist theme
	useEffect(() => 
	{
		if (!ready) return;
		AsyncStorage.setItem(STORAGE_KEY, themeScheme);
	}, [themeScheme, ready]);

	// Update theme object
	useEffect(() => 
	{
		setTheme(themeScheme === 'dark' ? themes['dark'] : themes['light']);
	}, [themeScheme, ready]);

	const value: ThemeContextValue = {
		theme,
		themeScheme,
		toggleTheme: () => setThemeScheme(prev => prev === 'dark' ? 'light' : 'dark'),
		ready,
	};

	return (
		<ThemeContext.Provider value={value}>
			{children}
		</ThemeContext.Provider>
	);
}
export function usePersistentTheme() 
{
	const context = useContext(ThemeContext);

	if (!context) 
	{
		throw new Error('useTheme must be used within a ThemeProvider');
	}

	return context;
}