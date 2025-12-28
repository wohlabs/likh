import { ICustomLists } from "@/types/ICustomList";
import api from "./AxiosInstance";
import { ServiceResult } from "./IServiceResult";

export const getCustomLists = async (mangaId?: number) : Promise<ServiceResult<ICustomLists>> =>
{
	try
	{
		const optionalParams = mangaId ? `?mangaId=${mangaId}` : ""
		const response = await api.get('/custom-lists' + optionalParams);
		return {
			success: true,
			data: response.data
		};
	}
	catch (error: any)
	{
		return {
			success: false,
			error: error.response?.data?.error || "Could not fetch custom lists"
		};
	}
}