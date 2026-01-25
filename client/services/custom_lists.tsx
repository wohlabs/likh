import { ICustomList, ICustomLists } from "@/types/ICustomList";
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

export const createCustomList = async (name: string, description: string = "", initMangaIds: number[] = []) : Promise<ServiceResult<ICustomList>> =>
{
	try
	{
		const response = await api.post('/custom-lists', {
			name,
			description,
			initMangaIds
		});

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

export const deleteCustomList = async (listId: string) : Promise<ServiceResult<ICustomList>> =>
{
	try
	{
		const response = await api.delete(`/custom-lists/${listId}`);

		return {
			success: true,
			data: response.data
		};
	}
	catch (error: any)
	{
		return {
			success: false,
			error: error.response?.data?.error || "Could not delete custom list"
		};
	}
}

export const addToCustomList = async (listId: string, mangaId: number, isIncluded: boolean) : Promise<ServiceResult<null>> =>
{
	try
	{
		await api.post(`/custom-lists/${listId}/manga`, {
			mangaId,
			isIncluded
		});
		return {
			success: true,
			data: null
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

export const favoriteManga = async (mangaId: number, isFav: boolean) : Promise<ServiceResult<null>> =>
{
	try
	{
		await api.post('/custom-lists/favorite/manga', {
			mangaId,
			isFav
		});
		return {
			success: true,
			data: null
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