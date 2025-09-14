import { IMangaNotes, INoteEntry } from "@/components/INotes";
import NotePreviewCard from "@/components/NotePreviewCard";
import NoteViewer from "@/components/NoteViewer";
import { formatData, getMangaData, getMangaDetails, IMangaDetails } from "@/components/util";
import { Ionicons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Overlay } from "@rneui/base";
import { router, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const Tab = createMaterialTopTabNavigator();

export default function MangaDetails({ navigation }: any) {
	const { mangaId } = useLocalSearchParams(); // <-- get from URL
	const [manga, setManga] = useState<IMangaDetails>();
	const [data, setData] = useState<IMangaNotes>([]);
	const [filteredNotes, setFilteredNotes] = useState<IMangaNotes>([]);
	const [searchString, setSearchString] = useState<string>("");
	const [isViewingOverlay, setIsViewingOverlay] = useState<boolean>(false);
	const [viewerNote, setViewerNote] = useState<INoteEntry>({id: "", text: "", images: [], startChapter: -1, endChapter: -1, createdAt: "", modifiedAt: ""});

	useEffect(() => {
		const populateMangaData = async () => {
			const manga = await getMangaDetails(mangaId.toString());
			setManga(manga);
		};
		populateMangaData();
	}, []);

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

	useEffect(() => {
		setFilteredNotes(
			searchString.trim().length == 0 ? data : data.filter((note: INoteEntry) => (note.text && note.text.toLowerCase().includes(searchString.toLowerCase()))));
	}, [searchString, data]);


	return (
		<ScrollView contentContainerStyle={{ minHeight: '100%'}}>
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
			<FlatList
				data={formatData(filteredNotes, 2)}
				keyExtractor={(_, index) => index.toString()}
				numColumns={2}
				contentContainerStyle={{flexGrow: 0}}
				scrollEnabled={false}
				columnWrapperStyle={{ marginLeft: 5, marginRight: 5 }}
				renderItem={({ item }: { item: INoteEntry }) => (
					item.id ?
					<NotePreviewCard note={item} style={{ flex: 1, height: 200, margin: 5}} onPress={()=> {setViewerNote(item); setIsViewingOverlay(true)}}/>
					:
					<View style={{ flex: 1, margin: 5}}></View>
				)}
			/>
			<Overlay isVisible={isViewingOverlay} onBackdropPress={() => {setIsViewingOverlay(false)}} overlayStyle={{padding: 0, width: "80%", height: "80%", backgroundColor: "transparent", borderRadius: 10, shadowColor: "transparent", flexDirection: "row", justifyContent: "center", alignItems: "center"}} >
				<Ionicons name="arrow-back" size={30} color={"black"}/>
					<NoteViewer note={viewerNote} mangaTitle={manga?.title.userPreferred} style={{height: "100%", backgroundColor: "white", borderRadius: 10, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 5}}/>
				<Ionicons name="arrow-forward" size={30} color={"black"}/>
			</Overlay>
			<View style={{height: 60, width: "50%", position: "sticky", bottom: 25, left:"50%", transform: "translateX(-50%)", flexDirection: "row", alignItems: "center"}}>
				<View style={{ flex: 1, backgroundColor: "white", flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 5, borderRadius: 10, shadowColor: "black", shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 5}} >
					<Ionicons name="search" size={20} style={{position: "relative", margin: 5}}/>
					<TextInput style={{flex: 1, margin: 5, borderWidth: 0, borderColor: "transparent", fontSize: 20, padding: 5}} underlineColorAndroid={"transparent"} onChangeText={(text) => setSearchString(text)} />
				</View>
				<TouchableOpacity
					onPress={() => router.navigate(`/manga/${mangaId}/add_note`)}
					style={{width: 40, height: 40, margin: 5, aspectRatio: 1, shadowOpacity: 0.3, shadowRadius: 5, backgroundColor: "white", borderRadius: "100%", shadowColor: "black", shadowOffset: {width: 0, height: 4} }}>
					<Ionicons name="add" size={40} style={{ width: "100%", height: "100%", position: "relative" }} color={"black"}/>
				</TouchableOpacity>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	tabTitle: { fontSize: 14, fontWeight: "bold" },
	mangaCoverImage: { width: '100%', aspectRatio: '0.8'}
});