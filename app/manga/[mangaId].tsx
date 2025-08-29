import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Stack } from "expo-router";
import MangaImagesTab from "../../components/MangaImagesTab";
import MangaNotesTab from "../../components/MangaNotesTab";



const MANGA_QUERY = `
	query GetManga($id: Int) {
		Media(id: $id, type: MANGA) {
			id
			title {
				userPreferred
			}
			coverImage {
				large
			}
			description
			genres
			chapters
			volumes
			status
		}
	}`;

const Tab = createMaterialTopTabNavigator();

export default function MangaDetails({ navigation }: any) {

	return (
		<>
			<Stack.Screen options={{ title: "Manga Title" }} />
			<Tab.Navigator
				screenOptions={{
				tabBarIndicatorStyle: { backgroundColor: "blue" },
				tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
				}}
			>
				<Tab.Screen name="Images" component={MangaImagesTab} />
				<Tab.Screen name="Notes" component={MangaNotesTab} />
			</Tab.Navigator>
		</>
	);
}