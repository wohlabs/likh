import AsyncStorage from '@react-native-async-storage/async-storage';
import { IMangaNotes, INoteEntry } from './INotes';

export const TEST_USER_ID: string = "68c8cf1de67a0c9e19ce6ee5"

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

export type IMangaDetails = {
	id: string;
	title: { userPreferred?: string };
	coverImage?: { large?: string };
	description?: string;
	genres?: string[];
	chapters?: number;
	// volumes?: number;
	status?: string;
};

export const getMangaData = async (mangaId: string) : Promise<IMangaNotes> => {
	try {
		const notes = await AsyncStorage.getItem("manga_" + mangaId.toString());
		return JSON.parse(notes || "[]");
	} catch (e) {
		// error reading value
		return [];
	}
};

export const addMangaToLibrary = async (mangaId: string) : Promise<boolean> => {
	const storageKey = "manga_" + mangaId;
	try {
		let currentMangaData: Array<any> = JSON.parse((await AsyncStorage.getItem(storageKey))?.toString() || "[]");
		await AsyncStorage.setItem('manga_' + mangaId.toString(), JSON.stringify(currentMangaData));
	} catch (e) {
		// saving error
		return false
	}
	return true
};

export const addMangaNote = async (mangaId: string, entry: INoteEntry) : Promise<boolean> => {
	const storageKey = "manga_" + mangaId;
	try {
		let notes: IMangaNotes = await getMangaData(mangaId);
		notes.push(entry)
		await AsyncStorage.setItem('manga_' + mangaId.toString(), JSON.stringify(notes));
	} catch (e) {
		// saving error
		console.log("save error", e)
		return false
	}
	return true
};

export const deleteMangaNote = async (mangaId: string, entryId: string) : Promise<boolean> => {
	const storageKey = "manga_" + mangaId;
	try {
		let notes: IMangaNotes = await getMangaData(mangaId);
		notes = notes.filter((note) => note.id !== entryId)
		await AsyncStorage.setItem('manga_' + mangaId.toString(), JSON.stringify(notes));
	} catch (e) {
		console.log("delete note error", e)
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
	.then((data) => {
		return data
	})
	.then((media) => {
		return media.Media as IMangaDetails;
	})
	.catch((error) => {
		console.error(error);
		return undefined
	});
	return data;
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
	.then((data) => {
		return data.Page.media
	})
	.catch((error) => {
		console.error(error);
	});
	return data;
}

export const formatData = (data: Array<any>, numColumns: number) => {
	// source: https://www.youtube.com/watch?v=8wv0kjsirso
	const copyData = [...data];
	const numberOfFullRows = Math.floor(copyData.length / numColumns);
	let numberOfElementsLastRow = copyData.length - numberOfFullRows * numColumns;
	while (
		numberOfElementsLastRow !== numColumns &&
		numberOfElementsLastRow !== 0
	) {
		copyData.push({});
		numberOfElementsLastRow++;
	}
	return copyData;
};