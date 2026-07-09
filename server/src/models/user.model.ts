import { Document, Schema, Types, model } from 'mongoose';

export interface IUser extends Document
{
	username: string;
	password: string;
	manga: string[];
	anilist_token?: string; // optional Anilist OAuth token - lasted forever
	manga_lists: Types.ObjectId[]; // custom manga lists
	allowsAdultContent?: boolean; // custom manga lists
}

const UserSchema = new Schema<IUser>({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	manga: { type: [String], default: [] },
	anilist_token: { type: String, required: false, unique: false },
	manga_lists: { type: [Schema.ObjectId], required: true, default: []},
	allowsAdultContent: { type: Boolean, required: false, default: false}
});

export const User = model<IUser>('User', UserSchema);