import express, { Request, Response, Router } from 'express';
import AuthenticateMiddleware from '../middleware/Authentication';
import { CustomList, ICustomList, MangaItem } from '../models/custom_list.model';
import { User } from '../models/user.model';
import { getAnilistFavoritesManga, TOGGLE_ANILIST_FAV } from './anilist';
import { anilistAuthenticatedRequest } from '../Utility';

const router: Router = Router();

router.use(express.json())

function isMangaIdInList(list: ICustomList, mangaId: number)
{
	return list.manga.findIndex((manga: any) => manga.mangaId == mangaId) != -1
}

// get manga lists of current user /custom-lists?mangaId=12345
router.get(`/`, AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	const userId = req.user?.id
	const {mangaId, inTheList} = req.query
	const findOptions: any = {userId};
	if (mangaId != null)
	{
		// if inTheList is not set or not "false" => return the list with mangaId
		if (inTheList != null && inTheList == "false")
		{
			findOptions['manga.mangaId'] = { $ne: mangaId }
		}
		else
		{
			findOptions['manga.mangaId'] = mangaId
		}
	}
	let lists: any[] = (await CustomList.find(findOptions).select('name manga isFavorite description').lean())
	let favList = lists.find((value) => value.isFavorite == true)
	const user = await User.findById(userId);
	let anilistFavs: any[] = []
	if (user && user.anilist_token)
	{
		anilistFavs = (await getAnilistFavoritesManga(user.anilist_token))
		anilistFavs = anilistFavs.filter((val: number) => !isMangaIdInList(favList, val)).map((value) => ({mangaId: value})) // remove manga that is already inside my current fav list
	}
	lists = lists.map((list) => (list.isFavorite ? ({...list, manga: [...list.manga, ...anilistFavs]}) : list))
	return res.status(200).json(lists)
})

// create new manga list
router.post(`/`, AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	const userId = req.user?.id
	const { name, description, initMangaIds } = req.body
	const newList = new CustomList({
		userId,
		name,
		description,
		manga: initMangaIds.map((item: number) => ({mangaId: item, addedDate: new Date()})) ?? []
	})
	await newList.save()
	res.json(newList)
})

// add manga to favorite list
router.post(`/favorite/manga`, AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	const userId = req.user?.id
	const { mangaId, isFav } = req.body // isFav determines if mangaId is to be added or removed from Favorites list. to be distinguished with isFavorite of a custom list
	if (!mangaId)
	{
		return res.sendStatus(400);
	}
	const numMangaId = Number(mangaId)
	let list = await CustomList.findOne({userId, isFavorite: true}).exec()
	if (list === null)
	{
		const newFavList = await CustomList.create({
			userId,
			name: 'Favorites',
			isFavorite: true,
			mangaIds: [numMangaId]
		})
		list = newFavList
	}

	if (isFav && !list.manga.some((item: MangaItem) => item.mangaId === numMangaId))
	{
		list.manga.push({mangaId: numMangaId, addedAt: new Date()})
	}
	else if (!isFav && list.manga.some((item: MangaItem) => item.mangaId === numMangaId))
	{
		list.manga = list.manga.filter((elem) => elem.mangaId !== numMangaId)
	}

	const user = await User.findById(userId);
	let anilistFavs: any[] = []
	if (user && user.anilist_token)
	{
		anilistFavs = (await getAnilistFavoritesManga(user.anilist_token, true))
	}
	if (user && user.anilist_token)
	{
		if (isFav != anilistFavs.includes(mangaId)) // if different, then toggle. if not, leave it be
		{
			const res = await anilistAuthenticatedRequest(TOGGLE_ANILIST_FAV, { mangaId: numMangaId}, user.anilist_token, 600, true)
		}
	}
	list.save()
	res.sendStatus(200)
})

// delete list 
router.delete(`/:listId`, AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	const userId = req.user?.id
	const { listId } = req.params
	if (!listId )
	{
		return res.sendStatus(400);
	}
	const list = await CustomList.findById(listId).exec()
	if (list === null)
	{
		return res.sendStatus(404);
	}
	if (list?.userId.toString() !== userId)
	{
		return res.status(401).json("User does not have valid authorization on this list.")
	}

	await list.deleteOne();
	return res.sendStatus(200)
})

// edit list attributes
router.patch(`/:listId`, AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	const userId = req.user?.id
	const { listId } = req.params
	const { description, name, isFavorite } = req.body
	if (!listId )
	{
		return res.sendStatus(400);
	}
	const list = await CustomList.findById(listId).exec()
	if (list === null)
	{
		return res.sendStatus(404);
	}
	if (list?.userId.toString() !== userId)
	{
		return res.status(401).json("User does not have valid authorization on this list.")
	}

	if (description) list.description = description
	if (name) list.name = name
	if (isFavorite) list.isFavorite = isFavorite

	list.save()
	res.sendStatus(200)
})

// add manga to list
router.post(`/:listId/manga`, AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	const userId = req.user?.id
	const { listId } = req.params
	const { mangaId, isIncluded } = req.body
	if (!listId || !mangaId)
	{
		return res.sendStatus(400);
	}
	const list = await CustomList.findById(listId).exec()
	if (list === null)
	{
		return res.sendStatus(404);
	}
	if (list?.userId.toString() !== userId)
	{
		return res.status(401).json("User does not have valid authorization on this list.")
	}

	const numMangaId = Number(mangaId)
	if (isIncluded && !list.manga.some((item: MangaItem) => item.mangaId === numMangaId))
	{
		list.manga.push({mangaId: numMangaId, addedAt: new Date()})
	}
	else if (!isIncluded && list.manga.some((item: MangaItem) => item.mangaId === numMangaId))
	{
		list.manga = list.manga.filter((elem) => elem.mangaId !== numMangaId)
	}
	if (list.isFavorite == true)
	{
		const user = await User.findById(userId);
		let anilistFavs: any[] = []
		if (user && user.anilist_token)
		{
			anilistFavs = (await getAnilistFavoritesManga(user.anilist_token, true))
		}
		if (user && user.anilist_token)
		{
			if (isIncluded != anilistFavs.includes(mangaId)) // if different, then toggle. if not, leave it be
			{
				const res = await anilistAuthenticatedRequest(TOGGLE_ANILIST_FAV, { mangaId: numMangaId}, user.anilist_token, 600, true)
				console.log(res)
			}
		}
	}
	list.save()
	res.sendStatus(200)
})

export default router;