import { Schema, model, Document, Types } from 'mongoose'

export interface INote extends Document
{
	userId: Types.ObjectId
	mangaId: number;
	createdAt: Date; // creation timestamp
	modifiedAt: Date; // modification timestamp
	startChapter: number;
	endChapter?: number;
	images: Types.ObjectId[]; // could be an empty array
	text?: string
}

const NoteSchema = new Schema<INote>({
	userId: { type: Schema.ObjectId, ref: 'User' },
	mangaId: { type: Number, required: true },
	createdAt: { type: Date, required: true, default: Date.now },
	modifiedAt: { type: Date, required: true, default: Date.now },
	startChapter: { type: Number, required: true },
	endChapter: { type: Number, required: false },
	images: { type: [Schema.ObjectId], default: [], ref: 'uploads.files' },
	text: { type: String, default: "" }
});

export const Note = model<INote>('Note', NoteSchema);