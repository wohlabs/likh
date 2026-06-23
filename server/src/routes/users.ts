import bcrypt from 'bcrypt';
import express, { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import AuthenticateMiddleware, { JWT_SECRET } from '../middleware/Authentication';
import { CustomList } from '../models/custom_list.model';
import { IUser, User } from '../models/user.model';
import { IUserMediaEntry, USER_MEDIA_ENTRY_MUTATION, UserMediaEntry } from '../models/user_media_status.model';
import { anilistAuthenticatedRequest } from '../Utility';
import { getMangaIdsWithNotes } from './anilist';

const router: Router = Router();

router.use(express.json())

// user register
router.post(`/`, async (req: Request, res: Response) =>
{
	const { username, password } = req.body;
	const validPasswordRule = /^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/;
	if (!validPasswordRule.test(password))
	{
		res.status(400).json({ error: 'Your password needs to:\n- have at least 8 characters.\n- contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.' });
	}
	const hashedPassword = await bcrypt.hash(password, 10);

	try
	{
		const newUser = new User({
			username: username.toLowerCase(),
			password: hashedPassword
		});
		await newUser.save();

		const newFavList = await CustomList.create({
			userId: newUser._id,
			name: 'Favorites',
			description: '',
			isFavorite: true,
			mangaIds: []
		})
		await newFavList.save();

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
	const normUsername = username.toLowerCase()
	const user = await User.findOne({ username: normUsername });
	if (!user) return res.status(400).json({ error: 'User not found' });

	const isPasswordValid = await bcrypt.compare(password, user.password);
	if (!isPasswordValid) return res.status(400).json({ error: 'Incorrect password' });

	const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1y' });
	res.json({
		token,
		username: normUsername,
		...(user.anilist_token && { anilist_token: user.anilist_token})
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

export async function getMangaInLibrary(userId: string) : Promise<Array<number>>
{
	const mangaIdsWithNotes = await getMangaIdsWithNotes(userId);
	const libMangaIds: Set<number> = new Set()
	const entries = await UserMediaEntry.find({ userId }).select('mangaId');
	for (const entry of entries)
	{
		libMangaIds.add(entry.mangaId)
	}
	for (const mangaId of mangaIdsWithNotes)
	{
		libMangaIds.add(Number(mangaId))
	}
	return Array.from(libMangaIds)
}

// get manga from user's collection
router.get(`/me/manga`, AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	// console.log(userId)
	const userId = req.user?.id
	if (!userId)
	{
		return res.status(400).json("Invalid query")
	}
	try
	{
		res.json(await getMangaInLibrary(userId))
	}
	catch
	{
		res.sendStatus(404)
	}
})

export async function addMangaToLibrary(userId: string, mangaId: number) : Promise<IUserMediaEntry>
{
	const user = await User.findById(userId);
	if (!user) // unlikely. throw excception because user doesn't exist to have a manga
	{
		throw Error("User not found")
	}

	let anilistEntry = null;
	if (user?.anilist_token)
	{
		const anilistResult = await anilistAuthenticatedRequest(USER_MEDIA_ENTRY_MUTATION, { mediaId: mangaId }, user.anilist_token as string, 3600);
		anilistEntry = anilistResult.data.SaveMediaListEntry
		if (anilistEntry == null)
		{
			throw Error("Could not update anilist")
		}
	}

	const entry = await UserMediaEntry.findOne({ userId, mangaId });
	if (entry) // unexpected to happen. at most it will update itself to match anilist
	{
		if (anilistEntry)
		{
			entry.status = anilistEntry.status;
			entry.score = anilistEntry.score;
			entry.save();
		}
		return entry;
	}
	else
	{
		const newEntry = new UserMediaEntry({
			userId,
			mangaId
		});
		if (anilistEntry)
		{
			newEntry.status = anilistEntry.status;
			newEntry.score = anilistEntry.score;
		}
		newEntry.save();
		return newEntry;
	}
}

// add a manga to collection
router.post(`/me/manga`, AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	const userId = req.user?.id
	const { mangaId } : any = req.body;
	try
	{
		if (userId && mangaId)
		{
			return res.status(200).json(addMangaToLibrary(userId, mangaId))
		}
		else
		{
			return res.status(400).json("Invalid request")
		}
	}
	catch (err: any)
	{
		return res.status(500).json({ error: err?.message || `Failed to update entry` });
	}
})

export default router;