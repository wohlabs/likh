import MainNavigator from "@/components/MainNavigator";
import ThemeButton from "@/components/ThemeButton";
import ThemeText from "@/components/ThemeText";
import { AuthProvider } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text } from "react-native";
import { Button, DefaultTheme, PaperProvider } from "react-native-paper";

export default function RootLayout() {
	return (
		<PaperProvider theme={DefaultTheme}>
			<AuthProvider>
				<KeyboardAvoidingView
					style={{ flex: 1 }}
					behavior={Platform.OS === "ios" ? "padding" : "height"}
				>
					<MainNavigator />
				</KeyboardAvoidingView>
			</AuthProvider>
		</PaperProvider>
	);
}
