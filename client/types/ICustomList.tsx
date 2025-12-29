export type ICustomList = {
	_id: string;
	name: string;
	description: string;
	isFavorite: boolean;
	mangaIds: number[];
};

export type ICustomLists = ICustomList[]