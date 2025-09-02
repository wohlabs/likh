import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, SectionList, Text, TouchableOpacity, View } from "react-native";
import { getMangaData } from "./util";

export default function MangaNotesTab() {
	const { mangaId } = useLocalSearchParams(); // <-- get from URL
	const [data, setData] = useState([]);
	const fetchData = async () => {
		const DATA = await getMangaData(mangaId.toString());
		setData(
			DATA
			.sort((a:any, b:any) => a.chapter - b.chapter)
			.map((chapter: any) => {
				return {
					title: chapter.chapter >= 0 ? `Chapter ${chapter.chapter}` : "All",
					data: chapter.notes.filter((note: any) => note.text !== undefined), // only keep notes with text
				};
			}).filter((chapter: any) => chapter.data.length > 0) // only keep chapters with notes
		);
	};
	useEffect(() => {
		fetchData();
	}, []);

	useFocusEffect(
		useCallback(() => {
			fetchData()
		}, [])
	)

	return (
		<>
			<SectionList
				sections={data}
				keyExtractor={(_, index) => index.toString()}
				style={{ flex: 1 }}
				renderSectionHeader={({ section: { title } }) => (
					<Text
						style={{
							fontWeight: "bold",
							fontSize: 20,
							padding: 10,
							backgroundColor: "white",
						}}
					>
						{title}
					</Text>
				)}
				renderItem={({ item: { text, image } }) => (
					<Pressable
						style={{
							flex: 1,
							margin: 5,
							borderRadius: 10,
							padding: 10,
							backgroundColor: "lightblue",
						}}
						onPress={() => router.navigate(`/manga/${mangaId}/viewer`)}
					>
						<View
							style={{ flexDirection: "row", justifyContent: "space-between" }}
						>
							<Text style={{ color: "gray" }}>6/5/2025 @ 14:05 PM</Text>
							{image && <Ionicons name="image" size={20} color="gray" />}
						</View>
						<Text style={{ paddingTop: 5 }}>{text}</Text>
					</Pressable>
				)}
			/>
			<TouchableOpacity style={{height: 60, width: "100%", alignItems: "center", backgroundColor: "green", justifyContent: "center"}} onPress={() => router.navigate(`/manga/${mangaId}/add_note`)}>
				<Ionicons name="add" size={35} color={"white"}/>
			</TouchableOpacity>
		</>
	);
}
