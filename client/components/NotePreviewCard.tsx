import { Image, Pressable, StyleProp, Text, View } from "react-native";
import { INoteEntry } from "./INotes";

import { ViewStyle } from "react-native";
import ThemeText from "./ThemeText";
import { getImageBase64 } from "./util";
import { useEffect, useState } from "react";
import { Button, Card } from "react-native-paper";

export default function NotePreviewCard({ note, style, onPress }: { note: INoteEntry, style?: StyleProp<ViewStyle>, onPress?: () => void }) {
	const [previews, setPreviews] = useState<string[]>(note.images);
	useEffect(() => {
		const fetchImages = async () => {
			previews.map(async (imageId, index) => {
				const image = await getImageBase64(imageId)
				setPreviews(prev => {
					const updated = [...prev];
					updated[index] = image
					return updated
				})
			})
		};
		fetchImages()
	}, [])
	return (
		<Card
			style={style}
			onPress={onPress}
		>
			<Card.Content style={{ justifyContent: 'space-between', alignItems: 'center', width: '100%', flexDirection: 'row' }}>
				<Image
					source={{ uri: previews[0] }}
					style={{ width: 50, aspectRatio: 1, backgroundColor: "white", borderRadius: 7, alignSelf: 'center', opacity: previews.length > 0 ? 1 : 0 }}
					resizeMode="cover"
				/>
				<ThemeText style={{flex: 1, textAlign: 'center'}}>{new Date(note.modifiedAt).toDateString() || "date @ time"}</ThemeText>
				<ThemeText style={{flex: 1, textAlign: 'center'}}>
					{
						note.startChapter == -1
						? `All`
						: `Chapter ${note.startChapter}${note.endChapter ? " - " + note.endChapter : ""}`
					}
				</ThemeText>
				<ThemeText style={{flex: 1, textAlign: 'right', paddingLeft: 20}} ellipsizeMode="tail" numberOfLines={1}>{note.text || "No notes"}</ThemeText>
			</Card.Content>
		</Card>
	);
}