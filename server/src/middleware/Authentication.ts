import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'

dotenv.config()

export const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret123"

export interface JwtPayload {
	id: string;
}

const authenticationMiddleware = (req: Request, res: Response, next: NextFunction) =>
{
	const authHeader = req.headers['authorization'];
	if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

	const token = authHeader.split(' ')[1];
	try
	{
		const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
		req.user = decoded;
		next();
	}
	catch
	{
		res.status(401).json({ error: 'Invalid token' });
	}
};

export default authenticationMiddleware;