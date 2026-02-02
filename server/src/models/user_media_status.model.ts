import { model, ObjectId, Schema, Types } from "mongoose";

export const USER_MEDIA_ENTRY_QUERY = `
	query GetUserMediaEntry($id: Int) {
		Media(id: $id, type: MANGA) {
			mediaListEntry {
				id
				status
				score
			}
		}
	}`;

export const USER_MEDIA_ENTRY_MUTATION = `
	mutation GetUserMediaEntry($id: Int) {
		SaveMediaListEntry(
			id: $id
			mediaId: $mediaId
			status: $status
			score: $score
			progress: $progress
			progressVolumes: $progressVolumes
			repeat: $repeat
			private: $private
			notes: $notes
			customLists: $customLists
			hiddenFromStatusLists: $hiddenFromStatusLists
			advancedScores: $advancedScores
			startedAt: $startedAt
			completedAt: $completedAt
		  ) {
			id
			mediaId
			status
			score
			advancedScores
			progress
			progressVolumes
			repeat
			priority
			private
			hiddenFromStatusLists
			customLists
			notes
			updatedAt
			startedAt {
			  year
			  month
			  day
			}
			completedAt {
			  year
			  month
			  day
			}
			user {
			  id
			  name
			}
			media {
			  id
			  title {
				userPreferred
			  }
			  coverImage {
				large
			  }
			  type
			  format
			  status
			  episodes
			  volumes
			  chapters
			  averageScore
			  popularity
			  isAdult
			  startDate {
				year
			  }
			}
		  }
	}`;

export type IUserMediaStatus = "CURRENT" | "PLANNING" | "COMPLETED" | "DROPPED" | "PAUSED" | "REPEATING";

export const MEDIA_LIST_STATUSES = [
	"CURRENT",
	"PLANNING",
	"COMPLETED",
	"DROPPED",
	"PAUSED",
	"REPEATING",
] as const


export interface IUserMediaEntry extends Document {
	id: number,
	userId: Types.ObjectId,
	mangaId: number, // anilist manga id
	status: IUserMediaStatus,
	score: number
}

// per current design, we will keep the schema the same as Anilist. If user has anilist account linked, we will update/overwrite that.
// If not, we will keep our own data
const UserMediaEntrySchema = new Schema<IUserMediaEntry>(
	{
		userId: { type: Schema.ObjectId, required: true},
		mangaId: { type: Number, required: true},
		status: {
			type: String,
			enum: MEDIA_LIST_STATUSES,
			required: true,
			default: "PLANNING"
		},
		score: { type: Number, required: false }
	}
)

export const UserMediaEntry = model<IUserMediaEntry>('UserMediaEntry', UserMediaEntrySchema);