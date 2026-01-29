import { AuthProvider, AuthContext } from "@/context/AuthContext";
import { useCallback, useContext, useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { usePersistentTheme } from "@/context/usePersistentTheme";
import { LoadingScreen } from "@/components/LoadingScreen";
import api from "@/services/AxiosInstance";
import Toast from "react-native-toast-message";
import { ThemeToast } from "@/components/ThemeToast";
import LoadingToast from "@/components/LoadingToast";
import { ServerContext, ServerProvider } from "@/context/ServerContext";
import { Slot, Stack, useSegments } from "expo-router";

const toastConfig = {
	error: (props: any) => <ThemeToast {...props} variant="error" />,
	loading: (props: any) => <LoadingToast {...props} />,
};

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
							<Toast config={toastConfig}/>
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

	useEffect(() => {
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
		</PaperProvider>
	);
};