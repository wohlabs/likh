import { getMangaTitle, IMangaDetails } from "@/types/IManga";
import { StyleProp, ViewStyle, StyleSheet, View, Image, GestureResponderEvent } from "react-native";
import ThemeText from "./ThemeText";
import ReadMore from '@/components/ReadMore';
import { Button, IconButton, Menu, Portal, useTheme, Modal } from "react-native-paper";
import { useCallback, useContext, useEffect, useState } from "react";
import NewCustomListView from "./NewCustomListView";
import { ICustomList, ICustomLists, MangaItem } from "@/types/ICustomList";
import { addToCustomList, getCustomLists } from "@/services/custom_lists";
import ThemeButton from "./ThemeButton";
import Toast from "react-native-toast-message";
import { getMangaStatus, updateMangaStatus } from "@/services/media_entry.service";
import { AuthContext } from "@/context/AuthContext";
import { ThemeDropdown } from "./ThemeDropdown";


export default function MangaOverviewHeader({ style, manga } : { style?: StyleProp<ViewStyle>, manga?: IMangaDetails })
{
	const theme = useTheme()
	const [optionsVisible, setOptionsVisible] = useState(false)
	const [isCreatingNewList, setCreatingNewList] = useState(false)
	const { anilistToken } = useContext(AuthContext)
	const [lists, setLists] = useState<(ICustomList & {isInList: boolean})[]>([])
	const [status, setStatus] = useState<string>("")
	const [statusOpen, setStatusOpen] = useState<boolean>(false)
	const [statusFetched, setStatusFetched] = useState<boolean>(false)

	
	const addIsInListData = useCallback((lists: ICustomLists) => {
		return lists.map((list: any) => {
			const isInList = list.manga.some((mangaItem: MangaItem) => mangaItem.mangaId == manga?.mangaId)
			list['isInList'] = isInList
			return list;
		})
	}, [manga?.mangaId])
	
	const fetchLists = useCallback(async () => {
		if (manga?.mangaId)
		{
			const result = await getCustomLists();
			if (result.success)
			{
				const listsWithIsInListData = addIsInListData(result.data)
				setLists(listsWithIsInListData)
			}
		}
	}, [])

	const fetchStatus = useCallback(async () => {
		if (manga?.mangaId)
		{
			const result = await getMangaStatus(manga.mangaId.toString(), anilistToken ? anilistToken : undefined);
			if (result.success && result.data != null)
			{
				setStatus(result.data.status)
				setStatusFetched(true)
			}
		}
	}, [])

	const handleStatusChange = async (val?: any) => {
		if (!manga?.mangaId) return;
		const newStatus = val ?? '';
		const previous = status;
		setStatus(newStatus);
		const result = await updateMangaStatus(manga.mangaId.toString(), newStatus, undefined);
		if (!result.success)
		{
			setStatus(previous);
			Toast.show({ type: 'error', text1: 'Could not update manga status' });
		}
	}

	const toggleList = async (listId: string) => {
		const targetList = lists.find((list) => list._id === listId)
		if (targetList !== undefined)
		{
			const result = await addToCustomList(listId, Number(manga?.mangaId), !targetList.isInList)
			if (result.success)
			{
				setLists(prevLists =>
					prevLists.map(list =>
						list._id === listId
							? { ...list, isInList: !list.isInList }
							: list
					)
				)
			}
		}
	}

	useEffect(() => {
		if (statusFetched)
		{
			console.log('testtt')
			handleStatusChange(status)
		}
	}, [status, statusFetched])
	
	useEffect(() => {
		fetchLists();
		fetchStatus()
	}, [])
	
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
			<View style={[styles.mangaOverviewContainer]}>
				<View style={{flexDirection: 'column', alignItems: 'center'}}>
					<Image
						source={{ uri: manga?.coverImage?.large }}
						resizeMode="contain"
						style={styles.mangaCoverImage}
					/>
					<View style={{flexDirection: 'row', alignItems: 'center'}}>
						<View>
							<ThemeDropdown
								value={status}
								setValue={setStatus}
								items={[
									{
										value: 'CURRENT',
										label: 'reading'
									},
									{
										value: 'PLANNING',
										label: 'planning'
									},
									{
										value: 'COMPLETED',
										label: 'completed'
									},
									{
										value: 'DROPPED',
										label: 'dropped'
									},
									{
										value: 'PAUSED',
										label: 'paused'
									},
									{
										value: 'REPEATING',
										label: 'rereading'
									},
								]}
								open={statusOpen}
								setOpen={setStatusOpen}
								multiple={false}
								listMode="FLATLIST"
								maxHeight={300}
							/>
						</View>
						<Menu
							visible={optionsVisible}
							onDismiss={() =>{
								setOptionsVisible(false)
							}}
							anchorPosition="bottom"
							anchor={
								<IconButton
									icon={lists.reduce((accumulator, currentValue)=> accumulator || currentValue.isInList, false) ? 'bookmark' : 'bookmark-outline'}
									mode="contained"
									style={{borderRadius: 10}}
									onPress={() => setOptionsVisible(true)}
								/>
							}
						>
							<Menu.Item 
								title={'add to...'} leadingIcon={undefined}
							/>
							{
								lists.map((list, number) => (
									<Menu.Item 
										key={list._id ? `custom_list_${list._id}` : `custom_list_undefined_${number}`}
										onPress={() => toggleList(list._id)} title={list.name}
										leadingIcon={list.isInList ? (list.isFavorite ? "heart" : "bookmark") : (list.isFavorite ? "heart-outline" : "bookmark-outline")}
									/>
								))
							}
							<Menu.Item 
								onPress={() => {setOptionsVisible(false);setCreatingNewList(true);}} title={'new list'} leadingIcon={'plus'}
							/>
						</Menu>
					</View>
				</View>
				<View style={{ flex: 1, marginHorizontal: 10 }}>
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
			<Portal>
				<Modal visible={isCreatingNewList} onDismiss={() => setCreatingNewList(false)}
					contentContainerStyle={{minWidth: 200, minHeight: 200, width: "30%", height: "50%", backgroundColor: theme.colors.background, borderRadius: 10, margin: 'auto', padding: 10, gap: 5}}
				>
					<NewCustomListView mangaIdToAdd={Number(manga?.mangaId)} setAllCustomLists={() => null} onCustomListCreated={async () => setCreatingNewList(false)} />
				</Modal>
			</Portal>
		</View>
	);
}

const styles = StyleSheet.create({
	mangaOverviewContainer: {maxWidth: 1000, width: '100%', flexDirection: 'row'},
	mangaCoverImage: {aspectRatio: 3/4, height: 200, marginHorizontal: 5},
	titleDetailsContainer: { height: 70, flexDirection: 'row', alignItems: 'flex-end'},
	title: {fontWeight: 'bold', alignItems: 'flex-end', textAlignVertical: 'bottom'},
});