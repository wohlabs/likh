import { router, Stack } from "expo-router";
import { Pressable } from "react-native";
import ThemeText from "./ThemeText";
import ThemeButton from "./ThemeButton";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export default function MainNavigator()
{
	const {token, logout} = useContext(AuthContext);
	return (
		<Stack
			screenOptions={{
				headerTitle: () => <Pressable onPress={() => router.navigate("/")}><ThemeText style={{fontWeight: 'bold'}}>aninote</ThemeText></Pressable>,
				headerTitleAlign: "center",
				headerLeft: () => null, // disable back button
				headerRight: () => token
				? <ThemeButton onPress={() => {
					logout();
					router.push('/') // may not be ideal to refresh
				}}>Logout</ThemeButton>
				: <ThemeButton onPress={() => router.push("/users/login")}>Login</ThemeButton>
			}}
		>
			<Stack.Screen name="index" />
			<Stack.Screen name="manga/[mangaId]" />
		</Stack>
	)
}