import ThemeText from "@/components/ThemeText";
import { ThemeMenu, ThemeMenuItem } from "@/components/ThemeMenu";
import { themes, usePersistentTheme } from "@/context/usePersistentTheme";
import { addToCustomList, favoriteManga } from "@/services/custom_lists";
import { MangaProps } from "@/services/manga.service";
import { ICustomLists, MangaItem } from "@/types/ICustomList";
import { getMangaTitle } from "@/types/IManga";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Image, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

export default function MangaCard({item, style, allCustomLists, onCreateList } : {item: MangaProps, style?: StyleProp<ViewStyle>, onCreateList?: (mangaIdToAdd?: number) => {mangaIdToAdd: undefined}, allCustomLists: ICustomLists})
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
					className="w-full rounded-lg overflow-hidden relative shadow-elevation-level1 shadow-md"
					onPress={() => { router.navigate(`/app/manga/${item.id}`) }}
				>
					<Image
						source={{ uri: item.coverImage?.large }}
						resizeMode="cover"
						className="w-full overflow-hidden rounded-lg"
						style={{ aspectRatio: 0.8 }}
					/>
					{/* Gradient mask */}
					<LinearGradient
						colors={["transparent", "#1E293B"]} // elevation-level-1
						locations={[0.6, 1]}
						style={StyleSheet.absoluteFill}
						pointerEvents="none"
					/>
					<View className="flex-1 justify-between items-center absolute w-full rounded-t-md bottom-0">
						<View className="flex w-full text-left">
							<Text
								className="text-left m-1 text-gray-100 lowercase"
								numberOfLines={2}
							>
								{getMangaTitle(item)}
							</Text>
						</View>
					</View>
					<View
						className="absolute top-0 w-full flex-row-reverse"
					>
						<ThemeMenu
							visible={optionsVisible}
							onDismiss={() =>
							{
								setOptionsVisible(false)
							}}
							anchor={
								<Ionicons size={15}
									name={mangaCustomLists.reduce((accumulator, currentValue)=> accumulator || currentValue.isInList, false) ? 'bookmark' : 'bookmark-outline'}
									className='icon-button-contained'
									onPress={() => setOptionsVisible(true)}
								/>
							}
						>
							<ThemeMenuItem 
								title={'add to...'} leadingIcon={undefined}
							/>
							{
								mangaCustomLists.map((list, number) => (
									<ThemeMenuItem 
										key={list._id ? `custom_list_${list._id}` : `custom_list_undefined_${number}`}
										onPress={() => toggleList(list._id)} title={list.name} leadingIcon={list.isInList ? "bookmark" : "bookmark-outline"}
									/>
								))
							}
							<ThemeMenuItem 
								onPress={() => {setOptionsVisible(false); onCreateList && onCreateList(Number(item.id) ?? undefined);}} title={'new list'} leadingIcon={'plus'}
							/>
						</ThemeMenu>
						<Ionicons size={15} name={isFavorite ? "heart" : "heart-outline"}
							className="icon-button-contained"
							onPress={() => toggleFavorite()}
						/>
					</View>
				</Pressable>
			</View>
		</>
	);
}