import { LoadingScreen } from "@/components/LoadingScreen";
import { toastConfig } from "@/components/ThemeToast";
import { AuthContext, AuthProvider } from "@/context/AuthContext";
import { ServerContext, ServerProvider } from "@/context/ServerContext";
import { usePersistentTheme } from "@/context/usePersistentTheme";
import { Stack, useSegments } from "expo-router";
import { useContext, useEffect } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from "react-native-paper";
import Toast from "react-native-toast-message";

export default function RootLayout() 
{
	const { theme, isDark, toggleTheme } = usePersistentTheme();

	return (
		<GestureHandlerRootView>
			<ServerProvider>
				<AuthProvider>
					<KeyboardAvoidingView
						style={{ flex: 1 }}
						behavior={Platform.OS === "ios" ? "padding" : "height"}
					>
						<AppGate />
					</KeyboardAvoidingView>
				</AuthProvider>
			</ServerProvider>
		</GestureHandlerRootView>
	);
}

const AppGate = () => 
{
	const { loading } = useContext(AuthContext);
	const { ready, theme } = usePersistentTheme();
	const { isAvailable, loading: isServerLoading } = useContext(ServerContext)
	const segments = useSegments()

	useEffect(() => 
	{
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
	}, [isServerLoading]);
	
	// Wait until theme is resolved
	if (!ready) 
	{
		return null; // or a blank view with safe default background
	}

	if (loading) 
	{
		return <LoadingScreen />;  // splash or spinner
	}

	return (
		<PaperProvider theme={theme}>
			<Stack
				screenOptions={{
					contentStyle: {backgroundColor: theme.colors.background},
					headerStyle: {backgroundColor: theme.colors.surfaceVariant},
					headerTintColor: theme.colors.onSurface,
					headerShown: false
				}}
			>
			</Stack>
			<Toast config={toastConfig}/>
		</PaperProvider>
	);
};