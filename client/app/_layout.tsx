import ThemeButton from "@/components/ThemeButton";
import ThemeText from "@/components/ThemeText";
import { router, Stack } from "expo-router";
import { KeyboardAvoidingView, Platform, Pressable, Text } from "react-native";
import { Button, DefaultTheme, PaperProvider } from "react-native-paper";

export default function RootLayout() {
	return (
		<PaperProvider theme={DefaultTheme}>
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<Stack
				screenOptions={{
					headerTitle: () => <Pressable onPress={() => router.navigate("/")}><ThemeText style={{fontWeight: 'bold'}}>aninote</ThemeText></Pressable>,
					headerTitleAlign: "center",
					headerLeft: () => null, // disable back button
					headerRight: () => <ThemeButton onPress={() => router.navigate("/users/login")}>Login</ThemeButton>,
				}}
			>
				<Stack.Screen name="index" />
				<Stack.Screen name="manga/[mangaId]" />
			</Stack>
		</KeyboardAvoidingView>
		</PaperProvider>
	);
}
