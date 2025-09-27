import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = 'http://localhost:3000'

const api = axios.create({
  baseURL: API_URL, // Replace with your backend URL
  timeout: 10000,
  headers: {
	"bypass-tunnel-reminder": true
  }
});

// Request interceptor to attach token
api.interceptors.request.use(
	async (config) => {
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
