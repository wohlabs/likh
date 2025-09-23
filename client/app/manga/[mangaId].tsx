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
import { FlatList, Image, ScrollView, StyleSheet, Text, View } from "react-native";
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
		<ScrollView contentContainerStyle={{ minHeight: '100%'}}>
			<View style={{ alignItems: 'center', height: 300, width: '100%', justifyContent: 'center', flexDirection: 'row' }}>
				<View style={{height: '100%', width: '70%', flexDirection: 'row'}}>
					<Image
						source={{ uri: manga?.coverImage?.large }}
						resizeMode="contain"
						style={{height: '100%', aspectRatio: '1'}}
					/>
					<View style={{ flex: 1}}>
						<View style={{flex: 1, flexDirection: 'row', alignItems: 'flex-end'}}>
							<ThemeText style={{fontSize: 24, fontWeight: 'bold', alignItems: 'flex-end', textAlignVertical: 'bottom'}}>{manga?.title.userPreferred}</ThemeText>
						</View>
						<ThemeText style={{flex: 2}}>{manga?.description}</ThemeText>
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
				renderItem={({ item, index }: { item: INoteEntry, index: any }) => (
					item.id ?
					<NotePreviewCard note={item} style={{ flex: 1, height: 200, margin: 5}} onPress={()=> {setViewerNoteIndex(index); setIsViewingOverlay(true)}}/>
					:
					<View style={{ flex: 1, margin: 5}}></View>
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
			<View style={{height: 60, width: "50%", position: "sticky", bottom: 25, left:"50%", transform: "translateX(-50%)", flexDirection: "row", alignItems: "center"}}>
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
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	tabTitle: { fontSize: 14, fontWeight: "bold" },
	mangaCoverImage: { width: '100%', aspectRatio: '0.8'}
});