import type { AstroGlobal } from "astro";
import { pathTag } from "astro/cache/provider-utils";

export async function rewriteNotFound(Astro: AstroGlobal): Promise<Response> {
	// The adapter sees /404 after the rewrite. Redirect writes purge the originally requested path.
	if (!Astro.cache?.enabled) return Astro.rewrite("/404");
	const tag = pathTag(Astro.url.pathname);
	// Workers Cache separates tags with commas and limits each tag to 1024 characters.
	if (tag.includes(",") || tag.length > 1024) {
		const response = await Astro.rewrite("/404");
		Astro.cache.set(false);
		response.headers.set("Cache-Control", "no-store");
		return response;
	}
	Astro.cache.set({ tags: [tag] });
	return Astro.rewrite("/404");
}

export function contentUnavailable(Astro: AstroGlobal, error: Error): Response {
	console.error("[content] Entry lookup failed", error);
	if (Astro.cache?.enabled) Astro.cache.set(false);
	return new Response("This page is temporarily unavailable. Please try again.", {
		status: 503,
		headers: { "Cache-Control": "no-store" },
	});
}
