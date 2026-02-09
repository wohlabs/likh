import { Document, Schema, Types, model } from 'mongoose'

export interface MangaItem {
	mangaId: number // anilist id
	addedAt: Date
}

export interface ICustomList extends Document
{
	userId: Types.ObjectId
	name: string,
	description: string,
	isFavorite: boolean,
	manga: MangaItem[]
}

const MangaItemSchema = new Schema<MangaItem>(
	{
		mangaId: { type: Number, required: true },
		addedAt: { type: Date, default: Date.now }
	},
	{ _id: false }
)

const ICustomListSchema = new Schema<ICustomList>({
	userId: { type: Schema.ObjectId, ref: 'User' },
	name: { type: String, required: true },
	description: { type: String },
	isFavorite: { type: Boolean, required: true, default: false },
	manga: {
		type: [MangaItemSchema],
		required: true,
		default: []
	},
});

ICustomListSchema.pre('deleteOne', function (next) {
	if (this.getQuery().isFavorite)
	{
		return next(new Error('Favorite list cannot be deleted'))
	}
	next()
})


export const CustomList = model<ICustomList>('CustomList', ICustomListSchema);