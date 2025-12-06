import { IMangaNotes, INoteEntry } from "@/types/INotes";
import NotePreviewCard from "@/components/NotePreviewCard";
import NoteViewer from "@/components/NoteViewer";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState, useContext } from "react";
import { FlatList, Platform, ScrollView, StyleProp, useWindowDimensions, View, ViewStyle, StyleSheet } from "react-native";
import { IconButton, Modal, Portal, Searchbar, useTheme } from "react-native-paper";
import ReanimatedSwipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { SharedValue, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import Carousel, { ICarouselInstance, Pagination } from "react-native-reanimated-carousel";
import { AuthContext } from "@/context/AuthContext";
import { getMangaData, getMangaDetails } from "@/services/manga.service";
import { deleteMangaNote } from "@/services/notes.service";
import MangaOverViewHeader from "@/components/MangaOverViewHeader";
import { IMangaDetails } from "@/types/IManga";

function NoteButtons({ onDeletePress }: { onDeletePress?: () => void })
{
	return (
		<>
			<IconButton
				icon={"pencil-outline"}
				size={20}
				onPress={() => {}}
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
	const { mangaId } = useLocalSearchParams(); // <-- get from URL
	const [manga, setManga] = useState<IMangaDetails>();
	const [data, setData] = useState<IMangaNotes>([]);
	const [filteredNotes, setFilteredNotes] = useState<IMangaNotes>([]);
	const [searchString, setSearchString] = useState<string>("");
	const [isViewingOverlay, setIsViewingOverlay] = useState<boolean>(false);
	const [viewerNote, setViewerNote] = useState<INoteEntry>({id: "", text: "", images: [], startChapter: -1, endChapter: -1, createdAt: "", modifiedAt: "", fromAnilist: false});
	const [viewerNoteIndex, setViewerNoteIndex] = useState<number>(0);
	const progress = useSharedValue<number>(0);
	const carouselRef = useRef<ICarouselInstance>(null)
	const anilist_token: string = useContext(AuthContext).anilistToken || ""

	const populateMangaData = useCallback(async () => 
	{
		const manga = await getMangaDetails(mangaId.toString());
		setManga(manga);
	}, [mangaId]);

	useEffect(() => 
	{
		populateMangaData();
	}, [populateMangaData]);

	const fetchData = useCallback(async () => 
	{
		const DATA = await getMangaData(mangaId.toString(), anilist_token);
		setData(DATA);
	}, [mangaId, anilist_token]);

	useEffect(() => 
	{
		fetchData();
	}, [fetchData]);

	useFocusEffect(
		useCallback(() => 
		{
			fetchData()
			return () => {};
		}, [fetchData])
	)

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

	const onPressPagination = (index: number) => 
	{
		carouselRef.current?.scrollTo({
			/**
			 * Calculate the difference between the current index and the target index
			 * to ensure that the carousel scrolls to the nearest index
			 */
			count: index - progress.value,
			animated: true,
		});
	};

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
			<ScrollView nestedScrollEnabled={true}>
				<MangaOverViewHeader manga={manga} style={styles.mangaHeader} />
				<FlatList
					data={filteredNotes}
					keyExtractor={(item) => `NotePreview_${item.id}`}
					key={`filteredNotes_${Date.now()}`}
					numColumns={1}
					contentContainerStyle={{flexGrow: 0}}
					scrollEnabled={false}
					renderItem={({ item, index }: { item: INoteEntry, index: any }) => (
						Platform.OS === 'web'
							?
							<View style={{flex:1, flexDirection: 'row', alignItems: 'center'}}>
								<NotePreviewCard note={item} style={{ flex: 1, margin: 5}} onPress={()=> {setViewerNoteIndex(index); setIsViewingOverlay(true)}} />
								<NoteButtons onDeletePress={() => onDelete(item.id)} />
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
										<NoteButtons onDeletePress={() => onDelete(item.id)} />
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
						<Carousel
							ref={carouselRef}
							autoPlayInterval={2000}
							data={filteredNotes}
							pagingEnabled={true}
							snapEnabled={true}
							width={width}
							loop={false}
							style={styles.carousel}
							containerStyle={styles.carousel}
							mode="parallax"
							modeConfig={{
								parallaxScrollingScale: 1,
								parallaxScrollingOffset: 40,
							}}
							onProgressChange={progress}
							defaultIndex={viewerNoteIndex}
							renderItem={(item) =>
								(
									<NoteViewer
										note={item.item} mangaId={Array.isArray(mangaId) ? mangaId[0] : mangaId} mangaTitle={manga?.title.userPreferred}
										style={[styles.noteViewer, {backgroundColor: theme.colors.background}]}
										onDelete={() => onDelete(viewerNote.id)}
										key={`NoteViewer_${viewerNote?.id}`}
									/>
								)
							}
						/>
						<Pagination.Basic
							progress={progress}
							data={data}
							dotStyle={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 50 }}
							containerStyle={{ gap: 5, marginTop: 10 }}
							onPress={onPressPagination}
						/>
					</Modal>
				</Portal>
				<View style={{height: 85}}/>
			</ScrollView>
			<View style={styles.floatingContainer}>
				<View style={styles.searchBarContainer}>
					<Searchbar
						placeholder="search note"
						onChangeText={setSearchString}
						style={styles.searchBar}
						value={searchString}
					/>
					<IconButton
						icon={"plus"}
						size={30}
						onPress={() => router.navigate(`/manga/${mangaId}/add_note`)}
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
	actionButton: {shadowOpacity: 0.3, shadowRadius: 5, shadowColor: "black", shadowOffset: {width: 0, height: 4} },
	noteContainer: { marginHorizontal: 5, flexDirection: 'row', alignItems: 'center', overflow: 'hidden'},
	noteModalContainer: { borderRadius: 10, width: '100%', height: '85%', maxHeight: 700, shadowOpacity: 0, padding: 0},
	carousel: {
		flex:1,
		margin: 0,
		padding: 0
	},
	noteViewer: {
		shadowOpacity: 0.3, shadowRadius: 5, borderRadius: 10,
		flex: 1, marginHorizontal: 30,
	},
	floatingContainer: {width: "100%", minWidth: 350, height: 60, position: "absolute", bottom: 25, flexDirection: "row", alignItems: "center", margin: 'auto', justifyContent: 'center'},
	searchBarContainer: {width: '90%', flexDirection: 'row', maxWidth: 600, alignItems: 'center'},
	searchBar: {margin: 10, borderRadius: 10, flex: 1, shadowOpacity: 0.3, shadowRadius: 5, shadowColor: "black", shadowOffset: {width: 0, height: 4} },
	addButton: {shadowOpacity: 0.3, shadowRadius: 5, shadowColor: "black", shadowOffset: {width: 0, height: 4} }
});