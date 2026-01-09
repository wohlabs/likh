import express, { Request, Response } from "express";
import { anilistRequest } from "../Utility";
import { Manga, MANGA_QUERY } from "../models/manga.model";

const router = express.Router();
router.use(express.json())

const TTL = 7*24*60*60*1000; // 7 days in milliseconds

// forward request to Anilist API
router.get("/:id", async (req: Request, res: Response) => {
	const id: string = req.params?.id;
	try {
		const storedManga = await Manga.findOne({ mangaId: parseInt(id) });
		if (!storedManga)
		{
			console.log("Manga not found in DB, fetching from Anilist");
			const refreshedManga = await anilistRequest(MANGA_QUERY, { id: parseInt(id) } , 3600);
			const toBeRefreshedManga = new Manga({
				mangaId: refreshedManga.data.Media.id,
				title: refreshedManga.data.Media.title,
				coverImage: refreshedManga.data.Media.coverImage,
				description: refreshedManga.data.Media.description,
				genres: refreshedManga.data.Media.genres,
				chapters: refreshedManga.data.Media.chapters,
				volumes: refreshedManga.data.Media.volumes,
				status: refreshedManga.data.Media.status,
				updatedAt: new Date()
			})
			toBeRefreshedManga.save();
			return res.status(200).json(toBeRefreshedManga);
		}
		else if (storedManga.updatedAt < new Date(Date.now() - TTL))
		{
			const refreshedManga = await anilistRequest(MANGA_QUERY, { id: parseInt(id) } , 3600);
			storedManga.title = refreshedManga.data.Media.title;
			storedManga.coverImage = refreshedManga.data.Media.coverImage;
			storedManga.description = refreshedManga.data.Media.description;
			storedManga.genres = refreshedManga.data.Media.genres;
			storedManga.chapters = refreshedManga.data.Media.chapters;
			storedManga.volumes = refreshedManga.data.Media.volumes;
			storedManga.status = refreshedManga.data.Media.status;
			storedManga.updatedAt = new Date();
			storedManga.save();
			return res.status(200).json(storedManga);
		}
		else
		{
			return res.status(200).json(storedManga);
		}
	} catch (err: any) {
		return res.status(500).json({ error: err.message || "Failed to fetch manga" });
	}
});

export default router;