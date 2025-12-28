import { Schema, model, Document, Types } from 'mongoose'

export interface IMangaList extends Document
{
	userId: Types.ObjectId
	name: string,
	description: string,
	list: number[]
}

const MangaListSchema = new Schema<IMangaList>({
	userId: { type: Schema.ObjectId, ref: 'User' },
	name: { type: String, required: true },
	description: { type: String, required: true, default: "" },
	list: { type: [Number], required: true, default: [] },
});

export const MangaList = model<IMangaList>('MangaList', MangaListSchema);