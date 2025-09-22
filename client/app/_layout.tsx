import ThemeButton from "@/components/ThemeButton";
import ThemeText from "@/components/ThemeText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text } from "react-native";
import { Button, DefaultTheme, PaperProvider } from "react-native-paper";

export default function RootLayout() {
	const [token, setToken] = useState<string | null>();

	const logout = async () => {
		await AsyncStorage.removeItem('token');
		setToken(null);
		router.push('/') // may not be ideal to refresh
	};

	useEffect(() => {
		const fetchToken = async () => {
			const result = await AsyncStorage.getItem('token');
			console.log(result)
			if (result)
			{
				setToken(result);
			}
		};
		fetchToken();
	}, []);

	return (
		<PaperProvider theme={DefaultTheme}>
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<Stack
				screenOptions={{
					headerTitle: () => <Pressable onPress={() => router.push("/")}><ThemeText style={{fontWeight: 'bold'}}>aninote</ThemeText></Pressable>,
					headerTitleAlign: "center",
					headerLeft: () => null, // disable back button
					headerRight: () => token
					? <ThemeButton onPress={logout}>Logout</ThemeButton>
					: <ThemeButton onPress={() => router.push("/users/login")}>Login</ThemeButton>
				}}
			>
				<Stack.Screen name="index" />
				<Stack.Screen name="manga/[mangaId]" />
			</Stack>
		</KeyboardAvoidingView>
		</PaperProvider>
	);
}
