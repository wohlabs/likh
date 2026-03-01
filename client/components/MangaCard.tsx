import ThemeText from "@/components/ThemeText";
import { usePersistentTheme } from "@/context/usePersistentTheme";
import { addToCustomList, favoriteManga } from "@/services/custom_lists";
import { MangaProps } from "@/services/manga.service";
import { modernDarkTheme } from "@/theme/modernTheme";
import { ICustomLists, MangaItem } from "@/types/ICustomList";
import { getMangaTitle } from "@/types/IManga";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Image, Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { IconButton, Menu } from "react-native-paper";

export default function MangaCard({item, style, allCustomLists, onCreateList } : {item: MangaProps, style?: StyleProp<ViewStyle>, onCreateList?: (mangaIdToAdd?: number) => {}, allCustomLists: ICustomLists})
{
	const { theme } = usePersistentTheme();
	const [optionsVisible, setOptionsVisible] = useState<boolean>(false);
	const [mangaCustomLists, setMangaCustomLists] = useState<{ _id: string, name: string, isInList: boolean}[]>([]);
	const [isFavorite, setFavorite] = useState<boolean>(false);
	
	const fetchMangaCustomLists = useCallback(async () => 
	{
		if (item && item?.id) // undefined id is from "blank" card used to fill in for flat list empty space
		{
			setMangaCustomLists(allCustomLists.filter((list) => !list.isFavorite).map((list) => ({ _id: list._id, name: list.name, isInList: list.manga?.some((m: MangaItem) => m.mangaId === Number(item.id)) })))
			setFavorite(allCustomLists.findLast((list) => list.isFavorite)?.manga.some(m => m.mangaId === Number(item.id)) ?? false)
		}
	}, [allCustomLists, item])

	const toggleList = async (listId: string) => 
	{
		if (item && item?.id) // undefined id is from "blank" card used to fill in for flat list empty space
		{
			const targetList = mangaCustomLists.findLast((list) => list._id === listId)
			if (targetList !== undefined)
			{
				addToCustomList(listId, Number(item.id), !targetList.isInList)
				setMangaCustomLists(prevLists =>
					prevLists.map(list =>
						list._id === listId
							? { ...list, isInList: !list.isInList }
							: list
					)
				)
			}
		}
	}

	const toggleFavorite = async () => 
	{
		if (item && item?.id) // undefined id is from "blank" card used to fill in for flat list empty space
		{
			favoriteManga(Number(item.id), !isFavorite)
			setFavorite(!isFavorite)
		}
	}
	
	useEffect(() => 
	{
		fetchMangaCustomLists()
	}, [allCustomLists, fetchMangaCustomLists])

	return (
		<>
			<View style={style}>
				<Pressable 
					style={[styles.mangaCardContainer, {
						shadowColor: "#000",
						shadowOffset: { width: 0, height: 4 },
						shadowOpacity: 0.08,
						shadowRadius: 12,
						elevation: 2,
						boxShadow: `0 0 5px 1px ${theme['--color-elevation-level1']}`
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
						colors={["transparent", theme['--color-background']]}
						locations={[0.6, 1]}
						style={StyleSheet.absoluteFill}
						pointerEvents="none"
					/>
					<View style={styles.bottomContent}>
						<View style={styles.textContainer}>
							<ThemeText style={[styles.mangaTitle, {color: theme['--color-onBackground']}]} numberOfLines={2}>{getMangaTitle(item)}</ThemeText>
						</View>
					</View>
					<View style={{position: "absolute", top: 0, width: "100%", flexDirection: "row-reverse"}}>
						<Menu
							visible={optionsVisible}
							onDismiss={() =>
							{
								setOptionsVisible(false)
							}}
							anchor={
								<IconButton size={15} icon={mangaCustomLists.reduce((accumulator, currentValue)=> accumulator || currentValue.isInList, false) ? 'bookmark' : 'bookmark-outline'} mode="contained"
									onPress={() => setOptionsVisible(true)}
								/>
							}
						>
							<Menu.Item 
								title={'add to...'} leadingIcon={undefined}
							/>
							{
								mangaCustomLists.map((list, number) => (
									<Menu.Item 
										key={list._id ? `custom_list_${list._id}` : `custom_list_undefined_${number}`}
										onPress={() => toggleList(list._id)} title={list.name} leadingIcon={list.isInList ? "bookmark" : "bookmark-outline"}
									/>
								))
							}
							<Menu.Item 
								onPress={() => {setOptionsVisible(false); onCreateList && onCreateList(Number(item.id) ?? undefined);}} title={'new list'} leadingIcon={'plus'}
							/>
						</Menu>
						<IconButton size={15} icon={isFavorite ? "heart" : "heart-outline"} mode="contained"
							onPress={() => toggleFavorite()}
						/>
					</View>
				</Pressable>
			</View>
		</>
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
});