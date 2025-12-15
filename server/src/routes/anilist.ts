import express, { Request, Response } from "express";
import { anilistRequest } from "../Utility";

const router = express.Router();
router.use(express.json())

// forward request to Anilist API
router.post("/", async (req: Request, res: Response) => {
	const query = req.body.query;
	const variables = req.body.variables || {};
	const auth = req.body.auth || {};
	try {
		const data = await anilistRequest(query, variables, 3600);
		return res.status(200).json(data);
	} catch (err: any) {
		console.error(err);
		return res.status(500).json({ error: err.message || "Failed to fetch data" });
	}
});

export default router;
