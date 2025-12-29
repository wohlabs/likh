import express, { Router, Request, Response } from 'express';
import AuthenticateMiddleware from '../middleware/Authentication';
import { CustomList, ICustomList } from '../models/custom_list.model';

const router: Router = Router();

router.use(express.json())

// get manga lists of current user /custom-lists?mangaId=12345
router.get(`/`, AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	const userId = req.user?.id
	const {mangaId} = req.query
	if (mangaId == null)
	{
		res.status(200).json(await CustomList.find({ userId }).select('name mangaIds isFavorite'))
	}
	else
	{
		const lists = (await CustomList.find({ userId, mangaIds: mangaId }).select('name mangaIds isFavorite'))
		res.status(200).json(lists)
	}
})

// create new manga list
router.post(`/`, AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	const userId = req.user?.id
	const { name, description } = req.body
	const newList = new CustomList({
		userId,
		name,
		description,
		list: []
	})
	await newList.save()
	res.json(newList)
})

// add manga to list
router.post(`/favorite/manga`, AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	const userId = req.user?.id
	const { mangaId } = req.body
	if ( !mangaId)
	{
		return res.sendStatus(400);
	}
	let list = await CustomList.findOne({userId, isFavorite: true}).exec()
	if (list === null)
	{
		const newFavList = await CustomList.create({
			userId,
			name: 'Favorites',
			isFavorite: true,
			mangaIds: []
		})
		list = newFavList
	}

	list.mangaIds.push(Number(mangaId))
	list.save()
	res.sendStatus(200)
})

// add manga to list
router.post(`/:listId/manga`, AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	const userId = req.user?.id
	const { listId } = req.params
	const { mangaId } = req.body
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
	list.mangaIds.push(Number(mangaId))
	list.save()
	res.sendStatus(200)
})

export default router;