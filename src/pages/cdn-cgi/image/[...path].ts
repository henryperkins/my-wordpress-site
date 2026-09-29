import type { APIRoute } from "astro";

export const prerender = false;

// Bundled photos load through Cloudflare Image Transformations, /cdn-cgi/image/<options>/<file> (see lib/photos.ts),
// which the live zone answers before the Worker runs. Where no resizer sits in front of the site (astro dev, astro
// preview, workers.dev) the request reaches this route instead, and the browser is sent to the original file.
const FILE = /^(?:images|brand)\/[\w.-]+$/;

export const GET: APIRoute = ({ params, url }) => {
	const file = (params.path ?? "").split("/").slice(1).join("/");
	if (!FILE.test(file)) return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
	return new Response(null, { status: 302, headers: { Location: new URL(`/${file}`, url).toString(), "Cache-Control": "no-store" } });
};
