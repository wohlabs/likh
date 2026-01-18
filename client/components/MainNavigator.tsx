import { Stack, useRouter, useSegments } from "expo-router";
import { Linking, Platform, Pressable, Image, StyleSheet } from "react-native";
import ThemeText from "./ThemeText";
import ThemeButton from "./ThemeButton";
import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { IconButton, Menu, useTheme } from "react-native-paper";
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from "@/services/AxiosInstance";
import * as WebBrowser from 'expo-web-browser';
import Toast from "react-native-toast-message"
import { ThemeToast } from "./ThemeToast";
import LoadingToast from "./LoadingToast";
import { LoadingScreen } from "./LoadingScreen";


export default function MainNavigator({ isDark, toggleTheme }: { isDark: boolean, toggleTheme?: () => void })
{
	const theme = useTheme()
	const {token, username, anilistToken, logout} = useContext(AuthContext);
	const [optionsVisible, setOptionsVisible] = useState<boolean>(false);
	const segments = useSegments();
	const router = useRouter();
	const [ serverLoading, setServerLoading ] = useState(segments[0] == "app")
	
	useEffect(() => {
		if (serverLoading && segments[0] != "app")
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
		// Start delayed UI timer
		const timeoutId = setTimeout(() => {
			setServerLoading(true);
		}, 5000);
		while (true)
		{
			try
			{
				const response = await api.get("/")
				if (response.status == 200)
				{
					clearTimeout(timeoutId)
					setServerLoading(false)
					return
				}
			}
			catch (e)
			{
			}
			console.log('Failed to wake up the server. trying again.')
			await wait(2000) // wait for 2s until attempting to wake the server up again
		}
	}, [])
	

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

	useEffect(() => {
		const inAuthGroup = segments[0] === "users";
		const inAppGroup = segments[0] === "app";

		// 🚫 Not logged in → block app routes
		if (!token && inAppGroup) {
			router.replace("/users/login");
			return;
		}

		// ✅ Logged in → block auth routes
		if (token && inAuthGroup) {
			router.replace("/app");
			return
		}
	}, [token, segments]);

	useEffect(() => {
		wakeupServer()
	}, []);
	
	const onTitleClicked = () => {
		const inAuthGroup = segments[0] === "users";
		if (inAuthGroup)
		{
			router.navigate("/")
		}
		else
		{
			router.navigate("/app")
		}
	}

	const linkAnilist = () => 
	{
		const clientId = 30897;
		const authUrl = `https://anilist.co/api/v2/oauth/authorize?client_id=${clientId}&response_type=token`;
		// Open the URL in the device's browser
		WebBrowser.openAuthSessionAsync(authUrl);
	};
	
	if (segments[0] === "app" && serverLoading)
	{
		return <LoadingScreen text="booting up the server. please wait..." />
	}

	return (
		<>
		<Stack
			screenOptions={{
				contentStyle: {backgroundColor: theme.colors.background},
				headerStyle: {backgroundColor: theme.colors.surfaceVariant},
				headerTintColor: theme.colors.onSurface,
				headerLeft: () => <Pressable onPress={onTitleClicked}><ThemeText style={{ fontWeight: "900", letterSpacing: 2, marginLeft: 10 }} variant="titleLarge">likh</ThemeText></Pressable>,
				headerTitleAlign: "center",
				headerTitle: () => null,
				headerRight: () =>
				(
					<>
						{
							token &&
							<IconButton
								icon="bookmark-multiple"
								onPress={() => router.push("/app/custom-lists")}
								style={{ marginRight: 10 }}
								iconColor={theme.colors.primary}
							/>
						}
						<IconButton size={20} icon={isDark ? 'moon-waning-crescent' : 'white-balance-sunny'} onPress={toggleTheme} style={[Platform.OS === 'ios' && {margin: 'auto'}]} iconColor={theme.colors.primary} />
						{
							token
							?
							<Menu
								visible={optionsVisible}
								onDismiss={() => setOptionsVisible(false)}
								anchorPosition="bottom"
								anchor={
									<ThemeButton icon={'account'} onPress={() => setOptionsVisible(true)} mode="text" textColor={theme.colors.primary}>{username}</ThemeButton>
								}
							>
								<Menu.Item 
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
											style={styles.anilistIcon}
										/>
									)}
									title={anilistToken == null || anilistToken === undefined || anilistToken === "undefined" || anilistToken === '' ? "Link your Anilist account" : "Anilist linked"}
								/>
								<Menu.Item 
									onPress={() => 
									{
										setOptionsVisible(false);
										logout();
										router.navigate('/users/login') // may not be ideal to refresh
									}} title="Logout" leadingIcon={"logout"}
								/>
							</Menu>
							: <ThemeButton icon={'login'} onPress={() => router.navigate("/users/login")}>Login</ThemeButton>
						}
					</>
				)
			}}
		>
			<Stack.Screen name="index" options={{headerShown: false}}/>
		</Stack>
		</>
	)
}

const styles = StyleSheet.create({
	anilistIcon: {
		width: 24, height: 24, borderRadius: 4
	}
});