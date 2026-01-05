import express, { Router, Request, Response } from 'express';
import AuthenticateMiddleware from '../middleware/Authentication';
import { Note } from '../models/note.model';
import { CustomList } from '../models/custom_list.model';
import { anilistRequest } from '../Utility';
import { getMangaInLibrary } from './users';
import { getMangaData } from './anilist';

const router: Router = Router();

router.use(express.json());

// Centralized search endpoint
// GET /search?query=<search_term>
router.get('/', AuthenticateMiddleware, async (req: Request, res: Response) => {
	const userId = req.user?.id;
	const { query } = req.query;
	
	if (!userId)
	{
		return res.status(400).json({ error: 'Invalid query' });
	}

	if (!query || typeof query !== 'string') {
		return res.status(400).json({ error: 'Query parameter is required' });
	}

	try {
		const searchResults = {
			manga: [] as any[],
			notes: [] as any[],
			lists: [] as any[]
		};

		// Search manga from AniList
		const MANGA_SEARCH_QUERY = `
			query ($search: String, $page: Int, $perPage: Int) {
				Page (page: $page, perPage: $perPage) {
					media (search: $search, type: MANGA, sort: TRENDING_DESC) {
						id
						title {
							userPreferred
							english
						}
						coverImage {
							large
						}
					}
				}
			}
		`;

		try {
			const mangaData = await anilistRequest(MANGA_SEARCH_QUERY, {
				search: query,
				page: 1,
				perPage: 2
			}, 3600);
			const mangaIdsInLib = await getMangaInLibrary(userId)

			if (mangaData?.data?.Page?.media) {
				searchResults.manga = mangaData.data.Page.media.map((manga: any) => ({
					...manga,
					inLibrary: mangaIdsInLib.includes(String(manga.id)) ?? false
				}));
			}
		} catch (err) {
			console.error('Error searching manga:', err);
		}

		// Search notes in database
		const notes = await Note.find(
			{
				userId,
				text: { $regex: query, $options: 'i' }
			},
			{ mangaId: 1, text: 1, startChapter: 1, endChapter: 1, createdAt: 1 }
		)
			.limit(2)
			.sort({ createdAt: -1 })
			.lean();

		try {
			const mangaData: any[] = await getMangaData(notes.map((note) => note.mangaId))

			if (notes && notes.length > 0) {
				searchResults.notes = notes.map((note) => ({
					id: note._id,
					manga: {
						_id: note.mangaId,
						title: mangaData.find((manga) => manga.id === note.mangaId).title
					},
					text: (note.text || '').substring(0, 100), // Truncate text for preview
					startChapter: note.startChapter,
					endChapter: note.endChapter,
					createdAt: note.createdAt
				}));
			}
		} catch (err) {
			console.error('Error searching notes:', err);
		}


		// Search custom lists
		const lists = await CustomList.find(
			{
				userId,
				$or: [
					{ name: { $regex: query, $options: 'i' } },
					{ mangaIds: { $in: [] } } // This will be replaced with actual search logic
				]
			},
			{ name: 1, mangaIds: 1, isFavorite: 1 }
		)
			.limit(2)
			.lean();

		if (lists && lists.length > 0) {
			searchResults.lists = lists.map((list) => ({
				id: list._id,
				name: list.name,
				mangaIds: list.mangaIds,
				isFavorite: list.isFavorite
			}));
		}

		res.status(200).json(searchResults);
	} catch (err: any) {
		console.error('Search error:', err);
		return res.status(500).json({ error: err.message || 'Failed to perform search' });
	}
});

// Category-specific search endpoint with pagination
// GET /search/manga?query=<search_term>&page=<page>&pageSize=<pageSize>
// GET /search/notes?query=<search_term>&page=<page>&pageSize=<pageSize>
// GET /search/lists?query=<search_term>&page=<page>&pageSize=<pageSize>
router.get('/:category', AuthenticateMiddleware, async (req: Request, res: Response) => {
	const userId = req.user?.id;
	const { query, page = '1', pageSize = '20' } = req.query;
	const category = req.params.category;

	if (!userId) {
		return res.status(400).json({ error: 'Invalid user' });
	}

	if (!query || typeof query !== 'string') {
		return res.status(400).json({ error: 'Query parameter is required' });
	}

	const pageNum = Math.max(1, parseInt(page as string) || 1);
	const pageSizeNum = Math.min(50, Math.max(1, parseInt(pageSize as string) || 20));
	const skip = (pageNum - 1) * pageSizeNum;

	try {
		let items: any[] = [];
		let total = 0;

		if (category === 'manga') {
			// Search manga from AniList with pagination
			const MANGA_SEARCH_QUERY = `
				query ($search: String, $page: Int, $perPage: Int) {
					Page (page: $page, perPage: $perPage) {
						pageInfo {
							total
							currentPage
							lastPage
							hasNextPage
						}
						media (search: $search, type: MANGA, sort: TRENDING_DESC) {
							id
							title {
								userPreferred
								english
							}
							coverImage {
								large
							}
						}
					}
				}
			`;

			const mangaData = await anilistRequest(MANGA_SEARCH_QUERY, {
				search: query,
				page: pageNum,
				perPage: pageSizeNum
			}, 3600);

			if (mangaData?.data?.Page?.media) {
				const mangaIdsInLib = await getMangaInLibrary(userId);
				items = mangaData.data.Page.media.map((manga: any) => ({
					...manga,
					inLibrary: mangaIdsInLib.includes(String(manga.id)) ?? false
				}));
				total = mangaData.data.Page.pageInfo?.total || 0;
			}
		} else if (category === 'notes') {
			// Search notes with pagination
			total = await Note.countDocuments({
				userId,
				text: { $regex: query, $options: 'i' }
			});

			const notes = await Note.find(
				{
					userId,
					text: { $regex: query, $options: 'i' }
				},
				{ mangaId: 1, text: 1, startChapter: 1, endChapter: 1, createdAt: 1 }
			)
				.skip(skip)
				.limit(pageSizeNum)
				.sort({ createdAt: -1 })
				.lean();

			const mangaData: any[] = await getMangaData(notes.map((note) => note.mangaId))

			items = notes.map((note) => ({
				id: note._id,
				manga: {
					_id: note.mangaId,
					title: mangaData.find((manga) => manga.id === note.mangaId).title
				},
				text: (note.text || '').substring(0, 100),
				startChapter: note.startChapter,
				endChapter: note.endChapter,
				createdAt: note.createdAt
			}));
		} else if (category === 'lists') {
			// Search custom lists with pagination
			total = await CustomList.countDocuments({
				userId,
				name: { $regex: query, $options: 'i' }
			});

			const lists = await CustomList.find(
				{
					userId,
					name: { $regex: query, $options: 'i' }
				},
				{ name: 1, mangaIds: 1, isFavorite: 1 }
			)
				.skip(skip)
				.limit(pageSizeNum)
				.lean();

			items = lists.map((list) => ({
				id: list._id,
				name: list.name,
				mangaIds: list.mangaIds,
				isFavorite: list.isFavorite
			}));
		} else {
			return res.status(400).json({ error: 'Invalid category. Must be manga, notes, or lists' });
		}

		const hasMore = skip + items.length < total;

		res.status(200).json({
			items,
			total,
			page: pageNum,
			pageSize: pageSizeNum,
			hasMore
		});
	} catch (err: any) {
		console.error(`Category search error for ${category}:`, err);
		return res.status(500).json({ error: err.message || `Failed to search ${category}` });
	}
})

export default router;
