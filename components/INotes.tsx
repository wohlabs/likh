export type INoteEntry = {
	id: string;
	createdAt: string; // creation timestamp
	modifiedAt: string; // modification timestamp
	startChapter: number;
	endChapter?: number;
	images?: string[];
	text?: string
};

export type IMangaNotes = INoteEntry[]