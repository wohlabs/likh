import { router } from "expo-router";
import { Pressable, SectionList, Text } from "react-native";

const DATA = [
	{
		title: "Chapter 2",
		data: [
			{
				id: 1,
				note: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
				hasImage: true,
			},
			{
				id: 2,
				note: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
				hasImage: false,
			},
			{
				id: 3,
				note: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
				hasImage: true,
			},
		],
	},
	{
		title: "Chapter 69",
		data: [
			{
				id: 1,
				note: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
				hasImage: false,
			},
			{
				id: 2,
				note: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
				hasImage: false,
			}
		],
	},
];

export default function MangaNotesTab() {
	return (
		<SectionList
			sections={DATA}
			keyExtractor={(_, index) => index.toString()}
			style={{ flex: 1 }}
			renderSectionHeader={({ section: { title } }) => <Text style={{fontWeight: 'bold'}}>{title}</Text>}
			renderItem={({ item: { note } }) =>
				<Pressable
					style={{ flex: 1, margin: 5 }}
					onPress={() => router.navigate("/manga/123/viewer")}
				>
					<Text>{note}</Text>
				</Pressable>
			}
		/>
	);
}
