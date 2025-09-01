import AsyncStorage from '@react-native-async-storage/async-storage';

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


export const getMangaData = async (mangaId: string) => {
	try {
		const jsonValue = await AsyncStorage.getItem("manga_" + mangaId.toString());
		return jsonValue != null ? JSON.parse(jsonValue) : [];
	} catch (e) {
		// error reading value
	}
};

export const addMangaNote = async (mangaId: string, chapter: number, image: string | null, text: string | null) : Promise<boolean> => {
	if (image === null && (text === null || text.trim().length == 0)) return false;
	const storageKey = "manga_" + mangaId;
	try {
		let currentMangaData: Array<any> = JSON.parse((await AsyncStorage.getItem(storageKey))?.toString() || "[]");
		let index = currentMangaData.findIndex((manga: any) => manga.chapter == chapter);
		if (index < 0)
		{
			currentMangaData.push({
				chapter: chapter,
				notes: []
			})
			index = currentMangaData.length - 1;
		}
		let newChapterData:any = currentMangaData[index];
		newChapterData.notes.push({
			image: image || undefined,
			text: text && text.trim().length > 0 ? text.trim() : undefined
		})
		currentMangaData[index] = newChapterData
		await AsyncStorage.setItem('manga_' + mangaId.toString(), JSON.stringify(currentMangaData));
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