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