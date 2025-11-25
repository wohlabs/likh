import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext({
	token: null,
	username: null,
	anilistToken: "",
	loading: true,
	login: async (_userData: any) => {},
	logout: async () => {},
});

export const AuthProvider = ({ children }: any) => {
	const [token, setToken] = useState<string | null>(null);
	const [username, setUsername] = useState<string | null>(null);
	const [anilistToken, setAnilistToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	// Load token from storage
	useEffect(() => {
		const loadUser = async () => {
		try {
			const storedToken = await AsyncStorage.getItem('token');
			const storedUsername = await AsyncStorage.getItem('username');
			const storedAnilistToken = await AsyncStorage.getItem('anilist_token');
			setToken(storedToken);
			setUsername(storedUsername);
			setAnilistToken(storedAnilistToken);
		} catch (error) {
			console.error('Failed to load user:', error);
		} finally {
			setLoading(false);
		}
		};
		loadUser();
	}, []);

	const login = async (userData: any) => {
		try {
			console.log(userData)
			await AsyncStorage.setItem('token', userData.token);
			await AsyncStorage.setItem('username', userData.username);
			await AsyncStorage.setItem('anilist_token', userData.anilist_token);
			setToken(userData.token);
			setUsername(userData.username);
			setAnilistToken(userData.anilist_token);
		} catch (error) {
			console.error('Failed to login:', error);
		}
	};

	const logout = async () => {
		try {
			await AsyncStorage.removeItem('token');
			await AsyncStorage.removeItem('username');
			await AsyncStorage.removeItem('anilist_token');
			setToken(null);
			setUsername(null);
		} catch (error) {
			console.error('Failed to logout:', error);
		}
	};

	return (
		<AuthContext.Provider value={{ token, username, anilistToken, loading, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};
