import MainNavigator from "@/components/MainNavigator";
import { AuthProvider, AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import { KeyboardAvoidingView, Platform, ActivityIndicator, View } from "react-native";
import { PaperProvider, useTheme } from "react-native-paper";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { usePersistentTheme } from "@/context/usePersistentTheme";
import { modernDarkTheme, modernLightTheme } from "@/theme/modernTheme";

export default function RootLayout() 
{
	const { theme, isDark, toggleTheme } = usePersistentTheme();

	return (
		<PaperProvider theme={theme}>
			<GestureHandlerRootView>
				<AuthProvider>
					<AppGate isDark={isDark} toggleTheme={toggleTheme} />
				</AuthProvider>
			</GestureHandlerRootView>
		</PaperProvider>
	);
}

const AppGate = ({ toggleTheme, isDark }: { toggleTheme: () => void, isDark: boolean }) => 
{
	const { loading } = useContext(AuthContext);
	const { ready } = usePersistentTheme();
	
	const theme = isDark ? modernDarkTheme : modernLightTheme;
	
	
	// Wait until theme is resolved
	if (!ready) 
	{
		return null; // or a blank view with safe default background
	}

	if (loading) 
	{
		return <LoadingScreen theme={theme} />;  // splash or spinner
	}

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<MainNavigator isDark={isDark} toggleTheme={toggleTheme} />
		</KeyboardAvoidingView>
	);
};

function LoadingScreen({ theme }: { theme: typeof modernLightTheme })
{
	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background }}>
			<ActivityIndicator size="large" />
		</View>
	);
}
