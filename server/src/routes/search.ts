import express, { Router, Request, Response } from 'express';
import AuthenticateMiddleware from '../middleware/Authentication';
import { Note } from '../models/note.model';
import { CustomList, ICustomList, MangaItem } from '../models/custom_list.model';
import { anilistRequest } from '../Utility';
import { getMangaInLibrary } from './users';
import { getMangaData } from './anilist';

const router: Router = Router();

router.use(express.json());

// CAUTION: have not implemented limit passed 50 for anilist
const searchLists = async (userId: string, query: string, limit: number = 50, page: number = 1) =>
{
	let results: any[] = [];

	// Search manga from AniList
	const MANGA_SEARCH_QUERY = `
		query ($search: String, $page: Int, $perPage: Int) {
			Page (page: $page, perPage: $perPage) {
				media (search: $search, type: MANGA) {
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
	const matchingMangaIds = (await anilistRequest(MANGA_SEARCH_QUERY, {
		search: query,
		page: 1,
		perPage: 50
	}, 3600))?.data?.Page?.media?.map((manga: any) => manga.id);

	// Search custom lists with pagination
	const total = await CustomList.countDocuments({
		userId,
		$or: [
			{ name: { $regex: query, $options: 'i' } },
			{ 'manga.mangaId': { $in: matchingMangaIds } }
		]
	});
	// Search custom lists
	const lists = await CustomList.find(
		{
			userId,
			$or: [
				{ name: { $regex: query, $options: 'i' } },
				{ 'manga.mangaId': { $in: matchingMangaIds } }
			]
		},
	)
		.skip(Math.max(0, limit * (page - 1)))
		.limit(limit)
		.lean();

	if (lists && lists.length > 0)
	{
		// Fetch manga data for all mangaIds present in the returned lists
		const allMangaIds = Array.from(new Set(lists.flatMap((l: ICustomList) => l.manga))).map((manga: MangaItem) => manga.mangaId);
		let allMangaData: any[] = [];
		try {
			if (allMangaIds.length > 0) {
				allMangaData = await getMangaData(allMangaIds);
			}
		} catch (err) {
			console.error('Error fetching manga data for lists:', err);
		}

		results = lists.map((list) => ({
			id: list._id,
			name: list.name,
			manga: (list.manga || []).map((item: MangaItem) => {
				const md = allMangaData.find((m) => m.id === item.mangaId);
				return {
					id: item.mangaId,
					title: md?.title || { userPreferred: null, english: null }
				};
			}),
			isFavorite: list.isFavorite
		}));
	}

	return {
		results,
		hasMore: (limit * (page - 1)) + results.length < total
	};
}

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
					media (search: $search, type: MANGA) {
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
					inLibrary: mangaIdsInLib.includes(manga.id) ?? false
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

		searchResults.lists = (await searchLists(userId, query, 2)).results

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
	let hasMore = false;

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
						media (search: $search, type: MANGA) {
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
					inLibrary: mangaIdsInLib.includes(manga.id) ?? false
				}));
				total = mangaData.data.Page.pageInfo?.total || 0;
			}
			hasMore = skip + items.length < total;
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
			hasMore = skip + items.length < total;
		} else if (category === 'lists') {
			// Search custom lists with pagination
			total = await CustomList.countDocuments({
				userId,
				name: { $regex: query, $options: 'i' }
			});
			const temp = await searchLists(userId, query, pageSizeNum, pageNum)
			items = temp.results
			hasMore = temp.hasMore
		} else {
			return res.status(400).json({ error: 'Invalid category. Must be manga, notes, or lists' });
		}


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
