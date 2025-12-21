import MainNavigator from "@/components/MainNavigator";
import { AuthProvider, AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import { KeyboardAvoidingView, Platform, ActivityIndicator, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { usePersistentTheme } from "@/context/usePersistentTheme";

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

	if (loading) 
	{
		return <LoadingScreen />;  // splash or spinner
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

function LoadingScreen() 
{
	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<ActivityIndicator size="large" />
		</View>
	);
}
