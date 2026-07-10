import { LoadingScreen } from "@/components/LoadingScreen";
import { toastConfig } from "@/components/ThemeToast";
import { AuthContext, AuthProvider } from "@/context/AuthContext";
import { ServerContext, ServerProvider } from "@/context/ServerContext";
import { ThemeProvider, themes, usePersistentTheme } from "@/context/usePersistentTheme";
import { Stack, useSegments } from "expo-router";
import { VariableContextProvider } from "nativewind";
import { useContext, useEffect } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from "react-native-paper";
import Toast from "react-native-toast-message";

export default function RootLayout() 
{
	return (
		<GestureHandlerRootView>
			<ServerProvider>
				<AuthProvider>
					<ThemeProvider>
						<KeyboardAvoidingView
							style={{ flex: 1 }}
							// behavior={Platform.OS === "ios" ? "padding" : "height"}
						>
							<AppGate />
						</KeyboardAvoidingView>
					</ThemeProvider>
				</AuthProvider>
			</ServerProvider>
		</GestureHandlerRootView>
	);
}

const AppGate = () => 
{
	const { loading } = useContext(AuthContext);
	const { ready, theme, themeScheme } = usePersistentTheme();
	const { loading: isServerLoading } = useContext(ServerContext)
	const segments = useSegments()

	useEffect(() => 
	{
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
		<VariableContextProvider value={themes[themeScheme]}>
			<PaperProvider>
				<Stack
					screenOptions={{
						contentStyle: {backgroundColor: theme['--color-background']},
						headerStyle: {backgroundColor: theme['--color-surfaceVariant']},
						headerTintColor: theme['--color-onSurface'],
						headerShown: false
					}}
				>
				</Stack>
				<Toast config={toastConfig}/>
			</PaperProvider>
		</VariableContextProvider>
	);
};