import { Schema, model, Document } from 'mongoose'

export interface IUser extends Document
{
	username: string;
	password: string;
	manga: string[];
	anilist_token?: string; // optional Anilist OAuth token - lasted forever
}

const UserSchema = new Schema<IUser>({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	manga: { type: [String], default: [] },
	anilist_token: { type: String, required: false, unique: false }
});

export const User = model<IUser>('User', UserSchema);