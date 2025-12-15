import api from "@/services/AxiosInstance";
import { IMangaNotes, INoteEntry } from "@/types/INotes";
import { getUserIdFromToken } from "@/components/util";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ServiceResult } from "./IServiceResult";

export const MANGA_NOTE_QUERY = `
query ($userId: Int, $mediaId: Int) {
	MediaList (userId: $userId, mediaId: $mediaId) {
		id
		userId
		notes
		createdAt
		updatedAt
	}
}
`

export const getAnilistNote = async (mangaId: string, access_token: string) : Promise<INoteEntry | null> =>
{
	try
	{
		const result = await api.post('/anilist', { query: MANGA_NOTE_QUERY, variables: {userId : getUserIdFromToken(access_token), mediaId: mangaId} });
		const item = result.data.data.MediaList
		if (!item || !item.notes) return null
		console.log("Anilist note fetched:", item)
		return {
			id: item.id,
			createdAt: new Date(item.createdAt * 1000).toString(),
			modifiedAt: new Date(item.updatedAt * 1000).toString(),
			startChapter: -1,
			endChapter: undefined,
			images: [],
			text: item.notes,
			fromAnilist: true
		} as INoteEntry;
	}
	catch (err: any)
	{
		return null
	}
}

export const addMangaNote = async (mangaId: string, entry: INoteEntry) : Promise<boolean> => 
{
	try 
	{
		await api.post('/notes', {
			mangaId,
			...entry
		})
	}
	catch (e) 
	{
		// saving error
		console.error("save error", e)
		return false
	}
	return true
};

export const deleteMangaNote = async (mangaId: string, entryId: string) : Promise<IMangaNotes> => 
{
	let notes: IMangaNotes = await AsyncStorage.getItem('manga_' + mangaId.toString())
		.then((value) => value ? JSON.parse(value) : [])
	try 
	{
		await api.delete(`/notes/${entryId}`);
		notes = notes.filter((note) => note.id !== entryId)
		await AsyncStorage.setItem('manga_' + mangaId.toString(), JSON.stringify(notes));
		return notes;
	}
	catch (e) 
	{
		console.error("delete note error", e)
		return notes;
	}
};

export const getNote = async (noteId: string) : Promise<ServiceResult<INoteEntry>> => 
{
	try 
	{
		const response = await api.get(`/notes/${noteId}`);
		return { success: true, data: response.data };
	}
	catch (e) 
	{
		console.error("get note error", e)
		return { success: false, error: "Could not fetch note" };
	}
};