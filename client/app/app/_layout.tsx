import { LoadingScreen } from "@/components/LoadingScreen";
import ThemeButton from "@/components/ThemeButton";
import ThemeText from "@/components/ThemeText";
import { toastConfig } from "@/components/ThemeToast";
import { ThemeMenu } from "@/components/ThemeMenu";
import { AuthContext } from "@/context/AuthContext";
import { ServerContext } from "@/context/ServerContext";
import { usePersistentTheme } from "@/context/usePersistentTheme";
import api from "@/services/AxiosInstance";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter, useSegments } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
import { VariableContextProvider } from "nativewind";
import { useCallback, useContext, useEffect, useState } from "react";
import { Image, Linking, Platform, View, Text } from "react-native";
import { PaperProvider } from "react-native-paper";
import Toast from "react-native-toast-message";

function Header()
{
	const {token, username, anilistToken, logout} = useContext(AuthContext);
	const {theme, toggleTheme, themeScheme} = usePersistentTheme()
	const router = useRouter();
	const [optionsVisible, setOptionsVisible] = useState<boolean>(false);
	const segments = useSegments();

	const handleLogout = useCallback(async () =>
	{
		setOptionsVisible(false);
		await logout();
		router.navigate('/users/login')
	}, [logout, router]);

	const linkAnilist = useCallback(() => 
	{
		const clientId = 30897;
		const authUrl = `https://anilist.co/api/v2/oauth/authorize?client_id=${clientId}&response_type=token`;
		// Open the URL in the device's browser
		WebBrowser.openAuthSessionAsync(authUrl);
	}, []);

	const handleLinkAnilist = useCallback(() =>
	{
		if (anilistToken == null || anilistToken === undefined || anilistToken === "undefined" || anilistToken === '')
		{
			setOptionsVisible(false);
			linkAnilist();
			router.replace('/app')
		}
	}, [anilistToken, linkAnilist, router]);
	

	useEffect(() => 
	{
		const handleRedirect = (event:any) => 
		{
			const url = event.url;
			console.log('Redirected URL:', url);
			
			// AniList sends token in URL fragment (#)
			const [, fragment] = url.split('#');
			if (fragment) 
			{
				const params = new URLSearchParams(fragment);
				const token = params.get('access_token');
				if (token) 
				{
					api.post('/users/me/anilist/link', { anilist_token: token })
						.then(async response => 
						{
							await AsyncStorage.setItem('anilist_token', token);
							console.log('Anilist linked successfully:', response.data);
						})
						.catch(error => 
						{
							console.error('Error linking Anilist:', error);
						});
				}
			}
		};

		const subscription = Linking.addEventListener('url', handleRedirect);
		Linking.getInitialURL().then((url) => 
		{
			if (url) handleRedirect({ url });
		});

		return () => 
		{
			subscription.remove();
		};
	}, []);

	useEffect(() => 
	{
		// 🚫 Not logged in → block app routes
		if (!token) 
		{
			router.replace("/users/login");
			return;
		}
	}, [token, segments, router]);

	useEffect(() =>
	{
		// Close menu when navigating to a different route
		setOptionsVisible(false);
	}, [segments]);

	return (
		<View className="flex flex-row items-center">
			{
				token &&
				<Ionicons
					name="bookmarks-sharp"
					size={24}
					onPress={() => router.push("/app/custom-lists")}
					style={{ margin: 10 }}
					className="text-primary"
				/>
			}
			<Ionicons
				size={24}
				name={themeScheme === "dark" ? 'moon-sharp' : 'sunny-sharp'}
				onPress={toggleTheme}
				style={[Platform.OS === 'ios' && {margin: 'auto'}]}
				className="text-primary auto"
			/>
			<ThemeMenu
				visible={optionsVisible}
				onDismiss={() => setOptionsVisible(false)}
				anchor={
					<ThemeButton
						onPress={() => setOptionsVisible(true)}
						mode="text"
					>
						<Ionicons name="person" color={theme['--color-onBackground']} size={16}/>
						{username}
					</ThemeButton>
				}
			>
				<ThemeMenu.Item 
					onPress={handleLinkAnilist}
					leadingIcon={(
						<Image
							source={{ uri: 'https://docs.anilist.co/anilist.png' }}
							className="w-6 h-6 rounded"
						/>
					)}
					title={anilistToken == null || anilistToken === undefined || anilistToken === "undefined" || anilistToken === '' ? "Link your Anilist account" : "Anilist linked"}
				/>
				<ThemeMenu.Item 
					onPress={handleLogout}
					title="Logout"
					leadingIcon={
						<MaterialCommunityIcons name="logout" size={20} color={theme["--color-onBackground"]} />
					}
				/>
			</ThemeMenu>
		</View>
	)
}

export default function AppLayout()
{
	const {theme} = usePersistentTheme()
	const segments = useSegments();
	const router = useRouter();
	const { isAvailable } = useContext(ServerContext)
	
	
	const onTitleClicked = useCallback(() => 
	{
		const inAuthGroup = segments[0] === "users";
		if (inAuthGroup)
		{
			router.navigate("/")
		}
		else
		{
			router.navigate("/app")
		}
	}, [segments, router]);

	if (segments[0] === "app" && !isAvailable)
	{
		return (
			<LoadingScreen text="booting up the server. please wait..." />
		);
	}

	return (
		<VariableContextProvider value={theme}>
			<PaperProvider>
				<Stack
					screenOptions={{
						contentStyle: {backgroundColor: theme["--color-background"]},
						headerStyle: {
							backgroundColor: theme["--color-surface"],
							borderWidth: 0,
							shadowColor: "#000",
							shadowOffset: { width: 0, height: 4 },
							shadowOpacity: 0.15,
							shadowRadius: 12,
							elevation: 2,
							boxShadow: `0 0 5px 1px ${theme['--color-elevation-level0']}`
						},
						headerTintColor: theme["--color-onSurface"],
						headerLeft: () => (
							<ThemeText className="text-onBackground text-2xl font-extrabold tracking-wider" style={{ marginLeft: 10 }} onPress={onTitleClicked}>
								likh
							</ThemeText>
						),
						headerTitleAlign: "center",
						headerTitle: () => null,
						headerRight: () => <Header />
					}}
				>
				</Stack>
				<Toast config={toastConfig}/>
			</PaperProvider>
		</VariableContextProvider>
	)
}