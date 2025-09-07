import { formatData, MANGA_SEARCH_QUERY } from "@/components/util";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

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
	const [newMangaList, setNewMangaList] = useState<MangaProps[]>([]);
	const [newSearchString, setNewSearchString] = useState("")

	const populateMangaList = async () => {
		let libraryMangaIds: number[] = []
		try {
			const storageKeys = await AsyncStorage.getAllKeys();
			libraryMangaIds = storageKeys.filter((value) => value.startsWith("manga_")).map((value) =>value.replace("manga_", "")).map((value) => Number(value))
		} catch (error) {
			console.error("Could not fetch mangaIds")
		}
		let query = {
			query: LIBRARY_MANGA_QUERY,
			variables: {ids: libraryMangaIds}
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

	const populateNewMangaList = async () => {
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
		.then((data) => {
			if (data && data.Page && data.Page.media)
			{
				setNewMangaList(data.Page.media);
			}
			else
			{
				setNewMangaList([]);
			}
		})
		.catch((error) => {
			console.error(error);
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
				<TouchableOpacity
					onPress={() => { setSearching(!isSearching); populateNewMangaList(); }}
					style={{width: 40, height: 40, margin: 5, aspectRatio: 1, shadowOpacity: 0.3, shadowRadius: 5, backgroundColor: "white", borderRadius: "100%", shadowColor: "black", shadowOffset: {width: 0, height: 4} }}>
					<Ionicons name="add" size={40} style={{ width: "100%", height: "100%", position: "relative" }} color={"black"}/>
				</TouchableOpacity>
			</View>
		</View>
		{
			isSearching &&
			<Pressable style={{height: "100%", width: "100%", position: "absolute", backgroundColor: "black", opacity: 0.8}} onPress={() => setSearching(false)} >
			</Pressable>
		}
		{
			isSearching &&
			// <View style={{height: "100%", width: "100%", position: "absolute", justifyContent: "center", alignItems: "center"}} >
				<View style={{height: "80%", width: "80%", backgroundColor: "white", borderRadius: 10, position: "absolute", left: "50%", top: "50%", transform: "translateX(-50%) translateY(-50%)"}}>

					<View style={{ height: 50, backgroundColor: "white", flexDirection: "row", alignItems: "center", justifyContent: "space-between", margin: 10, padding: 5, borderRadius: 10, borderColor: "black", borderWidth: 2 }} >
						<Ionicons name="search" size={20} style={{position: "relative", margin: 5}}/>
						<TextInput style={{flex: 1, margin: 5, borderWidth: 0, borderColor: "transparent", fontSize: 20, padding: 5}} underlineColorAndroid={"transparent"} onSubmitEditing={() => { populateNewMangaList(); }} value={newSearchString} onChangeText={setNewSearchString}/>
					</View>
					<FlatList
						data={newMangaList}
						keyExtractor={(item) => item.id}
						numColumns={1}
						style={{flex: 1}}
						renderItem={({ item }) => (
							<Pressable style={{ height: 150, width: "100%", flexDirection: "row", alignItems: "center", padding: 5 }} onPress={() => { router.navigate(`/manga/${item.id}`) }}>
								<Image
									source={{ uri: item.coverImage?.large }}
									resizeMode="contain"
									style={{height: "100%", aspectRatio: 0.8}}
								/>
								<Text style={{textAlign: "left", fontSize: 20, flex: 1}}>{item.title?.userPreferred}</Text>
								<TouchableOpacity
									style={{width: 40, height: 40, margin: 5, aspectRatio: 1,
										backgroundColor: mangaList.find((elem) => elem.id === item.id) ? "lightgray" : "green", borderRadius: "100%", justifyContent: "center" }}>
										<Ionicons name="add" size={40} style={{ }} color={"white"}/>
								</TouchableOpacity>
							</Pressable>
						)}
					/>
				</View>
			// </View>
		}
		</>
	);
}

const styles = StyleSheet.create({
	mangaTitle: {textAlign: 'center'},
	mangaCoverImage: { width: '100%', aspectRatio: '0.8'}
});