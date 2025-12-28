import { Schema, model, Document, Types } from 'mongoose'

export interface ICustomList extends Document
{
	userId: Types.ObjectId
	name: string,
	description: string,
	mangaIds: number[]
}

const ICustomListSchema = new Schema<ICustomList>({
	userId: { type: Schema.ObjectId, ref: 'User' },
	name: { type: String, required: true },
	description: { type: String, required: true, default: "" },
	mangaIds: { type: [Number], required: true, default: [] },
});

export const CustomList = model<ICustomList>('CustomList', ICustomListSchema);