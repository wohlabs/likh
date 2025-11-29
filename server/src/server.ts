import express, { Request, Response, NextFunction } from 'express'
import { connectDB } from './config/db.js'
import * as dotenv from 'dotenv'
import mongoose, { Types } from 'mongoose'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import { getGFSBucket } from './config/db.js'
import { Readable } from 'stream'
import { getErrorMessage } from './Utility'
import AuthenticateMiddleware, { JWT_SECRET, JwtPayload } from './middleware/Authentication'
import { IUser, User } from './models/user.model'
import { INote, Note } from './models/note.model'

dotenv.config()

declare module 'express' {
	export interface Request {
		user?: JwtPayload;
	}
}

const PORT = process.env.PORT || 5000;
connectDB(process.env.MONGODB_URI || '');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const app = express()
app.use(cors())

app.get(`/`, (req: Request, res: Response) => { res.json('hello world') })

// create new note
app.post(`/notes`, upload.array('images', 10), AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	const userId = req.user?.id;
	const { mangaId, startChapter, endChapter, text } = req.body
	// invalid note entry
	if ((!req.files || req.files.length == 0) && !text) return res.status(400).json('Invalid note')

	const imageIds: Types.ObjectId[] = [];
	try
	{
		const files = req.files as Express.Multer.File[]; // type assertion
		if (files && files.length > 0)
		{
			const uploadedFiles = [];
			const bucket = getGFSBucket();
			for (const file of files)
			{
				const readableStream = new Readable()
				readableStream.push(file.buffer)
				readableStream.push(null)
				const uploadStream = bucket?.openUploadStream(`${Date.now()}_${file.originalname}`, {
					metadata: {
						userId,
						mimeType: file.mimetype
					}
				});
				if (uploadStream)
				{
					readableStream.pipe(uploadStream);
					// Wait for upload to finish before pushing fileId
					await new Promise((resolve, reject) =>
					{
						uploadStream.on('finish', () =>
						{
							uploadedFiles.push({ fileName: file.originalname, fileId: uploadStream.id, });
							imageIds.push(uploadStream.id)
							resolve(null);
						});
						uploadStream.on('error', reject);
					})
				}
			}
		}
	}
	catch (err: unknown)
	{
		return res.status(500).json({ error: getErrorMessage(err) })
	}

	const user: IUser | null = await User.findById(userId).exec();
	if (user?.manga.indexOf(mangaId) === -1)
	{
		user.manga.push(mangaId)
		user.save()
	}

	const newNote: INote = new Note(
		{
			userId,
			mangaId,
			startChapter,
			endChapter,
			images: imageIds,
			text
		}
	);
	await newNote.save()
	res.json(newNote)
})

app.get('/images/:id', AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	const id = new Types.ObjectId(req.params.id);
	const userId = req.user?.id
	try
	{
		const file = await mongoose.connection.db?.collection('images.files').findOne({ _id: id });
		if (!file) return res.status(404).json('Image not found');
		if (file.metadata.userId !== userId) return res.status(401).json('Unauthorized')
		res.set('Content-Type', file.metadata.mimeType)
		res.set('Content-Disposition', `inline; filename="${file.filename}"`)
		const downloadStream = getGFSBucket()?.openDownloadStream(file._id)
		downloadStream?.pipe(res);
	}
	catch (err: unknown)
	{
		res.status(500).json(getErrorMessage(err));
	}
})

app.use(express.json())

// get notes
app.get(`/notes`, AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	const userId = req.user?.id
	const { mangaId } = req.query // temporary. userId shall be determined by session cookie
	res.json(await Note.find({ userId, mangaId }).exec())
})

// get note of id
app.get(`/notes/:id`, async (req, res) =>
{
	try
	{
		const note = await Note.findById(req.params.id).exec()
		res.json(note)
	} catch
	{
		res.sendStatus(404)
	}
})

app.delete(`/notes/:id`, async (req: Request, res: Response) =>
{
	try
	{
		await Note.findByIdAndDelete(req.params.id)
		res.sendStatus(204)
	} catch
	{
		res.sendStatus(404)
	}
})

// user register
app.post(`/users`, async (req, res) =>
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
app.post('/users/login', async (req, res) =>
{
	const { username, password } = req.body;
	const user = await User.findOne({ username });
	if (!user) return res.status(400).json({ error: 'User not found' });

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) return res.status(400).json({ error: 'Invalid password' });

	const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1y' });
	res.json({
		token,
		username
	});
});

// link Anilist token
app.post('/users/me/anilist/link', AuthenticateMiddleware, async (req: Request, res: Response) =>
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
app.get(`/users/me/manga`, AuthenticateMiddleware, async (req: Request, res: Response) =>
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
app.post(`/users/me/manga`, AuthenticateMiddleware, async (req: Request, res: Response) =>
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

app.listen(PORT, () =>
	console.log(`
🚀 Server ready at: http://localhost:${PORT}
⭐️ See sample requests: https://github.com/prisma/prisma-examples/blob/latest/orm/express/README.md#using-the-rest-api`),
)