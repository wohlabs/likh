import express from 'express'
import { connectDB } from './config/db.js'
import * as dotenv from 'dotenv'
import { Schema, model, Document, Types } from 'mongoose'

dotenv.config()
const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGODB_URI || '');
const app = express()
app.use(express.json())

export interface IUser extends Document {
	username: string;
	password: string;
	manga: string[];
}

export interface INote extends Document {
	userId: Types.ObjectId
	mangaId: string;
	createdAt: Date; // creation timestamp
	modifiedAt: Date; // modification timestamp
	startChapter: number;
	endChapter?: number;
	images: string[]; // could be an empty array
	text?: string
}

const NoteSchema = new Schema<INote>({
	userId: {type: Schema.ObjectId, ref: 'User'},
	mangaId: {type: String, required: true },
	createdAt: {type: Date, required: true, default: Date.now },
	modifiedAt: {type: Date, required: true, default: Date.now },
	startChapter: {type: Number, required: true },
	endChapter: {type: Number, required: false },
	images: {type: [String], default: []},
	text: {type: String, default: ""}
});

const UserSchema = new Schema<IUser>({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	manga: { type: [String], default: [] }
});

const Note = model<INote>('Note', NoteSchema);
const User = model<IUser>('User', UserSchema);

// get note of id
app.get(`/notes/:id`, async (req, res) => {
	try {
		const note = await Note.findById(req.params.id).exec()
		res.json(note)
	} catch (error) {
		res.sendStatus(404)
	}
})

app.delete(`/notes/:id`, async (req, res) => {
	try {
		const note = await Note.findByIdAndDelete(req.params.id)
		res.sendStatus(204)
	} catch (error) {
		res.sendStatus(404)
	}
})

app.post(`/users`, async (req, res) => {
	let { username, password } = req.body
	const newUser: IUser = new User(
		{
			username,
			password // not encrypted for now
		}
	);
	await newUser.save()
	res.status(200).json({id: newUser.id})
})

// create new note
app.post(`/notes`, async (req, res) => {
	let { userId, mangaId, startChapter, endChapter, images, text } = req.body
	if ((!images || images.length == 0) && !text) return res.sendStatus(400)
	const newNote: INote = new Note(
		{
			userId,
			mangaId,
			startChapter,
			endChapter,
			images,
			text
		}
	);
	await newNote.save()
	res.json(newNote)
})

// create new note
app.get(`/notes`, async (req, res) => {
	const { userId } = req.body // temporary. userId shall be determined by session cookie
	res.json(await Note.find({userId}).exec())
})

// add a manga to collection
app.post(`/users/me/manga`, async (req, res) => {
	const { userId, mangaId } = req.body // temporary. userId shall be determined by session cookie
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
			console.log(user)
			res.status(200).json(user)
		}
	}
	catch(error)
	{
		res.sendStatus(404)
	}
})

const server = app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: https://github.com/prisma/prisma-examples/blob/latest/orm/express/README.md#using-the-rest-api`),
)