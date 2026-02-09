import api from "@/services/AxiosInstance";
import { IMangaNotes, INoteEntry } from "@/types/INotes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ServiceResult } from "./IServiceResult";

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