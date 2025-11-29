import { router, Stack } from "expo-router";
import { Linking, Platform, Pressable, useColorScheme, Image } from "react-native";
import ThemeText from "./ThemeText";
import ThemeButton from "./ThemeButton";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { IconButton, Menu, useTheme } from "react-native-paper";
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from "@/api/AxiosInstance";

export default function MainNavigator()
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
		Linking.openURL(authUrl);
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
				headerTitle: () => <Pressable onPress={() => router.navigate("/")}><ThemeText variant="titleMedium">aninote</ThemeText></Pressable>,
				headerTitleAlign: "center",
				headerLeft: () => <IconButton size={20} icon={colorScheme === 'dark' ? 'white-balance-sunny' : 'moon-waning-crescent'} style={[Platform.OS === 'ios' && {margin: 'auto'}]} iconColor={theme.colors.primary} />, // disable back button
				headerRight: () => token
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
							if (anilistToken === undefined || anilistToken === "undefined" || anilistToken === '')
							{
								setOptionsVisible(false);
								linkAnilist();
								router.replace('/') // may not be ideal to refresh
							}
						}}
						leadingIcon={() => (
							<Image
								source={{ uri: 'https://docs.anilist.co/anilist.png' }}
								style={{ width: 24, height: 24, borderRadius: 4 }}
							/>
						)}
						title={anilistToken === undefined || anilistToken === "undefined" || anilistToken === '' ? "Link your Anilist account" : "Anilist linked"}
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
			<Stack.Screen name="index" />
			<Stack.Screen name="manga/[mangaId]" />
		</Stack>
	)
}