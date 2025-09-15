export type INoteEntry = {
	id: string;
	createdAt: string; // creation timestamp
	modifiedAt: string; // modification timestamp
	startChapter: number;
	endChapter?: number;
	images: string[]; // could be an empty array
	text?: string
};

export type IMangaNotes = INoteEntry[]