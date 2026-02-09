import { IUserMediaEntry } from "@/types/IManga";
import api from "./AxiosInstance";
import { ServiceResult } from "./IServiceResult";

export const getMangaStatus = async (mangaId: string) : Promise<ServiceResult<IUserMediaEntry>> =>
{
	try 
	{
		const response = await api.get(`/media-entry`, {
			params: {
				mangaId
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
			error: err.response?.data?.error ?? 'Unable to get manga status'
		};
	}
}

export const updateMangaStatus = async (mangaId: string, status: string, score?: number) : Promise<ServiceResult<IUserMediaEntry>> =>
{
	try 
	{
		const response = await api.post(`/media-entry`, { status, score }, {
			params: { mangaId }
		});
		return {
			success: true,
			data: response.data
		};
	}
	catch (err: any)
	{
		return {
			success: false,
			error: err.response?.data?.error ?? 'Unable to update manga status'
		};
	}
}
