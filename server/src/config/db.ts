import { GridFSBucket } from 'mongodb';
import mongoose from 'mongoose';

let gfsBucket: GridFSBucket | undefined = undefined;

export const connectDB = async (uri: string) =>
{
	try
	{
		await mongoose.connect(uri);
		const db = mongoose.connection.db;
		if (!db) {
			throw new Error('MongoDB database connection is undefined');
		}
		gfsBucket = new GridFSBucket(db, {bucketName: 'images'});
		console.log('MongoDB connected');
	} catch (err)
	{
		console.error('MongoDB connection error:', err);
	}
};

export const getGFSBucket = () : GridFSBucket | undefined => gfsBucket;