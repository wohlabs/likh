import { Note } from '../models/note.model';

export async function addTagsToNotes() {
	try {
		// Update all notes that don't have tags field to have an empty tags array
		const result = await Note.updateMany(
			{ tags: { $exists: false } },
			{ $set: { tags: [] } }
		);
		console.log(`Migration: Added empty tags to ${result.modifiedCount} notes`);
		return result;
	} catch (error) {
		console.error('Migration failed:', error);
		throw error;
	}
}
