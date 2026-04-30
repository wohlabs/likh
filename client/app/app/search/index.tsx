import { ThemeDropdown } from "@/components/ThemeDropdown";
import ThemeSearchbar from '@/components/ThemeSearchbar';
import ThemeText from '@/components/ThemeText';
import { usePersistentTheme } from "@/context/usePersistentTheme";
import { addMangaToLibrary } from '@/services/manga.service';
import { PaginatedSearchResult, searchCategory } from '@/services/search.service';
import { getMangaTitle, IMangaDetails } from '@/types/IManga';
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import
{
	ActivityIndicator,
	FlatList,
	Image,
	Pressable,
	StyleSheet,
	View,
} from 'react-native';

export default function SearchCategoryPage() 
{
	const { theme } = usePersistentTheme();
	const router = useRouter();
	const { category, query } = useLocalSearchParams();
	const [results, setResults] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
	const [page, setPage] = useState<number>(1);
	const [hasMore, setHasMore] = useState<boolean>(true);
	const [searchQuery, setSearchQuery] = useState(query as string || '');
	const flatListRef = useRef<FlatList>(null);
	const [categoryOpen, setCatergoryOpen] = React.useState<boolean>(false);
	const [categoryCB, setCategoryCB] = React.useState<string>(category as string ?? "manga");
	
	const onCategoryChange: React.Dispatch<React.SetStateAction<string>> = (action) => 
	{
		let nextValue = "";
		setCategoryCB(prev => 
		{
			const next = typeof action === 'function' ? (action as (prev: string) => string)(prev) : action;
			nextValue = next;
			return next;
		});
		router.replace({ 
			pathname: '/app/search',
			params: { category: nextValue, query: searchQuery }
		})
	};

	
	const CATEGORY_OPTIONS = [
		{ label: 'manga', value: 'manga' },
		{ label: 'notes', value: 'notes' },
		{ label: 'lists', value: 'lists' },
	];


	const loadResults = useCallback(
		async (pageNum: number = 1, append: boolean = false) => 
		{
			if (!searchQuery.trim() || !category) return;

			const loader = pageNum === 1 ? setIsLoading : setIsLoadingMore;
			loader(true);

			const result = await searchCategory(
				searchQuery,
				category as 'manga' | 'notes' | 'lists',
				pageNum,
				20
			);

			if (result.success) 
			{
				const data = result.data as PaginatedSearchResult;
				if (append) 
				{
					setResults(prev => [...prev, ...data.items]);
				}
				else 
				{
					setResults(data.items);
					setPage(1);
				}
				setHasMore(data.hasMore);
				setPage(pageNum);
			}

			loader(false);
		},
		[searchQuery, category]
	);

	useEffect(() => 
	{
		if (searchQuery.trim()) 
		{
			loadResults(1, false);
		}
	}, [category, loadResults, searchQuery]);

	const handleLoadMore = useCallback(() => 
	{
		if (!isLoadingMore && hasMore) 
		{
			loadResults(page + 1, true);
		}
	}, [page, hasMore, isLoadingMore, loadResults]);

	const handleMangaPress = (mangaId: number) => 
	{
		router.navigate(`/app/manga/${mangaId}`);
	};

	const handleNotePress = (mangaId: number) => 
	{
		router.navigate(`/app/manga/${mangaId}`);
	};

	const handleListPress = (listId: string) => 
	{
		router.navigate(`/app/custom-lists/${listId}`);
	};

	const renderMangaResult = ({ item }: { item: any }) => (
		<Pressable
			className="flex-1 justify-center flex-row items-center p-4 mx-2.5 mb-2 bg-surface rounded-xl"
			onPress={() => handleMangaPress(item.id)}
		>
			<Image
				source={{ uri: item.coverImage?.large }}
				style={styles.mangaCover}
				resizeMode="contain"
			/>
			<View style={{ flex: 1 }}>
				<ThemeText numberOfLines={2}>
					{getMangaTitle(item)}
				</ThemeText>
			</View>
			<Ionicons
				name="add"
				size={24}
				className={`icon-button-contained ${item.inLibrary ? 'bg-disabledBackground' : 'bg-surfaceVariant'}`}
				disabled={item.inLibrary}
				color={item.inLibrary ? theme["--color-onDisabledBackground"] : theme["--color-primary"]}
				onPress={async (e) => 
				{
					e.stopPropagation();
					await addMangaToLibrary(item.id);
					setResults(prevResults =>
						prevResults.map(result =>
							result.id === item.id ? { ...result, inLibrary: true } : result
						)
					);
				}}
			/>
		</Pressable>
	);

	const renderNoteResult = ({ item }: { item: any }) => (
		<Pressable
			className="flex-1 justify-center p-4 mx-2.5 mb-2 bg-surface rounded-xl"
			onPress={() => handleNotePress(item.manga._id)}
		>
			<ThemeText className="font-medium" style={styles.noteTitle}>
				{getMangaTitle(item.manga)} - Chapter {item.startChapter === -1 ? "All" : `${item.startChapter}${item.endChapter ? ` - ${item.endChapter}` : ''}`}
			</ThemeText>
			<ThemeText numberOfLines={2} style={styles.noteText}>
				{item.text}
			</ThemeText>
		</Pressable>
	);

	const renderListResult = ({ item }: { item: any }) => (
		<Pressable
			className="flex-1 justify-center p-4 mx-2.5 mb-2 bg-surface rounded-xl"
			onPress={() => handleListPress(item.id)}
		>
			<View className="flex-row">
				<ThemeText>
					{item.name}
				</ThemeText>
				<ThemeText className="opacity-60">
					&nbsp;• {item.manga.length} manga
				</ThemeText>
			</View>
			<ThemeText className="mt-1 opacity-60">
				{
					item.manga?.map((mangaItem: IMangaDetails, index: number) =>(
						getMangaTitle(mangaItem) + (index === item.manga.length - 1 ? "" : " • ")
					))
				}
			</ThemeText>
		</Pressable>
	);

	const renderItem = ({ item }: { item: any }) => 
	{
		if (category === 'manga') 
		{
			return renderMangaResult({ item });
		}
		if (category === 'notes') 
		{
			return renderNoteResult({ item });
		}
		if (category === 'lists') 
		{
			return renderListResult({ item });
		}
		return null;
	};

	const getCategoryTitle = () => 
	{
		const titles: Record<string, string> = {
			manga: 'Manga',
			notes: 'Notes',
			lists: 'Lists'
		};
		return titles[category as string] || 'Results';
	};

	return (
		<>
			<View className="flex-1 bg-background pb-2.5">
				<View className="gap-1" style={[styles.searchBarContainer, {zIndex: 2}]}>
					<View style={{height: '100%'}}>
						<ThemeDropdown
							value={categoryCB}
							items={CATEGORY_OPTIONS}
							multiple={false}
							setValue={onCategoryChange}
							open={categoryOpen}
							setOpen={setCatergoryOpen}
							height={"100%"}
						/>
					</View>
					<ThemeSearchbar
						className="flex-1 shadow-md"
						placeholder={`Search ${getCategoryTitle().toLowerCase()}...`}
						onChangeText={setSearchQuery}
						onSubmitEditing={() => router.replace({ 
							pathname: '/app/search',
							params: { category: categoryCB, query: searchQuery }
						 })}
						value={searchQuery}
						loading={isLoading}
						style={styles.searchBar}
					/>
				</View>

				{isLoading && results.length === 0 ? (
					<View style={styles.loaderContainer}>
						<ActivityIndicator size="large" color={theme['--color-primary']} />
					</View>
				) : results.length === 0 ? (
					<View style={styles.emptyContainer}>
						<ThemeText style={styles.emptyText}>
							No results found
						</ThemeText>
					</View>
				) : (
					<FlatList
						ref={flatListRef}
						data={results}
						renderItem={renderItem}
						keyExtractor={(item: any, idx) => `${item.id}-${idx}`}
						onEndReached={handleLoadMore}
						onEndReachedThreshold={0.5}
						ListFooterComponent={
							isLoadingMore ? (
								<View style={styles.footerLoader}>
									<ActivityIndicator size="small" color={theme['--color-primary']} />
								</View>
							) : null
						}
						scrollEnabled={true}
					/>
				)}
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingBottom: 10,
	},
	searchBarContainer: {
		paddingHorizontal: 10,
		paddingTop: 10,
		paddingBottom: 5,
		flexDirection: 'row',
		alignItems: 'center',
		alignContent: 'center',
		verticalAlign: 'middle'
	},
	searchBar: {
		borderRadius: 10,
		flex: 1,
		marginHorizontal: 5
	},
	loaderContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	emptyText: {
		opacity: 0.6,
		textAlign: 'center',
	},
	footerLoader: {
		paddingVertical: 20,
		alignItems: 'center',
	},
	resultContent: {
		flex: 1,
		justifyContent: 'center',
	},
	mangaCover: {
		width: 40,
		height: 60,
		marginRight: 12,
		borderRadius: 4,
	},
	noteTitle: {
		marginBottom: 4,
		opacity: 0.8,
	},
	noteText: {
		opacity: 0.6,
	},
	listMeta: {
		marginTop: 4,
		opacity: 0.6,
	},
});
