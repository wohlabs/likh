import express, { Router, Request, Response } from 'express';
import AuthenticateMiddleware, { JWT_SECRET } from '../middleware/Authentication';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { IUser, User } from '../models/user.model';

const router: Router = Router();

router.use(express.json())

// user register
router.post(`/`, async (req: Request, res: Response) =>
{
	const { username, password } = req.body;
	const hashedPassword = await bcrypt.hash(password, 10);

	try
	{
		const newUser = new User({
			username,
			password: hashedPassword
		});
		await newUser.save();
		res.status(201).json({ message: 'User registered successfully' });
	} catch
	{
		res.status(400).json({ error: 'User already exists' });
	}
})

// Login route
router.post('/login', async (req: Request, res: Response) =>
{
	const { username, password } = req.body;
	const user = await User.findOne({ username });
	if (!user) return res.status(400).json({ error: 'User not found' });

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) return res.status(400).json({ error: 'Invalid password' });

	const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1y' });
	res.json({
		token,
		username,
		anilist_token: user.anilist_token
	});
});

// link Anilist token
router.post('/me/anilist/link', AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	const userId = req.user?.id
	const { anilist_token } = req.body
	try
	{
		console.log(`Linking Anilist token for user ${userId}`)
		const user: IUser | null = await User.findById(userId).exec();
		if (user)
		{
			user.anilist_token = anilist_token
			user.save()
			res.sendStatus(200)
		}
		else
		{
			res.sendStatus(404) // TODO: send proper error for already linked
		}
	}
	catch
	{
		res.sendStatus(404)
	}
})

// get manga from user's collection
router.get(`/me/manga`, AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	const userId = req.user?.id
	try
	{
		const user: IUser | null = await User.findById(userId).exec();
		res.json(user?.manga)
	}
	catch
	{
		res.sendStatus(404)
	}
})

// add a manga to collection
router.post(`/me/manga`, AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	const userId = req.user?.id
	const { mangaId } = req.body
	try
	{
		const user: IUser | null = await User.findById(userId).exec();
		if (user?.manga.indexOf(mangaId) === -1)
		{
			user.manga.push(mangaId)
			user.save()
			res.status(200).json(user)
		}
		else if (!user)
		{
			res.sendStatus(404)
		}
		else
		{
			res.status(200).json(user)
		}
	}
	catch
	{
		res.sendStatus(404)
	}
})

export default router;