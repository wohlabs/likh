import { model, Schema } from "mongoose";

export type IMediaListStatus = "CURRENT" | "PLANNING" | "COMPLETED" | "DROPPED" | "PAUSED" | "REPEATING";

export const MEDIA_LIST_STATUSES = [
	"CURRENT",
	"PLANNING",
	"COMPLETED",
	"DROPPED",
	"PAUSED",
	"REPEATING",
] as const


export type IMediaListEntry = {
	id: number,
	status: IMediaListStatus,
	score: number
}

export type IManga = {
	mangaId: number;
	title: {
		userPreferred: string,
		english: string
	};
	coverImage?: {
		large?: string
		medium?: string
	};
	description?: string;
	genres?: string[];
	chapters?: number;
	volumes?: number;
	status?: string;
	updatedAt: Date;
	mediaListEntry?: IMediaListEntry;
};

const mediaListEntrySchema = new Schema<IMediaListEntry>(
	{
		id: Number,
		status: {
			type: String,
			enum: MEDIA_LIST_STATUSES,
			required: true,
			default: "PLANNING"
		},
		score: Number
	},
	{ _id: false }
)

const MangaSchema = new Schema<IManga>({
	mangaId: { type: Number, required: true, unique: false, index: true },
	title: {
		userPreferred: { type: String },
		english: { type: String }
	},
	coverImage: {
		large: { type: String },
		medium: { type: String }
	},
	description: { type: String },
	genres: { type: [String] },
	chapters: { type: Number },
	volumes: { type: Number },
	status: { type: String },
	updatedAt: { type: Date, default: Date.now, required: true },
	mediaListEntry: { type: mediaListEntrySchema, required: false }
});

export const MANGA_QUERY = `
	query GetManga($id: Int) {
		Media(id: $id, type: MANGA) {
			id
			title {
				userPreferred
				english
			}
			coverImage {
				large
			}
			description
			genres
			chapters
			volumes
			status
			mediaListEntry {
				id
				status
				score
			}
		}
	}`;

export const Manga = model<IManga>('Manga', MangaSchema);