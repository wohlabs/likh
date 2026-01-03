import express, { Request, Response } from "express";
import { anilistRequest } from "../Utility";
import { jwtDecode } from "jwt-decode";
import { IUser, User } from '../models/user.model';

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
		const data = await anilistRequest(query, variables, 3600);
		const mangaIds = data.data.MediaListCollection.lists.flatMap((list: any) =>
			list.entries
				.filter((entry: any) => entry.notes && entry.notes.length > 0)
				.map((entry: any) => entry.mediaId.toString())
		);
		return mangaIds;
	}
	catch (err: any)
	{
		return [];
	}
}

export default router;
