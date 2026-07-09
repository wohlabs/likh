import AutoGrowingTextInput from "@/components/AutoGrowingTextInput";
import ThemeButton from "@/components/ThemeButton";
import ThemeText from "@/components/ThemeText";
import { usePersistentTheme } from "@/context/usePersistentTheme";
import { addToCustomList, getCustomLists } from "@/services/custom_lists";
import { editList } from "@/services/lists.service";
import { getLibraryMangaThumbnails, MangaProps } from "@/services/manga.service";
import { ICustomList, MangaItem } from "@/types/ICustomList";
import { getMangaTitle } from "@/types/IManga";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Image, Pressable, ScrollView, StyleSheet, View } from "react-native";

export default function CustomListDetail()
{
	const params = useLocalSearchParams();
	const listId = params.listId as string;
	const { theme } = usePersistentTheme();
	const router = useRouter();
	const [list, setList] = useState<ICustomList | null>(null);
	const [mangas, setMangas] = useState<(MangaProps & {addedDate: Date})[]>([]);
	const [officialDescription, setOfficialDescription] = useState<string>("");
	const [description, setDescription] = useState<string>("");
	const [isEditingDescription, setEditingDesc] = useState<boolean>(false);
	const [textHovered, setTextHovered] = useState<boolean>(false);

	const getListMangaData = async (mangaList: MangaItem[]) : Promise<(MangaProps & {addedDate: Date})[]> => 
	{

		const result = await getLibraryMangaThumbnails(mangaList.map((m) => m.mangaId));
		if (result.success)
		{
			const addedDataList: any[] = result.data.map((item: any) => 
			{
				item.addedDate = mangaList.find((m) => Number(m.mangaId) === Number(item.id))?.addedAt;
				return item;
			})
			return addedDataList
		}
		else
		{
			return []
		}
	}

	useEffect(() => 
	{
		(async () => 
		{
			const res = await getCustomLists();
			const list = res.success
				? res.data.find((l) => l._id === listId)
				: undefined;
			if (list)
			{
				setList(list);
				setDescription(list.description)
				setOfficialDescription(list.description)
				setMangas(await getListMangaData(list.manga))
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
	}, [description, listId]);
	
	return (
		<>
			<Stack.Screen
				options={{ title: list?.name ?? "List", headerTitleAlign: "center" }}
			/>
			<ScrollView
				className="pb-5"
			>
				<View className="gap-3 p-4">
					<ThemeText className="text-xl px-2.5">{list?.name}</ThemeText>
					<ThemeText className="opacity-60 px-2.5">
						{list?.manga?.length ?? 0} manga
					</ThemeText>
					{
						!isEditingDescription
							?
							<Pressable
								onHoverIn={() => setTextHovered(true)}
								onHoverOut={() => setTextHovered(false)}
								style={{cursor: 'auto'}}
							>
								<Ionicons name={"pencil-sharp"} size={16}
									className={`${textHovered ? 'flex' : 'hidden'} icon-button-contained absolute z-10 right-0 -top-5`}
									color={theme['--color-onSurfaceVariant']}
									onPress={() => 
									{
										setEditingDesc(true)
										setTextHovered(false)
									}}
									onHoverIn={() => setTextHovered(true)}
								/>
								<ThemeText
									className="text-onSurfaceVariant flex-1 p-2.5"
									style={{
										backgroundColor: textHovered ? theme['--color-surface'] : theme['--color-background'],
										opacity: officialDescription ? 1 : 0.6
									}}
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
									className="text-onBackground bg-background outline-2 outline-outline rounded-md p-2 z-10"
									multiline
								/>
								<View
									className="flex-row-reverse py-1 gap-1"
								>
									<ThemeButton mode="contained"
										onPress={onSaveDescription}
									>
										Save
									</ThemeButton>
									<ThemeButton mode="contained-tonal" onPress={() => 
									{
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
					renderItem={({ item }: {item: MangaProps & {addedDate: Date}}) => (
						<Pressable
							onPress={() => router.push(`/app/manga/${item.id}`)}
							className={`shadow-elevation-level1 shadow-md elevation-sm bg-surface flex-row items-center p-3 rounded-xl border border-surfaceVariant`}
						>
							<Image
								source={{ uri: item.coverImage?.large }}
								style={styles.thumb}
							/>
							<View className="flex-1">
								<ThemeText>
									{getMangaTitle(item)}
								</ThemeText>
								<ThemeText className="opacity-60">added on: {new Date(item.addedDate).toLocaleString() || "date @ time"}</ThemeText>
							</View>
							<Ionicons
								name={"trash-sharp"}
								className="icon-button-contained"
								color={theme['--color-onSurfaceVariant']}
								size={20}
								onPress={async () => 
								{
									const result = await addToCustomList(listId, Number(item.id), false)
									if (result.success)
									{
										setMangas(mangas.filter((manga: MangaProps) => manga.id != item.id))
									}
								}}
							/>
						</Pressable>
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
