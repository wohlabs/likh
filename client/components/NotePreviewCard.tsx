import { Image, StyleProp, ViewStyle, StyleSheet, View } from "react-native";
import { INoteEntry } from "../types/INotes";
import ThemeText from "./ThemeText";
import { getImageBase64 } from "./util";
import { useCallback, useEffect, useState } from "react";
import { Card, useTheme } from "react-native-paper";
import ReadMore from "./ReadMore";

export default function NotePreviewCard({ note, style, onPress }: { note: INoteEntry, style?: StyleProp<ViewStyle>, onPress?: () => void }) 
{
	const [previews, setPreviews] = useState<string[]>(note.images);
	const theme = useTheme()

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
			style={[{ flex: 1, margin: 5, borderRadius: 10}, style]}
			onPress={onPress}
		>
			<Card.Content style={{flexDirection: 'row', padding: 0, flex: 1}}>
				<View style={{width: '7%', backgroundColor: theme.colors.surfaceVariant, borderTopLeftRadius: 10, borderBottomLeftRadius: 10, padding: 2, justifyContent: 'center', }}>
					<ThemeText variant="labelSmall" style={{textAlign: 'center', opacity: 0.6}}>
						Chapter
					</ThemeText>
					<ThemeText variant="labelMedium" style={{textAlign: 'center'}}>
						{
							note.startChapter === -1
								? `Overall`
								: `${note.startChapter}${note.endChapter ? " - " + note.endChapter : ""}`
						}
					</ThemeText>
				</View>
				<View style={{flexDirection: 'row', justifyContent: 'space-between', flex: 1, padding: 5}}>
					<View style={{flexDirection: 'row', flex: 1, padding: 5, paddingHorizontal: 5, gap: 5}}>
						{ previews[0] && 
						<Image
							source={{ uri: previews[0] }}
							style={[styles.imagePreview, { opacity: previews.length > 0 ? 1 : 0 }]}
							resizeMode="cover"
						/>
						}
						<ReadMore
							numberOfLines={3}
							renderTruncatedFooter={() => {}}
							renderRevealedFooter={() => {}}
							onReady={() => {}}
							textStyle={{color: theme.colors.onBackground, opacity: note.text ? 1 : 0.6, minHeight: 40}}
							style={{flex: 1}}
						>
							<ThemeText variant="bodyMedium">{note.text || "(No notes)"}</ThemeText>
						</ReadMore>
					</View>
					<ThemeText variant="labelSmall" style={{opacity: 0.6}}>{new Date(note.modifiedAt).toLocaleString() || "date @ time"}</ThemeText>
				</View>
			</Card.Content>
		</Card>
	);
}

const styles = StyleSheet.create({
	noteSnippet: {
		flex: 1, textAlign: 'left', paddingLeft: 20
	},
	imagePreview: {
		width: 45, aspectRatio: 1, borderRadius: 7, alignSelf: 'center'
	},
	cardContent: {
		justifyContent: 'space-between', alignItems: 'center', width: '100%', flexDirection: 'row', padding: 10 
	},
	middleInfo: {
		flex: 1, textAlign: 'center'
	}
});