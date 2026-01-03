import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
	FlatList,
	Image,
	Pressable,
	StyleSheet,
	View,
	useWindowDimensions,
	ActivityIndicator,
} from 'react-native';
import { Card, IconButton, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import ThemeText from '@/components/ThemeText';
import ThemeSearchbar from '@/components/ThemeSearchbar';
import { searchCategory, PaginatedSearchResult } from '@/services/search.service';
import { getMangaTitle } from '@/types/IManga';
import { addMangaToLibrary } from '@/services/manga.service';

export default function SearchCategoryPage() {
	const theme = useTheme();
	const router = useRouter();
	const { category, query } = useLocalSearchParams();
	const [results, setResults] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [searchQuery, setSearchQuery] = useState(query as string || '');
	const flatListRef = useRef<FlatList>(null);

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

	const handleSearch = useCallback(() => {
		loadResults(1, false);
	}, [loadResults]);

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
			onPress={() => handleNotePress(item.mangaId)}
		>
			<Card.Content style={styles.resultContent}>
				<ThemeText variant="titleSmall" style={styles.noteTitle}>
					Note - Chapter {item.startChapter}{item.endChapter ? `-${item.endChapter}` : ''}
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
				<ThemeText variant="titleSmall">
					{item.name}
				</ThemeText>
				<ThemeText variant="bodySmall" style={styles.listMeta}>
					{item.mangaIds.length} manga{item.isFavorite ? ' • Favorites' : ''}
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
			<Stack.Screen
				options={{
					headerTitle: `${getCategoryTitle()} - "${searchQuery}"`,
					headerTitleStyle: { fontSize: 14 },
				}}
			/>
			<View style={[styles.container, { backgroundColor: theme.colors.background }]}>
				<View style={styles.searchBarContainer}>
					<ThemeSearchbar
						placeholder={`Search ${getCategoryTitle().toLowerCase()}...`}
						onChangeText={setSearchQuery}
						onSubmitEditing={handleSearch}
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
	},
	searchBar: {
		marginVertical: 5,
		height: 50,
		borderRadius: 10,
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
