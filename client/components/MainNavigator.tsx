import { router, Stack } from "expo-router";
import { Pressable } from "react-native";
import ThemeText from "./ThemeText";
import ThemeButton from "./ThemeButton";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useTheme } from "react-native-paper";

export default function MainNavigator()
{
	const {token, logout} = useContext(AuthContext);
	return (
		<Stack
			screenOptions={{
				contentStyle: {backgroundColor: useTheme().colors.background},
				headerStyle: {backgroundColor: useTheme().colors.surfaceVariant},
				headerTintColor: useTheme().colors.onSurface,
				headerTitle: () => <Pressable onPress={() => router.navigate("/")}><ThemeText variant="titleMedium">aninote</ThemeText></Pressable>,
				headerTitleAlign: "center",
				headerLeft: () => null, // disable back button
				headerRight: () => token
				? <ThemeButton onPress={() => {
					logout();
					router.navigate('/') // may not be ideal to refresh
				}}>Logout</ThemeButton>
				: <ThemeButton onPress={() => router.navigate("/users/login")}>Login</ThemeButton>
			}}
		>
			<Stack.Screen name="index" />
			<Stack.Screen name="manga/[mangaId]" />
		</Stack>
	)
}