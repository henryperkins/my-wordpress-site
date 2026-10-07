import assert from "node:assert/strict";
import test from "node:test";
import { getRequestContext, runWithContext, type EmDashRequestContext } from "emdash";
import {
	filterAISearchResponse,
	loadPublishedSearchEntries,
	searchDestination,
	type SearchCollectionReader,
	type SearchEntry,
} from "../src/lib/search-results.ts";

const now = Date.parse("2026-09-30T12:00:00Z");
const entry = (slug: string, data: Partial<SearchEntry["data"]> = {}): SearchEntry => ({
	id: slug,
	data: { id: `id-${slug}`, status: "published", publishedAt: new Date("2026-09-01T00:00:00Z"), title: slug, summary: `Public summary for ${slug}.`, ...data },
});
const chunk = (path: string, score = 0.8) => ({
	id: `stale-${path}`, type: "text", score,
	item: { key: path, metadata: { title: "Unpublished title", description: "Private draft text", image: "https://example.com/stale.png" } },
});
const response = (chunks: ReturnType<typeof chunk>[]) => Response.json({ success: true, result: { search_query: "hosting", chunks } });

test("public search keeps published metadata during editing and previews, including an already-cached draft", async () => {
	const database = {};
	for (const context of [
		{ editMode: true, locale: "en", db: database, dbIsIsolated: true },
		{ editMode: false, preview: { collection: "pages", id: "id-hosting" }, locale: "en", db: database, dbIsIsolated: true },
	] satisfies EmDashRequestContext[]) {
		await runWithContext(context, async () => {
			// Model the upstream reader at the publication boundary: draft overlays
			// and its query cache are scoped to the real EmDash request context.
			const cached = new WeakMap<EmDashRequestContext, { entries: SearchEntry[] }>();
			const read: SearchCollectionReader = async () => {
				const scope = getRequestContext()!;
				assert.equal(scope.locale, "en");
				assert.equal(scope.db, database);
				assert.equal(scope.dbIsIsolated, true);
				const previous = cached.get(scope);
				if (previous) return previous;
				const result = { entries: [scope.editMode || scope.preview
					? entry("hosting", { title: "Private draft title", summary: "Private draft summary" })
					: entry("hosting", { title: "Published hosting", summary: "Published hosting summary" })] };
				cached.set(scope, result);
				return result;
			};
			// EmDash 1.2 overlays drafts even with an explicit published filter.
			const draft = await read("pages", { status: "published", where: { slug: ["hosting"] }, limit: 50 });
			assert.equal(draft.entries[0]?.data.title, "Private draft title");
			const result = await filterAISearchResponse(response([chunk("/hosting")]), read, { now });
			assert.equal(result.status, 200);
			assert.deepEqual((await result.json()).result.chunks[0].item.metadata, {
				title: "Published hosting", description: "Published hosting summary",
			});
			assert.equal(getRequestContext(), context, "the surrounding editor context is preserved");
		});
	}
});

test("AI results are unique by canonical destination and use current published metadata", async () => {
	const read: SearchCollectionReader = async (collection, filter) => {
		assert.equal(collection, "pages");
		assert.equal(filter.status, "published");
		assert.deepEqual(filter.where, { slug: ["home", "hosting"] });
		return { entries: [entry("home", { title: "Home", summary: "Hosting and management for small businesses." }), entry("hosting", { title: "Hosting" })] };
	};
	const result = await filterAISearchResponse(response([chunk("/home", 0.6), chunk("/", 0.95), chunk("/home/", 0.9), chunk("/hosting"), chunk("/hosting/", 0.4)]), read, { now });
	assert.equal(result.status, 200);
	assert.equal(result.headers.get("cache-control"), "no-store");
	const body = await result.json();
	assert.deepEqual(body.result.chunks.map((item: any) => item.item.key), ["/", "/hosting"]);
	assert.equal(body.result.chunks[0].score, 0.95);
	assert.deepEqual(body.result.chunks[0].item.metadata, { title: "Home", description: "Hosting and management for small businesses." });
	assert.ok(!JSON.stringify(body).includes("Private draft"));
	assert.ok(!JSON.stringify(body).includes("Unpublished title"));
	assert.ok(!JSON.stringify(body).includes("stale.png"));
});

test("missing, draft, archived, scheduled, future-dated and invalid-date entries cannot leak", async () => {
	const read: SearchCollectionReader = async () => ({ entries: [
		entry("live", { title: "Live" }),
		entry("draft", { status: "draft", title: "Private draft" }),
		entry("archived", { status: "archived" }),
		entry("scheduled", { status: "scheduled", scheduledAt: new Date(now + 60_000) }),
		entry("future", { publishedAt: new Date(now + 60_000) }),
		entry("invalid", { publishedAt: new Date("invalid") }),
		entry("unknown", { status: undefined }),
	] });
	const result = await filterAISearchResponse(response(["live", "draft", "archived", "scheduled", "future", "invalid", "unknown", "missing"].map((slug) => chunk(`/${slug}`))), read, { now });
	assert.deepEqual((await result.json()).result.chunks.map((item: any) => item.item.key), ["/live"]);
});

