import AdvancedSearchModal from "@/components/AdvancedSearchModal";
import { LoadingScreen } from "@/components/LoadingScreen";
import MangaCard from "@/components/MangaCard";
import NewCustomListView from "@/components/NewCustomListView";
import { formatData } from "@/components/util";
import { usePersistentTheme } from "@/context/usePersistentTheme";
import { getCustomLists } from "@/services/custom_lists";
import { getLibraryMangaThumbnails, getMyListMangaIds, MangaProps } from "@/services/manga.service";
import { ICustomLists } from "@/types/ICustomList";
import { getMangaTitle } from "@/types/IManga";
import { Stack } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, useWindowDimensions, View } from "react-native";
import { Modal, Portal } from "react-native-paper";

export default function Index() 
{
	const {theme} = usePersistentTheme()
	const pageRef = useRef<View>(null);
	const [mangaList, setMangaList] = useState<MangaProps[]>([]);
	const [mangaIdToAdd, setMangaIdToAdd] = useState<number | undefined>(undefined);
	const [filteredMangaList, setFilteredMangaList] = useState<MangaProps[]>([]);
	const [isCreatingNewList, setCreatingNewList] = useState(false)
	const [searchString, setSearchString] = useState("")
	const [isAdvancedSearching, setIsAdvancedSearching] = useState(false)
	const [allCustomLists, setAllCustomLists] = useState<ICustomLists>([])
	const [loading, setLoading] = useState<boolean>(true)
	const { width } = useWindowDimensions();
	const listColNum = Math.max(Math.ceil(width/250), 1)

	const populateMangaList = useCallback(async () => 
	{
		const mangaIdsResult = await getMyListMangaIds()
		let libStringMangaIds: string[] = mangaIdsResult.success ? mangaIdsResult.data : []
		const libMangaIds: number[] = libStringMangaIds.map((value) => Number(value))
		const mangaListResult = await getLibraryMangaThumbnails(libMangaIds);
		setMangaList(mangaListResult.success ? mangaListResult.data : []);
		return setLoading(false);
	}, []);

	const popupCreateNewListWindow = useCallback(async (mangaIdToAdd?: number) => 
	{
		setMangaIdToAdd(mangaIdToAdd);
		setCreatingNewList(true)
	}, []);

	const populateCustomLists = useCallback(async () => 
	{
		const listResponse = await getCustomLists()
		setAllCustomLists(listResponse.success ? listResponse.data : []);
	}, []);
	
	useEffect(() => 
	{
		populateCustomLists()
	}, [populateCustomLists])

	useEffect(() => 
	{
		populateMangaList()
	}, [populateMangaList]);

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
			<View ref={pageRef} className="bg-background flex-1">
				{
					loading ?
						<LoadingScreen />
						:
						<FlatList
							data={formatData(filteredMangaList, listColNum)}
							keyExtractor={(item) => item.id}
							key={`filteredMangaList_${listColNum}`}
							numColumns={listColNum}
							style={{flex: 1, paddingBottom: 80}}
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
				<Modal visible={isCreatingNewList} onDismiss={() => setCreatingNewList(false)}
					contentContainerStyle={{minWidth: 200, minHeight: 200, width: "30%", height: "50%", backgroundColor: theme['--color-background'], borderRadius: 10, margin: 'auto', padding: 10, gap: 5}}>
					<NewCustomListView mangaIdToAdd={mangaIdToAdd} setAllCustomLists={setAllCustomLists} onCustomListCreated={async () => setCreatingNewList(false)} onCanceled={() => setCreatingNewList(false)} />
				</Modal>
			</Portal>
		</>
	);
}