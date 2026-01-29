import { LoadingScreen } from "@/components/LoadingScreen";
import ThemeButton from "@/components/ThemeButton";
import ThemeText from "@/components/ThemeText";
import { AuthContext } from "@/context/AuthContext";
import { ServerContext } from "@/context/ServerContext";
import { usePersistentTheme } from "@/context/usePersistentTheme";
import api from "@/services/AxiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter, useSegments } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Linking, Platform, Pressable, Image, StyleSheet } from "react-native";
import { IconButton, Menu, PaperProvider, useTheme } from "react-native-paper";
import * as WebBrowser from 'expo-web-browser';

export default function AppLayout()
{
	const {theme, toggleTheme, isDark} = usePersistentTheme()
	const {token, username, anilistToken, logout} = useContext(AuthContext);
	const [optionsVisible, setOptionsVisible] = useState<boolean>(false);
	const segments = useSegments();
	const router = useRouter();
	const { isAvailable, loading: isServerLoading } = useContext(ServerContext)
	
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
		// 🚫 Not logged in → block app routes
		if (!token) {
			router.replace("/users/login");
			return;
		}
	}, [token, segments]);
	
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
	
	if (segments[0] === "app" && !isAvailable)
	{
		return (
			<LoadingScreen text="booting up the server. please wait..." />
		);
	}

	return (
		<PaperProvider theme={theme}>
		<Stack
			screenOptions={{
				contentStyle: {backgroundColor: theme.colors.background},
				headerStyle: {backgroundColor: theme.colors.surfaceVariant},
				headerTintColor: theme.colors.onSurface,
				headerLeft: () => <Pressable onPress={onTitleClicked}><ThemeText style={{ fontWeight: "900", letterSpacing: 2, marginLeft: 10, color: theme.colors.primary }} variant="titleLarge">likh</ThemeText></Pressable>,
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
		</Stack>
		</PaperProvider>
	)
}

const styles = StyleSheet.create({
	anilistIcon: {
		width: 24, height: 24, borderRadius: 4
	}
});