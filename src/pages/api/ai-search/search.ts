import type { APIRoute } from "astro";
import { POST as nativeSearch } from "@emdash-cms/cloudflare/plugins/ai-search";
import { getEmDashCollection } from "emdash";
import { filterAISearchResponse } from "../../../lib/search-results";

export const prerender = false;

// Keep the native plugin's request validation, binding, configuration and error
// behavior. Its index can lag publication changes, so validate destinations and
// replace index metadata with current published CMS fields before responding.
export const POST: APIRoute = async (context) => filterAISearchResponse(
	await nativeSearch(context),
	getEmDashCollection,
	{ onError: (error) => console.error("[ai-search] Published content verification failed:", error) },
);
