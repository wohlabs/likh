// usePersistentTheme.js
import { modernDarkTheme, modernLightTheme } from "@/theme/modernTheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const STORAGE_KEY = "APP_THEME"; // "light" | "dark"

export function usePersistentTheme() 
{
	const [isDark, setIsDark] = useState(false);
	const [ready, setReady] = useState(false);
	const [theme, setTheme] = useState(modernLightTheme);

	// Load saved theme
	useEffect(() => 
	{
		(async () => 
		{
			try 
			{
				const saved = await AsyncStorage.getItem(STORAGE_KEY);
				if (saved === "dark") 
				{
					setIsDark(true);
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
		AsyncStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
	}, [isDark, ready]);

	useEffect(() => 
	{
		setTheme(isDark ? modernDarkTheme : modernLightTheme)
	}, [isDark, ready]);

	return {
		theme: theme,
		isDark,
		toggleTheme: () => setIsDark((prev) => !prev),
		ready,
	};
}
