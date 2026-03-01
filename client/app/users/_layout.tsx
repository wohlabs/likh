import { AuthContext } from "@/context/AuthContext";
import { ServerContext } from "@/context/ServerContext";
import { usePersistentTheme } from "@/context/usePersistentTheme";
import { modernLightTheme } from "@/theme/modernTheme";
import { Stack, useRouter, useSegments } from "expo-router";
import { useContext, useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import Toast from "react-native-toast-message";

export default function UsersLayout()
{
	const {theme} = usePersistentTheme()
	const {token} = useContext(AuthContext);
	const segments = useSegments();
	const router = useRouter();
	const { loading: isServerLoading } = useContext(ServerContext)

	useEffect(() => 
	{
		console.log(segments)
		if (isServerLoading && segments[0] !== "app")
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

	useEffect(() => 
	{
		// 🚫 Not logged in → block app routes
		if (token) 
		{
			router.replace("/app");
			Toast.hide()
			return;
		}
	}, [token, segments, router]);
	return (
		<PaperProvider theme={modernLightTheme}>
			<Stack
				screenOptions={{
					contentStyle: {backgroundColor: theme['--color-background']},
					headerStyle: {backgroundColor: theme['--color-surfaceVariant']},
					headerTintColor: theme['--color-onSurface'],
					headerShown: false
				}}
			>
			</Stack>
		</PaperProvider>
	)
}