import { router, Stack } from "expo-router";
import { Linking, Platform, Pressable, useColorScheme, Image, StyleSheet } from "react-native";
import ThemeText from "./ThemeText";
import ThemeButton from "./ThemeButton";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { IconButton, Menu, useTheme } from "react-native-paper";
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from "@/services/AxiosInstance";
import * as WebBrowser from 'expo-web-browser';

export default function MainNavigator({ isDark, toggleTheme }: { isDark: boolean, toggleTheme?: () => void })
{
	const colorScheme = useColorScheme();
	const theme = useTheme()
	const {token, username, anilistToken, logout} = useContext(AuthContext);
	const [optionsVisible, setOptionsVisible] = useState<boolean>(false);
	const linkAnilist = () => 
	{
		const clientId = 30897;
		const authUrl = `https://anilist.co/api/v2/oauth/authorize?client_id=${clientId}&response_type=token`;
		// Open the URL in the device's browser
		WebBrowser.openAuthSessionAsync(authUrl);
	};

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

	return (
		<Stack
			screenOptions={{
				contentStyle: {backgroundColor: theme.colors.background},
				headerStyle: {backgroundColor: theme.colors.surfaceVariant},
				headerTintColor: useTheme().colors.onSurface,
				headerTitle: () => <Pressable onPress={() => router.navigate("/app")}><ThemeText style={{ fontWeight: "900", letterSpacing: 2 }} variant="titleLarge">likh</ThemeText></Pressable>,
				headerTitleAlign: "center",
				headerLeft: () => <IconButton size={20} icon={isDark ? 'moon-waning-crescent' : 'white-balance-sunny'} onPress={toggleTheme} style={[Platform.OS === 'ios' && {margin: 'auto'}]} iconColor={theme.colors.primary} />, // disable back button
				headerRight: () =>
					token
						?
						<Menu
							visible={optionsVisible}
							onDismiss={() => setOptionsVisible(false)}
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
			}}
		>
			<Stack.Protected guard={token === null || token === undefined || token === ""}>
				<Stack.Screen name="users/login" />
				<Stack.Screen name="users/register" />
			</Stack.Protected>

			<Stack.Protected guard={token !== null && token !== ""}>
				<Stack.Screen name="app" />
			</Stack.Protected>
		</Stack>
	)
}

const styles = StyleSheet.create({
	anilistIcon: {
		width: 24, height: 24, borderRadius: 4
	}
});