test("a published entry with a future scheduled revision keeps its current live metadata", async () => {
	const read: SearchCollectionReader = async () => ({ entries: [entry("hosting", { scheduledAt: new Date(now + 60_000), title: "Current live title" })] });
	const result = await filterAISearchResponse(response([chunk("/hosting")]), read, { now });
	assert.equal((await result.json()).result.chunks[0].item.metadata.title, "Current live title");
});

test("post descriptions use their current published excerpt", async () => {
	const read: SearchCollectionReader = async (collection, filter) => {
		assert.equal(collection, "posts");
		assert.deepEqual(filter.where, { slug: ["a-guide"] });
		return { entries: [entry("a-guide", { title: "A guide", excerpt: "How to plan a small-business site.", summary: undefined })] };
	};
	const result = await filterAISearchResponse(response([chunk("/blog/a-guide")]), read, { now });
	assert.deepEqual((await result.json()).result.chunks[0].item.metadata, { title: "A guide", description: "How to plan a small-business site." });
});

test("unsupported destinations are removed before any content query", async () => {
	const read: SearchCollectionReader = async () => assert.fail("No content lookup is needed");
	const result = await filterAISearchResponse(response([chunk("https://example.com"), chunk("/_emdash/admin"), chunk("/products/widget"), chunk("/blog/%2e%2e")]), read, { now });
	assert.deepEqual((await result.json()).result.chunks, []);
});

test("only requested slugs can be returned even if a reader supplies unrelated entries", async () => {
	const read: SearchCollectionReader = async () => ({ entries: [entry("unrelated"), entry("hosting")] });
	const records = await loadPublishedSearchEntries([searchDestination("/hosting")!], read, now);
	assert.deepEqual([...records.keys()], ["/hosting"]);
});

test("candidate verification follows pagination with the same publication and slug restrictions", async () => {
	const calls: unknown[] = [];
	const read: SearchCollectionReader = async (collection, filter) => {
		calls.push({ collection, filter });
		if (!filter.cursor) return { entries: [entry("home")], nextCursor: "page-two", hasMore: true };
		assert.equal(filter.cursor, "page-two");
		return { entries: [entry("hosting")], hasMore: false };
	};
	const records = await loadPublishedSearchEntries([searchDestination("/")!, searchDestination("/hosting")!], read, now);
	assert.deepEqual([...records.keys()], ["/", "/hosting"]);
	assert.equal(calls.length, 2);
	for (const call of calls as any[]) {
		assert.equal(call.filter.status, "published");
		assert.deepEqual(call.filter.where, { slug: ["home", "hosting"] });
		assert.ok(call.filter.limit <= 50);
	}
});

test("a repeating cursor and incomplete pagination fail closed", async () => {
	for (const read of [
		async () => ({ entries: [], nextCursor: "same", hasMore: true }),
		async () => ({ entries: [], hasMore: true }),
	] satisfies SearchCollectionReader[]) {
		await assert.rejects(() => loadPublishedSearchEntries([searchDestination("/hosting")!], read, now));
	}
});

test("candidate work stays bounded when an upstream response is larger than the native maximum", async () => {
	let count = 0;
	const read: SearchCollectionReader = async (_collection, filter) => {
		count += filter.where.slug.length;
		return { entries: filter.where.slug.map((slug) => entry(slug)) };
	};
	const result = await filterAISearchResponse(response(Array.from({ length: 200 }, (_, i) => chunk(`/page-${i}`))), read, { now });
	assert.ok(count <= 50);
	assert.ok((await result.json()).result.chunks.length <= 50);
});

test("returned and thrown content errors produce an unavailable response, never stale metadata", async () => {
	for (const read of [
		async () => ({ entries: [], error: new Error("database unavailable") }),
		async () => { throw new Error("database unavailable"); },
	] satisfies SearchCollectionReader[]) {
		const result = await filterAISearchResponse(response([chunk("/hosting")]), read, { now });
		assert.equal(result.status, 503);
		assert.equal(result.headers.get("cache-control"), "no-store");
		assert.deepEqual(await result.json(), { success: false, error: "Search is temporarily unavailable" });
	}
});

test("native validation, disabled-plugin and provider errors retain their status and payload", async () => {
	for (const status of [400, 404, 429, 503]) {
		const read: SearchCollectionReader = async () => assert.fail("Native errors must not query content");
		const body = { success: false, error: `Native error ${status}` };
		const native = Response.json(body, { status, headers: { "retry-after": "30" } });
		const result = await filterAISearchResponse(native, read, { now });
		assert.equal(result.status, status);
		assert.equal(result.headers.get("retry-after"), "30");
		assert.equal(result.headers.get("cache-control"), "no-store");
		assert.deepEqual(await result.json(), body);
	}
});

test("an empty native query stays successful and makes no content query", async () => {
	const read: SearchCollectionReader = async () => assert.fail("Empty searches need no content lookup");
	const result = await filterAISearchResponse(Response.json({ success: true, result: { search_query: "", chunks: [] } }), read, { now });
	assert.deepEqual(await result.json(), { success: true, result: { search_query: "", chunks: [] } });
});

test("malformed successful provider responses fail closed", async () => {
	const read: SearchCollectionReader = async () => assert.fail("Malformed results must not query content");
	for (const native of [Response.json({ success: true, result: { chunks: "bad" } }), new Response("not JSON")]) {
		const result = await filterAISearchResponse(native, read, { now });
		assert.equal(result.status, 503);
		assert.equal((await result.json()).success, false);
	}
});
