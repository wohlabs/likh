import api from "@/api/AxiosInstance";
import ThemeText from "@/components/ThemeText";
import { formatData } from "@/components/util";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState, useContext, useCallback } from "react";
import { FlatList, Image, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { IconButton, Modal, Portal, Searchbar, useTheme } from "react-native-paper";
import { AuthContext } from "@/context/AuthContext";
import { addMangaToLibrary, getMangaIdsWithNotes, MANGA_SEARCH_QUERY } from "@/services/manga.service";

const MANGA_QUERY = `
	query {
		Page(page: 1, perPage: 10) {
			media(type: MANGA, sort: TRENDING_DESC) {
				id
				title {
					userPreferred
				}
				coverImage {
					large
				}
			}
		}
	}
`;

const LIBRARY_MANGA_QUERY = `
	query ($ids: [Int]){
		Page(page: 1, perPage: 50) {
			media(id_in: $ids, type: MANGA, sort: TRENDING_DESC) {
				id
				title {
					userPreferred
				}
				coverImage {
					large
				}
			}
		}
	}
`

type MangaProps = {
	id: string;
	title: {
		userPreferred: string;
	}
	coverImage: {
		large: string;
		medium: string
	}
};

export default function Index() 
{
	const router = useRouter();
	const theme = useTheme()
	const [mangaList, setMangaList] = useState<MangaProps[]>([]);
	const [filteredMangaList, setFilteredMangaList] = useState<MangaProps[]>([]);
	const [, setLoading] = useState(true);
	const [isSearching, setSearching] = useState(false)
	const [searchString, setSearchString] = useState("")
	const [newMangaList, setNewMangaList] = useState<MangaProps[]>([]);
	const [newSearchString, setNewSearchString] = useState("")
	const { width } = useWindowDimensions();
	const anilist_token: string = useContext(AuthContext).anilistToken
	const listColNum = Math.min(Math.max(Math.ceil(width/200), 1), 5)

	const populateMangaList = useCallback(async () => 
	{
		if (anilist_token === undefined || anilist_token === "undefined" || anilist_token === '') 
		{
			setMangaList([]);
			setLoading(false);
			return;
		}
		const anilistMangaIds: string[] = await getMangaIdsWithNotes(anilist_token)
		let libraryMangaIds: string[] = []
		try 
		{
			const response = await api.get(`/users/me/manga`)
			libraryMangaIds = response.data
		}
		catch 
		{
			console.error("Could not fetch mangaIds")
		}
		let query = {
			query: LIBRARY_MANGA_QUERY,
			variables: {ids: Array.from(new Set<string>([...libraryMangaIds, ...anilistMangaIds]))}
		}
		fetch("https://graphql.anilist.co", {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			body: JSON.stringify(query)
		})
			.then((response) => response.json())
			.then((response) => response.data)
			.then((data) =>
			{
				if (data && data.Page && data.Page.media)
				{
					setMangaList(data.Page.media);
				}
				else
				{
					setMangaList([]);
				}
				setLoading(false);
			})
			.catch((error) => 
			{
				console.error(error);
				setLoading(false);
			});
	}, [anilist_token]);

	const populateNewMangaList = useCallback(async () => 
	{
		let query = {
			query: newSearchString.length > 0 ? MANGA_SEARCH_QUERY : MANGA_QUERY,
			variables: {search: newSearchString}
		}
		fetch("https://graphql.anilist.co", {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			body: JSON.stringify(query)
		})
			.then((response) => response.json())
			.then((response) => response.data)
			.then((data) => 
			{
				if (data && data.Page && data.Page.media)
				{
					setNewMangaList(data.Page.media);
				}
				else
				{
					setNewMangaList([]);
				}
			})
			.catch((error) => 
			{
				console.error(error);
			});
	}, [newSearchString]);

	useEffect(() => 
	{
		populateMangaList()
	}, [isSearching, populateMangaList]);

	useEffect(() => 
	{
		setFilteredMangaList(mangaList.filter((manga) => manga.title?.userPreferred?.toLowerCase().includes(searchString.toLowerCase())))
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
							<Pressable style={{ flex:1 }} onPress={() => { router.navigate(`/manga/${item.id}`) }}>
								<Image
									source={{ uri: item.coverImage?.large }}
									resizeMode="contain"
									style={styles.mangaCoverImage}
								/>
								<ThemeText style={styles.mangaTitle}>{item.title?.userPreferred}</ThemeText>
							</Pressable>
							: <View style={{ flex: 1, margin: 5 }} />
					)}
				/>
				<View style={{width: "100%", minWidth: 350, height: 60, position: "absolute", bottom: 25, flexDirection: "row", alignItems: "center", margin: 'auto', justifyContent: 'center'}}>
					<View style={{width: '90%', maxWidth: 600, flexDirection: 'row', alignItems: 'center'}}>
						<Searchbar
							placeholder="search library"
							onChangeText={setSearchString}
							onSubmitEditing={() => { populateNewMangaList(); }}
							style={{margin: 10, borderRadius: 10, flex: 1, shadowOpacity: 0.3, shadowRadius: 5, shadowColor: "black", shadowOffset: {width: 0, height: 4} }}
							value={searchString}
						/>
						<IconButton
							icon={"plus"}
							size={30}
							onPress={() => { setSearching(!isSearching); populateNewMangaList(); }}
							style={{shadowOpacity: 0.3, shadowRadius: 5, shadowColor: "black", shadowOffset: {width: 0, height: 4} }}
							mode="contained"
						/>
					</View>
				</View>
			</View>
			<Portal>
				<Modal visible={isSearching} onDismiss={() => setSearching(false)}
					contentContainerStyle={{
						padding: 0, margin: 'auto', width: "90%", height: "80%", borderRadius: 10,
						backgroundColor: theme.colors.background
					}}>
					<Searchbar
						placeholder="search manga"
						onChangeText={setNewSearchString}
						onSubmitEditing={() => { populateNewMangaList(); }}
						style={{margin: 10, borderRadius: 10}}
						value={newSearchString}
					/>
					<FlatList
						data={newMangaList}
						keyExtractor={(item) => item.id}
						key={`newMangaList_${Date.now()}`}
						numColumns={1}
						style={{flex: 1}}
						renderItem={({ item }) => (
							<Pressable style={{ height: 150, width: "100%", flexDirection: "row", alignItems: "center", padding: 5 }} onPress={() => { router.navigate(`/manga/${item.id}`) }}>
								<Image
									source={{ uri: item.coverImage?.large }}
									resizeMode="contain"
									style={{height: "100%", aspectRatio: 0.8}}
								/>
								<ThemeText style={{textAlign: "left", fontSize: 20, flex: 1}}>{item.title?.userPreferred}</ThemeText>
								<IconButton
									icon={"plus"}
									mode="contained"
									iconColor={mangaList.find((elem) => elem.id === item.id) ? theme.colors.surfaceVariant : theme.colors.primary}
									containerColor={mangaList.find((elem) => elem.id === item.id) ? theme.colors.inverseOnSurface : theme.colors.surfaceVariant}
									onPress={async () => { await addMangaToLibrary(item.id); populateMangaList(); }}
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
	mangaCoverImage: { width: '100%', aspectRatio: '0.8'}
});