export type IMangaDetails = {
	id: string;
	title: { userPreferred?: string, english?: string };
	coverImage?: { large?: string };
	description?: string;
	genres?: string[];
	chapters?: number;
	// volumes?: number;
	status?: string;
};

export const getMangaTitle = (manga: IMangaDetails | undefined) : string => {
	return manga?.title.english || manga?.title.userPreferred || "Unknown Title";
}