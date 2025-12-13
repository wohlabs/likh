import ThemeText from "@/components/ThemeText";
import { formatData } from "@/components/util";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState, useContext, useCallback } from "react";
import { FlatList, Image, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { IconButton, Modal, Portal, Searchbar, useTheme } from "react-native-paper";
import { AuthContext } from "@/context/AuthContext";
import { addMangaToLibrary, getLibraryMangaThumbnails, getMangaIdsWithNotes, getMyListMangaIds, MangaProps, searchMangaByString } from "@/services/manga.service";
import { getMangaTitle } from "@/types/IManga";

export default function Index() 
{
	const router = useRouter();
	const theme = useTheme()
	const [mangaList, setMangaList] = useState<MangaProps[]>([]);
	const [filteredMangaList, setFilteredMangaList] = useState<MangaProps[]>([]);
	const [isSearching, setSearching] = useState(false)
	const [searchString, setSearchString] = useState("")
	const [newMangaList, setNewMangaList] = useState<MangaProps[]>([]);
	const [newSearchString, setNewSearchString] = useState("")
	const { width } = useWindowDimensions();
	const anilist_token: string = useContext(AuthContext).anilistToken || ""
	const listColNum = Math.min(Math.max(Math.ceil(width/200), 1), 5)

	const populateMangaList = useCallback(async () => 
	{
		if (anilist_token === undefined || anilist_token === "undefined" || anilist_token === '') 
		{
			setMangaList([]);
			return;
		}
		const anilistMangaIds: string[] = await getMangaIdsWithNotes(anilist_token)

		const mangaIdsResult = await getMyListMangaIds(anilist_token)
		let libraryMangaIds: string[] = mangaIdsResult.success ? mangaIdsResult.data : []
		const mangaListResult = await getLibraryMangaThumbnails(Array.from(new Set<string>([...libraryMangaIds, ...anilistMangaIds])));
		setMangaList(mangaListResult.success ? mangaListResult.data : []);
	}, [anilist_token]);

	const populateNewMangaList = useCallback(async () => 
	{
		const searchListResult = await searchMangaByString(newSearchString);
		setNewMangaList(searchListResult.success ? searchListResult.data : []);
	}, [newSearchString]);

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
					title: "Library",
					headerTitleAlign: "center"
				}}
			/>
			<View style={{flex: 1}}>
				<FlatList
					data={formatData(filteredMangaList, Math.min(5, listColNum))}
					keyExtractor={(item) => item.id}
					key={`filteredMangaList_${Date.now()}`}
					numColumns={Math.min(5, listColNum)}
					style={{flex: 1}}
					renderItem={({ item }) => (
						item?.id ?
							<Pressable style={{ flex:1 }} onPress={() => { router.navigate(`/app/manga/${item.id}`) }}>
								<Image
									source={{ uri: item.coverImage?.large }}
									resizeMode="contain"
									style={styles.mangaCoverImage}
								/>
								<ThemeText style={styles.mangaTitle}>{getMangaTitle(item)}</ThemeText>
							</Pressable>
							: <View style={{ flex: 1, margin: 5 }} />
					)}
				/>
				<View style={styles.searchBarFloating}>
					<View style={styles.searchBarContainer}>
						<Searchbar
							placeholder="search library"
							onChangeText={setSearchString}
							onSubmitEditing={() => { populateNewMangaList(); }}
							style={styles.searchBar}
							value={searchString}
						/>
						<IconButton
							icon={"plus"}
							size={30}
							onPress={() => { setSearching(!isSearching); populateNewMangaList(); }}
							style={styles.addNoteIconButton}
							mode="contained"
						/>
					</View>
				</View>
			</View>
			<Portal>
				<Modal visible={isSearching} onDismiss={() => setSearching(false)}
					contentContainerStyle={[styles.addMangaModalContainer, { backgroundColor: theme.colors.background }]}>
					<Searchbar
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
								<ThemeText style={styles.addMangaTitle}>{getMangaTitle(item)}</ThemeText>
								<IconButton
									icon={"plus"}
									mode="contained"
									iconColor={mangaList.find((elem) => elem.id === item.id) ? theme.colors.surfaceVariant : theme.colors.primary}
									containerColor={mangaList.find((elem) => elem.id === item.id) ? theme.colors.inverseOnSurface : theme.colors.surfaceVariant}
									onPress={async () => {
										await addMangaToLibrary(item.id);
										populateMangaList();
										setSearching(false);
									}}
								/>
							</Pressable>
						)}
					/>
				</Modal>
			</Portal>
		</>
	);
}

const styles = StyleSheet.create({
	mangaTitle: {textAlign: 'center'},
	mangaCoverImage: { width: '100%', aspectRatio: '0.8'},
	searchBarFloating: {
		width: "100%", minWidth: 350, height: 60, position: "absolute", bottom: 25, flexDirection: "row", alignItems: "center", margin: 'auto', justifyContent: 'center'
	},
	searchBarContainer: { width: '90%', maxWidth: 600, flexDirection: 'row', alignItems: 'center' },
	searchBar: {margin: 10, borderRadius: 10, flex: 1, boxShadow: "0px 4px 5px rgba(0,0,0,0.3)" },
	addNoteIconButton: {boxShadow: "0px 4px 5px rgba(0,0,0,0.3)" },
	addMangaModalContainer: {
		padding: 0, margin: 'auto', width: "90%", height: "80%", borderRadius: 10
	},
	addMangaModalSearchBar: {margin: 10, borderRadius: 10},
	addMangaContainer: { height: 150, width: "100%", flexDirection: "row", alignItems: "center", padding: 5 },
	addMangaTitle: {textAlign: "left", fontSize: 20, flex: 1}
});