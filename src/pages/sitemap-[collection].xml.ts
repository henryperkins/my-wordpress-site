import type { APIRoute } from "astro";
import { GET as emdashSitemap } from "emdash/internal/routes/sitemap-_collection_.xml";

export const prerender = false;

// EmDash's per-collection sitemap, which it stops injecting while this file exists. EmDash builds each page's
// URL from the pattern /{slug}, so it listed the home page as /home, which redirects to /. List it as / instead.
const HOME = /<loc>(https?:\/\/[^/<]+)\/home<\/loc>/;

export const GET: APIRoute = async (context) => {
	const response = await emdashSitemap(context);
	const collection = context.params.collection;
	if (!(collection === "pages" || collection?.startsWith("pages-")) || !response.ok) return response;
	const xml = await response.text();
	return new Response(xml.replace(HOME, "<loc>$1/</loc>"), { status: response.status, headers: response.headers });
};
