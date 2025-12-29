import { Schema, model, Document, Types } from 'mongoose'

export interface ICustomList extends Document
{
	userId: Types.ObjectId
	name: string,
	description: string,
	isFavorite: boolean,
	mangaIds: number[]
}

const ICustomListSchema = new Schema<ICustomList>({
	userId: { type: Schema.ObjectId, ref: 'User' },
	name: { type: String, required: true },
	description: { type: String },
	isFavorite: { type: Boolean, required: true, default: false },
	mangaIds: { type: [Number], required: true, default: [] },
});

// 👇 enforcement
ICustomListSchema.index(
	{ userId: 1 },
	{ unique: true, partialFilterExpression: { isFavorite: true } }
)

ICustomListSchema.pre('deleteOne', function (next) {
	if (this.getQuery().isFavorite)
	{
		return next(new Error('Favorite list cannot be deleted'))
	}
	next()
})


export const CustomList = model<ICustomList>('CustomList', ICustomListSchema);