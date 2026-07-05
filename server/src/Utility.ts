import crypto from "crypto";
import fetch from "node-fetch";
import { ApiCache, IApiCache } from "./models/cache.model";

const ANILIST_URL = "https://graphql.anilist.co";

export function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Unknown error";
}

// Generates a unique key for caching based on query + variables
function makeCacheKey(query: string, variables: Record<string, any>, authorization?: string): string {
  const raw = JSON.stringify({ query, variables, authorization });
  return crypto.createHash("sha1").update(raw).digest("hex");
}

export async function getCache(query: string, variables: Record<string, any>, authorization?: string) : Promise<IApiCache | null>
{
	const key = makeCacheKey(query, variables, authorization);

	// Check MongoDB cache first
	const cached = await ApiCache.findOne({
		key,
		expiresAt: { $gt: new Date() }
	});

	return cached;
}

export async function anilistRequest(
  query: string,
  variables: Record<string, any> = {},
  ttl: number = 600 // default TTL 10 minutes
): Promise<any>
{
	const key = makeCacheKey(query, variables);

	// Check MongoDB cache first
	const cached = await getCache(query, variables);
	if (cached) {
		return cached.data;
	}

	// Fetch from AniList
	const res = await fetch(ANILIST_URL, {
		method: "POST",
		headers: {
		"Content-Type": "application/json",
		Accept: "application/json"
		},
		body: JSON.stringify({ query, variables })
	});

	if (!res.ok) throw new Error(`AniList request failed: ${res.statusText}`);

	const data = await res.json();

	// Create or update current cache with the same key
	await ApiCache.updateOne(
		{ key },
		{
			$set: {
				data,
				expiresAt: new Date(Date.now() + ttl * 1000),
			},
		},
		{ upsert: true }
	);

	return data;
}

export async function anilistAuthenticatedRequest(
  query: string,
  variables: Record<string, any> = {},
  access_token?: string,
  ttl: number = 600, // default TTL 10 minutes
  skipCache = false
): Promise<any>
{
	const key = makeCacheKey(query, variables, access_token);
	if (!skipCache)
	{
		// Check MongoDB cache first
		const cached = await getCache(query, variables, access_token);
		if (cached) {
			return cached.data;
		}
	}

	const headers: HeadersInit = {
		"Content-Type": "application/json",
		Accept: "application/json",
	}
	if (access_token) // neccessary for some authenticated request
	{
		headers['Authorization'] = 'Bearer ' + access_token
	}
	// Fetch from AniList
	const res = await fetch(ANILIST_URL, {
		method: "POST",
		headers: headers,
		body: JSON.stringify({ query, variables })
	});

	if (!res.ok) throw new Error(`AniList request failed: ${res.statusText}`);

	const data = await res.json();

	// Create or update current cache with the same key
	await ApiCache.updateOne(
		{ key },
		{
			$set: {
				data,
				expiresAt: new Date(Date.now() + ttl * 1000),
			},
		},
		{ upsert: true }
	);

	return data;
}

export async function deleteAnilistCache(
  query: string,
  variables: Record<string, any> = {},
  access_token?: string,
)
{
	const key = makeCacheKey(query, variables, access_token);
	await ApiCache.deleteOne({key});
}