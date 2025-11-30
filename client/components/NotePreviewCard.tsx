import { Image, StyleProp, ViewStyle, StyleSheet } from "react-native";
import { INoteEntry } from "../types/INotes";
import ThemeText from "./ThemeText";
import { getImageBase64 } from "./util";
import { useCallback, useEffect, useState } from "react";
import { Card } from "react-native-paper";

export default function NotePreviewCard({ note, style, onPress }: { note: INoteEntry, style?: StyleProp<ViewStyle>, onPress?: () => void }) 
{
	const [previews, setPreviews] = useState<string[]>(note.images);

	const fetchImages = useCallback(async () => 
	{
		note.images.map(async (imageId, index) => 
		{
			const image = await getImageBase64(imageId)
			setPreviews(prev => 
			{
				const updated = [...prev];
				updated[index] = image
				return updated
			})
		})
	}, [note]);

	useEffect(() => 
	{
		fetchImages();
	}, [fetchImages])

	return (
		<Card
			style={style}
			onPress={onPress}
		>
			<Card.Content style={styles.cardContent}>
				<Image
					source={{ uri: previews[0] }}
					style={[styles.imagePreview, { opacity: previews.length > 0 ? 1 : 0 }]}
					resizeMode="cover"
				/>
				<ThemeText style={styles.middleInfo}>{new Date(note.modifiedAt).toDateString() || "date @ time"}</ThemeText>
				<ThemeText style={styles.middleInfo}>
					{
						note.startChapter === -1
							? `All`
							: `Chapter ${note.startChapter}${note.endChapter ? " - " + note.endChapter : ""}`
					}
				</ThemeText>
				<ThemeText style={styles.noteSnippet} ellipsizeMode="tail" numberOfLines={1}>{note.text || "No notes"}</ThemeText>
			</Card.Content>
		</Card>
	);
}

const styles = StyleSheet.create({
	noteSnippet: {
		flex: 1, textAlign: 'right', paddingLeft: 20
	},
	imagePreview: {
		width: 50, aspectRatio: 1, borderRadius: 7, alignSelf: 'center'
	},
	cardContent: {
		justifyContent: 'space-between', alignItems: 'center', width: '100%', flexDirection: 'row', padding: 10 
	},
	middleInfo: {
		flex: 1, textAlign: 'center'
	}
});