import AdvancedSearchModal from "@/components/AdvancedSearchModal";
import { LoadingScreen } from "@/components/LoadingScreen";
import MangaCard from "@/components/MangaCard";
import NewCustomListView from "@/components/NewCustomListView";
import ThemeSearchbar from "@/components/ThemeSearchbar";
import ThemeText from "@/components/ThemeText";
import { formatData } from "@/components/util";
import { AuthContext } from "@/context/AuthContext";
import { getCustomLists } from "@/services/custom_lists";
import { addMangaToLibrary, getLibraryMangaThumbnails, getMyListMangaIds, MangaProps, searchMangaByString } from "@/services/manga.service";
import { ICustomLists } from "@/types/ICustomList";
import { getMangaTitle } from "@/types/IManga";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { IconButton, Modal, Portal, useTheme } from "react-native-paper";

export default function Index() 
{
	const router = useRouter();
	const theme = useTheme()
	const pageRef = useRef<View>(null);
	const [mangaList, setMangaList] = useState<MangaProps[]>([]);
	const [mangaIdToAdd, setMangaIdToAdd] = useState<number | undefined>(undefined);
	const [filteredMangaList, setFilteredMangaList] = useState<MangaProps[]>([]);
	const [isSearching, setSearching] = useState(false)
	const [isCreatingNewList, setCreatingNewList] = useState(false)
	const [searchString, setSearchString] = useState("")
	const [isAdvancedSearching, setIsAdvancedSearching] = useState(false)
	const [newMangaList, setNewMangaList] = useState<MangaProps[]>([]);
	const [newSearchString, setNewSearchString] = useState("")
	const [allCustomLists, setAllCustomLists] = useState<ICustomLists>([])
	const [loading, setLoading] = useState<boolean>(true)
	const { width } = useWindowDimensions();
	const anilist_token: string = useContext(AuthContext).anilistToken || ""
	const listColNum = Math.max(Math.ceil(width/250), 1)

	const populateMangaList = useCallback(async () => 
	{
		const mangaIdsResult = await getMyListMangaIds()
		let libStringMangaIds: string[] = mangaIdsResult.success ? mangaIdsResult.data : []
		const libMangaIds: number[] = libStringMangaIds.map((value) => Number(value))
		const mangaListResult = await getLibraryMangaThumbnails(libMangaIds);
		setMangaList(mangaListResult.success ? mangaListResult.data : []);
		return setLoading(false);
	}, [anilist_token]);

	const populateNewMangaList = useCallback(async () => 
	{
		const searchListResult = await searchMangaByString(newSearchString);
		setNewMangaList(searchListResult.success ? searchListResult.data : []);
	}, [newSearchString]);

	const popupCreateNewListWindow = useCallback(async (mangaIdToAdd?: number) => 
	{
		setMangaIdToAdd(mangaIdToAdd);
		setCreatingNewList(true)
	}, [newSearchString]);

	const populateCustomLists = useCallback(async () => 
	{
		const listResponse = await getCustomLists()
		setAllCustomLists(listResponse.success ? listResponse.data : []);
	}, []);
	
	useEffect(() => 
	{
		populateCustomLists()
	}, [])

	useEffect(() => 
	{
		populateMangaList()
	}, [isSearching, populateMangaList]);

	useEffect(() => 
	{
		setFilteredMangaList(mangaList.filter((manga) => getMangaTitle(manga).toLowerCase().includes(searchString.toLowerCase())))
	}, [mangaList, searchString]);

	return (
		<>
			<Stack.Screen
				options={{
					title: "Library"
				}}
			/>
			<View ref={pageRef} style={{flex: 1}}>
				{
					loading ?
						<LoadingScreen />
						:
						<FlatList
							data={formatData(filteredMangaList, listColNum)}
							keyExtractor={(item) => item.id}
							key={`filteredMangaList_${listColNum}`}
							numColumns={listColNum}
							style={{flex: 1}}
							renderItem={({ item }) => (
								item?.id ?
									<MangaCard item={item} style={{ flex:1, padding: 10 }} allCustomLists={allCustomLists} onCreateList={popupCreateNewListWindow}/>
									: <View style={{ flex: 1, margin: 5 }} />
							)}
						/>
				}
				<AdvancedSearchModal 
					visible={isAdvancedSearching} 
					onDismiss={() => 
					{
						setIsAdvancedSearching(false);
						setSearchString('');
					}} 
					onMangaAdded={async () => 
					{
						await populateMangaList()
					}}
				/>
			</View>
			<Portal>
				<Modal visible={isSearching} onDismiss={() => setSearching(false)}
					contentContainerStyle={[styles.addMangaModalContainer, { backgroundColor: theme.colors.background }]}>
					<ThemeSearchbar
						placeholder="search manga"
						onChangeText={setNewSearchString}
						onSubmitEditing={() => { populateNewMangaList(); }}
						style={styles.addMangaModalSearchBar}
						value={newSearchString}
					/>
					<FlatList
						data={newMangaList}
						keyExtractor={(item) => item.id}
						key={`newMangaList_${Date.now()}`}
						numColumns={1}
						style={{flex: 1}}
						renderItem={({ item }) => (
							<Pressable style={styles.addMangaContainer} onPress={() => { setSearching(false); router.navigate(`/app/manga/${item.id}`) }}>
								<Image
									source={{ uri: item.coverImage?.large }}
									resizeMode="contain"
									style={{height: "100%", aspectRatio: 0.8}}
								/>
								<ThemeText variant="titleMedium" style={styles.addMangaTitle}>{getMangaTitle(item)}</ThemeText>
								<IconButton
									icon={"plus"}
									mode="contained"
									iconColor={mangaList.find((elem) => elem.id === item.id) ? theme.colors.surfaceVariant : theme.colors.primary}
									containerColor={mangaList.find((elem) => elem.id === item.id) ? theme.colors.inverseOnSurface : theme.colors.surfaceVariant}
									onPress={async () => 
									{
										await addMangaToLibrary(item.id);
										populateMangaList();
										setSearching(false);
									}}
								/>
							</Pressable>
						)}
					/>
				</Modal>
				<Modal visible={isCreatingNewList} onDismiss={() => setCreatingNewList(false)}
					contentContainerStyle={{minWidth: 200, minHeight: 200, width: "30%", height: "50%", backgroundColor: theme.colors.background, borderRadius: 10, margin: 'auto', padding: 10, gap: 5}}>
					<NewCustomListView mangaIdToAdd={mangaIdToAdd} setAllCustomLists={setAllCustomLists} onCustomListCreated={async () => setCreatingNewList(false)} />
				</Modal>
			</Portal>
		</>
	);
}

const styles = StyleSheet.create({
	searchBarContainer: { width: '90%', maxWidth: 600, flex: 1, flexDirection: 'column' },
	addNoteIconButton: {boxShadow: "0px 4px 5px rgba(0,0,0,0.3)" },
	addMangaModalContainer: {
		padding: 0, margin: 'auto', width: "90%", height: "80%", borderRadius: 10
	},
	addMangaModalSearchBar: {margin: 10, borderRadius: 10},
	addMangaContainer: { height: 150, width: "100%", flexDirection: "row", alignItems: "center", padding: 5 },
	addMangaTitle: {flex: 1}
});