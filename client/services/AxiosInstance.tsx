import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const API_URL = "https://likh-note.onrender.com"; // Fallback to localhost if not defined. The fallback is important to avoid webpack from optimizing away the environment variable

const api = axios.create({
	baseURL: API_URL, // Replace with your backend URL
	timeout: 10000,
	headers: {
		"bypass-tunnel-reminder": true
	}
});

// Request interceptor to attach token
api.interceptors.request.use(
	async (config) => 
	{
		const token = await AsyncStorage.getItem('token');
		if (token && config.headers)
		{
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

export default api;
