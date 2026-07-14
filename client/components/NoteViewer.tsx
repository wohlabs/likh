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
		<View style={[styles.viewerContainer, style]}>
			<View style={styles.imagesViewer}>
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
							style={styles.imageContainer}
						/>
						:
						<View style={styles.noImagesContainer}>
							<ThemeText style={{color: theme['--color-onSurface']}}>No images</ThemeText>
						</View>
				}
				<View style={{height: 100, flexDirection: "row"}}>
					<FlatList
						data={images}
						key={`images_${Date.now()}`}
						renderItem={({ item, index }) => (
							<Pressable onPress={() => {setCurrentImageIndex(index)}}>
								<Image
									source={{ uri: item }}
									resizeMode="cover"
									style={styles.thumbnailImage}
								/>
							</Pressable>
						)}
						horizontal
						style={{ flex: 1, marginTop: 10 }}
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
				<ThemeText style={[{fontWeight: "bold"}]}>Note:</ThemeText>
				<ScrollView>
					<ThemeText selectable={true}>{note.text}</ThemeText>
				</ScrollView>
				<View style={styles.viewerButtonsContainer}>
					{/* <ThemeButton style={styles.viewerButton}
						disabled={note.fromAnilist}
						onPress={() => {}}
					>
						<Ionicons name="share-social" size={16} color={note.fromAnilist ? theme["--color-onDisabledBackground"] : theme["--color-primary"]}/>
						Share
					</ThemeButton> */}
					<ThemeButton
						disabled={note.fromAnilist}
						style={styles.viewerButton}
						onPress={onEdit}
					>
						<Ionicons name="pencil" size={16} color={note.fromAnilist ? theme["--color-onDisabledBackground"] : theme["--color-primary"]}/>
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
	viewerContainer: {
		flex: 1, padding: 10, flexDirection: "row"
	},
	imagesViewer: {
		flex: 2, margin: 10, flexDirection: "column" 
	},
	noImagesContainer: {
		flex: 1, justifyContent: "center", alignItems: "center", borderWidth: 2, borderRadius: 10, borderStyle:"dashed"
	},
	imageContainer: {
		flex: 1,
		width: "100%",
		borderRadius: 10,
		borderWidth: 2,
	},
	thumbnailImage: {
		height: "100%",
		aspectRatio: 1,
		borderRadius: 10,
		borderColor: "black",
		borderWidth: 2,
		marginRight: 5
	},
	viewerButton: {
		flexDirection: "row", justifyContent: "center", alignItems: "center", flex: 1  
	},
	viewerButtonsContainer: {
		flexDirection: "row", alignItems: "center"
	}
});