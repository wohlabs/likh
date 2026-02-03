import express, { Router, Request, Response } from 'express';
import AuthenticateMiddleware from '../middleware/Authentication';
import { MEDIA_LIST_STATUSES, USER_MEDIA_ENTRY_MUTATION, USER_MEDIA_ENTRY_QUERY, UserMediaEntry } from '../models/user_media_status.model';
import { anilistAuthenticatedRequest, getCache } from '../Utility';
import { User } from '../models/user.model';

const router: Router = Router();

router.use(express.json())

// get user media entry: /media-entry?mangaId=123
router.get(`/`, AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	const userId = req.user?.id
	const { mangaId } = req.query
	const entry = await UserMediaEntry.findOne({ userId, mangaId });
	const user = await User.findById(userId);
	if (!entry)
	{
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
			anilistEntry.save()
			return res.status(200).json(anilistEntry)
		}
		else
		{
			return res.status(200).json(null)
		}
	}
	else
	{
		// if anilist is linked, sync its data to ours
		if (user?.anilist_token)
		{ // determines if cache has expires. if yes, overwrite current entry with anilist data
			const cached = await getCache(USER_MEDIA_ENTRY_QUERY, { id: mangaId }, user?.anilist_token);
			if (!cached)
			{
				const result = await anilistAuthenticatedRequest(USER_MEDIA_ENTRY_QUERY, { id: mangaId }, user.anilist_token as string, 3600);
				if (result.data.Media.mediaListEntry == null) // TODO: make sure this means deleted
				{
					await entry.deleteOne()
					return res.status(200).json(null)
				}
				else
				{
					const newAnilistEntry = result.data.Media.mediaListEntry
					if (newAnilistEntry)
					{
						entry.status = newAnilistEntry.status
						entry.score = newAnilistEntry.score
					}
					entry.save()
				}
			}

		}
		return res.status(200).json(entry)
	}
})

// edit/add user media entry: /media-entry?mangaId=123
router.post(`/`, AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	const userId = req.user?.id
	const { mangaId } : any = req.query;
	const { status, score } : any = req.body;
	try
	{
		const user = await User.findById(userId);
		let anilistEntry = null;
		if (user?.anilist_token)
		{
			const anilistResult = await anilistAuthenticatedRequest(USER_MEDIA_ENTRY_MUTATION, { mediaId: mangaId, status, score }, user.anilist_token as string, 3600);
			anilistEntry = anilistResult.data.SaveMediaListEntry
			if (anilistEntry == null)
			{
				throw Error("Could not update anilist")
			}
		}
		const entry = await UserMediaEntry.findOne({ userId, mangaId });
		if (entry)
		{
			entry.status = status // assuming anilist value is the same
			entry.score = score // assuming anilist value is the same
			entry.save();
			return res.json(entry);
		}
		else
		{
			const newEntry = new UserMediaEntry({
				userId,
				status: 'PLANNING',
				mangaId,
				score
			});
			if (anilistEntry)
			{
				newEntry.status = status
				newEntry.score = score
			}
			newEntry.save()
			return res.json(newEntry)
		}
	}
	catch (err: any)
	{
		return res.status(500).json({ error: err?.message || `Failed to update entry` });
	}
})

export default router;