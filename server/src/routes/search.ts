import express, { Router, Request, Response } from 'express';
import AuthenticateMiddleware from '../middleware/Authentication';
import { Note } from '../models/note.model';
import { CustomList } from '../models/custom_list.model';
import { anilistRequest } from '../Utility';
import { getMangaInLibrary } from './users';

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

		if (notes && notes.length > 0) {
			searchResults.notes = notes.map((note) => ({
				id: note._id,
				mangaId: note.mangaId,
				text: (note.text || '').substring(0, 100), // Truncate text for preview
				startChapter: note.startChapter,
				endChapter: note.endChapter,
				createdAt: note.createdAt
			}));
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

export default router;
