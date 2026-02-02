import express, { Request, Response } from 'express'
import { connectDB } from './config/db.js'
import * as dotenv from 'dotenv'
import mongoose, { Types } from 'mongoose'
import cors from 'cors'
import { getGFSBucket } from './config/db.js'
import { getErrorMessage } from './Utility'
import AuthenticateMiddleware, { JwtPayload } from './middleware/Authentication'
import UserRoutes from './routes/users'
import NoteRoutes from './routes/notes'
import AnilistRoutes from './routes/anilist'
import CustomListRoutes from './routes/custom_lists'
import SearchRoutes from './routes/search'
import MangaRoutes from './routes/manga'
import MediaEntryRoutes from './routes/media_entry'

dotenv.config()

declare module 'express' {
	export interface Request {
		user?: JwtPayload;
	}
}

const PORT = process.env.PORT || 5000;
connectDB(process.env.MONGODB_URI || '');
const app = express()
app.use(cors())

// Mount routes
app.use('/users', UserRoutes);
app.use('/notes', NoteRoutes);
app.use('/custom-lists', CustomListRoutes);
app.use('/anilist', AnilistRoutes);
app.use('/search', SearchRoutes);
app.use('/manga', MangaRoutes);
app.use('/media-entry', MediaEntryRoutes);

// test route
app.get(`/`, (req: Request, res: Response) => { res.json('hello world') })

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

app.listen(PORT, () =>
	console.log(`
🚀 Server ready at: http://localhost:${PORT}
⭐️ See sample requests: https://github.com/prisma/prisma-examples/blob/latest/orm/express/README.md#using-the-rest-api`),
)