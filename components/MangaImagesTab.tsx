import { FlatList, Image, SectionList, StyleSheet, Text } from "react-native";

const DATA = [
	{
		title: "Chapter 2",
		data: [
			{
				id: "1",
				images: [
					{ id: "4", uri: "https://picsum.photos/200/300" },
					{ id: "5", uri: "https://picsum.photos/200/300" },
					{ id: "4", uri: "https://picsum.photos/200/300" },
					{ id: "5", uri: "https://picsum.photos/200/300" },
				],
			},
		],
	},
	{
		title: "Chapter 5",
		data: [
			{
				id: "1",
				images: [
					{ id: "4", uri: "https://picsum.photos/200/300" },
					{ id: "5", uri: "https://picsum.photos/200/300" },
				],
			},
		],
	},
	{
		title: "Chapter 69",
		data: [
			{
				id: "1",
				images: [
					{ id: "4", uri: "https://picsum.photos/200/300" },
					{ id: "5", uri: "https://picsum.photos/200/300" },
				],
			},
		],
	},
	{
		title: "Chapter 200",
		data: [
			{
				id: "1",
				images: [
					{ id: "4", uri: "https://picsum.photos/200/300" },
					{ id: "5", uri: "https://picsum.photos/200/300" },
				],
			},
		],
	},
	{
		title: "Chapter 404",
		data: [
			{
				id: "1",
				images: [
					{ id: "4", uri: "https://picsum.photos/200/300" },
					{ id: "5", uri: "https://picsum.photos/200/300" },
				],
			},
		],
	},
	{
		title: "Chapter 420",
		data: [
			{
				id: "1",
				images: [
					{ id: "4", uri: "https://picsum.photos/200/300" },
					{ id: "5", uri: "https://picsum.photos/200/300" },
				],
			},
		],
	},
];

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
			sections={DATA}
			keyExtractor={(item) => item.id}
			style={{ flex: 1 }}
			renderSectionHeader={({ section: { title } }) => <Text style={{fontWeight: 'bold'}}>{title}</Text>}
			renderItem={({ item }) => (
				<FlatList
					data={formatData(item.images, 3)}
					keyExtractor={(item: any) => item.id}
					numColumns={3}
					style={{ flex: 1 }}
					renderItem={({ item }: any) => (
						<Image
							source={{ uri: item.uri }}
							style={styles.mangaCoverImage}
						/>
					)}
				/>
			)}
		/>
	);
}

const styles = StyleSheet.create({
	mangaCoverImage: { flex: 1, aspectRatio: "0.8", resizeMode: "contain" }
});