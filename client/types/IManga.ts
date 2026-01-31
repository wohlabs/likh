import { MangaProps } from "@/services/manga.service";

export type IMangaDetails = {
	id: string;
	title: { userPreferred?: string, english?: string };
	coverImage?: { large?: string };
	description?: string;
	genres?: string[];
	chapters?: number;
	// volumes?: number;
	status?: string;
	mangaId: number; // should be the same as anilist id
};

export const getMangaTitle = (manga: IMangaDetails | MangaProps | undefined) : string => {
	return manga?.title.english || manga?.title.userPreferred || "Unknown Title";
}