import ThemeText from "@/components/ThemeText";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, View, ScrollView } from "react-native";
import { Button, Card, IconButton, useTheme } from "react-native-paper";
import { getCustomLists } from "@/services/custom_lists";
import { getLibraryMangaThumbnails } from "@/services/manga.service";
import { ICustomList } from "@/types/ICustomList";
import { getMangaTitle } from "@/types/IManga";
import AutoGrowingTextInput from "@/components/AutoGrowingTextInput";
import ThemeButton from "@/components/ThemeButton";
import { editList } from "@/services/lists.service";

export default function CustomListDetail()
{
	const params = useLocalSearchParams();
	const listId = params.listId as string;
	const theme = useTheme();
	const router = useRouter();
	const [list, setList] = useState<ICustomList | null>(null);
	const [mangas, setMangas] = useState<any[]>([]);
	const [officialDescription, setOfficialDescription] = useState<string>("");
	const [description, setDescription] = useState<string>("");
	const [isEditingDescription, setEditingDesc] = useState<boolean>(false);
	const [textHovered, setTextHovered] = useState<boolean>(false);

	useEffect(() => {
		(async () => {
			const res = await getCustomLists();
			const list = res.success
				? res.data.find((l) => l._id === listId)
				: undefined;
			if (list)
			{
				setList(list);
				setDescription(list.description)
				setOfficialDescription(list.description)
				const thumbs = await getLibraryMangaThumbnails(list.mangaIds);
				setMangas(thumbs.success ? thumbs.data : []);
			}
		})();
	}, [listId]);
	
	const onSaveDescription = useCallback(async () => 
	{
		const response = await editList(listId, { description });
		if (response.success)
		{
			setOfficialDescription(description)
			setEditingDesc(false)
		}
	}, [description]);
	
	return (
		<>
			<Stack.Screen
				options={{ title: list?.name ?? "List", headerTitleAlign: "center" }}
			/>
			<ScrollView
				style={[{ flex: 1, backgroundColor: theme.colors.background }]}
			>
				<View style={styles.header}>
						<ThemeText variant="titleLarge" style={{paddingHorizontal: 10}}>{list?.name}</ThemeText>
						<ThemeText variant="labelLarge" style={{opacity: 0.6, paddingHorizontal: 10}}>
							{list?.mangaIds?.length ?? 0} manga
						</ThemeText>
						{
							!isEditingDescription
							?
							<Pressable
								onHoverIn={() => setTextHovered(true)}
								onHoverOut={() => setTextHovered(false)}
								style={{cursor: 'auto'}}
							>
								<IconButton icon={"pencil"} size={15} mode="contained"
									style={{display: textHovered ? 'flex' : 'none', position: 'absolute', top: -20, right: 0, zIndex: 2}}
									onPress={() => {
										setEditingDesc(true)
										setTextHovered(false)
									}}
									onHoverIn={() => setTextHovered(true)}
								/>
								<ThemeText
									variant="bodyMedium"
									style={{ color: theme.colors.onSurfaceVariant, flex: 1, backgroundColor: textHovered ? theme.colors.surface : theme.colors.background, padding: 10, opacity: officialDescription ? 1 : 0.6 }}
								>
									{officialDescription || "(no description)"}
								</ThemeText>
							</Pressable>
							:
							<View>
								<AutoGrowingTextInput
									value={description}
									onChangeText={setDescription}
									placeholder="Description of this list..."
									label={"Description"}
									style={{zIndex: 1}}
								/>
								<View style={{flexDirection: 'row-reverse', padding: 0, paddingVertical: 4, gap: 4}}>
									<ThemeButton mode="contained"
										onPress={onSaveDescription}
									>
										Save
									</ThemeButton>
									<ThemeButton mode="contained-tonal" onPress={() => {
										setEditingDesc(false)
										setDescription(officialDescription)
									}}>
										Cancel
									</ThemeButton>
								</View>
							</View>
						}
				</View>
				<FlatList
					data={mangas}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{ padding: 16, paddingVertical: 2, gap: 12 }}
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
			</ScrollView>
		</>
	);
}

const styles = StyleSheet.create({
	header: { gap: 12, padding: 16 },
	thumb: { width: 96, height: 120, borderRadius: 8, marginRight: 12 },
	mangaRow: {
		flexDirection: "row",
		alignItems: "center",
		padding: 12,
		borderRadius: 10,
	},
});
