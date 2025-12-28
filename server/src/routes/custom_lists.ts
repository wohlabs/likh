import express, { Router, Request, Response } from 'express';
import AuthenticateMiddleware from '../middleware/Authentication';
import { CustomList } from '../models/custom_list.model';

const router: Router = Router();

router.use(express.json())

// get manga lists of current user
router.get(`/`, AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	const userId = req.user?.id
	res.json(await CustomList.find({ userId }).exec())
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
router.post(`/:listId/:mangaId`, AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	const userId = req.user?.id
	const { listId, mangaId } = req.params
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
	list.list.push(Number(mangaId))
	list.save()
	res.sendStatus(200)
})

export default router;