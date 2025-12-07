import { useCallback, useEffect, useState } from "react";
import { FlatList, Image, Pressable, ScrollView, StyleProp, View, ViewStyle, StyleSheet } from "react-native";
import { IconButton, Menu } from 'react-native-paper';
import { INoteEntry } from "../types/INotes";
import { getImageBase64 as getImageBase64 } from "./util";
import ThemeButton from "./ThemeButton";
import ThemeText from "./ThemeText";

export default function NoteViewer({mangaTitle, mangaId, note, onDelete, style}: { mangaTitle?: string, mangaId: string, note: INoteEntry, style?: StyleProp<ViewStyle>, onDelete?: (noteId: string) => void }) 
{
	const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
	const [optionsVisible, setOptionsVisible] = useState<boolean>(false);
	const [images, setImages] = useState<string[]>(note.images);


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
							<ThemeText style={styles.noImagesText}>No images</ThemeText>
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
				<ThemeText style={styles.info}>Manhwa/Manga: {mangaTitle || "Unknown"}</ThemeText>
				<View style={{ flexDirection: "row"}}>
					<ThemeText style={styles.info}>Chapter: {note.startChapter?.toString() || ""} - {note.endChapter?.toString() || ""}</ThemeText>
				</View>
				<ThemeText style={[ styles.info, {fontWeight: "bold"}]}>Note:</ThemeText>
				<ScrollView>
					<ThemeText selectable={true} style={styles.info}>{note.text}</ThemeText>
				</ScrollView>
				<View style={styles. viewerButtonsContainer}>
					<ThemeButton icon={'share'} style={styles.viewerButton}
						onPress={() => {}}
					>
						Share
					</ThemeButton>
					<ThemeButton icon={"pencil"}
						style={styles.viewerButton}
						onPress={() => {}}
					>
						Edit
					</ThemeButton>
					<ThemeButton icon='heart'
						style={styles.viewerButton}
						onPress={() => {}}
					>
						Favorite
					</ThemeButton>
					<Menu
						visible={optionsVisible}
						onDismiss={() => setOptionsVisible(false)}
						anchor={
							<IconButton icon='dots-horizontal' onPress={() => setOptionsVisible(true)}
							/>
						}
					>
						<Menu.Item 
							onPress={async () => onDelete && onDelete(note.id)} title="delete" leadingIcon={"delete"}
						/>
					</Menu>
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
	noImagesText: {
		fontSize: 28, color: "lightgray"
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
		flexDirection: "row", justifyContent: "center", alignItems: "center", height: 40, flex: 1  
	},
	viewerButtonsContainer: {
		flexDirection: "row", alignItems: "center"
	},
	info: {
		fontSize: 20
	}
});