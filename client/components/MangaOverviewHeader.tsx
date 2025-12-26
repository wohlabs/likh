import { getMangaTitle, IMangaDetails } from "@/types/IManga";
import { StyleProp, ViewStyle, StyleSheet, View, Image, GestureResponderEvent } from "react-native";
import ThemeText from "./ThemeText";
import ReadMore from 'react-native-read-more-text';
import { useTheme } from "react-native-paper";


export default function MangaOverviewHeader({ style, manga } : { style?: StyleProp<ViewStyle>, manga?: IMangaDetails })
{
	const theme = useTheme()
	
	const _renderTruncatedFooter = (handlePress : (event: GestureResponderEvent) => void) => {
		return (
			<ThemeText style={{color: theme.colors.primary}} onPress={handlePress}>
				Read more
			</ThemeText>
		);
	}

	const _renderRevealedFooter = (handlePress : (event: GestureResponderEvent) => void) => {
		return (
			<ThemeText style={{color: theme.colors.primary}} onPress={handlePress}>
				Show less
			</ThemeText>
		);
	}
	return (
		<View style={style}>
			<View style={styles.mangaOverviewContainer}>
				<Image
					source={{ uri: manga?.coverImage?.large }}
					resizeMode="contain"
					style={styles.mangaCoverImage}
				/>
				<View style={{ flex: 1 }}>
					<View style={styles.titleDetailsContainer}>
						<ThemeText style={styles.title} variant="titleLarge">{getMangaTitle(manga)}</ThemeText>
					</View>
					
					<ReadMore
						numberOfLines={5}
						renderTruncatedFooter={_renderTruncatedFooter}
						renderRevealedFooter={_renderRevealedFooter}
						onReady={() => {}}
						>
						<ThemeText variant="bodySmall">{manga?.description}</ThemeText>
					</ReadMore>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	mangaOverviewContainer: {maxWidth: 1000, width: '100%', flexDirection: 'row'},
	mangaCoverImage: {aspectRatio: 3/4, height: 200, marginHorizontal: 5},
	titleDetailsContainer: { height: 70, flexDirection: 'row', alignItems: 'flex-end'},
	title: {fontWeight: 'bold', alignItems: 'flex-end', textAlignVertical: 'bottom'},
});