import mongoose, { Types } from 'mongoose';
import 'sharp'
import { Note } from '../models/note.model';
import { PaddleOcrService } from 'ppu-paddle-ocr';
import { GridFSBucket } from 'mongodb';
import convert from 'heic-convert';

const service = new PaddleOcrService({
  debugging: {
    debug: false,
    verbose: false,
  },
});

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

async function getFileBuffer(fileId: any) : Promise<Uint8Array<ArrayBufferLike> | undefined> {
	if (!mongoose.connection.db) return undefined;
    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'images' });
    
    // 1. Open the stream
    const downloadStream = bucket.openDownloadStream(fileId);
    
    // 2. Collect chunks
    const chunks: any = [];
    
    return new Promise((resolve, reject) => {
        downloadStream.on('data', (chunk) => {
            chunks.push(chunk);
        });
        
        downloadStream.on('error', (err) => {
            reject(err);
        });
        
        downloadStream.on('end', () => {
            // 3. Concatenate all chunks into a single Buffer
            resolve(Buffer.concat(chunks));
        });
    });
}

async function getAndConvertHeic(fileId: any) {
    // 1. Get the raw HEIC buffer using your existing function
    const heicBuffer = await getFileBuffer(fileId);
    if (!heicBuffer) return undefined;

    // 2. Convert to JPEG or PNG
    const outputBuffer = await convert({
        buffer: heicBuffer,
        format: 'JPEG',      // or 'PNG'
        quality: 0.9         // quality from 0 to 1
    });

    return outputBuffer;
}

export async function addOCRToImages() {
	// 1. Ensure we wait for the connection to be fully ready
    if (mongoose.connection.readyState !== 1) {
        console.log("Waiting for database connection...");
        await new Promise((resolve) => mongoose.connection.once('connected', resolve));
    }

	const images = await mongoose.connection.db?.collection('images.files').find(
		{ "metadata.ocrText": { $exists: false } }
	).toArray();
	service.initialize()
	for (const image of images ?? []) {
		try {

			let buffer;
			if(image.metadata.mimeType == 'image/heic') 
			{
				buffer = await getAndConvertHeic(image._id)
				console.log(buffer)
			}
			else
			{
				buffer = await getFileBuffer(image._id)
			}
			// console.log(image)
			const arrayBuffer = buffer?.buffer.slice(
				buffer.byteOffset, 
				buffer.byteOffset + buffer.byteLength
			);
			const result = (await service.recognize(arrayBuffer as ArrayBuffer));
			const ocrRes = result.text
			await mongoose.connection.db?.collection('images.files').updateOne({ _id: new Types.ObjectId(image._id) },
				{ 
					$set: { 
						"metadata.ocrText": ocrRes,
						"metadata.ocrProcessedAt": new Date()
					} 
				}
			);
	
		} catch (error) {
			console.error(`Failed to process image ${image._id}:`, error.message);
		}
	}
	await service.destroy();
	console.log("done")
}
