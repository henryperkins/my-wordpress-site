import type { APIRoute } from "astro";
import { getEmDashCollection, getSiteSettings } from "emdash";
import { postPath } from "../lib/posts";

export const prerender = false;

const XML: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" };
const escapeXml = (value: string) => value.replace(/[&<>"']/g, (ch) => XML[ch]!);

// RSS 2.0 feed of the 20 newest blog posts.
export const GET: APIRoute = async ({ site, url }) => {
	const origin = site ?? new URL(url.origin);
	const settings = await getSiteSettings();
	const title = settings?.title || "Lakefront Digital";
	const { entries } = await getEmDashCollection("posts", { orderBy: { published_at: "desc" }, limit: 20 });

	const items = entries
		.filter((post) => post.data.publishedAt)
		.map((post) => {
			const link = new URL(postPath(post.id), origin).href;
			return `    <item>
      <title>${escapeXml(post.data.title || "Untitled")}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${post.data.publishedAt!.toUTCString()}</pubDate>
      <description>${escapeXml(post.data.excerpt || "")}</description>
    </item>`;
		})
		.join("\n");

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${title} blog`)}</title>
    <description>${escapeXml(settings?.tagline || "")}</description>
    <link>${new URL("/blog", origin).href}</link>
    <atom:link href="${new URL("/rss.xml", origin).href}" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

	return new Response(body, {
		headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
	});
};
