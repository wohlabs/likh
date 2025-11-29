import api from "@/api/AxiosInstance";
import { IMangaNotes, INoteEntry } from "@/types/INotes";
import NotePreviewCard from "@/components/NotePreviewCard";
import NoteViewer from "@/components/NoteViewer";
import ThemeText from "@/components/ThemeText";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState, useContext } from "react";
import { FlatList, Image, Platform, ScrollView, StyleProp, useWindowDimensions, View, ViewStyle } from "react-native";
import { IconButton, Modal, Portal, Searchbar, useTheme } from "react-native-paper";
import ReanimatedSwipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { SharedValue, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import Carousel, { ICarouselInstance, Pagination } from "react-native-reanimated-carousel";
import { AuthContext } from "@/context/AuthContext";
import { IMangaDetails } from "@/types/IManga";
import { getMangaData, getMangaDetails } from "@/services/manga.service";

function NoteButtons({style, translation, onDeletePress}: { note: INoteEntry, style?: StyleProp<ViewStyle>, progress: SharedValue<number>, translation: SharedValue<number>, swipeableMethods: SwipeableMethods, onDeletePress?: () => void})
{
	const swipeLeftAnimation = useAnimatedStyle(() => {
		return {
			transform: [{ translateX: translation.value + 140 }],
		};
	});


	return (
		<Reanimated.View style={[style, swipeLeftAnimation]}>
			<IconButton
				icon={"pencil-outline"}
				size={20}
				onPress={() => {}}
				style={{shadowOpacity: 0.3, shadowRadius: 5, shadowColor: "black", shadowOffset: {width: 0, height: 4} }}
				mode="contained"
			/>
			<IconButton
				icon={"share-outline"}
				size={20}
				onPress={() => {}}
				style={{shadowOpacity: 0.3, shadowRadius: 5, shadowColor: "black", shadowOffset: {width: 0, height: 4} }}
				mode="contained"
			/>
			<IconButton
				icon={"trash-can-outline"}
				size={20}
				onPress={onDeletePress}
				style={{shadowOpacity: 0.3, shadowRadius: 5, shadowColor: "black", shadowOffset: {width: 0, height: 4} }}
				mode="contained"
			/>
		</Reanimated.View>
	)
}

export default function MangaDetails() {
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
	const anilist_token: string = useContext(AuthContext).anilistToken

	const populateMangaData = useCallback(async () => {
		const manga = await getMangaDetails(mangaId.toString());
		setManga(manga);
	}, [mangaId]);

	useEffect(() => {
		populateMangaData();
	}, [populateMangaData]);

	const fetchData = useCallback(async () => {
		const DATA = await getMangaData(mangaId.toString(), anilist_token);
		setData(DATA);
	}, [mangaId, anilist_token]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	useFocusEffect(
		useCallback(() => {
			fetchData()
			return () => {};
		}, [fetchData])
	)

	const onDelete = async (noteId: string) => {
		await api.delete(`/notes/${noteId}`)
		setIsViewingOverlay(false);
		fetchData();
	}

	const onPressPagination = (index: number) => {
		carouselRef.current?.scrollTo({
			/**
			 * Calculate the difference between the current index and the target index
			 * to ensure that the carousel scrolls to the nearest index
			 */
			count: index - progress.value,
			animated: true,
		});
	};

	useEffect(() => {

		setFilteredNotes(searchString.trim().length === 0 ? data : data.filter((note: INoteEntry) => (note.text && note.text.toLowerCase().includes(searchString.toLowerCase()))));
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
					keyExtractor={(item) => `NotePreview_${item.id}`}
					key={`filteredNotes_${Date.now()}`}
					numColumns={1}
					contentContainerStyle={{flexGrow: 0}}
					scrollEnabled={false}
					renderItem={({ item, index }: { item: INoteEntry, index: any }) => (
							Platform.OS === 'web'
							?
							<View style={{flex:1, flexDirection: 'row', alignItems: 'center'}}>
								<NotePreviewCard note={item} style={{ flex: 1, margin: 5}} onPress={()=> {setViewerNoteIndex(index); setIsViewingOverlay(true)}}/>
								<IconButton
									icon={"pencil-outline"}
									size={20}
									onPress={() => {}}
									style={{shadowOpacity: 0.3, shadowRadius: 5, shadowColor: "black", shadowOffset: {width: 0, height: 4} }}
									mode="contained"
								/>
								<IconButton
									icon={"share-outline"}
									size={20}
									onPress={() => {}}
									style={{shadowOpacity: 0.3, shadowRadius: 5, shadowColor: "black", shadowOffset: {width: 0, height: 4} }}
									mode="contained"
								/>
								<IconButton
									icon={"trash-can-outline"}
									size={20}
									onPress={() => onDelete(item.id)}
									style={{shadowOpacity: 0.3, shadowRadius: 5, shadowColor: "black", shadowOffset: {width: 0, height: 4} }}
									mode="contained"
								/>
							</View>
							:
							<ReanimatedSwipeable
								containerStyle={{ marginHorizontal: 5, flexDirection: 'row', alignItems: 'center', overflow: 'hidden'}}
								childrenContainerStyle={{flex: 1}}
								friction={2}
								renderRightActions={(progress: SharedValue<number>, translation: SharedValue<number>, swipeableMethods: SwipeableMethods) => (
									<NoteButtons
										note={item}
										progress={progress}
										translation={translation}
										swipeableMethods={swipeableMethods}
										style= {{flexDirection: 'row', alignItems: 'center'}}
										onDeletePress={() => onDelete(item.id)}
									/>
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
						contentContainerStyle={{ borderRadius: 10, width: '100%', height: '85%', maxHeight: 700, shadowOpacity: 0, padding: 0}}
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
							style={{
								flex:1,
								margin: 0,
								padding: 0
							}}
							containerStyle={{
								flex:1,
								margin: 0,
								padding: 0
							}}
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
										style={{
											shadowOpacity: 0.3, shadowRadius: 5, borderRadius: 10,
											backgroundColor: theme.colors.background,
											flex: 1, marginHorizontal: 30,
										}}
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