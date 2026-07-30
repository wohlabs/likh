import { LoadingScreen } from "@/components/LoadingScreen";
import ThemeButton from "@/components/ThemeButton";
import ThemeText from "@/components/ThemeText";
import { toastConfig } from "@/components/ThemeToast";
import { ThemeMenu, ThemeMenuItem } from "@/components/ThemeMenu";
import { AuthContext } from "@/context/AuthContext";
import { ServerContext } from "@/context/ServerContext";
import { usePersistentTheme } from "@/context/usePersistentTheme";
import api from "@/services/AxiosInstance";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter, useSegments } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
import { VariableContextProvider } from "nativewind";
import { useContext, useEffect, useState } from "react";
import { Image, Linking, Platform, Text, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import Toast from "react-native-toast-message";

export default function AppLayout()
{
	const {theme, toggleTheme, themeScheme} = usePersistentTheme()
	const {token, username, anilistToken, logout} = useContext(AuthContext);
	const [optionsVisible, setOptionsVisible] = useState<boolean>(false);
	const segments = useSegments();
	const router = useRouter();
	const { isAvailable } = useContext(ServerContext)
	
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
		const inAuthGroup = segments[0] === "app" && segments[1] === "users";
		if (!inAuthGroup && !token) 
		{
			router.replace("/app/users/login");
			return;
		}
	}, [token, segments, router]);
	
	const onTitleClicked = () => 
	{
		const inAuthGroup = segments[0] === "app" && segments[1] === "users";
		if (inAuthGroup)
		{
			router.navigate("/")
		}
		else
		{
			router.navigate("/app/users/login")
		}
	}

	const linkAnilist = () => 
	{
		const clientId = 30897;
		const authUrl = `https://anilist.co/api/v2/oauth/authorize?client_id=${clientId}&response_type=token`;
		// Open the URL in the device's browser
		WebBrowser.openAuthSessionAsync(authUrl);
	};
	
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
						},
						headerTintColor: theme["--color-onSurface"],
						headerLeft: () => <ThemeText className="text-primary text-2xl font-extrabold tracking-wider ml-2" onPress={onTitleClicked}>likh</ThemeText>,
						headerTitleAlign: "center",
						headerTitle: () => null,
						headerRight: () =>
							(
								<View className="mr-2 flex-row items-center">
									{
										token &&
										<Ionicons
											name="bookmarks-sharp"
											size={24}
											onPress={() => router.push("/app/custom-lists")}
											style={{ margin: 10 }}
											className="text-primary icon-button"
										/>
									}
									<Ionicons
										size={24}
										name={themeScheme === "dark" ? 'moon-sharp' : 'sunny-sharp'}
										onPress={toggleTheme}
										style={[Platform.OS === 'ios' && {margin: 'auto'}]}
										className="text-primary auto icon-button"
									/>
									{
										<ThemeMenu
											visible={optionsVisible}
											onDismiss={() => setOptionsVisible(false)}
											anchorPosition="bottom"
											anchor={
												<ThemeButton
													onPress={() => setOptionsVisible(true)}
													mode="text"
												>
													<Ionicons name="person"
														className="color-onSurfaceVariant"
													/>
													<Text
														className="text-onSurfaceVariant"
													>{username}</Text>
												</ThemeButton>
											}
										>
											<ThemeMenuItem 
												onPress={() => 
												{
													if (anilistToken == null || anilistToken === undefined || anilistToken === "undefined" || anilistToken === '')
													{
														setOptionsVisible(false);
														linkAnilist();
														router.replace('/app') // may not be ideal to refresh
													}
												}}
												leadingIcon={() => (
													<Image
														source={{ uri: 'https://docs.anilist.co/anilist.png' }}
														className="w-6 h-6 rounded"
													/>
												)}
												title={anilistToken == null || anilistToken === undefined || anilistToken === "undefined" || anilistToken === '' ? "Link your Anilist account" : "Anilist linked"}
											/>
											<ThemeMenuItem 
												onPress={async () => 
												{
													setOptionsVisible(false);
													router.navigate('/app/settings')
												}} title="Settings" leadingIcon={"cog"}
											/>
											<ThemeMenuItem 
												onPress={async () => 
												{
													setOptionsVisible(false);
													await logout();
													router.navigate('/app/users/login') // may not be ideal to refresh
												}} title="Logout" leadingIcon={"logout"}
											/>
										</ThemeMenu>
									}
								</View>
							)
					}}
				>
				</Stack>
				<Toast config={toastConfig}/>
			</PaperProvider>
		</VariableContextProvider>
	)
}