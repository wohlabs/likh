import express, { Router, Request, Response } from 'express';
import AuthenticateMiddleware from '../middleware/Authentication';
import { MEDIA_LIST_STATUSES, USER_MEDIA_ENTRY_QUERY, UserMediaEntry } from '../models/user_media_status.model';
import { anilistAuthenticatedRequest } from '../Utility';
import { User } from '../models/user.model';

const router: Router = Router();

router.use(express.json())

// get user media entry: /media-entry?mangaId=123
router.get(`/`, AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	const userId = req.user?.id
	const { mangaId } = req.query
	const entry = await UserMediaEntry.findOne({ userId, mangaId });
	if (!entry)
	{
		const user = await User.findById(userId);
		if (user?.anilist_token)
		{
			const result = await anilistAuthenticatedRequest(USER_MEDIA_ENTRY_QUERY, { id: mangaId }, user.anilist_token as string, 3600);
			if (result.data.Media.mediaListEntry == null)
			{
				return res.status(200).json(null)
			}
			const anilistEntry = new UserMediaEntry({
				...result.data.Media.mediaListEntry,
				mangaId,
				userId
			});
			return res.status(200).json(anilistEntry)
		}
		else
		{
			return res.status(200).json(null)
		}
	}
	else
	{
		return res.status(200).json(entry)
	}
})

// edit/add user media entry: /media-entry?mangaId=123
router.post(`/`, AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	return null; // broken code: do no call
	// const userId = req.user?.id
	// const { mangaId } : any = req.params;
	// const { status, score } : any = req.query;
	// try
	// {
	// 	const user = await User.findById(userId);
	// 	if (user?.anilist_token)
	// 	{
	// 		const result = await anilistAuthenticatedRequest(USER_MEDIA_ENTRY_QUERY, { id: mangaId }, user.anilist_token as string, 3600);
	// 	}
	// 	const entry = await UserMediaEntry.findOne({ userId, mangaId });
	// 	if (entry)
	// 	{
	// 		entry.status = status
	// 		entry.save();
	// 		return res.json(entry);
	// 	}
	// 	else if ()
	// 	{

	// 	}
	// 	else
	// 	{
	// 		const newEntry = new UserMediaEntry({ userId, status: 'PLANNING', mangaId, score});
	// 		newEntry.save()
	// 		return res.json(newEntry)
	// 	}
	// }
	// catch (err: any)
	// {
	// 	return res.status(500).json({ error: err?.message || `Failed to update entry` });
	// }
})

export default router;