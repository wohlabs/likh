import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, SectionList, Text, View } from "react-native";
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
			renderSectionHeader={({ section: { title } }) => <Text style={{fontWeight: 'bold', fontSize: 20, padding: 10, backgroundColor: 'white'}}>{title}</Text>} renderItem={({ item: { text, image } }) =>
				<Pressable
					style={{ flex: 1, margin: 5, borderRadius: 10, padding: 10, backgroundColor: 'lightblue' }}
					onPress={() => router.navigate("/manga/123/viewer")}
				>
					<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
						<Text style={{color: 'gray'}}>6/5/2025 @ 14:05 PM</Text>
						{image && <Ionicons name="image" size={20} color="gray" />}
					</View>
					<Text style={{paddingTop: 5}}>{text}</Text>
				</Pressable>
			}
		/>
	);
}
