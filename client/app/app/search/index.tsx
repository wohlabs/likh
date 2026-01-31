import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
	FlatList,
	Image,
	StyleSheet,
	View,
	ActivityIndicator,
} from 'react-native';
import { Card, IconButton, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import ThemeText from '@/components/ThemeText';
import ThemeSearchbar from '@/components/ThemeSearchbar';
import { searchCategory, PaginatedSearchResult } from '@/services/search.service';
import { getMangaTitle, IMangaDetails } from '@/types/IManga';
import { addMangaToLibrary } from '@/services/manga.service';
import {ThemeDropdown} from "@/components/ThemeDropdown";

export default function SearchCategoryPage() {
	const theme = useTheme();
	const router = useRouter();
	const { category, query } = useLocalSearchParams();
	const [results, setResults] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
	const [page, setPage] = useState<number>(1);
	const [hasMore, setHasMore] = useState<boolean>(true);
	const [searchQuery, setSearchQuery] = useState(query as string || '');
	const flatListRef = useRef<FlatList>(null);
  const [showDropDown, setShowDropDown] = React.useState<boolean>(false);
  const [categoryCB, setCategoryCB] = React.useState<string>(category as string ?? "manga");

	
	const CATEGORY_OPTIONS = [
		{ label: 'manga', value: 'manga' },
		{ label: 'notes', value: 'notes' },
		{ label: 'lists', value: 'lists' },
	];


	const loadResults = useCallback(
		async (pageNum: number = 1, append: boolean = false) => {
			if (!searchQuery.trim() || !category) return;

			const loader = pageNum === 1 ? setIsLoading : setIsLoadingMore;
			loader(true);

			const result = await searchCategory(
				searchQuery,
				category as 'manga' | 'notes' | 'lists',
				pageNum,
				20
			);

			if (result.success) {
				const data = result.data as PaginatedSearchResult;
				if (append) {
					setResults(prev => [...prev, ...data.items]);
				} else {
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

	useEffect(() => {
		if (searchQuery.trim()) {
			loadResults(1, false);
		}
	}, [category]);

	const handleLoadMore = useCallback(() => {
		if (!isLoadingMore && hasMore) {
			loadResults(page + 1, true);
		}
	}, [page, hasMore, isLoadingMore, loadResults]);

	const handleMangaPress = (mangaId: number) => {
		router.navigate(`/app/manga/${mangaId}`);
	};

	const handleNotePress = (mangaId: number) => {
		router.navigate(`/app/manga/${mangaId}`);
	};

	const handleListPress = (listId: string) => {
		router.navigate(`/app/custom-lists/${listId}`);
	};

	const renderMangaResult = ({ item }: { item: any }) => (
		<Card
			style={{ marginHorizontal: 10, marginBottom: 8, backgroundColor: theme.colors.surface }}
			onPress={() => handleMangaPress(item.id)}
		>
			<Card.Content style={[styles.resultContent, { flexDirection: 'row', alignItems: 'center' }]}>
				<Image
					source={{ uri: item.coverImage?.large }}
					style={styles.mangaCover}
					resizeMode="contain"
				/>
				<View style={{ flex: 1 }}>
					<ThemeText variant="titleSmall" numberOfLines={2}>
						{getMangaTitle(item)}
					</ThemeText>
				</View>
				<IconButton
					icon="plus"
					mode="contained"
					disabled={item.inLibrary}
					onPress={async (e) => {
						e.stopPropagation();
						await addMangaToLibrary(item.id);
						setResults(prevResults =>
							prevResults.map(result =>
								result.id === item.id ? { ...result, inLibrary: true } : result
							)
						);
					}}
				/>
			</Card.Content>
		</Card>
	);

	const renderNoteResult = ({ item }: { item: any }) => (
		<Card
			style={{ marginHorizontal: 10, marginBottom: 8, backgroundColor: theme.colors.surface }}
			onPress={() => handleNotePress(item.manga._id)}
		>
			<Card.Content style={styles.resultContent}>
				<ThemeText variant="titleSmall" style={styles.noteTitle}>
					{getMangaTitle(item.manga)} - Chapter {item.startChapter === -1 ? "All" : `${item.startChapter}${item.endChapter ? ` - ${item.endChapter}` : ''}`}
				</ThemeText>
				<ThemeText variant="bodySmall" numberOfLines={2} style={styles.noteText}>
					{item.text}
				</ThemeText>
			</Card.Content>
		</Card>
	);

	const renderListResult = ({ item }: { item: any }) => (
		<Card
			style={{ marginHorizontal: 10, marginBottom: 8, backgroundColor: theme.colors.surface }}
			onPress={() => handleListPress(item.id)}
		>
			<Card.Content style={styles.resultContent}>
				<View style={{flexDirection: 'row', alignContent: 'center'}}>
					<ThemeText variant="titleSmall">
						{item.name}
					</ThemeText>
					<ThemeText variant="titleSmall" style={{opacity: 0.6}}>
						&nbsp;• {item.manga.length} manga
					</ThemeText>
				</View>
			</Card.Content>
			<Card.Content style={styles.listMeta}>
				<ThemeText variant="titleSmall">
				{
					item.manga?.map((mangaItem: IMangaDetails, index: number) =>(
							getMangaTitle(mangaItem) + (index === item.manga.length - 1 ? "" : " • ")
					))
				}
				</ThemeText>
			</Card.Content>
		</Card>
	);

	const renderItem = ({ item }: { item: any }) => {
		if (category === 'manga') {
			return renderMangaResult({ item });
		}
		if (category === 'notes') {
			return renderNoteResult({ item });
		}
		if (category === 'lists') {
			return renderListResult({ item });
		}
		return null;
	};

	const getCategoryTitle = () => {
		const titles: Record<string, string> = {
			manga: 'Manga',
			notes: 'Notes',
			lists: 'Lists'
		};
		return titles[category as string] || 'Results';
	};

	return (
		<>
			<View style={[styles.container, { backgroundColor: theme.colors.background }]}>
				<View style={styles.searchBarContainer}>
					<ThemeDropdown
						label="category"
						value={categoryCB}
						items={CATEGORY_OPTIONS}
						onChange={(cat: string) => {
							setCategoryCB(cat)
							router.replace({ 
								pathname: '/app/search',
								params: { category: cat, query: searchQuery }
							})
						}}
						mode='flat'
					/>
					<ThemeSearchbar
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
						<ActivityIndicator size="large" color={theme.colors.primary} />
					</View>
				) : results.length === 0 ? (
					<View style={styles.emptyContainer}>
						<ThemeText variant="bodyMedium" style={styles.emptyText}>
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
									<ActivityIndicator size="small" color={theme.colors.primary} />
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
