import AsyncStorage from '@react-native-async-storage/async-storage';

export const getMangaData = async (mangaId: string) => {
	try {
		const jsonValue = await AsyncStorage.getItem("manga_" + mangaId.toString());
		return jsonValue != null ? JSON.parse(jsonValue) : [];
	} catch (e) {
		// error reading value
	}
};