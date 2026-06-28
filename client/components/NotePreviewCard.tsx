import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, PressableProps, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { INoteEntry } from "../types/INotes";
import ReadMore from "./ReadMore";
import ThemeText from "./ThemeText";
import { getImageBase64 } from "./util";
import { usePersistentTheme } from "@/context/usePersistentTheme";
import ThemeBadge from "./ThemeBadge";

export default function NotePreviewCard({ note, style, className, onPress }: { note: INoteEntry, style?: StyleProp<ViewStyle>, onPress?: () => void } & PressableProps) 
{
	const [previews, setPreviews] = useState<string[]>(note.images);
	const { theme } = usePersistentTheme()

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
		<Pressable
			className={`flex-1 m-1 rounded-lg bg-elevation-level1 flex-row p-0 shadow-lg ${className}`}
			onPress={onPress}
		>
			<View className="w-15 bg-surfaceVariant p-1 rounded-l-lg justify-center">
				<ThemeText style={{textAlign: 'center', opacity: 0.6}}>
						Chapter
				</ThemeText>
				<ThemeText style={{textAlign: 'center'}}>
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
					<View style={{flex: 1}}>
						<ReadMore
							numberOfLines={3}
							renderTruncatedFooter={() => {}}
							renderRevealedFooter={() => {}}
							onReady={() => {}}
							textStyle={{color: theme['--color-onBackground'], opacity: note.text ? 1 : 0.6, minHeight: 20}}
							style={{flex: 1}}
						>
							<ThemeText numberOfLines={3}>{note.text || "(No notes)"}</ThemeText>
						</ReadMore>
						<View className="flex-row gap-1 justify-between">
							<View className="flex-row justify-end gap-1">
							{
								note.tags?.map((value) => (
									<ThemeBadge className="border-2 p-0.5!" labelForColor={value}>{value}</ThemeBadge>
								))
							}
							</View>
							<ThemeText style={{opacity: 0.6, textAlign: 'right', alignSelf: 'flex-end'}}>{note.fromAnilist && "from anilist - "}{new Date(note.modifiedAt).toLocaleString() || "date @ time"}</ThemeText>
						</View>
					</View>
				</View>
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	noteSnippet: {
		flex: 1, textAlign: 'left', paddingLeft: 20
	},
	imagePreview: {
		width: 60, aspectRatio: 1, borderRadius: 7, alignSelf: 'center'
	},
	cardContent: {
		justifyContent: 'space-between', alignItems: 'center', width: '100%', flexDirection: 'row', padding: 10 
	},
	middleInfo: {
		flex: 1, textAlign: 'center'
	}
});