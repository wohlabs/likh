import { formatData, MANGA_SEARCH_QUERY } from "@/components/util";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

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
		if (isSearching && searchString.length > 0)
		{
			query = {
				query: MANGA_SEARCH_QUERY,
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
			if (data)
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

	return (
		<>
		<Stack.Screen
			options={{
			headerRight: () => (
				<Ionicons
					name= {isSearching ? "close" : "search"}
					size={25}
					onPress={() => setSearching(!isSearching)}
				/>
			),
			headerTitle: () => (
				isSearching ? <TextInput
					placeholder="Search..."
					value={searchString}
					onChangeText={setSearchString}
					style={{
						backgroundColor: "#f0f0f0",
						borderRadius: 8,
						paddingHorizontal: 10,
						width: "100%",
						height: 36,
					}}
					returnKeyType="search"
					onSubmitEditing={() => { populateMangaList(); Keyboard.dismiss()}}
				/>
				: <Text>Library</Text>
			)
			}}
		/>
		<View>
			<FlatList
				data={formatData(mangaList, 2)}
				keyExtractor={(item) => item.id}
				numColumns={2}
				renderItem={({ item }) => (
					<Pressable style={{ flex:1 }} onPress={() => { router.navigate(`/manga/${item.id}`) }}>
						<Image
							source={{ uri: item.coverImage?.large }}
							resizeMode="contain"
							style={styles.mangaCoverImage}
						/>
						<Text style={styles.mangaTitle}>{item.title?.userPreferred}</Text>
					</Pressable>
				)}
			/>
		</View>
		</>
	);
}

const styles = StyleSheet.create({
	mangaTitle: {textAlign: 'center'},
	mangaCoverImage: { width: '100%', aspectRatio: '0.8'}
});