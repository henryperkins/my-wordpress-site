import { getRequestContext, runWithContext } from "emdash";

/** Search results stay as text; the Astro renderer supplies the only allowed markup (<mark>). */
export interface SearchTextPart { text: string; marked: boolean }
export interface SearchEntry {
	id: string;
	data: { id?: unknown; status?: unknown; publishedAt?: unknown; scheduledAt?: unknown; title?: unknown; summary?: unknown; excerpt?: unknown };
}
export type SearchCollection = "pages" | "posts";
export interface SearchCandidate { collection: SearchCollection; slug: string; path: string }
export type SearchCollectionReader = (collection: SearchCollection, filter: {
	status: "published"; where: { slug: string[] }; limit: number; cursor?: string; orderBy?: Record<string, "asc" | "desc">;
}) => Promise<{ entries: SearchEntry[]; error?: Error; nextCursor?: string; hasMore?: boolean }>;

interface PublicSearchEntry { id: string; title: string; description: string }

// The native public endpoint accepts at most 50 results. Never turn a candidate
// check into an unbounded collection scan, even if an upstream response changes.
const MAX_CANDIDATES = 50;
const MAX_QUERY_PAGES = 3;
const MAX_EXCERPT_LENGTH = 240;
const RESERVED_PAGES = new Set(["api", "_emdash", "search", "404"]);

const normalizedText = (value: unknown): string => typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
const comparisonText = (value: string): string => normalizedText(value).replace(/^(?:\.{3}|…)+|(?:\.{3}|…)+$/g, "").trim().toLocaleLowerCase();

/** Decode only the escaping EmDash uses, once; decoded content is still text. */
function decodeSnippetText(value: string): string {
	const entities: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", apos: "'", nbsp: " " };
	return value.replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (_match, entity: string) => entities[entity]!);
}

function snippetParts(snippet: string): SearchTextPart[] {
	let marked = false;
	const parts: SearchTextPart[] = [];
	for (const part of snippet.trim().split(/(<\/?mark>)/g)) {
		if (part === "<mark>") marked = true;
		else if (part === "</mark>") marked = false;
		else if (part) parts.push({ text: decodeSnippetText(part), marked });
	}
	return parts;
}

