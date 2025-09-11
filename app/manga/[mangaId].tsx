import { getMangaDetails, IMangaDetails } from "@/components/util";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import MangaImagesTab from "../../components/MangaImagesTab";

const Tab = createMaterialTopTabNavigator();

export default function MangaDetails({ navigation }: any) {
	const { mangaId } = useLocalSearchParams(); // <-- get from URL
	const [manga, setManga] = useState<IMangaDetails>();

	useEffect(() => {
		const populateMangaData = async () => {
			const manga = await getMangaDetails(mangaId.toString());
			setManga(manga);
		};
		populateMangaData();
	}, []);

	return (
		<>
			<Stack.Screen options={{ title: manga?.title.userPreferred || "Unknown", headerShown: false }} />
			<View style={{ alignItems: 'center', height: 300, width: '100%', justifyContent: 'center', flexDirection: 'row' }}>
				<View style={{height: '100%', width: '70%', flexDirection: 'row'}}>
					<Image
						source={{ uri: manga?.coverImage?.large }}
						resizeMode="contain"
						style={{height: '100%', aspectRatio: '1'}}
					/>
					<View style={{ flex: 1}}>
						<View style={{flex: 1, flexDirection: 'row', alignItems: 'flex-end'}}>
							<Text style={{fontSize: 24, fontWeight: 'bold', alignItems: 'flex-end', textAlignVertical: 'bottom'}}>{manga?.title.userPreferred}</Text>
						</View>
						<Text style={{flex: 2}}>{manga?.description}</Text>
					</View>
				</View>
			</View>
			<MangaImagesTab />
		</>
	);
}

const styles = StyleSheet.create({
	tabTitle: { fontSize: 14, fontWeight: "bold" },
	mangaCoverImage: { width: '100%', aspectRatio: '0.8'}
});