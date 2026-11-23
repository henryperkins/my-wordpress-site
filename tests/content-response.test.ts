import assert from "node:assert/strict";
import { test } from "node:test";
import type { AstroGlobal } from "astro";
import { contentUnavailable, rewriteNotFound } from "../src/lib/content-response.ts";

test("a rewritten miss retains the original escaped pathname for redirect invalidation", async () => {
	const calls: unknown[] = [];
	const context = {
		url: new URL("https://example.test/blog/caf%C3%A9?from=home"),
		cache: { enabled: true, set: (hint: unknown) => calls.push(hint) },
		rewrite: async (path: string) => {
			calls.push(path);
			return new Response(null, { status: 404 });
		},
	} as unknown as AstroGlobal;
	assert.equal((await rewriteNotFound(context)).status, 404);
	assert.deepEqual(calls, [{ tags: ["astro-path:/blog/caf%C3%A9"] }, "/404"]);
});

test("misses with an unrepresentable cache tag opt out after the 404 renders", async () => {
	for (const path of ["/a,b", "/" + "x".repeat(1024)]) {
		const calls: unknown[] = [];
		const context = {
			url: new URL(path, "https://example.test"),
			cache: { enabled: true, set: (hint: unknown) => calls.push(hint) },
			rewrite: async () => {
				calls.push("render");
				return new Response(null, { status: 404 });
			},
		} as unknown as AstroGlobal;
		const response = await rewriteNotFound(context);
		assert.equal(response.headers.get("Cache-Control"), "no-store");
		assert.deepEqual(calls, ["render", false]);
	}
});

test("content lookup errors opt out of shared caching and return 503", async (t) => {
	t.mock.method(console, "error", () => {});
	const cacheCalls: unknown[] = [];
	const context = { cache: { enabled: true, set: (hint: unknown) => cacheCalls.push(hint) } } as unknown as AstroGlobal;
	const response = contentUnavailable(context, new Error("internal D1 details"));
	assert.equal(response.status, 503);
	assert.equal(response.headers.get("Cache-Control"), "no-store");
	assert.deepEqual(cacheCalls, [false]);
	assert.doesNotMatch(await response.text(), /internal D1 details/);
});
