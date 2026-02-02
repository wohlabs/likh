import { IUserMediaEntry } from "@/types/IManga";
import api from "./AxiosInstance";
import { ServiceResult } from "./IServiceResult";

export const getMangaStatus = async (mangaId: string, anilist_token?: string) : Promise<ServiceResult<IUserMediaEntry>> =>
{
	try 
	{
		const response = await api.get(`/media-entry`, {
			params: {
				mangaId,
				anilist_token,
			},
		})
		return {
			success: true,
			data: response.data
		};
	}
	catch (err: any)
	{
		return {
			success: false,
			error: 'Unable to get manga status'
		};
	}
}