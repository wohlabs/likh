import React, { useCallback, useState } from 'react';
import {
	FlatList,
	Image,
	Pressable,
	StyleSheet,
	View,
	useWindowDimensions,
} from 'react-native';
import { IconButton, Modal, Portal, useTheme } from 'react-native-paper';
import ThemeText from '@/components/ThemeText';
import ThemeSearchbar from '@/components/ThemeSearchbar';
import { performAdvancedSearch, SearchResult } from '@/services/search.service';
import { useRouter } from 'expo-router';
import { getMangaTitle } from '@/types/IManga';

interface AdvancedSearchModalProps {
	visible: boolean;
	onDismiss: () => void;
}

export default function AdvancedSearchModal({ visible, onDismiss }: AdvancedSearchModalProps) {
	const theme = useTheme();
	const router = useRouter();
	const { width } = useWindowDimensions();
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState<SearchResult>({
		manga: [],
		notes: [],
		lists: []
	});
	const [isLoading, setIsLoading] = useState(false);

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
		onDismiss();
		router.navigate(`/app/manga/${mangaId}`);
	};

	const handleNotePress = (mangaId: number) => {
		onDismiss();
		router.navigate(`/app/manga/${mangaId}`);
	};

	const handleListPress = (listId: string) => {
		onDismiss();
		router.navigate(`/app/custom-lists/${listId}`);
	};

	const renderMangaResult = ({ item }: { item: any }) => (
		<Pressable
			style={[styles.resultItem, { backgroundColor: theme.colors.surfaceVariant }]}
			onPress={() => handleMangaPress(item.id)}
		>
			<Image
				source={{ uri: item.coverImage?.large }}
				style={styles.mangaCover}
				resizeMode="contain"
			/>
			<View style={styles.resultContent}>
				<ThemeText variant="titleSmall" numberOfLines={2}>
					{getMangaTitle(item)}
				</ThemeText>
			</View>
			<IconButton icon="chevron-right" size={24} />
		</Pressable>
	);

	const renderNoteResult = ({ item }: { item: any }) => (
		<Pressable
			style={[styles.resultItem, { backgroundColor: theme.colors.surface }]}
			onPress={() => handleNotePress(item.mangaId)}
		>
			<View style={styles.resultContent}>
				<ThemeText variant="titleSmall" style={styles.noteTitle}>
					Note - Chapter {item.startChapter}{item.endChapter ? `-${item.endChapter}` : ''}
				</ThemeText>
				<ThemeText variant="bodySmall" numberOfLines={2} style={styles.noteText}>
					{item.text}
				</ThemeText>
			</View>
			<IconButton icon="chevron-right" size={24} />
		</Pressable>
	);

	const renderListResult = ({ item }: { item: any }) => (
		<Pressable
			style={[styles.resultItem, { backgroundColor: theme.colors.surfaceVariant }]}
			onPress={() => handleListPress(item.id)}
		>
			<View style={styles.resultContent}>
				<ThemeText variant="titleSmall">
					{item.name}
				</ThemeText>
				<ThemeText variant="bodySmall" style={styles.listMeta}>
					{item.mangaIds.length} manga{item.isFavorite ? ' • Favorites' : ''}
				</ThemeText>
			</View>
			<IconButton icon="chevron-right" size={24} />
		</Pressable>
	);

	return (
			<Modal
				visible={visible}
				onDismiss={onDismiss}
				contentContainerStyle={[
					styles.container,
					{ backgroundColor: theme.colors.background }
				]}
			>
				<View style={styles.header}>
					<ThemeSearchbar
						placeholder="Search manga, notes, lists..."
						value={searchQuery}
						onChangeText={setSearchQuery}
						onSubmitEditing={handleSearch}
						style={styles.searchInput}
					/>
				</View>

				{isLoading ? (
					<View style={styles.loadingContainer}>
						<ThemeText>Searching...</ThemeText>
					</View>
				) : searchQuery.trim() === '' ? (
					<View style={styles.emptyContainer}>
						<ThemeText variant="bodyMedium" style={styles.emptyText}>
							Start typing to search
						</ThemeText>
					</View>
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
							...(searchResults.notes.length > 0 ? [{ type: 'notes-header', label: 'Notes' } as any] : []),
							...searchResults.notes.map((n, idx) => ({ type: 'note', data: n, key: `note-${idx}` } as any)),
							...(searchResults.lists.length > 0 ? [{ type: 'lists-header', label: 'Lists' } as any] : []),
							...searchResults.lists.map((l, idx) => ({ type: 'list', data: l, key: `list-${idx}` } as any))
						]}
						keyExtractor={(item: any, idx) => item.key || `${item.type}-${idx}`}
						renderItem={({ item }: { item: any }) => {
							if (item.type === 'manga-header' || item.type === 'notes-header' || item.type === 'lists-header') {
								return (
									<View style={styles.categoryHeader}>
										<ThemeText variant="labelLarge" style={styles.categoryLabel}>
											{item.label}
										</ThemeText>
										<View style={styles.categoryDivider} />
									</View>
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
			</Modal>
	);
}

const styles = StyleSheet.create({
	container: {
		margin: 'auto',
		width: '95%',
		maxWidth: 600,
		height: '85%',
		borderRadius: 12,
		overflow: 'hidden',
		flexDirection: 'column'
	},
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
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	emptyText: {
		opacity: 0.6
	},
	categoryHeader: {
		marginTop: 8,
		marginBottom: 8
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
		borderRadius: 8
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
	}
});