function shortenedText(text: string): string {
	if (text.length <= MAX_EXCERPT_LENGTH) return text;
	const cut = text.slice(0, MAX_EXCERPT_LENGTH - 1);
	const lastSpace = cut.lastIndexOf(" ");
	return `${(lastSpace > MAX_EXCERPT_LENGTH / 2 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

function highlightText(text: string, query: string): SearchTextPart[] {
	const terms = [...new Set(query.slice(0, 200).match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? [])].sort((a, b) => b.length - a.length);
	if (terms.length === 0) return [{ text, marked: false }];
	const pattern = new RegExp(terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "giu");
	const parts: SearchTextPart[] = [];
	let offset = 0;
	for (const match of text.matchAll(pattern)) {
		if (match.index > offset) parts.push({ text: text.slice(offset, match.index), marked: false });
		parts.push({ text: match[0], marked: true });
		offset = match.index + match[0].length;
	}
	if (offset < text.length) parts.push({ text: text.slice(offset), marked: false });
	return parts;
}

/** Prefer a useful native snippet, then the published summary/excerpt, then no repeated description. */
export function searchExcerpt(title: unknown, snippet?: unknown, fallback?: unknown, query = ""): SearchTextPart[] {
	const heading = comparisonText(normalizedText(title));
	const parts = typeof snippet === "string" ? snippetParts(snippet) : [];
	const native = comparisonText(parts.map((part) => part.text).join(""));
	if (native && native !== heading) return parts;
	const description = normalizedText(fallback);
	if (!description || comparisonText(description) === heading) return [];
	return highlightText(shortenedText(description), query);
}

/** Only destinations supported by this site's current page and article routes. */
export function searchDestination(value: unknown): SearchCandidate | null {
	if (typeof value !== "string" || value.length > 512 || !value.startsWith("/") || /[\\?#\s\u0000-\u001f\u007f]/.test(value)) return null;
	if (value === "/") return { collection: "pages", slug: "home", path: "/" };
	const path = value.endsWith("/") ? value.slice(0, -1) : value;
	let segments: string[];
	try {
		segments = path.slice(1).split("/").map((segment) => decodeURIComponent(segment));
	} catch {
		return null;
	}
	// Encoded separators, dot segments, nested encodings and control characters
	// cannot become a different destination after the browser parses the URL.
	if (segments.some((segment) => !/^[\p{L}\p{N}][\p{L}\p{N}_-]*$/u.test(segment))) return null;
	if (segments.length === 1) {
		const slug = segments[0]!;
		if (RESERVED_PAGES.has(slug)) return null;
		return { collection: "pages", slug, path: slug === "home" ? "/" : `/${encodeURIComponent(slug)}` };
	}
	if (segments.length === 2 && segments[0] === "blog") {
		const slug = segments[1]!;
		return { collection: "posts", slug, path: `/blog/${encodeURIComponent(slug)}` };
	}
	return null;
}

export function searchResultDestination(collection: string, slug: string | null | undefined): SearchCandidate | null {
	if ((collection !== "pages" && collection !== "posts") || !slug) return null;
	const candidate = searchDestination(collection === "posts" ? `/blog/${encodeURIComponent(slug)}` : `/${encodeURIComponent(slug)}`);
	return candidate?.collection === collection ? candidate : null;
}

/** Keep public search on live revisions, preserving locale and database routing. */
export function withPublishedContent<T>(read: () => T): T {
	const context = getRequestContext();
	if (!context || (!context.editMode && context.preview === undefined)) return read();
	// A fresh context also avoids reusing a collection query cached with draft
	// overlays elsewhere in the editor request. Leave the outer context intact.
	return runWithContext({ ...context, editMode: false, preview: undefined }, read);
}

/** Check published collection rows rather than preview revisions or index metadata. */
export async function loadPublishedSearchEntries(candidates: SearchCandidate[], read: SearchCollectionReader, now = Date.now()): Promise<Map<string, PublicSearchEntry>> {
	const unique = new Map<string, SearchCandidate>();
	for (const candidate of candidates.slice(0, MAX_CANDIDATES)) {
		const validated = searchResultDestination(candidate.collection, candidate.slug);
		if (validated?.path === candidate.path) unique.set(candidate.path, candidate);
	}
	const groups = ["pages", "posts"] as const;
	const records = await withPublishedContent(() => Promise.all(groups.map(async (collection) => {
		const slugs = [...new Set([...unique.values()].filter((candidate) => candidate.collection === collection).map((candidate) => candidate.slug))];
		const found = new Map<string, PublicSearchEntry>();
		if (slugs.length === 0) return found;
		const requested = new Set(slugs);
		const seenCursors = new Set<string>();
		let cursor: string | undefined;
		for (let page = 0; page < MAX_QUERY_PAGES; page++) {
			const result = await read(collection, { status: "published", where: { slug: slugs }, limit: MAX_CANDIDATES, orderBy: { id: "asc" }, ...(cursor ? { cursor } : {}) });
			if (result.error) throw result.error;
			for (const entry of result.entries) {
				const destination = searchResultDestination(collection, entry.id);
				if (!destination || !requested.has(destination.slug) || entry.data.status !== "published") continue;
				const publishedAt = entry.data.publishedAt;
				if (publishedAt != null) {
					const timestamp = publishedAt instanceof Date ? publishedAt.getTime() : typeof publishedAt === "string" ? Date.parse(publishedAt) : NaN;
					if (!Number.isFinite(timestamp) || timestamp > now) continue;
				}
				const title = normalizedText(entry.data.title);
				if (!title) continue;
				const excerpt = searchExcerpt(title, undefined, collection === "pages" ? entry.data.summary : entry.data.excerpt);
				found.set(destination.path, { id: typeof entry.data.id === "string" ? entry.data.id : destination.path, title, description: excerpt.map((part) => part.text).join("") });
			}
			if (!result.nextCursor) {
				if (result.hasMore) throw new Error("Search content query omitted its next cursor");
				return found;
			}
			if (seenCursors.has(result.nextCursor)) throw new Error("Search content query repeated its cursor");
			seenCursors.add(result.nextCursor);
			cursor = result.nextCursor;
		}
		throw new Error("Search content query exceeded its candidate page limit");
	})));
	return new Map(records.flatMap((group) => [...group]));
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

/** Keep the native validation/error contract; only successful result bodies are repaired. */
export async function filterAISearchResponse(response: Response, read: SearchCollectionReader, options: { now?: number; onError?: (error: unknown) => void } = {}): Promise<Response> {
	const headers = new Headers(response.headers);
	headers.set("Cache-Control", "no-store");
	if (!response.ok) return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
	try {
		const body: unknown = await response.json();
		if (isRecord(body) && body.success === false) return Response.json(body, { status: response.status, headers });
		if (!isRecord(body) || body.success !== true || !isRecord(body.result) || !Array.isArray(body.result.chunks) || typeof body.result.search_query !== "string") {
			throw new Error("Unexpected AI search response");
		}
		const bestByPath = new Map<string, { candidate: SearchCandidate; score: number; type: string }>();
		for (const chunk of body.result.chunks.slice(0, MAX_CANDIDATES)) {
			if (!isRecord(chunk) || !isRecord(chunk.item) || typeof chunk.score !== "number" || !Number.isFinite(chunk.score) || typeof chunk.type !== "string") continue;
			const candidate = searchDestination(chunk.item.key);
			if (!candidate) continue;
			const previous = bestByPath.get(candidate.path);
			if (!previous || chunk.score > previous.score) bestByPath.set(candidate.path, { candidate, score: chunk.score, type: chunk.type });
		}
		const current = await loadPublishedSearchEntries([...bestByPath.values()].map(({ candidate }) => candidate), read, options.now);
		const chunks = [...bestByPath.values()].sort((a, b) => b.score - a.score).flatMap(({ candidate, score, type }) => {
			const published = current.get(candidate.path);
			return published ? [{ id: published.id, type, score, item: { key: candidate.path, metadata: { title: published.title, description: published.description } } }] : [];
		});
		headers.delete("Content-Length");
		headers.delete("ETag");
		return Response.json({ success: true, result: { search_query: body.result.search_query, chunks } }, { status: response.status, headers });
	} catch (error) {
		options.onError?.(error);
		return Response.json({ success: false, error: "Search is temporarily unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
	}
}
