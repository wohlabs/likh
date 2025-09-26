import AsyncStorage from '@react-native-async-storage/async-storage';
import { IMangaNotes, INoteEntry } from './INotes';
import api from '@/api/AxiosInstance';

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
		const response = await api.get(`/notes?mangaId=${mangaId}`);
		const notes: IMangaNotes = response.data.map((item: any) => ({
			id: item._id,
			createdAt: item.createdAt,
			modifiedAt: item.modifiedAt,
			startChapter: item.startChapter,
			endChapter: item.endChapter,
			images: item.images,
			text: item.text
		}))
		return notes || JSON.parse("[]");
	} catch (err: any) {
		console.error(err.response?.data || err.message);
		// error reading value
		return [];
	}
};

export const addMangaToLibrary = async (mangaId: string) : Promise<boolean> => {
	try {
		await api.post('/users/me/manga', {
			mangaId: parseInt(mangaId)
		});
	} catch (e) {
		// saving error
		return false
	}
	return true
};

export const addMangaNote = async (mangaId: string, entry: INoteEntry) : Promise<boolean> => {
	try {
		await api.post('/notes', {
			mangaId,
			...entry
		})
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
export const base64ToBlob = (base64: string, type = 'image/jpeg') => {
	const base64Stripped = base64.replace(/^data:image\/\w+;base64,/, '')
	const binary = atob(base64Stripped);
	const array = [];
	for (let i = 0; i < binary.length; i++) {
		array.push(binary.charCodeAt(i));
	}
	return new Blob([new Uint8Array(array)], { type });
};

export const blobToBase64 = (blob: Blob) : Promise<string | ArrayBuffer | null> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onloadend = () => resolve(reader.result)
		reader.onerror = reject
		reader.readAsDataURL(blob)
	})
};

export const getImageBase64 = async (imageId: string) : Promise<string> => {
	const blob = (await api.get(`/images/${imageId}`, {
		responseType: 'blob',
	})).data
	const imageBase64 = await blobToBase64(blob)
	if (imageBase64 instanceof ArrayBuffer) return ""
	if (imageBase64 === null) return ""
	else return imageBase64
}