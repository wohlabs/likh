import ThemeText from "@/components/ThemeText";
import { formatData } from "@/components/util";
import { router, Stack, useRouter } from "expo-router";
import React, { useEffect, useState, useContext, useCallback } from "react";
import { FlatList, Image, Pressable, StyleProp, StyleSheet, useWindowDimensions, View, ViewProps, ViewStyle } from "react-native";
import { Button, IconButton, Menu, Modal, Portal, Searchbar, useTheme } from "react-native-paper";
import { BlurView } from "expo-blur";
import { AuthContext } from "@/context/AuthContext";
import { addMangaToLibrary, getLibraryMangaThumbnails, getMangaIdsWithNotes, getMyListMangaIds, MangaProps, searchMangaByString } from "@/services/manga.service";
import { getMangaTitle } from "@/types/IManga";
import ThemeSearchbar from "@/components/ThemeSearchbar";
import { LoadingScreen } from "@/components/LoadingScreen";
import { LinearGradient } from 'expo-linear-gradient'
import { modernDarkTheme } from "@/theme/modernTheme";

export default function MangaCard({item, style} : {item: MangaProps, style: StyleProp<ViewStyle>})
{
	const theme = useTheme();
	const [optionsVisible, setOptionsVisible] = useState<boolean>(false);

	return (
		<View style={style}>
			<Pressable 
				style={[styles.mangaCardContainer, {
					shadowColor: "#000",
					shadowOffset: { width: 0, height: 4 },
					shadowOpacity: 0.08,
					shadowRadius: 12,
					elevation: 2,
					// borderColor: "white",
					// borderWidth: 1,
					// borderRadius: 10
					boxShadow: `0 0 5px 1px ${theme.colors.backdrop}`
				}]}
				onPress={() => { router.navigate(`/app/manga/${item.id}`) }}
			>
				<Image
					source={{ uri: item.coverImage?.large }}
					resizeMode="cover"
					style={styles.mangaCoverImage}
				/>
			{/* Gradient mask */}
			<LinearGradient
				colors={["transparent", modernDarkTheme.colors.background]}
				locations={[0.6, 1]}
				style={StyleSheet.absoluteFill}
				pointerEvents="none"
			/>
			<View style={styles.bottomContent}>
				<View style={styles.textContainer}>
					<ThemeText variant="titleMedium" style={[styles.mangaTitle, {color: modernDarkTheme.colors.onBackground}]} numberOfLines={2}>{getMangaTitle(item)}</ThemeText>
				</View>
			</View>
			<View style={{position: "absolute", top: 0, width: "100%", flexDirection: "row-reverse"}}>
				<Menu
					visible={optionsVisible}
					onDismiss={() =>{setOptionsVisible(false)}}
					anchor={
						<IconButton size={15} icon='dots-vertical' mode="contained"
							onPress={() => setOptionsVisible(true)}
						/>
					}
				>
					<Menu.Item 
						onPress={() => {}} title="add to list" leadingIcon={"playlist-plus"}
					/>
				</Menu>
				<IconButton size={15} icon={"heart-outline"} mode="contained"
					onPress={() => {}}
				/>
			</View>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	mangaTitle: {textAlign: 'left', margin: 5},
	mangaCoverImage: { width: '100%', aspectRatio: '0.8', overflow: 'hidden', borderRadius: 10 },
	mangaCardContainer: { width: '100%', aspectRatio: '0.8', borderRadius: 10, overflow: 'hidden', position: 'relative' },
	bottomContent: {
		flex: 1,
		justifyContent: 'space-between',
		alignItems: 'center',
		// padding: 10,
		position: "absolute",
		bottom: 0,
		width: "100%",
		borderTopLeftRadius: 5,
		borderTopRightRadius: 5
	},
	textContainer: {
		flex: 1,
		width: '100%',
		textAlign: 'left'
	},
	searchBarFloating: {
		width: "100%", minWidth: 350, height: 60, position: "absolute", bottom: 25, flexDirection: "row", alignItems: "center", margin: 'auto', justifyContent: 'center', pointerEvents: 'none'
	},
	searchBarContainer: { width: '90%', maxWidth: 600, flexDirection: 'row', alignItems: 'center' },
	searchBar: {margin: 10, borderRadius: 10, flex: 1, boxShadow: "0px 4px 5px rgba(0,0,0,0.3)" },
	addNoteIconButton: {boxShadow: "0px 4px 5px rgba(0,0,0,0.3)" },
	addMangaModalContainer: {
		padding: 0, margin: 'auto', width: "90%", height: "80%", borderRadius: 10
	},
	addMangaModalSearchBar: {margin: 10, borderRadius: 10},
	addMangaContainer: { height: 150, width: "100%", flexDirection: "row", alignItems: "center", padding: 5 },
	addMangaTitle: {flex: 1}
});