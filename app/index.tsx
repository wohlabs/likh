import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";

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

	useEffect(() => {
		fetch("https://graphql.anilist.co", {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			body: JSON.stringify({ query: MANGA_QUERY })
		})
		.then((response) => response.json())
		.then((response) => response.data)
		.then((data) => {
			setMangaList(data.Page.media);
			setLoading(false);
		})
		.catch((error) => {
			console.error(error);
			setLoading(false);
		});
	}, []);

	return (
		<View>
			<FlatList
				data={mangaList}
				keyExtractor={(item) => item.id}
				numColumns={2}
				renderItem={({ item }) => (
					<Pressable style={{ flex:1 }} onPress={() => { router.navigate(`/manga/${item.id}`) }}>
						<Image
							source={{ uri: item.coverImage.large }}
							resizeMode="contain"
							style={styles.mangaCoverImage}
						/>
						<Text style={styles.mangaTitle}>{item.title.userPreferred}</Text>
					</Pressable>
				)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	mangaTitle: {textAlign: 'center'},
	mangaCoverImage: { width: '100%', aspectRatio: '0.8'}
});