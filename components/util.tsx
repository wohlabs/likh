import AsyncStorage from '@react-native-async-storage/async-storage';

export const getMangaData = async (mangaId: string) => {
	try {
		const jsonValue = await AsyncStorage.getItem("manga_" + mangaId.toString());
		return jsonValue != null ? JSON.parse(jsonValue) : [];
	} catch (e) {
		// error reading value
	}
};

export const addMangaNote = async (mangaId: string, chapter: number, image: string | null, text: string | null) => {
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
	}
};