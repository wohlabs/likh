import api from "@/services/AxiosInstance";
import { IMangaNotes, INoteEntry } from "@/types/INotes";
import { getAnilistNote } from "./notes.service";
import { IMangaDetails } from "@/types/IManga";
import { getUserIdFromToken } from "@/components/util";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ServiceResult } from "./IServiceResult";

const MANGA_QUERY = `
	query GetManga($id: Int) {
		Media(id: $id, type: MANGA) {
			id
			title {
				userPreferred
			}
			coverImage {
				large
			}
			description
			genres
			chapters
			volumes
			status
		}
	}`;

export const MANGA_SEARCH_QUERY = `
query ($search: String, $page: Int, $perPage: Int) {
	Page (page: $page, perPage: $perPage) {
		media (search: $search, type: MANGA, sort: TRENDING_DESC) {
			id
			title {
				userPreferred
			}
			coverImage {
				large
			}
		}
	}
}
`

const LIBRARY_MANGA_QUERY = `
	query ($ids: [Int]){
		Page(page: 1, perPage: 50) {
			media(id_in: $ids, type: MANGA, sort: TRENDING_DESC) {
				id
				title {
					userPreferred
				}
				coverImage {
					large
				}
			}
		}
	}
`

export type MangaProps = {
	id: string;
	title: {
		userPreferred: string;
	}
	coverImage: {
		large: string;
		medium: string
	}
};


export const getMangaData = async (mangaId: string, access_token: string = "") : Promise<IMangaNotes> => 
{
	try 
	{
		const response = await api.get(`/notes?mangaId=${mangaId}`);
		const notes: IMangaNotes = response.data.map((item: any): INoteEntry => ({
			id: item._id,
			createdAt: item.createdAt,
			modifiedAt: item.modifiedAt,
			startChapter: item.startChapter,
			endChapter: item.endChapter,
			images: item.images,
			text: item.text,
			fromAnilist: false
		}))
		const anilistNote: INoteEntry | null = await getAnilistNote(mangaId, access_token)
		if (anilistNote !== null)
		{
			notes.push(anilistNote)
		}
		await AsyncStorage.setItem('manga_' + mangaId.toString(), JSON.stringify(notes));
		return notes || JSON.parse("[]");
	}
	catch (err: any) 
	{
		console.error(err.response?.data || err.message);
		// error reading value
		return [];
	}
};

export const addMangaToLibrary = async (mangaId: string) : Promise<boolean> => 
{
	try 
	{
		await api.post('/users/me/manga', {
			mangaId: parseInt(mangaId)
		});
	}
	catch
	{
		// saving error
		return false
	}
	return true
};

export const getMangaDetails = async (mangaId: string) : Promise<IMangaDetails | undefined> =>
{
	const data = await fetch("https://graphql.anilist.co", {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		},
		body: JSON.stringify({ query: MANGA_QUERY, variables: {id : mangaId} })
	})
		.then((response) => response.json())
		.then((response) => response.data)
		.then((data) => 
		{
			return data
		})
		.then((media) => 
		{
			return media.Media as IMangaDetails;
		})
		.catch((error) => 
		{
			console.error(error);
			return undefined
		});
	return data;
}

export const getMangaIdsWithNotes = async (accessToken: string) : Promise<string[]> =>
{
	if (accessToken === null || accessToken.length === 0) return []
	const userId = getUserIdFromToken(accessToken);
	const mangaIds = await fetch("https://graphql.anilist.co", {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		},
		body: JSON.stringify({ query: `
		query ($userId: Int){
			MediaListCollection(userId: $userId, type: MANGA) {
				lists {
					entries {
						notes
						id
						mediaId
					}
				}
			}
		}`, variables: {userId : userId}})
	})
		.then((response) => response.json())
		.then((response) => response.data)
		.then((data) => 
		{
			const  result = data.MediaListCollection.lists.flatMap((list: any) =>
				list.entries
					.filter((entry: any) => entry.notes && entry.notes.length > 0)
					.map((entry: any) => entry.mediaId.toString())
			);
			return result
		})
		.catch((error) => 
		{
			console.error(error);
			return undefined
		});
	return mangaIds;
}

export const searchMangaByString = async (searchString: string, page: number = 1, perPage: number = 10) =>
{
	const data = await fetch("https://graphql.anilist.co", {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		},
		body: JSON.stringify({ query: MANGA_SEARCH_QUERY, variables: {search : searchString, page, perPage} })
	})
		.then((response) => response.json())
		.then((response) => response.data)
		.then((data) => 
		{
			return data.Page.media
		})
		.catch((error) => 
		{
			console.error(error);
		});
	return data;
}

export const getMyListMangaIds = async (accessToken: string) : Promise<ServiceResult<string[]>> =>
{
	try 
	{
		const response = await api.get(`/users/me/manga`)
		return {
			success: true,
			data: response.data
		}
	}
	catch (err: any)
	{
		return {
			success: false,
			error: err.response?.data?.error || "Could not fetch mangaIds"
		};
	}
}

export const getLibraryMangaThumbnails = async (mangaIds: string[]) : Promise<ServiceResult<MangaProps[]>> =>
{
	if (mangaIds.length === 0) return {success: true, data: []};

	const query = {
		query: LIBRARY_MANGA_QUERY,
		variables: {ids: mangaIds}
	}

	const result = await (fetch("https://graphql.anilist.co", {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		},
		body: JSON.stringify(query)
	})
		.then((response) => response.json())
		.then((response) => response.data)
		.then((data) =>
		{
			if (data && data.Page && data.Page.media)
			{
				return {success: true as const, data: data.Page.media};
			}
			else
			{
				return {success: true as const, data: []};
			}
		})
		.catch((error) => 
		{
			return {
				success: false as const,
				error: error.response?.data?.error || "Could not fetch mangaIds"
			};
		}));
	return result;
}