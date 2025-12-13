import MainNavigator from "@/components/MainNavigator";
import { AuthProvider, AuthContext } from "@/context/AuthContext";
import { useEffect, useState, useContext } from "react";
import { KeyboardAvoidingView, Platform, useColorScheme , ActivityIndicator, View } from "react-native";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Redirect } from "expo-router";

export default function RootLayout() 
{
	const colorScheme = useColorScheme();
	const [theme, setTheme] = useState(MD3LightTheme);

	useEffect(() => 
	{
		// necessary to avoid mixing themes on initial load
		if (colorScheme === 'dark') setTheme(MD3DarkTheme);
		else setTheme(MD3LightTheme);
	}, [colorScheme]);

	return (
		<PaperProvider theme={theme}>
			<GestureHandlerRootView>
				<AuthProvider>
					<AppGate />
				</AuthProvider>
			</GestureHandlerRootView>
		</PaperProvider>
	);
}

const AppGate = () => 
{
	const { loading } = useContext(AuthContext);

	if (loading) 
	{
		return <LoadingScreen />;  // splash or spinner
	}

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<MainNavigator />
		</KeyboardAvoidingView>
	);
};

function LoadingScreen() 
{
	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<ActivityIndicator size="large" />
		</View>
	);
}
