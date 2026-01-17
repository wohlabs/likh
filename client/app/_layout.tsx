import MainNavigator from "@/components/MainNavigator";
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

const toastConfig = {
	error: (props: any) => <ThemeToast {...props} variant="error" />,
	loading: (props: any) => <LoadingToast {...props} />,
};

export default function RootLayout() 
{
	const { theme, isDark, toggleTheme } = usePersistentTheme();

	return (
		<PaperProvider theme={theme}>
			<GestureHandlerRootView>
				<AuthProvider>
					<AppGate isDark={isDark} toggleTheme={toggleTheme} />
					<Toast config={toastConfig}/>
				</AuthProvider>
			</GestureHandlerRootView>
		</PaperProvider>
	);
}

const AppGate = ({ toggleTheme, isDark }: { toggleTheme: () => void, isDark: boolean }) => 
{
	const { loading } = useContext(AuthContext);
	const { ready } = usePersistentTheme();
	const [ serverLoading, setServerLoading ] = useState(true)

	useEffect(() => {
		if (serverLoading)
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
	}, [serverLoading]);
	
	function wait(ms: number) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	
	const wakeupServer = useCallback(async () => {
		while (true)
		{
			try
			{
				const response = await api.get("/")
				if (response.status == 200)
				{
					setServerLoading(false)
					return;
				}
			}
			catch (e)
			{
			}
			console.log('Failed to wake up the server. trying again.')
			wait(2000) // wait for 2s until attempting to wake the server up again
		}
	}, [])
	
	useEffect(() => {
		wakeupServer()
	}, []);
	
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
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<MainNavigator isDark={isDark} toggleTheme={toggleTheme} />
		</KeyboardAvoidingView>
	);
};