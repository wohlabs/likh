import { formatData, MANGA_SEARCH_QUERY } from "@/components/util";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

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

export default function Index() {
	const router = useRouter();
	const [mangaList, setMangaList] = useState<MangaProps[]>([]);
	const [filteredMangaList, setFilteredMangaList] = useState<MangaProps[]>([]);
	const [loading, setLoading] = useState(true);
	const [isSearching, setSearching] = useState(false)
	const [searchString, setSearchString] = useState("")

	const populateMangaList = async () => {
		let libraryMangaIds: number[] = []
		try {
			const storageKeys = await AsyncStorage.getAllKeys();
			libraryMangaIds = storageKeys.filter((value) => value.startsWith("manga_")).map((value) =>value.replace("manga_", "")).map((value) => Number(value))
		} catch (error) {
			console.error("Could not fetch mangaIds")
		}
		let query = {}
		if (isSearching)
		{
			query = {
				query: searchString.length > 0 ? MANGA_SEARCH_QUERY : MANGA_QUERY,
				variables: {search: searchString}
			}
		}
		else
		{
			query = {
				query: LIBRARY_MANGA_QUERY,
				variables: {ids: libraryMangaIds}
			}
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
		.then((data) => {
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
		.catch((error) => {
			console.error(error);
			setLoading(false);
		});
	}

	useEffect(() => {
		populateMangaList()
	}, [isSearching]);

	useEffect(() => {
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
				data={formatData(filteredMangaList, 5)}
				keyExtractor={(item) => item.id}
				numColumns={5}
				style={{flex: 1}}
				renderItem={({ item }) => (
					item?.id ?
					<Pressable style={{ flex:1 }} onPress={() => { router.navigate(`/manga/${item.id}`) }}>
						<Image
							source={{ uri: item.coverImage?.large }}
							resizeMode="contain"
							style={styles.mangaCoverImage}
						/>
						<Text style={styles.mangaTitle}>{item.title?.userPreferred}</Text>
					</Pressable>
					: <View style={{ flex: 1, backgroundColor: "transparent", margin: 5 }} />
				)}
			/>
			<View style={{height: 60, width: "50%", position: "absolute", bottom: 25, left:"50%", transform: "translateX(-50%)", flexDirection: "row", alignItems: "center"}}>
				<View style={{ flex: 1, backgroundColor: "white", flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 5, borderRadius: 10, shadowColor: "black", shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 5}} >
					<Ionicons name="search" size={20} style={{position: "relative", margin: 5}}/>
					<TextInput style={{flex: 1, margin: 5, borderWidth: 0, borderColor: "transparent", fontSize: 20, padding: 5}} underlineColorAndroid={"transparent"} onSubmitEditing={() => { populateMangaList(); }} value={searchString} onChangeText={setSearchString}/>
				</View>
				<Ionicons name="add" size={40} style={{ width: 40, height: 40, position: "relative", margin: 5, backgroundColor: "white", borderRadius: "50%", aspectRatio: 1, shadowColor: "black", shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 5}} color={"black"}/>
			</View>
		</View>
		</>
	);
}

const styles = StyleSheet.create({
	mangaTitle: {textAlign: 'center'},
	mangaCoverImage: { width: '100%', aspectRatio: '0.8'}
});