import { getMangaDetails } from "@/services/manga.service";
import { IMangaDetails } from "@/types/IManga";
import { useCallback, useEffect, useState } from "react";
import { StyleProp, ViewStyle, StyleSheet, View, Image } from "react-native";
import ThemeText from "./ThemeText";


export default function MangaOverviewHeader({ style, manga } : { style?: StyleProp<ViewStyle>, manga?: IMangaDetails })
{
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
						<ThemeText style={styles.title}>{manga?.title.english}</ThemeText>
					</View>
					<ThemeText lineBreakMode="tail" numberOfLines={6} ellipsizeMode="tail">{manga?.description}</ThemeText>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	mangaOverviewContainer: {height: '100%', maxWidth: 700, width: '100%', flexDirection: 'row'},
	mangaCoverImage: {aspectRatio: 3/4, marginHorizontal: 5},
	titleDetailsContainer: { height: '30%', flexDirection: 'row', alignItems: 'flex-end'},
	title: {fontSize: 24, fontWeight: 'bold', alignItems: 'flex-end', textAlignVertical: 'bottom'},
});