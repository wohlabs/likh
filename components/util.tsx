import AsyncStorage from '@react-native-async-storage/async-storage';
import { IMangaNotes, INoteEntry } from './INotes';

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
		return false
	}
	return true
};

export const getMangaDetails = async (mangaId: string) =>
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
	.catch((error) => {
		console.error(error);
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
	const numberOfFullRows = Math.floor(data.length / numColumns);
	let numberOfElementsLastRow = data.length - numberOfFullRows * numColumns;
	while (
		numberOfElementsLastRow !== numColumns &&
		numberOfElementsLastRow !== 0
	) {
		data.push({});
		numberOfElementsLastRow++;
	}
	return data;
};