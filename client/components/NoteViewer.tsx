import { useCallback, useEffect, useState } from "react";
import { FlatList, Image, Pressable, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { INoteEntry } from "../types/INotes";
import ThemeButton from "./ThemeButton";
import ThemeText from "./ThemeText";
import { ThemeMenu, ThemeMenuItem } from "./ThemeMenu";
import { getImageBase64 } from "./util";
import { Ionicons } from "@expo/vector-icons";
import { usePersistentTheme } from "@/context/usePersistentTheme";
import ThemeBadge from "./ThemeBadge";

export default function NoteViewer({mangaTitle, note, onDelete, onEdit, style}: { mangaTitle?: string, note: INoteEntry, style?: StyleProp<ViewStyle>, onDelete?: () => void , onEdit?: () => void})
{
	const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
	const [optionsVisible, setOptionsVisible] = useState<boolean>(false);
	const [images, setImages] = useState<string[]>(note.images);
	const {theme} = usePersistentTheme()


	const fetchImages = useCallback(async () => 
	{
		note.images.map(async (imageId, index) => 
		{
			const image = await getImageBase64(imageId)
			setImages(prev => 
			{
				const updated = [...prev];
				updated[index] = image
				return updated
			})
		})
	}, [note]);

	useEffect(() => 
	{
		fetchImages()
	}, [fetchImages])

	return (
		note &&
		<View
			className="flex-1 p-2 flex-row"
			style={style}
		>
			<View
				className="flex-2 mb-2 ml-2 mr-2 flex-col"
			>
				{
					images?.length > 0 ? 
						<Image
							defaultSource={{
								uri: "https://png.pngtree.com/png-clipart/20190705/original/pngtree-vector-add-icon-png-image_4232053.jpg",
							}}
							source={{
								uri: images[currentImageIndex] || "https://static.thenounproject.com/png/187803-200.png"
							}}
							resizeMode="contain"
							className="flex flex-1 w-full rounded-lg border-2 border-outlineVariant"
						/>
						:
						<View className="flex-1 justify-center items-center border-2 rounded-lg border-dashed">
							<ThemeText className="text-onSurface">No images</ThemeText>
						</View>
				}
				<View className="h-25 flex-row w-full">
					<FlatList
						data={images}
						key={`images_${Date.now()}`}
						renderItem={({ item, index }) => (
							<Pressable onPress={() => {setCurrentImageIndex(index)}} className="w-20 h-20">
								<Image
									source={{ uri: item }}
									resizeMode="cover"
									className="h-full aspect-square border-2 border-outlineVariant rounded-lg mr-1.5"
								/>
							</Pressable>
						)}
						horizontal
						className="flex-1 mr-2 mt-2 flex-row"
						keyExtractor={(_, index) => index?.toString() || ""}
					/>
				</View>
			</View>
			<View style={{ flexDirection: "column", flex: 3}}>
				<ThemeText>Manhwa/Manga: {mangaTitle || "Unknown"}</ThemeText>
				<View style={{ flexDirection: "row"}}>
					{
						note.startChapter === -1 ?
							<ThemeText>Chapter: All</ThemeText>
							:
							note.endChapter
								?
								<ThemeText>Chapter: {note.startChapter?.toString() || ""} - {note.endChapter?.toString() || ""}</ThemeText>
								:
								<ThemeText>Chapter: {note.startChapter?.toString() || ""}</ThemeText>
					}
				</View>
				<View className="flex-row gap-1">
				{
					note.tags?.map((value) => (
						<ThemeBadge className="border-2 p-1!" labelForColor={value}>{value}</ThemeBadge>
					))
				}
				</View>
				<ThemeText className="font-bold">Note:</ThemeText>
				<ScrollView>
					<ThemeText selectable={true}>{note.text}</ThemeText>
				</ScrollView>
				<View className="flex-row items-center">
					{/* <ThemeButton
						disabled={note.fromAnilist}
						className="flex-row justify-center items-center flex-1"
						onPress={() => {}}
					>
						<Ionicons name="share-social" size={16} color={note.fromAnilist ? theme["--color-onDisabledBackground"] : theme["--color-primary"]}/>
						Share
					</ThemeButton> */}
					<ThemeButton
						disabled={note.fromAnilist}
						className="flex-row justify-center items-center flex-1"
						onPress={onEdit}
						mode="contained-tonal"
					>
						<Ionicons name="pencil" size={16} color={note.fromAnilist ? theme["--color-onDisabledBackground"] : theme["--color-onPrimaryContainer"]}/>
						Edit
					</ThemeButton>
					{/* <ThemeButton
						disabled={note.fromAnilist}
						style={styles.viewerButton}
						onPress={() => {}}
					>
						<Ionicons name="heart" size={16} color={note.fromAnilist ? theme["--color-onDisabledBackground"] : theme["--color-primary"]}/>
						Favorite
					</ThemeButton> */}
					<ThemeMenu
						visible={optionsVisible}
						onDismiss={() => setOptionsVisible(false)}
						anchor={
							<Ionicons name='ellipsis-horizontal'
								className="icon-button m-auto"
								onPress={() => setOptionsVisible(true)}
							/>
						}
						anchorPosition="bottom"
					>
						<ThemeMenuItem 
							onPress={onDelete} title="delete" leadingIcon={"delete"}
						/>
					</ThemeMenu>
				</View>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	viewerButton: {
		flexDirection: "row", justifyContent: "center", alignItems: "center", flex: 1  
	},
});