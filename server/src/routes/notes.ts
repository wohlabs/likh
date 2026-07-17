import express, { Request, Response, Router } from 'express';
import mongoose, { Types } from 'mongoose';
import multer from 'multer';
import { Readable } from 'stream';
import { getErrorMessage } from '../Utility';
import { getGFSBucket } from '../config/db';
import AuthenticateMiddleware from '../middleware/Authentication';
import { INote, Note } from '../models/note.model';
import { IUser, User } from '../models/user.model';
import { getAnilistNote } from './anilist';
import { addMangaToLibrary } from './users';
import {GoogleGenAI} from '@google/genai';
import { PaddleOcrService } from 'ppu-paddle-ocr';
import fs from 'fs'

const service = new PaddleOcrService({
  debugging: {
    debug: false,
    verbose: false,
  },
});

const storage = multer.diskStorage({ destination: '/tmp'});
const upload = multer({ storage });
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});
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
	const ocrText = []
	try
	{
		const files = req.files as Express.Multer.File[]; // type assertion
		if (files && files.length > 0)
		{
			await service.initialize();
			const uploadedFiles = [];
			const bucket = getGFSBucket();
			if (!bucket) return res.status(500).json('GridFS bucket is not initialized')

			for (const file of files)
			{
				let buffer: Buffer | null = fs.readFileSync(file.path); // Read into RAM
				const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

				const result = await service.recognize(arrayBuffer as ArrayBuffer);
				const uploadStream = bucket?.openUploadStream(`${Date.now()}_${file.originalname}`, {
					metadata: {
						userId,
						mimeType: file.mimetype,
						ocrText: result.text,
						ocrProcessedAt: new Date()
					}
				});
				ocrText.push(result.text)
				const readStream = fs.createReadStream(file.path);
				readStream.pipe(uploadStream);
				uploadedFiles.push({ fileName: file.originalname, fileId: uploadStream.id })
				imageIds.push(uploadStream.id)
				uploadStream.on('finish', () => {
					fs.unlink(file.path, (err) => {
						if (err) console.error(`Failed to delete temporary file: ${file.path}`, err);
					});
				});
			}
			await service.destroy()
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
	return res.json({...newNote, ocrText: ocrText})
})

router.post(`/ocr`, upload.array('images', 1), AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	try
	{
		await service.initialize();

		let ocrRes = ""
		const files = req.files as Express.Multer.File[]; // type assertion
		if (files && files.length > 0)
		{
			for (const file of files)
			{
				// Convert Node Buffer to ArrayBuffer for PaddleOcrService.recognize
				const arrayBuffer = file.buffer.buffer
				const result = await service.recognize(arrayBuffer as ArrayBuffer);
				ocrRes = result.text
			}
		}
		await service.destroy();
		return res.json(ocrRes)
	}
	catch (err: unknown)
	{
		return res.status(500).json({ error: getErrorMessage(err) })
	}
})

