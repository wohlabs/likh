import api from "@/services/AxiosInstance";
import { ServiceResult } from "./IServiceResult";

export interface SearchResultItem {
	id: number;
	title: {
		userPreferred: string;
		english: string;
	};
	coverImage: {
		large: string;
	};
	inLibrary: boolean;
}

export interface NoteResultItem {
	id: string;
	mangaId: number;
	text: string;
	startChapter: number;
	endChapter?: number;
	createdAt: string;
}

export interface ListResultItem {
	id: string;
	name: string;
	mangaIds: number[];
	isFavorite: boolean;
}

export interface SearchResult {
	manga: SearchResultItem[];
	notes: NoteResultItem[];
	lists: ListResultItem[];
}

export interface PaginatedSearchResult {
	items: SearchResultItem[] | NoteResultItem[] | ListResultItem[];
	total: number;
	page: number;
	pageSize: number;
	hasMore: boolean;
}

export const performAdvancedSearch = async (query: string): Promise<ServiceResult<SearchResult>> => 
{
	try 
	{
		const response = await api.get(`/search?query=${encodeURIComponent(query)}`);
		return {
			success: true,
			data: response.data
		};
	}
	catch (err: any) 
	{
		console.error('Advanced search error:', err);
		return {
			success: false,
			error: err.message || 'Failed to perform search'
		};
	}
};

export const searchCategory = async (
	query: string,
	category: 'manga' | 'notes' | 'lists',
	page: number = 1,
	pageSize: number = 20
): Promise<ServiceResult<PaginatedSearchResult>> => 
{
	try 
	{
		const response = await api.get(
			`/search/${category}?query=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`
		);
		return {
			success: true,
			data: response.data
		};
	}
	catch (err: any) 
	{
		console.error(`Category search error for ${category}:`, err);
		return {
			success: false,
			error: err.message || `Failed to search ${category}`
		};
	}
};
