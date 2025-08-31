import { Ionicons } from "@expo/vector-icons"; // or any icon library
import { router } from "expo-router";
import React from "react";
import
	{
		FlatList,
		Image,
		Pressable,
		SectionList,
		StyleSheet,
		Text,
	} from "react-native";
import DATA from "./data.json";

const data = DATA.map((section) => {
	return {
		title: `Chapter ${section.chapter}`,
		data: [
			{
				id: section.id,
				images: section.notes.filter((note)=> note.image != undefined).map((img) => ({
					id: img.id,
					uri: img.image,
				})),
			},
		],
	};
});

const formatData = (data: Array<any>, numColumns: number) => {
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

export default function MangaImagesTab() {
	return (
		<SectionList
			sections={data}
			keyExtractor={(item) => item.id.toString()}
			style={{ flex: 1 }}
			renderSectionHeader={({ section: { title } }) => (
				<Text style={{ fontWeight: "bold" }}>{title}</Text>
			)}
			renderItem={({ item }) => (
				<FlatList
					data={formatData(item.images, 3)}
					keyExtractor={(item: any) => item.id}
					numColumns={3}
					style={{ flex: 1 }}
					columnWrapperStyle={{ marginLeft: 5, marginRight: 5 }}
					renderItem={({ item }: any) => (
						<Pressable
							style={{ flex: 1, margin: 5 }}
							onPress={() => { item.uri && router.navigate("/manga/123/viewer")}}
						>
							<Image
								source={{ uri: item.uri }}
								style={styles.mangaCoverImage}
								resizeMode="center"
							/>
							{item.uri && (
								<>
									<Ionicons
										name="chatbox"
										size={28}
										color="black"
										style={{
											position: "absolute",
											right: 2,
											top: 2,
											textShadowColor: "black",
										}}
									/>
									<Ionicons
										name="chatbox"
										size={24}
										color="white"
										style={{
											position: "absolute",
											right: 4,
											top: 3,
											textShadowColor: "black",
										}}
									/>
								</>
							)}
						</Pressable>
					)}
				/>
			)}
		/>
	);
}

const styles = StyleSheet.create({
	mangaCoverImage: { flex: 1, aspectRatio: 1 },
});
