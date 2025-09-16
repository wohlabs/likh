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
	mangas: string[];
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

const Note = model<INote>('Note', NoteSchema);

// get note of id
app.get(`/note/:id`, async (req, res) => {

})

app.post(`/note`, async (req, res) => {
	
})

app.post(`/user/:id`, async (req, res) => {
	
})

app.post(`/user`, async (req, res) => {
	
})

// create new note
app.post(`/note`, async (req, res) => {
	const newNote = new Note()
	await newNote.save()
	res.json(newNote)
})

const server = app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: https://github.com/prisma/prisma-examples/blob/latest/orm/express/README.md#using-the-rest-api`),
)