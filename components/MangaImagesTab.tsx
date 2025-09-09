import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import
	{
		FlatList,
		Image,
		Pressable,
		StyleSheet,
		Text,
		TouchableOpacity,
		View
	} from "react-native";
import { IMangaNotes, INoteEntry } from "./INotes";
import { formatData, getMangaData } from "./util";

export default function MangaImagesTab() {
	const [data, setData] = useState<IMangaNotes>([]);
	const { mangaId } = useLocalSearchParams(); // <-- get from URL
	const fetchData = async () => {
		const DATA = await getMangaData(mangaId.toString());
		setData(DATA);
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
			<FlatList
				data={formatData(data, 2)}
				keyExtractor={(_, index) => index.toString()}
				numColumns={2}
				style={{ flex: 1 }}
				columnWrapperStyle={{ marginLeft: 5, marginRight: 5 }}
				renderItem={({ item }: { item: INoteEntry }) => (
					item.id ? <Pressable
						style={{ flex: 1, height: 200, margin: 5, flexDirection: "row", borderRadius: 10, borderColor: "black", borderWidth: 2 }}
						onPress={() => {
							item.images && router.navigate(`/manga/${mangaId}/viewer`);
						}}
					>
						<Image
							source={{ uri: item.images && item.images.length > 0 ? item.images?.at(0) : undefined }}
							style={{ height: "100%", width: "30%" }}
							resizeMode="cover"
						/>
						<View style={{ flex: 1, padding: 10 }}>
							<Text>6/3/2025 @ 14:00PM</Text>
							<Text>Chapter 5</Text>
							<Text>{item.text || "No notes"}</Text>
						</View>
					</Pressable>
					:
					<View style={{ flex: 1, margin: 5}}></View>
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
