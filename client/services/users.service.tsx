import api from "./AxiosInstance";
import { ServiceResult } from "./IServiceResult";

export const registerUser = async (username: string, password: string) : Promise<ServiceResult<null>> =>
{
	try
	{
		await api.post('/users', { username, password });
	}
	catch (error: any)
	{
		return {
			success: false,
			error: error.response?.data?.error || "Registration failed"
		};
	}

	return {
		success: true,
		data: null
	};
}

export const loginUser = async (username: string, password: string) : Promise<ServiceResult<{token: string, username: string, anilist_token?: string}>> =>
{
	try
	{
		const res = await api.post('/users/login', { username, password });
		return {
			success: true,
			data: res.data
		};
	}
	catch (err: any)
	{
		return {
			success: false,
			error: err.response?.data?.error || "Login failed"
		};
	}
}