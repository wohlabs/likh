import api from "./AxiosInstance";
import { ServiceResult } from "./IServiceResult";

export const editList = async (listId: string, newData: {}) : Promise<ServiceResult<null>> =>
{
	try 
	{
		const response = await api.patch(`/custom-lists/${listId}`, newData)
		return {
			success: true,
			data: response.data
		}
	}
	catch (error: any)
	{
		return {
			success: false,
			error: error.response?.data?.error || "Could not edit list"
		};
	}
}