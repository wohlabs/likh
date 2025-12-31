import api from "@/services/AxiosInstance";
import { ServiceResult } from "./IServiceResult";

export interface SearchResult {
	manga: Array<{
		id: number;
		title: {
			userPreferred: string;
			english: string;
		};
		coverImage: {
			large: string;
		};
	}>;
	notes: Array<{
		id: string;
		mangaId: number;
		text: string;
		startChapter: number;
		endChapter?: number;
		createdAt: string;
	}>;
	lists: Array<{
		id: string;
		name: string;
		mangaIds: number[];
		isFavorite: boolean;
	}>;
}

export const performAdvancedSearch = async (query: string): Promise<ServiceResult<SearchResult>> => {
	try {
		const response = await api.get(`/search?query=${encodeURIComponent(query)}`);
		return {
			success: true,
			data: response.data
		};
	} catch (err: any) {
		console.error('Advanced search error:', err);
		return {
			success: false,
			error: err.message || 'Failed to perform search'
		};
	}
};
