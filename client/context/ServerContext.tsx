import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/AxiosInstance';

export const ServerContext = createContext({
	loading: true,
	isAvailable: false
});

export const ServerProvider = ({ children }: any) => 
{
	const [loading, setLoading] = useState<boolean>(false);
	const [isAvailable, setAvailable] = useState<boolean>(false);

	function wait(ms: number) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	
	const wakeupServer = useCallback(async () => {
		// Start delayed UI timer
		const timeoutId = setTimeout(() => {
			setLoading(true);
		}, 3000);
		while (true)
		{
			try
			{
				const response = await api.get("/")
				if (response.status == 200)
				{
					clearTimeout(timeoutId)
					setLoading(false)
					setAvailable(true)
					return
				}
			}
			catch (e)
			{
			}
			console.log('Failed to wake up the server. trying again.')
			await wait(10000) // wait for 2s until attempting to wake the server up again
		}
	}, [])

	// Load token from storage
	useEffect(() => 
	{
		wakeupServer();
	}, []);


	return (
		<ServerContext.Provider value={{loading, isAvailable}}>
			{children}
		</ServerContext.Provider>
	);
};
