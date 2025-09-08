import { getMangaDetails } from "@/components/util";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import MangaImagesTab from "../../components/MangaImagesTab";

const Tab = createMaterialTopTabNavigator();

export default function MangaDetails({ navigation }: any) {
	const { mangaId } = useLocalSearchParams(); // <-- get from URL
	const [mangaName, setMangaName] = useState<string>("Fetching...")

	useEffect(() => {
		const populateMangaData = async () => {
			const manga = await getMangaDetails(mangaId.toString());
			setMangaName(manga.Media.title.userPreferred);
		};
		populateMangaData();
	}, []);

	return (
		<>
			<Stack.Screen options={{ title: mangaName }} />
			<MangaImagesTab />
		</>
	);
}

const styles = StyleSheet.create({
	tabTitle: { fontSize: 14, fontWeight: "bold" },
	mangaCoverImage: { width: '100%', aspectRatio: '0.8'}
});