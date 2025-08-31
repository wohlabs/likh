import { router } from "expo-router";
import { Pressable, SectionList, Text } from "react-native";
import DATA from "./data.json";


const data = DATA.map((chapter) => {
	return {
		title: `Chapter ${chapter.chapter}`,
		data: chapter.notes.filter((note) => note.text !== undefined), // only keep notes with text
	};
}).filter((chapter) => chapter.data.length > 0); // only keep chapters with notes

export default function MangaNotesTab() {
	return (
		<SectionList
			sections={data}
			keyExtractor={(_, index) => index.toString()}
			style={{ flex: 1 }}
			renderSectionHeader={({ section: { title } }) => <Text style={{fontWeight: 'bold'}}>{title}</Text>}
			renderItem={({ item: { text } }) =>
				<Pressable
					style={{ flex: 1, margin: 5 }}
					onPress={() => router.navigate("/manga/123/viewer")}
				>
					<Text>{text}</Text>
				</Pressable>
			}
		/>
	);
}
