import AsyncStorage from '@react-native-async-storage/async-storage';
import { IMangaNotes, INoteEntry } from './INotes';
import api from '@/api/AxiosInstance';
import { jwtDecode } from "jwt-decode";
import { getAnilistNote } from '@/services/notes.service';

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

export const getMangaData = async (mangaId: string, access_token: string = "") : Promise<IMangaNotes> => {
	try {
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

export const getUserIdFromToken = (accessToken: string) : number | null => {
	if (accessToken.length === 0) return null
	const decodedToken: any = jwtDecode(accessToken);
	const userId: number = decodedToken.sub;
	return userId;
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
	.then((data) => {
		const  result = data.MediaListCollection.lists.flatMap((list: any) =>
			list.entries
				.filter((entry: any) => entry.notes && entry.notes.length > 0)
				.map((entry: any) => entry.mediaId.toString())
		);
		return result
	})
	.catch((error) => {
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
	.then((data) => {
		return data.Page.media
	})
	.catch((error) => {
		console.error(error);
	});
	return data;
}

export const formatData = (data: any[], numColumns: number) => {
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