import { Ionicons } from "@expo/vector-icons"; // or any icon library
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import
	{
		FlatList,
		Image,
		Pressable,
		SectionList,
		StyleSheet,
		Text,
		TouchableOpacity,
		View,
	} from "react-native";
import { formatData, getMangaData } from "./util";


export default function MangaImagesTab() {
	const [data, setData] = useState([]);
	const { mangaId } = useLocalSearchParams(); // <-- get from URL
	const fetchData = async () => {
		const DATA = await getMangaData(mangaId.toString());
		setData(
			DATA
			.sort((a:any, b:any) => a.chapter - b.chapter)
			.map((section: any) => {
				return {
					title: section.chapter >= 0 ? `Chapter ${section.chapter}` : "All",
					data: [
						// SectionList expects an array of items
						{
							id: section.id,
							images: section.notes.filter(
								(note: any) => note.image != undefined
							),
						},
					],
				};
			}).filter((section:any) => section.data[0].images.length > 0) // remove chapters with no images
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
					>{title}</Text>
				)}
				renderItem={({ item }) => (
					<FlatList
						data={formatData(item.images, 2)}
						keyExtractor={(_, index) => index.toString()}
						numColumns={2}
						style={{ flex: 1 }}
						columnWrapperStyle={{ marginLeft: 5, marginRight: 5 }}
						renderItem={({ item }: any) => (
							item.image ? <Pressable
								style={{ flex: 1, height: 200, margin: 5, flexDirection: "row", borderRadius: 10, borderColor: "black", borderWidth: 2 }}
								onPress={() => {
									item.image && router.navigate(`/manga/${mangaId}/viewer`, {

									});
								}}
							>
								<Image
									source={{ uri: item.image }}
									style={{ height: "100%", width: "30%" }}
									resizeMode="cover"
								/>
								<View style={{ flex: 1, padding: 10 }}>
									<Text>6/3/2025 @ 14:00PM</Text>
									<Text>Chapter 5</Text>
									<Text>{item.text}</Text>
								</View>
							</Pressable>
							:
							<View style={{flex: 1, margin: 5}}></View>
						)}
					/>
				)}
			/>
			<TouchableOpacity style={{height: 60, width: "100%", alignItems: "center", backgroundColor: "green", justifyContent: "center"}} onPress={() => router.navigate(`/manga/${mangaId}/add_note`)}>
				<Ionicons name="add" size={35} color={"white"}/>
			</TouchableOpacity>
		</>
	);
}

const styles = StyleSheet.create({
	mangaCoverImage: { flex: 1, aspectRatio: 1 },
});
