import { router, Stack } from "expo-router";
import { Platform, Pressable, useColorScheme, View } from "react-native";
import ThemeText from "./ThemeText";
import ThemeButton from "./ThemeButton";
import { useContext, useRef, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Button, IconButton, Menu, useTheme } from "react-native-paper";

export default function MainNavigator()
{
	const colorScheme = useColorScheme();
	const theme = useTheme()
	const {token, username, logout} = useContext(AuthContext);
	const [optionsVisible, setOptionsVisible] = useState<boolean>(false);
	return (
		<Stack
			screenOptions={{
				contentStyle: {backgroundColor: theme.colors.background},
				headerStyle: {backgroundColor: theme.colors.surfaceVariant},
				headerTintColor: useTheme().colors.onSurface,
				headerTitle: () => <Pressable onPress={() => router.navigate("/")}><ThemeText variant="titleMedium">aninote</ThemeText></Pressable>,
				headerTitleAlign: "center",
				headerLeft: () => <IconButton size={20} icon={colorScheme == 'dark' ? 'white-balance-sunny' : 'moon-waning-crescent'} style={[Platform.OS=='ios' && {margin: 'auto'}]} iconColor={theme.colors.primary} />, // disable back button
				headerRight: () => token
				?
				<Menu
					visible={optionsVisible}
					onDismiss={() => setOptionsVisible(false)}
					anchor={
						<ThemeButton icon={'account'} onPress={() => setOptionsVisible(true)} mode="text" textColor={theme.colors.primary}>{username}</ThemeButton>
					}
				>
					<Menu.Item 
						onPress={() => {
							setOptionsVisible(false);
							logout();
							router.navigate('/users/login') // may not be ideal to refresh
						}} title="Logout" leadingIcon={"logout"}
					/>
				</Menu>
				: <ThemeButton icon={'login'} onPress={() => router.navigate("/users/login")}>Login</ThemeButton>
			}}
		>
			<Stack.Screen name="index" />
			<Stack.Screen name="manga/[mangaId]" />
		</Stack>
	)
}