import express, { Request, Response, Router } from 'express';
import { Types } from 'mongoose';
import multer from 'multer';
import { Readable } from 'stream';
import { getErrorMessage } from '../Utility';
import { getGFSBucket } from '../config/db';
import AuthenticateMiddleware from '../middleware/Authentication';
import { INote, Note } from '../models/note.model';
import { IUser, User } from '../models/user.model';
import { getAnilistNote } from './anilist';
import { addMangaToLibrary } from './users';

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router: Router = Router();

router.use(express.json())

// create new note
router.post(`/`, upload.array('images', 10), AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	const userId = req.user?.id;
	const { mangaId, startChapter, endChapter, text, tags } = req.body

	if (!userId) return res.status(400).json('Invalid request')
	const user: IUser | null = await User.findById(userId).exec();
	if (!user) return res.status(400).json('User not found')
	// invalid note entry
	if ((!req.files || req.files.length == 0) && !text) return res.status(400).json('Invalid note')

	await addMangaToLibrary(userId, mangaId);

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

	// Deduplicate tags
	const uniqueTags = tags ? [...new Set(tags as string[])] : [];

	const newNote: INote = new Note(
		{
			userId,
			mangaId,
			startChapter,
			endChapter,
			images: imageIds,
			text,
			tags: uniqueTags
		}
	);
	await newNote.save()
	return res.json(newNote)
})

// edit note
router.patch(`/:id`, upload.array('images', 10), AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	const userId = req.user?.id;
	const noteId = req.params?.id;
	const { mangaId, startChapter, endChapter, text, tags, deletedImageIds } = req.body
	const deletedImageObjectIds = (JSON.parse(deletedImageIds) as string[]).map(id => new Types.ObjectId(id));

	const newImageIds: Types.ObjectId[] = [];
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
							newImageIds.push(uploadStream.id)
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

	const note = await Note.findById(req.params.id).exec()
	if (note)
	{
		note.images = note.images.filter(imageId => !deletedImageIds.includes(imageId.toString()))
		note.images.push(...newImageIds);
		note.startChapter = startChapter;
		note.endChapter = endChapter;
		note.text = text;
		note.modifiedAt = new Date();
		note.tags = tags ? [...new Set(tags as string[])] : [];

		if ((!note.images || note.images.length === 0) && (!note.text || note.text.length === 0)) return res.status(400).json('Invalid note')

		for (const objId of deletedImageObjectIds)
		{
			getGFSBucket()?.delete(objId);
		}
		await note.save()
		return res.json(note);
	}

	return res.sendStatus(404)
})

// get notes
router.get(`/`, AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	const userId = req.user?.id
	const { mangaId } = req.query
	if (userId && mangaId)
	{
		const likhNotes = await Note.find({ userId, mangaId });
		likhNotes.map((note: INote | any) => {
			return { ...note, fromAnilist: false};
		})
		const user = await User.findById(userId);
		if (user && user.anilist_token)
		{
			const anilistNote: any = user.anilist_token ? await getAnilistNote(mangaId.toString(), user.anilist_token) : null;
			if (anilistNote)
			{
				likhNotes.push({ ...anilistNote, fromAnilist: true})
			}
		}
		return res.json(likhNotes)
	}
	return res.sendStatus(400)
})

// get note of id
router.get(`/:id`, async (req: Request, res: Response) =>
{
	try
	{
		const note = await Note.findById(req.params.id).exec()
		if (note === null)
		{
			throw Error("Note not found")
		}
		res.json(note)
	} catch
	{
		res.sendStatus(404)
	}
})

router.delete(`/:id`, async (req: Request, res: Response) =>
{
	try
	{
		const itemId = req.params.id;

		// 1️⃣ Find the item first
		const item = await Note.findById(itemId);
		if (!item) return res.status(404).json({ error: "Item not found" });

		// 2️⃣ Delete files from GridFS
		const bucket = getGFSBucket();
		if (!bucket) return res.status(500).json({ error: "Something went wrong" });

		if (item.images && item.images.length > 0)
		{
			for (const imgId of item.images)
			{
				try
				{
					await bucket.delete(new Types.ObjectId(imgId));
				}
				catch (err)
				{
					console.error(`Failed to delete image ${imgId}`, err);
				}
			}
		}
		await Note.findByIdAndDelete(req.params.id)
		return res.sendStatus(204)
	} catch
	{
		return res.sendStatus(404)
	}
})

export default router;