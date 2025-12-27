import ThemeText from "@/components/ThemeText";
import { formatData } from "@/components/util";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState, useContext, useCallback } from "react";
import { FlatList, Image, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { Button, IconButton, Modal, Portal, Searchbar, useTheme } from "react-native-paper";
import { BlurView } from "expo-blur";
import { AuthContext } from "@/context/AuthContext";
import { addMangaToLibrary, getLibraryMangaThumbnails, getMangaIdsWithNotes, getMyListMangaIds, MangaProps, searchMangaByString } from "@/services/manga.service";
import { getMangaTitle } from "@/types/IManga";
import ThemeSearchbar from "@/components/ThemeSearchbar";
import { LoadingScreen } from "@/components/LoadingScreen";
import { LinearGradient } from 'expo-linear-gradient'
import { modernDarkTheme } from "@/theme/modernTheme";

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
	const [loading, setLoading] = useState<boolean>(true)
	const { width } = useWindowDimensions();
	const anilist_token: string = useContext(AuthContext).anilistToken || ""
	const listColNum = Math.max(Math.ceil(width/250), 1)

	const populateMangaList = useCallback(async () => 
	{
		if (anilist_token === undefined || anilist_token === "undefined" || anilist_token === '') 
		{
			setMangaList([]);
			return setLoading(false);
		}
		const anilistMangaIds: string[] = await getMangaIdsWithNotes(anilist_token)

		const mangaIdsResult = await getMyListMangaIds(anilist_token)
		let libStringMangaIds: string[] = mangaIdsResult.success ? mangaIdsResult.data : []
		const libMangaIds: number[] = [...libStringMangaIds, ...anilistMangaIds].map((value) => Number(value))
		const mangaListResult = await getLibraryMangaThumbnails(Array.from(new Set<number>(libMangaIds)));
		setMangaList(mangaListResult.success ? mangaListResult.data : []);
		return setLoading(false);
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
								<View style={{ flex:1, padding: 10,
								 }}>
									<Pressable 
										style={[styles.mangaCardContainer, {
											shadowColor: "#000",
											shadowOffset: { width: 0, height: 4 },
											shadowOpacity: 0.08,
											shadowRadius: 12,
											elevation: 2,
											// borderColor: "white",
											// borderWidth: 1,
											// borderRadius: 10
											boxShadow: `0 0 5px 1px ${theme.colors.backdrop}`
										}]}
										onPress={() => { router.navigate(`/app/manga/${item.id}`) }}
									>
										<Image
											source={{ uri: item.coverImage?.large }}
											resizeMode="cover"
											style={styles.mangaCoverImage}
										/>
									{/* Gradient mask */}
									<LinearGradient
										colors={["transparent", modernDarkTheme.colors.background]}
										locations={[0.6, 1]}
										style={StyleSheet.absoluteFill}
										pointerEvents="none"
									/>
									<View style={styles.bottomContent}>
										<View style={styles.textContainer}>
											<ThemeText variant="titleMedium" style={[styles.mangaTitle, {color: modernDarkTheme.colors.onBackground}]} numberOfLines={2}>{getMangaTitle(item)}</ThemeText>
										</View>
									</View>
									<View style={{position: "absolute", top: 0, width: "100%", flexDirection: "row-reverse"}}>
										<IconButton size={15} icon={"dots-horizontal"} mode="contained"
											onPress={() => {}}
										/>
										<IconButton size={15} icon={"heart-outline"} mode="contained"
											onPress={() => {}}
										/>
									</View>
									</Pressable>
								</View>
								: <View style={{ flex: 1, margin: 5 }} />
						)}
					/>
				}
				<View style={styles.searchBarFloating}>
					<View style={styles.searchBarContainer}>
						<ThemeSearchbar
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
	mangaTitle: {textAlign: 'left', margin: 5},
	mangaCoverImage: { width: '100%', aspectRatio: '0.8', overflow: 'hidden', borderRadius: 10 },
	mangaCardContainer: { width: '100%', aspectRatio: '0.8', borderRadius: 10, overflow: 'hidden', position: 'relative' },
	bottomContent: {
		flex: 1,
		justifyContent: 'space-between',
		alignItems: 'center',
		// padding: 10,
		position: "absolute",
		bottom: 0,
		width: "100%",
		borderTopLeftRadius: 5,
		borderTopRightRadius: 5
	},
	textContainer: {
		flex: 1,
		width: '100%',
		textAlign: 'left'
	},
	searchBarFloating: {
		width: "100%", minWidth: 350, height: 60, position: "absolute", bottom: 25, flexDirection: "row", alignItems: "center", margin: 'auto', justifyContent: 'center', pointerEvents: 'none'
	},
	searchBarContainer: { width: '90%', maxWidth: 600, flexDirection: 'row', alignItems: 'center' },
	searchBar: {margin: 10, borderRadius: 10, flex: 1, boxShadow: "0px 4px 5px rgba(0,0,0,0.3)" },
	addNoteIconButton: {boxShadow: "0px 4px 5px rgba(0,0,0,0.3)" },
	addMangaModalContainer: {
		padding: 0, margin: 'auto', width: "90%", height: "80%", borderRadius: 10
	},
	addMangaModalSearchBar: {margin: 10, borderRadius: 10},
	addMangaContainer: { height: 150, width: "100%", flexDirection: "row", alignItems: "center", padding: 5 },
	addMangaTitle: {flex: 1}
});