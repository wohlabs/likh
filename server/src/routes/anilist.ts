import express, { Request, Response } from "express";
import { jwtDecode } from "jwt-decode";
import { INote } from "../models/note.model";
import { User } from '../models/user.model';
import { anilistAuthenticatedRequest, anilistRequest } from "../Utility";

const router = express.Router();
router.use(express.json())

export const getUserIdFromToken = (accessToken: string) : number | null => 
{
	if (accessToken.length === 0) return null
	const decodedToken: any = jwtDecode(accessToken);
	const userId: number = decodedToken.sub;
	return userId;
}

// forward request to Anilist API
router.post("/", async (req: Request, res: Response) => {
	const query = req.body.query;
	const variables = req.body.variables || {};
	const auth = req.body.auth || {};
	try {
		const data = await anilistRequest(query, variables, 3600);
		return res.status(200).json(data);
	} catch (err: any) {
		console.error(err);
		return res.status(500).json({ error: err.message || "Failed to fetch data" });
	}
});

export const getMangaData = async (mangaIds: number[]) : Promise<any[]> =>
{
	const MANGA_INFO_QUERY = `
		query ($ids: [Int], $page: Int){
			Page(page: $page, perPage: 50) {
				pageInfo {
					hasNextPage
				}
				media(id_in: $ids, type: MANGA) {
					id
					title {
						userPreferred
						english
					}
				}
			}
		}
	`

	let allMedias: any[] = []
	let hasNextPage = true
	let i = 1;
	while (hasNextPage)
	{
		const result = await anilistRequest(MANGA_INFO_QUERY, {ids: mangaIds, page: i}, 3600);
		allMedias=[...allMedias, ...result.data.Page.media]
		hasNextPage = result.data.Page.pageInfo.hasNextPage
		i++;
	}
	return allMedias;
}

export const getMangaIdsWithNotes = async (user_id: string) : Promise<string[]> =>
{
	const accessToken = (await User.findById(user_id))?.anilist_token;
	if (accessToken === undefined || accessToken.length === 0) return []
	const userId = getUserIdFromToken(accessToken);
	const query = `query ($userId: Int){
			MediaListCollection(userId: $userId, type: MANGA) {
				lists {
					entries {
						notes
						id
						mediaId
					}
				}
			}
		}`;
	const variables = {userId : userId};
	try
	{
		const data = await anilistAuthenticatedRequest(query, variables, accessToken, 3600);
		const mangaIds = data.data.MediaListCollection.lists.flatMap((list: any) =>
			list.entries
				.map((entry: any) => entry.mediaId.toString())
		);
		return mangaIds;
	}
	catch (err: any)
	{
		return [];
	}
}

export const getAnilistNote = async (mangaId: string, access_token: string) : Promise<Partial<INote> | null> =>
{
	const MANGA_NOTE_QUERY = `
	query ($userId: Int, $mediaId: Int) {
		MediaList (userId: $userId, mediaId: $mediaId) {
			id
			userId
			notes
			createdAt
			updatedAt
		}
	}
	`

	try
	{
		const data = await anilistRequest(MANGA_NOTE_QUERY, {userId : getUserIdFromToken(access_token), mediaId: mangaId}, 3600);
		const item = data.data.MediaList
		if (!item || !item.notes) return null
		return {
			id: item.id,
			createdAt: new Date(item.createdAt * 1000),
			modifiedAt: new Date(item.updatedAt * 1000),
			startChapter: -1,
			endChapter: undefined,
			images: [],
			text: item.notes
		};
	}
	catch (err: any)
	{
		return null
	}
}

export const getAnilistFavoritesManga = async (access_token: string) : Promise<Array<number>> =>
{
	const MANGA_FAVORITES = `
	query {
		Viewer {
			favourites {
				manga {
					nodes {
						id
						title {
							userPreferred
						}
						description
					}
				}
			}
		}
	}
	`

	try
	{
		const data = await anilistAuthenticatedRequest(MANGA_FAVORITES, {}, access_token);
		const items = data.data.Viewer.favourites.manga.nodes
		if (!items) return []
		return items.map((item: any) => item.id);
	}
	catch (err: any)
	{
		return []
	}
}

export default router;
