import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext({
	token: null,
	loading: true,
	login: async (_userData: any) => {},
	logout: async () => {},
});

export const AuthProvider = ({ children }: any) => {
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	// Load token from storage
	useEffect(() => {
		const loadUser = async () => {
		try {
			const storedToken = await AsyncStorage.getItem('token');
			setToken(storedToken);
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
			await AsyncStorage.setItem('token', userData);
			setToken(userData);
		} catch (error) {
			console.error('Failed to login:', error);
		}
	};

	const logout = async () => {
		try {
			await AsyncStorage.removeItem('token');
			setToken(null);
		} catch (error) {
			console.error('Failed to logout:', error);
		}
	};

	return (
		<AuthContext.Provider value={{ token, loading, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};
