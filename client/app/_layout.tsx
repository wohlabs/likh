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
					headerTitle: () => <Pressable onPress={() => router.navigate("/")}><Text style={{fontWeight: 'bold'}}>aninote</Text></Pressable>,
					headerTitleAlign: "center",
					headerLeft: () => null, // disable back button
					headerRight: () => <Button onPress={() => router.navigate("/users/login")}>Login</Button>,
				}}
			>
				<Stack.Screen name="index" />
				<Stack.Screen name="manga/[mangaId]" />
			</Stack>
		</KeyboardAvoidingView>
		</PaperProvider>
	);
}
