import { AuthContext } from "@/context/AuthContext";
import { ServerContext } from "@/context/ServerContext";
import { usePersistentTheme } from "@/context/usePersistentTheme";
import { Stack, useRouter, useSegments } from "expo-router";
import { useContext, useEffect, useState } from "react";
import Toast from "react-native-toast-message";

export default function UsersLayout()
{
	const {theme, toggleTheme, isDark} = usePersistentTheme()
	const {token, username, anilistToken, logout} = useContext(AuthContext);
	const [optionsVisible, setOptionsVisible] = useState<boolean>(false);
	const segments = useSegments();
	const router = useRouter();
	const { isAvailable, loading: isServerLoading } = useContext(ServerContext)

	useEffect(() => {
		console.log(segments)
		if (isServerLoading && segments[0] != "app")
		{
			Toast.show({
				type: 'loading',
				text1: 'booting up the server. please wait...',
				position: 'top',
				autoHide: false,
			}); 
		}
		else
		{
			Toast.hide()
		}
	}, [isServerLoading, segments]);

	useEffect(() => {
		// 🚫 Not logged in → block app routes
		if (token) {
			router.replace("/app/home");
			Toast.hide()
			return;
		}
	}, [token, segments]);
	return (
		<Stack
			screenOptions={{
				contentStyle: {backgroundColor: theme.colors.background},
				headerStyle: {backgroundColor: theme.colors.surfaceVariant},
				headerTintColor: theme.colors.onSurface,
				header: (() => null)
			}}
		>
			<Stack.Screen name="index" options={{headerShown: false}}/>
		</Stack>
	)
}