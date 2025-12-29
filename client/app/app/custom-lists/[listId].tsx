import ThemeText from "@/components/ThemeText";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, View } from "react-native";
import { Card, IconButton, useTheme } from "react-native-paper";
import { getCustomLists } from "@/services/custom_lists";
import { getLibraryMangaThumbnails } from "@/services/manga.service";
import { ICustomList } from "@/types/ICustomList";
import { getMangaTitle } from "@/types/IManga";

export default function CustomListDetail() {
	const params = useLocalSearchParams();
	const listId = params.listId as string;
	const theme = useTheme();
	const router = useRouter();
	const [list, setList] = useState<ICustomList | null>(null);
	const [mangas, setMangas] = useState<any[]>([]);

	useEffect(() => {
		(async () => {
			const res = await getCustomLists();
			const found = res.success
				? res.data.find((l) => l._id === listId)
				: undefined;
			if (found) {
				setList(found);
				const thumbs = await getLibraryMangaThumbnails(found.mangaIds);
				setMangas(thumbs.success ? thumbs.data : []);
			}
		})();
	}, [listId]);

	return (
		<>
			<Stack.Screen
				options={{ title: list?.name ?? "List", headerTitleAlign: "center" }}
			/>
			<View
				style={[styles.container, { backgroundColor: theme.colors.background }]}
			>
				<View style={styles.header}>
					<View style={{ flex: 1 }}>
						<ThemeText variant="titleLarge">{list?.name}</ThemeText>
						<ThemeText
							variant="bodyMedium"
							style={{ color: theme.colors.onSurfaceVariant }}
						>
							{list?.description}
						</ThemeText>
						<ThemeText variant="labelLarge">
							{list?.mangaIds?.length ?? 0} manga
						</ThemeText>
					</View>
				</View>

				<FlatList
					data={mangas}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{ padding: 16, gap: 12 }}
					renderItem={({ item }) => (
						<Card onPress={() => router.push(`/app/manga/${item.id}`)}>
							<Card.Content style={styles.mangaRow}>
								<Image
									source={{ uri: item.coverImage?.large }}
									style={styles.thumb}
								/>
								<View style={{ flex: 1 }}>
									<ThemeText variant="titleMedium">
										{getMangaTitle(item)}
									</ThemeText>
								</View>
							</Card.Content>
						</Card>
					)}
				/>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	header: { flexDirection: "row", gap: 12, padding: 16, alignItems: "center" },
	thumb: { width: 96, height: 120, borderRadius: 8, marginRight: 12 },
	mangaRow: {
		flexDirection: "row",
		alignItems: "center",
		padding: 12,
		borderRadius: 10,
	},
});
