import MainNavigator from "@/components/MainNavigator";
import ThemeButton from "@/components/ThemeButton";
import ThemeText from "@/components/ThemeText";
import { AuthProvider } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text, useColorScheme } from "react-native";
import { Button, MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [theme, setTheme] = useState(MD3LightTheme);

	useEffect(() => {
		// necessary to avoid mixing themes on initial load
		if (colorScheme === 'dark') setTheme(MD3DarkTheme);
		else setTheme(MD3LightTheme);
	}, [colorScheme]);

	return (
		<PaperProvider theme={theme}>
			<GestureHandlerRootView>
					<AuthProvider>
						<KeyboardAvoidingView
							style={{ flex: 1 }}
							behavior={Platform.OS === "ios" ? "padding" : "height"}
						>
							<MainNavigator />
						</KeyboardAvoidingView>
					</AuthProvider>
			</GestureHandlerRootView>
		</PaperProvider>
	);
}
