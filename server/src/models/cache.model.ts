import { Schema, model } from "mongoose";

export interface IApiCache extends Document
{
	key: string;
	data: any;
	expiresAt: Date;
}

const cacheSchema = new Schema<IApiCache>({
	key: { type: String, unique: true },
	data: Schema.Types.Mixed,
	expiresAt: { type: Date, index: { expireAfterSeconds: 0 } }
});

export const ApiCache = model("ApiCache", cacheSchema);