import { IMangaNotes, INoteEntry } from "@/types/INotes";
import NotePreviewCard from "@/components/NotePreviewCard";
import NoteViewer from "@/components/NoteViewer";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import { useCallback, useEffect, useState, useContext } from "react";
import { FlatList, Platform, ScrollView, StyleProp, useWindowDimensions, View, ViewStyle, StyleSheet } from "react-native";
import { IconButton, Modal, Portal, Searchbar, useTheme } from "react-native-paper";
import ReanimatedSwipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { SharedValue, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { AuthContext } from "@/context/AuthContext";
import { getMangaData, getMangaDetails } from "@/services/manga.service";
import { deleteMangaNote } from "@/services/notes.service";
import MangaOverviewHeader from "@/components/MangaOverviewHeader";
import { getMangaTitle, IMangaDetails } from "@/types/IManga";
import ThemeCarousel from "@/components/ThemeCarousel";
import { Style } from "react-native-paper/lib/typescript/components/List/utils";
import ThemeSearchbar from "@/components/ThemeSearchbar";
import Toast from "react-native-toast-message"
import { LoadingScreen } from "@/components/LoadingScreen";

function NoteButtons({ onEditPress, onDeletePress }: { onEditPress?: () => void, onDeletePress?: () => void })
{
	return (
		<>
			<IconButton
				icon={"pencil-outline"}
				size={20}
				onPress={onEditPress}
				style={styles.actionButton}
				mode="contained"
			/>
			<IconButton
				icon={"share-outline"}
				size={20}
				onPress={() => {}}
				style={styles.actionButton}
				mode="contained"
			/>
			<IconButton
				icon={"trash-can-outline"}
				size={20}
				onPress={onDeletePress}
				style={styles.actionButton}
				mode="contained"
			/>
		</>
	)
}

function TranslatableButtonContainer({ style, translation, children }: { note: INoteEntry, style?: StyleProp<ViewStyle>, progress: SharedValue<number>, translation: SharedValue<number>, swipeableMethods: SwipeableMethods, children: React.ReactNode })
{
	const swipeLeftAnimation = useAnimatedStyle(() => 
	{
		return {
			transform: [{ translateX: translation.value + 140 }],
		};
	});


	return (
		<Reanimated.View style={[style, swipeLeftAnimation]}>
			{children}
		</Reanimated.View>
	)
}

export default function MangaDetails() 
{
	const theme = useTheme();
	const {width} = useWindowDimensions()
	const { mangaId, error } = useLocalSearchParams(); // <-- get from URL
	const [manga, setManga] = useState<IMangaDetails>();
	const [data, setData] = useState<IMangaNotes>([]);
	const [filteredNotes, setFilteredNotes] = useState<IMangaNotes>([]);
	const [searchString, setSearchString] = useState<string>("");
	const [isViewingOverlay, setIsViewingOverlay] = useState<boolean>(false);
	const [viewerNote, setViewerNote] = useState<INoteEntry>({id: "", text: "", images: [], startChapter: -1, endChapter: -1, createdAt: "", modifiedAt: "", fromAnilist: false});
	const [viewerNoteIndex, setViewerNoteIndex] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(true);
	const anilist_token: string = useContext(AuthContext).anilistToken || ""
	
	// Optional: Clear the error from the URL so it doesn't persist on refresh
	useEffect(() => {
		if (error)
		{
			Toast.show({
				type: 'error',
				text1: error as string
			  });
			
			setTimeout(() => {
				router.replace({
					pathname: '/app/manga/[mangaId]',
					params: { mangaId: mangaId as string },
				});
			}, 50);
		}
	}, [error]);

	const populateMangaData = useCallback(async () => 
	{
		const manga = await getMangaDetails(mangaId.toString());
		if (manga)
		{
			manga.description = manga.description?.replace(/<br\s*\/?>/gi, '\n').replace(/<\/?[^>]+(>|$)/g, '');
			setManga(manga);
		}
	}, [mangaId]);

	useEffect(() => 
	{
		populateMangaData();
	}, [populateMangaData]);

	const fetchData = useCallback(async () => 
	{
		const DATA = await getMangaData(mangaId.toString(), anilist_token);
		setData(DATA);
		setLoading(false);
	}, [mangaId, anilist_token]);

	useEffect(() => 
	{
		fetchData();
	}, [fetchData]);

	const onDelete = async (noteId: string) => 
	{
		try
		{
			const notes = await deleteMangaNote(mangaId.toString(), noteId);
			setIsViewingOverlay(false);
			setData(notes);
		}
		catch
		{
			console.error("Could not delete note");
		}
	}

	useEffect(() => 
	{

		setFilteredNotes(searchString.trim().length === 0 ? data : data.filter((note: INoteEntry) => (note.text && note.text.toLowerCase().includes(searchString.toLowerCase()))));
	}, [searchString, data]);

	useEffect(() => 
	{
		setViewerNote(filteredNotes[viewerNoteIndex]);
	}, [filteredNotes, viewerNoteIndex]);
	
	return (
		<View style={{flex: 1}}>
			{
				loading ?
				<LoadingScreen />
				:
				<ScrollView nestedScrollEnabled={true}>
					<MangaOverviewHeader manga={manga} style={styles.mangaHeader} />
					<FlatList
						data={filteredNotes}
						keyExtractor={(item) => `NotePreview_${item.id}`}
						key={`filteredNotes`}
						numColumns={1}
						contentContainerStyle={{flexGrow: 0}}
						scrollEnabled={false}
						renderItem={({ item, index }: { item: INoteEntry, index: any }) => (
							Platform.OS === 'web'
								?
								<View style={{flex:1, flexDirection: 'row', alignItems: 'center'}}>
									<NotePreviewCard note={item} style={{ flex: 1, margin: 5}} onPress={()=> {setViewerNoteIndex(index); setIsViewingOverlay(true)}} />
									<NoteButtons onEditPress={() => router.navigate(`/app/manga/${mangaId}/edit_note/${item.id}`)} onDeletePress={() => onDelete(item.id)} key={`NotePreviewCard_${item.id}`} />
								</View>
								:
								<ReanimatedSwipeable
									containerStyle={styles.noteContainer}
									childrenContainerStyle={{flex: 1}}
									friction={2}
									renderRightActions={(progress: SharedValue<number>, translation: SharedValue<number>, swipeableMethods: SwipeableMethods) => (
										<TranslatableButtonContainer
											note={item}
											progress={progress}
											translation={translation}
											swipeableMethods={swipeableMethods}
											style= {{flexDirection: 'row', alignItems: 'center'}}
										>
											<NoteButtons onEditPress={() => router.navigate(`/app/manga/${mangaId}/edit_note/${item.id}`)} onDeletePress={() => onDelete(item.id)} />
										</TranslatableButtonContainer>
									)}
									key={`NotePreview_Swipeable_${item.id}`}
								>
									<NotePreviewCard
										key={`NotePreview_${item.id}`}
										note={item} style={{flex: 1,margin: 5, flexDirection: 'row', right: 0}} onPress={()=> {setViewerNoteIndex(index); setIsViewingOverlay(true)}}
									/>
								</ReanimatedSwipeable>
						)}
					/>
					<Portal
						theme={theme}
					>
						<Modal visible={isViewingOverlay}
							theme={theme}
							contentContainerStyle={styles.noteModalContainer}
							onDismiss={() => {setIsViewingOverlay(false)}}
						>
							<ThemeCarousel
								data={filteredNotes}
								width={width}
								defaultIndex={viewerNoteIndex}
								carouselRenderItem={(item) =>
									(
										<NoteViewer
											note={item.item} mangaId={Array.isArray(mangaId) ? mangaId[0] : mangaId} mangaTitle={getMangaTitle(manga)}
											style={[styles.noteViewer, {backgroundColor: theme.colors.background}]}
											onDelete={() => onDelete(viewerNote.id)}
											onEdit={() => {router.navigate(`/app/manga/${mangaId}/edit_note/${viewerNote.id}`); setIsViewingOverlay(false)}}
											key={`NoteViewer_${viewerNote?.id}`}
										/>
									)
								}
							 />
						</Modal>
					</Portal>
					<View style={{height: 85}}/>
				</ScrollView>
			}
			<View style={styles.floatingContainer}>
				<View style={styles.searchBarContainer}>
					<ThemeSearchbar
						placeholder="search note"
						onChangeText={setSearchString}
						style={styles.searchBar}
						value={searchString}
					/>
					<IconButton
						icon={"plus"}
						size={30}
						onPress={() => router.navigate(`/app/manga/${mangaId}/add_note`)}
						style={styles.addButton}
						mode="contained"
					/>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	mangaHeader: { alignItems: 'center', height: 200, maxHeight: 200, width: '100%', justifyContent: 'center', flexDirection: 'row' },
	actionButton: {boxShadow: "0px 4px 5px rgba(0,0,0,0.3)"},
	noteContainer: { marginHorizontal: 5, flexDirection: 'row', alignItems: 'center', overflow: 'hidden'},
	noteModalContainer: { borderRadius: 10, width: '100%', height: '85%', maxHeight: 700, padding: 0},
	noteViewer: {
		borderRadius: 10,
		flex: 1, marginHorizontal: 30,
		boxShadow: "0px 4px 5px rgba(0,0,0,0.3)"
	},
	floatingContainer: {width: "100%", minWidth: 350, height: 60, position: "absolute", bottom: 25, flexDirection: "row", alignItems: "center", margin: 'auto', justifyContent: 'center', pointerEvents: 'none'},
	searchBarContainer: {width: '90%', flexDirection: 'row', maxWidth: 600, alignItems: 'center'},
	searchBar: {margin: 10, borderRadius: 10, flex: 1, boxShadow: "0px 4px 5px rgba(0,0,0,0.3)" },
	addButton: {boxShadow: "0px 4px 5px rgba(0,0,0,0.3)" }
});