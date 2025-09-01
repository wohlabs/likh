import { Ionicons } from "@expo/vector-icons"; // or any icon library
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import
	{
		FlatList,
		Image,
		Pressable,
		SectionList,
		StyleSheet,
		Text,
		TouchableOpacity,
	} from "react-native";
import { getData } from "./util";

// storing some initial data for testing
// import DATA from "./data.json";
// const storeData = async () => {
//   try {
// 	const jsonValue = JSON.stringify(DATA)
//     await AsyncStorage.setItem('DATA', jsonValue);
// 	console.log("saved data successfully")
//   } catch (e) {
//     // saving error
//   }
// };
// storeData()

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
	const [data, setData] = useState([]);
	useEffect(() => {
		const fetchData = async () => {
			const DATA = await getData();
			setData(
				DATA.map((section: any) => {
					return {
						title: `Chapter ${section.chapter}`,
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
				})
			);
		};
		fetchData();
	}, []);

	return (
		<>
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
								onPress={() => {
									item.image && router.navigate("/manga/123/viewer");
								}}
							>
								<Image
									source={{ uri: item.image }}
									style={styles.mangaCoverImage}
									resizeMode="center"
								/>
								{item.text && (
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
			<TouchableOpacity style={{height: 60, width: "100%", alignItems: "center", backgroundColor: "green", justifyContent: "center"}}>
				<Ionicons name="add" size={35} color={"white"}/>
			</TouchableOpacity>
		</>
	);
}

const styles = StyleSheet.create({
	mangaCoverImage: { flex: 1, aspectRatio: 1 },
});
