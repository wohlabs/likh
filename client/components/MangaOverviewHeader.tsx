import ReadMore from '@/components/ReadMore';
import { ThemeMenu, ThemeMenuItem } from "@/components/ThemeMenu";
import { addToCustomList, getCustomLists } from "@/services/custom_lists";
import { getMangaStatus, updateMangaStatus } from "@/services/media_entry.service";
import { ICustomList, ICustomLists, MangaItem } from "@/types/ICustomList";
import { getMangaTitle, IMangaDetails } from "@/types/IManga";
import { useCallback, useEffect, useState } from "react";
import { GestureResponderEvent, Image, StyleProp, StyleSheet, View, ViewStyle, ActivityIndicator } from "react-native";
import { Modal, Portal } from "react-native-paper";
import Toast from "react-native-toast-message";
import NewCustomListView from "./NewCustomListView";
import ThemeButton from "./ThemeButton";
import { ThemeDropdown } from "./ThemeDropdown";
import ThemeText from "./ThemeText";
import { usePersistentTheme } from '@/context/usePersistentTheme';
import { Ionicons } from '@expo/vector-icons';


export default function MangaOverviewHeader({ style, manga } : { style?: StyleProp<ViewStyle>, manga?: IMangaDetails })
{
	const { theme } = usePersistentTheme()
	const [optionsVisible, setOptionsVisible] = useState(false)
	const [isCreatingNewList, setCreatingNewList] = useState(false)
	const [lists, setLists] = useState<(ICustomList & {isInList: boolean})[]>([])
	const [status, setStatus] = useState<string>("")
	const [statusOpen, setStatusOpen] = useState<boolean>(false)
	const [loading, setLoading] = useState<boolean>(true)

	
	const addIsInListData = useCallback((lists: ICustomLists) => 
	{
		return lists.map((list: any) => 
		{
			const isInList = list.manga.some((mangaItem: MangaItem) => mangaItem.mangaId == manga?.mangaId)
			list['isInList'] = isInList
			return list;
		})
	}, [manga?.mangaId])
	
	const fetchLists = useCallback(async () => 
	{
		if (manga?.mangaId)
		{
			const result = await getCustomLists();
			if (result.success)
			{
				const listsWithIsInListData = addIsInListData(result.data)
				setLists(listsWithIsInListData)
			}
		}
	}, [addIsInListData, manga?.mangaId])

	const fetchStatus = useCallback(async () => 
	{
		if (manga?.mangaId)
		{
			const result = await getMangaStatus(manga.mangaId.toString());
			if (result.success && result.data != null)
			{
				setStatus(result.data.status)
			}
		}
		setLoading(false)
	}, [manga?.mangaId])

	const handleStatusChange: React.Dispatch<React.SetStateAction<string>> = async (action) => 
	{
		let value = "";
		setStatus(prev => 
		{
			const next = typeof action === 'function' ? (action as (prev: string) => string)(prev) : action;
			value = next;
			return next;
		});

		if (!manga?.mangaId) return;
		const newStatus = value ?? '';
		const result = await updateMangaStatus(manga.mangaId.toString(), newStatus, undefined);
		if (!result.success)
		{
			Toast.show({ type: 'error', text1: 'Could not update manga status' });
		}
		else
		{
			setStatus(newStatus);
		}
	};

	const handleCreateEntry = async () => 
	{
		if (!manga?.mangaId) return;
		const result = await updateMangaStatus(manga.mangaId.toString(), 'PLANNING', undefined);
		if (result.success && result.data)
		{
			setStatus(result.data.status || 'PLANNING');
		}
		else
		{
			Toast.show({ type: 'error', text1: 'Could not add to library' });
		}
	};

	const toggleList = async (listId: string) => 
	{
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
	
	useEffect(() => 
	{
		fetchLists();
		fetchStatus()
	}, [fetchLists, fetchStatus])
	
	const _renderTruncatedFooter = (handlePress : (event: GestureResponderEvent) => void) => 
	{
		return (
			<ThemeText style={{color: theme['--color-primary']}} onPress={handlePress}>
				Read more
			</ThemeText>
		);
	}

	const _renderRevealedFooter = (handlePress : (event: GestureResponderEvent) => void) => 
	{
		return (
			<ThemeText style={{color: theme['--color-primary']}} onPress={handlePress}>
				Show less
			</ThemeText>
		);
	}
	
	function htmlToPlainText(html: string) 
	{
		return html
			// normalize line endings
			.replace(/\r\n/g, "\n")
			// <br> → newline
			.replace(/<br\s*\/?>/gi, "\n")
			// block tags → newline
			.replace(/<\/(p|div|h[1-6]|li|tr)>/gi, "\n")
			// remove all remaining tags
			.replace(/<[^>]+>/g, "")
			// decode entities
			.replace(/&nbsp;/gi, " ")
			.replace(/&amp;/gi, "&")
			.replace(/&lt;/gi, "<")
			.replace(/&gt;/gi, ">")
			.replace(/&quot;/gi, '"')
			.replace(/&#39;/gi, "'")
			.replace(/\n\s*\n+/g, "\n\n")
			// remove trailing spaces
			.replace(/[ \t]+\n/g, "\n")
			.trimEnd();
	}

	return (
		<View style={style}>
			{
				loading
					?
					<ActivityIndicator style={[styles.mangaOverviewContainer, {height: 200}]} />
					:
					<View style={[styles.mangaOverviewContainer]}>
						<View style={{flexDirection: 'column', alignItems: 'center'}}>
							<Image
								source={{ uri: manga?.coverImage?.large }}
								resizeMode="contain"
								style={styles.mangaCoverImage}
							/>
							<View style={{flexDirection: 'row', alignItems: 'center'}}>
								{
									!status ? 
										<ThemeButton mode="contained" onPress={handleCreateEntry} style={{minWidth:150, marginTop:6}}>
											add to library
										</ThemeButton>
										:
										<>
											<View>
												<ThemeDropdown
													value={status}
													setValue={handleStatusChange}
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
													style={{minWidth: 100}}
													className="shadow-sm rounded-lg"
												/>
											</View>
											<ThemeMenu
												visible={optionsVisible}
												onDismiss={() =>
												{
													setOptionsVisible(false)
												}}
												anchorPosition="bottom"
												anchor={
													<Ionicons
														size={22}
														name={lists.reduce((accumulator, currentValue)=> accumulator || currentValue.isInList, false) ? 'bookmark' : 'bookmark-outline'}
														className='icon-button-contained shadow-sm'
														style={{borderRadius: 8, width: 50, height: 50, justifyContent: 'center', alignItems: 'center', alignContent: 'center', textAlign: 'center'}}
														onPress={() => setOptionsVisible(true)}
													/>
												}
											>
												<ThemeMenuItem 
													title={'add to...'} leadingIcon={undefined}
												/>
												{
													lists.map((list, number) => (
														<ThemeMenuItem 
															key={list._id ? `custom_list_${list._id}` : `custom_list_undefined_${number}`}
															onPress={() => toggleList(list._id)} title={list.name}
															leadingIcon={list.isInList ? (list.isFavorite ? "heart" : "bookmark") : (list.isFavorite ? "heart-outline" : "bookmark-outline")}
														/>
													))
												}
												<ThemeMenuItem 
													onPress={() => {setOptionsVisible(false);setCreatingNewList(true);}} title={'new list'} leadingIcon={'plus'}
												/>
											</ThemeMenu>
										</>
								}					
							</View>
						</View>
						<View style={{ flex: 1, marginHorizontal: 10 }}>
							<View style={styles.titleDetailsContainer}>
								<ThemeText style={styles.title}>{getMangaTitle(manga)}</ThemeText>
							</View>
							<ReadMore
								numberOfLines={5}
								renderTruncatedFooter={_renderTruncatedFooter}
								renderRevealedFooter={_renderRevealedFooter}
								onReady={() => {}}
							>
								<ThemeText>
									{
										htmlToPlainText(manga?.description || "")
									}
								</ThemeText>
							</ReadMore>
						</View>
					</View>
			}
			<Portal>
				<Modal visible={isCreatingNewList} onDismiss={() => setCreatingNewList(false)}
					contentContainerStyle={{minWidth: 200, minHeight: 200, width: "30%", height: "50%", backgroundColor: theme['--color-background'], borderRadius: 10, margin: 'auto', padding: 10, gap: 5}}
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