import { useEffect, useState } from "react";
import { FlatList, Image, Text, View } from "react-native";

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
					medium
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
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<FlatList
				data={mangaList}
				keyExtractor={(item) => item.id}
				numColumns={2}
				style={{ width: '100%' }}
				renderItem={({ item }) => (
					<View style={{ flex: 1, alignItems: 'center' }}>
						<Image
							source={{ uri: item.coverImage.large }}
							style={{ width: 150, height: 220, resizeMode: 'contain'}}
						/>
						<Text style={{textAlign: 'center'}}>{item.title.userPreferred}</Text>
					</View>
				)}
			/>
		</View>
	);
}
