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
				english
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
				english
			}
			coverImage {
				large
			}
		}
	}
}
`

const MANGA_SEARCH_TREND_QUERY = `
	query {
		Page(page: 1, perPage: 10) {
			media(type: MANGA, sort: TRENDING_DESC) {
				id
				title {
					userPreferred
					english
				}
				coverImage {
					large
				}
			}
		}
	}
`;

const LIBRARY_MANGA_QUERY = `
	query ($ids: [Int], $page: Int){
		Page(page: $page, perPage: 50) {
			pageInfo {
				hasNextPage
			}
			media(id_in: $ids, type: MANGA, sort: TRENDING_DESC) {
				id
				title {
					userPreferred
					english
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
		english: string;
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
	try 
	{
		const respone = await api.post("/anilist", {
			query: MANGA_QUERY,
			variables: {id : mangaId} 
		})
		const data = respone.data.data.Media as IMangaDetails;
		return data;
	}
	catch (err: any)
	{
		return undefined;
	}
}

export const getMangaIdsWithNotes = async (accessToken: string) : Promise<string[]> =>
{
	if (accessToken === null || accessToken.length === 0) return []
	const userId = getUserIdFromToken(accessToken);
	const query = `query ($userId: Int){
			MediaListCollection(userId: $userId, type: MANGA) {
				lists {
					entries {
						notes
						id
						mediaId
					}
				}
			}
		}`;
	const variables = {userId : userId};
	try
	{

		const result = await api.post('/anilist', { query, variables });
		const mangaIds = result.data.data.MediaListCollection.lists.flatMap((list: any) =>
			list.entries
				.filter((entry: any) => entry.notes && entry.notes.length > 0)
				.map((entry: any) => entry.mediaId.toString())
		);
		return mangaIds;
	}
	catch (err: any)
	{
		return [];
	}
}

export const searchMangaByString = async (searchString: string, page: number = 1, perPage: number = 25): Promise<ServiceResult<MangaProps[]>> =>
{
	try
	{
		const result = await api.post('/anilist', {
			query: searchString.length > 0 ? MANGA_SEARCH_QUERY : MANGA_SEARCH_TREND_QUERY,
			variables: {search: searchString, page, perPage} });
		return {success: true as const, data: result.data.data.Page.media};
	}
	catch (err: any)
	{
		return {success: false as const, error: err.response?.data?.error || "Could not search manga"};
	}
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
	catch (error: any)
	{
		return {
			success: false,
			error: error.response?.data?.error || "Could not fetch mangaIds"
		};
	}
}

export const getLibraryMangaThumbnails = async (mangaIds: string[]) : Promise<ServiceResult<MangaProps[]>> =>
{
	if (mangaIds.length === 0) return {success: true, data: []};

	console.log("filtered mangaids:", mangaIds) //125167

	try
	{
		let allMedias: any[] = []
		let hasNextPage = true
		let i = 1;
		while (hasNextPage)
		{
			const query = {
				query: LIBRARY_MANGA_QUERY,
				variables: {ids: mangaIds, page: i}
			}
			const result = await api.post('/anilist', query);
			allMedias=[...allMedias, ...result.data.data.Page.media]
			hasNextPage = result.data.data.Page.pageInfo.hasNextPage
			i++;
		}
		return {success: true as const, data: allMedias};
	}
	catch (error: any)
	{
		return {
			success: false as const,
			error: error.response?.data?.error || "Could not fetch mangaIds"
		};
	}
}