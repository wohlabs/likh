import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext({
	token: null,
	username: null,
	loading: true,
	login: async (_userData: any) => {},
	logout: async () => {},
});

export const AuthProvider = ({ children }: any) => {
	const [token, setToken] = useState<string | null>(null);
	const [username, setUsername] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	// Load token from storage
	useEffect(() => {
		const loadUser = async () => {
		try {
			const storedToken = await AsyncStorage.getItem('token');
			const storedUsername = await AsyncStorage.getItem('username');
			setToken(storedToken);
			setUsername(storedUsername);
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
			setToken(userData.token);
			setUsername(userData.username);
			console.log("userdata", userData)
		} catch (error) {
			console.error('Failed to login:', error);
		}
	};

	const logout = async () => {
		try {
			await AsyncStorage.removeItem('token');
			await AsyncStorage.removeItem('username');
			setToken(null);
			setUsername(null);
		} catch (error) {
			console.error('Failed to logout:', error);
		}
	};

	return (
		<AuthContext.Provider value={{ token, username, loading, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};
