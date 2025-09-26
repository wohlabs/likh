import { Image, Pressable, StyleProp, Text, View } from "react-native";
import { INoteEntry } from "./INotes";

import { ViewStyle } from "react-native";
import ThemeText from "./ThemeText";
import { getImageBase64 } from "./util";
import { useEffect, useState } from "react";

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
		<Pressable
			style={[
				{ flexDirection: "row", borderRadius: 10, borderColor: "black", borderWidth: 2 },
				style
			]}
			onPress={onPress}
		>
			{(previews && previews.length > 0) &&
				(<View style={{ width: 200, height: 200, justifyContent: "center", alignItems: "center" }} key={0}>
					<Image
						source={{ uri: previews[0] }}
						style={{ height: "80%", aspectRatio: 1, backgroundColor: "white", borderRadius: 10 }}
						resizeMode="cover"
					/>
				</View>)
		}
			<View style={{ flex: 1, padding: 10 }}>
				<ThemeText>{note.modifiedAt || "date @ time"}</ThemeText>
				<ThemeText>{`Chapter ${note.startChapter}${note.endChapter ? " - " + note.endChapter : ""}`}</ThemeText>
				<ThemeText ellipsizeMode="tail" numberOfLines={5}>{note.text || "No notes"}</ThemeText>
			</View>
		</Pressable>
	);
}