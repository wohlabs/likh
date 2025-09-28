import MainNavigator from "@/components/MainNavigator";
import ThemeButton from "@/components/ThemeButton";
import ThemeText from "@/components/ThemeText";
import { AuthProvider } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text } from "react-native";
import { Button, MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
	return (
		<GestureHandlerRootView>
			<PaperProvider theme={MD3LightTheme}>

				<AuthProvider>
					<KeyboardAvoidingView
						style={{ flex: 1 }}
						behavior={Platform.OS === "ios" ? "padding" : "height"}
					>
						<MainNavigator />
					</KeyboardAvoidingView>
				</AuthProvider>
			</PaperProvider>
		</GestureHandlerRootView>
	);
}
