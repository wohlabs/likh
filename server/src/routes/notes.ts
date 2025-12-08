import express, { Router, Request, Response } from 'express';
import AuthenticateMiddleware from '../middleware/Authentication';
import multer from 'multer'
import { Types } from 'mongoose';
import { getGFSBucket } from '../config/db';
import { Readable } from 'stream';
import { getErrorMessage } from '../Utility';
import { IUser, User } from '../models/user.model';
import { INote, Note } from '../models/note.model';

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router: Router = Router();

router.use(express.json())

// create new note
router.post(`/`, upload.array('images', 10), AuthenticateMiddleware, async (req: Request, res: Response) =>
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

// edit note
router.patch(`/:id`, upload.array('images', 10), AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	console.log("Editing note...", req.params.id)
	const userId = req.user?.id;
	const noteId = req.params?.id;
	const { mangaId, startChapter, endChapter, text, deletedImageIds } = req.body
	// invalid note entry
	if ((!req.files || req.files.length == 0) && !text) return res.status(400).json('Invalid note')

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
		await note.save()
		return res.json(note);
	}

	return res.sendStatus(404)
})

// get notes
router.get(`/`, AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	const userId = req.user?.id
	const { mangaId } = req.query // temporary. userId shall be determined by session cookie
	res.json(await Note.find({ userId, mangaId }).exec())
})

// get note of id
router.get(`/:id`, async (req: Request, res: Response) =>
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

router.delete(`/:id`, async (req: Request, res: Response) =>
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

export default router;