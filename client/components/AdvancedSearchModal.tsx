import React, { useCallback, useRef, useState } from 'react';
import {
	FlatList,
	Image,
	Pressable,
	StyleProp,
	StyleSheet,
	TextInput,
	View,
	ViewStyle,
	useWindowDimensions,
} from 'react-native';
import { Card, IconButton, useTheme } from 'react-native-paper';
import ThemeText from '@/components/ThemeText';
import ThemeSearchbar from '@/components/ThemeSearchbar';
import { performAdvancedSearch, SearchResult } from '@/services/search.service';
import { useRouter } from 'expo-router';
import { getMangaTitle } from '@/types/IManga';
import { addMangaToLibrary } from '@/services/manga.service';
import { hexToRgba } from './util';
import { modernDarkTheme } from '@/theme/modernTheme';

interface AdvancedSearchModalProps {
	visible: boolean;
	onDismiss: () => void;
	style?: StyleProp<ViewStyle>
	onMangaAdded: () => void;
}

export default function AdvancedSearchModal({ visible, onDismiss, style, onMangaAdded }: AdvancedSearchModalProps) {
	const theme = useTheme();
	const router = useRouter();
	const { width, height } = useWindowDimensions();
	const [searchQuery, setSearchQuery] = useState('');
	const [isAdvancedSearching, setIsAdvancedSearching] = useState<boolean>(false);
	const [searchResults, setSearchResults] = useState<SearchResult>({
		manga: [],
		notes: [],
		lists: []
	});
	const [isLoading, setIsLoading] = useState(false);
	const searchRef = useRef<TextInput>(null);
	const isSubmittingRef = useRef<boolean>(false);

	const handleSearch = useCallback(async () => {
		if (!searchQuery.trim()) {
			setSearchResults({ manga: [], notes: [], lists: [] });
			return;
		}

		setIsLoading(true);
		const result = await performAdvancedSearch(searchQuery);
		if (result.success) {
			setSearchResults(result.data);
		}
		setIsLoading(false);
	}, [searchQuery]);

	const handleMangaPress = (mangaId: number) => {
		console.log("press manga")
		onDismiss();
		router.navigate(`/app/manga/${mangaId}`);
	};

	const handleNotePress = (mangaId: number) => {
		console.log("press note")
		onDismiss();
		router.navigate(`/app/manga/${mangaId}`);
	};

	const handleListPress = (listId: string) => {
		console.log("press list")
		onDismiss();
		router.navigate(`/app/custom-lists/${listId}`);
	};

	const handleShowMore = (category: 'manga' | 'notes' | 'lists') => {
		onDismiss();
		router.navigate({
			pathname: '/app/search',
			params: { category: category, query: searchQuery }
		});
	};

	const renderMangaResult = ({ item }: { item: any }) => (
		<Card
			style={{ marginHorizontal: 10, marginBottom: 8, backgroundColor: theme.colors.surface }}
			onPress={() => handleMangaPress(item.id)}
		>
			<Card.Content style={[styles.resultContent, {flexDirection: 'row', alignItems: 'center'}]}>
				<Image
					source={{ uri: item.coverImage?.large }}
					style={styles.mangaCover}
					resizeMode="contain"
				/>
				<View style={{flex: 1}}>
					<ThemeText variant="titleSmall" numberOfLines={2}>
						{getMangaTitle(item)}
					</ThemeText>
				</View>
				<IconButton
					icon={"plus"}
					mode="contained"
					disabled={item.inLibrary}
					onPress={async (e) => {
						setIsAdvancedSearching(true)
						await addMangaToLibrary(item.id);
						onMangaAdded();
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
				<ThemeText variant="titleSmall">
					{item.name}
				</ThemeText>
				<ThemeText variant="bodySmall" style={styles.listMeta}>
					{item.mangaIds.length} manga{item.isFavorite ? ' • Favorites' : ''}
				</ThemeText>
			</Card.Content>
		</Card>
	);

	return (
		<Pressable
			style={{width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, backgroundColor: isAdvancedSearching ? hexToRgba(modernDarkTheme.colors.background, 0.6) : 'transparent'}}
			onPress={() => setIsAdvancedSearching(false)}
			pointerEvents={isAdvancedSearching ? 'auto' : 'none'}
		>
			<Pressable style={[styles.searchBarFloating]} onPress={(e) => e.stopPropagation()} pointerEvents='none'>
				<View
					style={[
						styles.container,
						{ backgroundColor: theme.colors.background, maxHeight: 0.7 * height, marginHorizontal: 10, display: isAdvancedSearching ? 'flex' : 'none' },
					]}
					pointerEvents={isAdvancedSearching ? 'auto' : 'none'}
				>

					{searchQuery.trim() === '' ? (
						<></>
					) : searchResults.manga.length === 0 && searchResults.notes.length === 0 && searchResults.lists.length === 0 ? (
						<View style={styles.emptyContainer}>
							<ThemeText variant="bodyMedium" style={styles.emptyText}>
								No results found
							</ThemeText>
						</View>
					) : (
						<FlatList
							data={[
								...(searchResults.manga.length > 0 ? [{ type: 'manga-header', label: 'Manga' } as any] : []),
								...searchResults.manga.map((m, idx) => ({ type: 'manga', data: m, key: `manga-${idx}` } as any)),
								...(searchResults.manga.length > 0 ? [{ type: 'manga-show-more' } as any] : []),
								...(searchResults.notes.length > 0 ? [{ type: 'notes-header', label: 'Notes' } as any] : []),
								...searchResults.notes.map((n, idx) => ({ type: 'note', data: n, key: `note-${idx}` } as any)),
								...(searchResults.notes.length > 0 ? [{ type: 'notes-show-more' } as any] : []),
								...(searchResults.lists.length > 0 ? [{ type: 'lists-header', label: 'Lists' } as any] : []),
								...searchResults.lists.map((l, idx) => ({ type: 'list', data: l, key: `list-${idx}` } as any)),
								...(searchResults.lists.length > 0 ? [{ type: 'lists-show-more' } as any] : [])
							]}
							keyExtractor={(item: any, idx) => item.key || `${item.type}-${idx}`}
							renderItem={({ item }: { item: any }) => {
								if (item.type === 'manga-header' || item.type === 'notes-header' || item.type === 'lists-header') {
									return (
										<View style={[{cursor: 'auto'}]}>
											<ThemeText variant="labelLarge" style={styles.categoryLabel}>
												{item.label}
											</ThemeText>
											<View style={styles.categoryDivider} />
										</View>
									);
								}

								if (item.type === 'manga-show-more' || item.type === 'notes-show-more' || item.type === 'lists-show-more') {
									const categoryMap = {
										'manga-show-more': 'manga' as const,
										'notes-show-more': 'notes' as const,
										'lists-show-more': 'lists' as const
									};
									return (
										<Pressable
											style={({ pressed }) => [
												styles.showMoreButton,
												{ 
													backgroundColor: pressed ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
													opacity: pressed ? 0.8 : 1
												}
											]}
											onPress={() => handleShowMore(categoryMap[item.type as keyof typeof categoryMap])}
										>
											<ThemeText variant="labelLarge" style={{ textAlign: 'center', color: theme.colors.primary }}>
												Show more
											</ThemeText>
										</Pressable>
									);
								}
								
								if (item.type === 'manga') {
									return renderMangaResult({ item: item.data });
								}
								if (item.type === 'note') {
									return renderNoteResult({ item: item.data });
								}
								if (item.type === 'list') {
									return renderListResult({ item: item.data });
								}
								return null;
							}}
							scrollEnabled={true}
						/>
					)}
				</View>
				<ThemeSearchbar
					ref={searchRef}
					key="library_search_bar"
					placeholder="Search manga, notes, lists..."
					onChangeText={setSearchQuery}
					onSubmitEditing={() =>  {
						handleSearch()
					}}
					onFocus={() => {
						setIsAdvancedSearching(true)
					}}
					style={styles.searchBar}
					value={searchQuery}
					loading={isLoading}
				/>
			</Pressable>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	container: {
		borderRadius: 12,
		// flexDirection: 'column',
		flex: 1,
		width: '100%'
	},
	searchBarFloating: {
		width: "50%", minWidth: 350, position: "absolute", bottom: 25, flexDirection: "column", alignItems: "center", justifyContent: 'center', pointerEvents: 'none', alignContent: 'center', alignSelf: 'center'
	},
	searchBar: {marginHorizontal: 10, marginVertical: 5, height: 60, borderRadius: 10, flex: 1, boxShadow: "0px 4px 5px rgba(0,0,0,0.3)", width: '100%' },
	header: {
		padding: 12,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(0, 0, 0, 0.1)'
	},
	searchInput: {
		borderRadius: 8,
		margin: 0
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	emptyContainer: {
		// justifyContent: 'center',
		// alignItems: 'center',
		padding: 10
	},
	emptyText: {
		opacity: 0.6,
	},
	categorySection: {
		marginTop: 8
	},
	categoryLabel: {
		paddingHorizontal: 16,
		paddingTop: 12,
		paddingBottom: 8,
		opacity: 0.7
	},
	categoryDivider: {
		height: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.1)',
		marginHorizontal: 16,
		marginBottom: 8
	},
	resultItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 12,
		marginHorizontal: 8,
		marginBottom: 8,
		borderRadius: 8,
		pointerEvents: 'auto'
	},
	mangaCover: {
		width: 40,
		height: 60,
		marginRight: 12,
		borderRadius: 4
	},
	resultContent: {
		flex: 1,
		justifyContent: 'center'
	},
	noteTitle: {
		marginBottom: 4,
		opacity: 0.8
	},
	noteText: {
		opacity: 0.6
	},
	listMeta: {
		marginTop: 4,
		opacity: 0.6
	},
	showMoreButton: {
		marginHorizontal: 10,
		marginVertical: 8,
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderRadius: 8,
		justifyContent: 'center',
		alignItems: 'center'
	}
});
