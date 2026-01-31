export type MangaItem = {
	mangaId: number,
	addedAt: Date
};

export type ICustomList = {
	_id: string;
	name: string;
	description: string;
	isFavorite: boolean;
	manga: MangaItem[];
};

export type ICustomLists = ICustomList[]