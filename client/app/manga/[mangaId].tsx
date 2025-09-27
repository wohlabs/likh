import api from "@/api/AxiosInstance";
import { IMangaNotes, INoteEntry } from "@/components/INotes";
import NotePreviewCard from "@/components/NotePreviewCard";
import NoteViewer from "@/components/NoteViewer";
import ThemeText from "@/components/ThemeText";
import { formatData, getMangaData, getMangaDetails, IMangaDetails } from "@/components/util";
import { Ionicons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Image, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { IconButton, Modal, Portal, Searchbar } from "react-native-paper";

const Tab = createMaterialTopTabNavigator();

export default function MangaDetails({ navigation }: any) {
	const { mangaId } = useLocalSearchParams(); // <-- get from URL
	const [manga, setManga] = useState<IMangaDetails>();
	const [data, setData] = useState<IMangaNotes>([]);
	const [filteredNotes, setFilteredNotes] = useState<IMangaNotes>([]);
	const [searchString, setSearchString] = useState<string>("");
	const [isViewingOverlay, setIsViewingOverlay] = useState<boolean>(false);
	const [viewerNote, setViewerNote] = useState<INoteEntry>({id: "", text: "", images: [], startChapter: -1, endChapter: -1, createdAt: "", modifiedAt: ""});
	const [viewerNoteIndex, setViewerNoteIndex] = useState<number>(0);

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

	const onDelete = async (noteId: string) => {
		await api.delete(`/notes/${noteId}`)
		setIsViewingOverlay(false);
		fetchData();
	}

	useEffect(() => {
		setFilteredNotes(
			searchString.trim().length == 0 ? data : data.filter((note: INoteEntry) => (note.text && note.text.toLowerCase().includes(searchString.toLowerCase()))));
	}, [searchString, data]);

	useEffect(() => {
		setViewerNote(filteredNotes[viewerNoteIndex]);
	}, [filteredNotes, viewerNoteIndex]);

	return (
		<View style={{flex: 1}}>
			<ScrollView nestedScrollEnabled={true}>
				<View style={{ alignItems: 'center', height: 200, maxHeight: 200, width: '100%', justifyContent: 'center', flexDirection: 'row' }}>
					<View style={{height: '100%', maxWidth: 700, width: '100%', flexDirection: 'row'}}>
						<Image
							source={{ uri: manga?.coverImage?.large }}
							resizeMode="contain"
							style={{aspectRatio: 3/4, marginHorizontal: 5}}
						/>
						<View style={{ flex: 1 }}>
							<View style={{ height: '30%', flexDirection: 'row', alignItems: 'flex-end'}}>
								<ThemeText style={{fontSize: 24, fontWeight: 'bold', alignItems: 'flex-end', textAlignVertical: 'bottom'}}>{manga?.title.userPreferred}</ThemeText>
							</View>
							<ThemeText lineBreakMode="tail" numberOfLines={6} ellipsizeMode="tail">{manga?.description}</ThemeText>
						</View>
					</View>
				</View>
				<FlatList
					data={filteredNotes}
					keyExtractor={(_, index) => index.toString()}
					numColumns={1}
					contentContainerStyle={{flexGrow: 0}}
					scrollEnabled={false}
					renderItem={({ item, index }: { item: INoteEntry, index: any }) => (
						<NotePreviewCard note={item} style={{ flex: 1, margin: 5, padding: 5}} onPress={()=> {setViewerNoteIndex(index); setIsViewingOverlay(true)}}/>
					)}
				/>
				<Portal>
					<Modal visible={isViewingOverlay} onDismiss={() => {setIsViewingOverlay(false)}} contentContainerStyle={{margin: 100, flexDirection: "row", alignItems: "center", height: "80%", shadowOpacity: 0, justifyContent: "center"}}
						>
						<Ionicons name="arrow-back" size={50} color={"white"}
							style={{opacity: viewerNoteIndex != 0 ? 1 : 0 }}
							onPress={() => setViewerNoteIndex(viewerNoteIndex-1)}
							pointerEvents={ viewerNoteIndex == 0  ? 'none' : 'auto'}
						/>
						<NoteViewer note={viewerNote} mangaId={Array.isArray(mangaId) ? mangaId[0] : mangaId} mangaTitle={manga?.title.userPreferred} style={{height: "100%", backgroundColor: "white", borderRadius: 10, shadowOpacity: 0.3, shadowRadius: 5}} onDelete={() => onDelete(viewerNote.id)}/>
						<Ionicons name="arrow-forward" size={50} color={"white"}
							style={{opacity: viewerNoteIndex != filteredNotes.length - 1 ? 1 : 0 }} 
							onPress={() => setViewerNoteIndex(viewerNoteIndex+1)}
							pointerEvents={ viewerNoteIndex == filteredNotes.length - 1  ? 'none' : 'auto'}
						/>
					</Modal>
				</Portal>
			</ScrollView>
			<View style={{width: "100%", minWidth: 350, height: 60, position: "absolute", bottom: 25, flexDirection: "row", alignItems: "center", margin: 'auto', justifyContent: 'center'}}>
				<View style={{width: '90%', flexDirection: 'row', maxWidth: 600, alignItems: 'center'}}>
					<Searchbar
						placeholder="search note"
						onChangeText={setSearchString}
						style={{margin: 10, borderRadius: 10, flex: 1, shadowOpacity: 0.3, shadowRadius: 5, shadowColor: "black", shadowOffset: {width: 0, height: 4} }}
						value={searchString}
					/>
					<IconButton
						icon={"plus"}
						size={30}
						onPress={() => router.navigate(`/manga/${mangaId}/add_note`)}
						style={{shadowOpacity: 0.3, shadowRadius: 5, shadowColor: "black", shadowOffset: {width: 0, height: 4} }}
						mode="contained"
					/>
				</View>
			</View>

		</View>
	);
}

const styles = StyleSheet.create({
	tabTitle: { fontSize: 14, fontWeight: "bold" },
	mangaCoverImage: { width: '100%', aspectRatio: '0.8'}
});