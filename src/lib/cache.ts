import type { AstroGlobal } from "astro";
import { getSiteSettingsWithCacheHint } from "emdash";
import { loadMenus } from "./menus";

export interface EdgeCache {
	/** Seconds the edge serves the page as fresh */
	maxAge: number;
	/** Further seconds it serves the stale page while one request refreshes it in the background */
	swr?: number;
}

/**
 * Lets the edge cache (Workers Cache, astro.config.mjs) share a page, tagged so that EmDash purges it when the page's
 * content, a menu or the site settings change. Astro sends headers before the layout renders, so pages call this from
 * their own frontmatter, last, after their content cache hints: a later Astro.cache.set() would undo the signed-in
 * opt-out. The settings and menu reads repeat Base.astro's; EmDash answers them from its per-request cache.
 */
export async function cachePage(Astro: AstroGlobal, options: EdgeCache = { maxAge: 300, swr: 86400 }): Promise<void> {
	// Ordinary form redirects can render private draft values. Opt out before
	// streaming the layout, even when edge caching is disabled locally.
	if (Astro.url.searchParams.has("enquiry")) {
		Astro.response.headers.set("Cache-Control", "private, no-store");
		if (Astro.cache?.enabled) Astro.cache.set(false);
		return;
	}
	if (!Astro.cache?.enabled) return;
	// Signed-in renders show the admin link. Without cache options the adapter marks them no-store for the edge.
	if (Astro.locals.user) return Astro.cache.set(false);
	const [settings, { hints }] = await Promise.all([getSiteSettingsWithCacheHint(), loadMenus()]);
	Astro.cache.set(settings.cacheHint);
	for (const hint of hints) Astro.cache.set(hint);
	Astro.cache.set(options);
}
