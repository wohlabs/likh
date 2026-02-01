import fetch from "node-fetch";
import crypto from "crypto";
import { ApiCache } from "./models/cache.model";

const ANILIST_URL = "https://graphql.anilist.co";

export function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Unknown error";
}

// Generates a unique key for caching based on query + variables
function makeCacheKey(query: string, variables: Record<string, any>, authorization?: string): string {
  const raw = JSON.stringify({ query, variables, authorization });
  return crypto.createHash("sha1").update(raw).digest("hex");
}

export async function anilistRequest(
  query: string,
  variables: Record<string, any> = {},
  ttl: number = 600 // default TTL 10 minutes
): Promise<any>
{
	const key = makeCacheKey(query, variables);

	// Check MongoDB cache first
	const cached = await ApiCache.findOne({ key });
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

	await ApiCache.deleteMany({ key });
	// Save to cache
	await ApiCache.create({
		key,
		data,
		expiresAt: new Date(Date.now() + ttl * 1000)
	});

	return data;
}

export async function anilistAuthenticatedRequest(
  query: string,
  variables: Record<string, any> = {},
  access_token?: string,
  ttl: number = 600 // default TTL 10 minutes
): Promise<any>
{
	const key = makeCacheKey(query, variables, access_token);

	// Check MongoDB cache first
	const cached = await ApiCache.findOne({ key });
	if (cached) {
		return cached.data;
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

	await ApiCache.deleteMany({ key });
	// Save to cache
	await ApiCache.create({
		key,
		data,
		expiresAt: new Date(Date.now() + ttl * 1000)
	});

	return data;
}