// edit note
router.patch(`/:id`, upload.array('images', 10), AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	const userId = req.user?.id;
	const noteId = req.params?.id;
	const { mangaId, startChapter, endChapter, text, tags, deletedImageIds } = req.body
	const deletedImageObjectIds = (JSON.parse(deletedImageIds) as string[]).map(id => new Types.ObjectId(id));

	const newImageIds: Types.ObjectId[] = [];
	const ocrText = []
	try
	{
		const files = req.files as Express.Multer.File[]; // type assertion
		if (files && files.length > 0)
		{
			await service.initialize();
			const uploadedFiles = [];
			const bucket = getGFSBucket();
			if (!bucket) return res.status(500).json('GridFS bucket is not initialized')

			for (const file of files)
			{
				let buffer: Buffer | null = fs.readFileSync(file.path); // Read into RAM
				const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

				const result = await service.recognize(arrayBuffer as ArrayBuffer);
				const uploadStream = bucket?.openUploadStream(`${Date.now()}_${file.originalname}`, {
					metadata: {
						userId,
						mimeType: file.mimetype,
						ocrText: result.text,
						ocrProcessedAt: new Date()
					}
				});
				ocrText.push(result.text)
				const readStream = fs.createReadStream(file.path);
				readStream.pipe(uploadStream);
				uploadedFiles.push({ fileName: file.originalname, fileId: uploadStream.id })
				newImageIds.push(uploadStream.id)
				uploadStream.on('finish', () => {
					fs.unlink(file.path, (err) => {
						if (err) console.error(`Failed to delete temporary file: ${file.path}`, err);
					});
				});
			}
			await service.destroy()
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
		return res.json({...note, ocrText: ocrText});
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
		const likhDBNotes = await Note.find({ userId, mangaId }).lean();
		const likhNotes = await Promise.all(likhDBNotes.map(async (note: any) => {
			
			const ocrPromises = note.images.map(async (imageId: string) => {
				const file = await mongoose.connection.db?.collection('images.files')
					.findOne({ _id: new Types.ObjectId(imageId) });
				return file?.metadata?.ocrText || "";
			});

			const ocrResults = await Promise.all(ocrPromises);

			return { 
				...note, 
				ocrText: ocrResults, 
				fromAnilist: false,
				id: note._id // Assuming you want to keep the ID mapping
			};
		}));
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

// add tag to note
router.post(`/:id/tags`, AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	try
	{
		const noteId = req.params.id;
		const { tag } = req.body;

		if (!tag || typeof tag !== 'string' || tag.trim() === '') {
			return res.status(400).json({ error: "Tag must be a non-empty string" });
		}

		const note = await Note.findById(noteId).exec();
		if (!note) {
			return res.status(404).json({ error: "Note not found" });
		}

		const trimmedTag = tag.trim();
		if (!note.tags.includes(trimmedTag)) {
			note.tags.push(trimmedTag);
			note.modifiedAt = new Date();
			await note.save();
		}

		res.json(note);
	}
	catch (err: unknown)
	{
		res.status(500).json({ error: getErrorMessage(err) });
	}
})

// remove tag from note
router.delete(`/:id/tags/:tag`, AuthenticateMiddleware, async (req: Request, res: Response) =>
{
	try
	{
		const noteId = req.params.id;
		const tag = decodeURIComponent(req.params.tag);

		const note = await Note.findById(noteId).exec();
		if (!note) {
			return res.status(404).json({ error: "Note not found" });
		}

		const tagIndex = note.tags.indexOf(tag);
		if (tagIndex > -1) {
			note.tags.splice(tagIndex, 1);
			note.modifiedAt = new Date();
			await note.save();
		}

		res.json(note);
	}
	catch (err: unknown)
	{
		res.status(500).json({ error: getErrorMessage(err) });
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

router.post('/summary', AuthenticateMiddleware, async (req: Request, res: Response) => {
	const userId = req.user?.id;
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

		const items = likhNotes.map((note, i) => {
			const tags = Array.isArray(note.tags) ? note.tags.join(', ') : (note.tags ?? '');
			return `Note ${i + 1}:
				Chapter: ${note.startChapter == -1 ? "Overall" : note.startChapter}${note.endChapter ? " - " + note.endChapter : ""}
				Tags: ${tags}
				Text: ${note.text}`;
			}
		).join('\n\n---\n\n');
	
		const systemPrompt = `You are an assistant that summarizes user notes for a manga. Use the provided notes (text), their tags, and chapter numbers to produce a concise and useful summary. 
		Return your response strictly in JSON format using the following schema:
		{
			"summary": "A concise 3-4 sentence summary of all provided notes.",
			"key_points_by_chapter": [
				{
					"chapter_group": "e.g., Chapter 1-5",
					"point": "A single, concise bullet point summarizing the main event for this range."
				}
			]
		}
		Ensure the output is valid JSON and contains no additional text outside the JSON object.`;
		const userPrompt = `Notes:\n${items}\n\nPlease analyze these notes and provide the summary in the required JSON format.`;

		const modelPriorityList: string[] = [
			'gemini-3.5-flash',
			'gemini-3.1-flash-lite',
			'gemini-3.0-flash',
			'gemini-2.5-flash',
			'gemini-2.5-flash-lite',
			'gemini-2.0-flash'
		];
		for (const model of modelPriorityList)
		{
			try
			{
				const response = await ai.interactions.create({
					model: model,
					input: userPrompt,
					system_instruction: systemPrompt
				})
				if (response.output_text)
				{
					return res.send(response.output_text);
				}
				throw new Error("Empty response received");
			}
			catch (error: any)
			{
			}
		}

		return res.sendStatus(500) // could just be because not enough token left
	}
})


export default router;