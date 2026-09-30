import assert from "node:assert/strict";
import test from "node:test";
import { searchExcerpt, searchDestination, searchResultDestination } from "../src/lib/search-results.ts";

test("a highlighted title uses the CMS summary and highlights the search term", () => {
	assert.deepEqual(searchExcerpt("Hosting", "<mark>Hosting</mark>", "Managed hosting with daily backups.", "hosting"), [
		{ text: "Managed ", marked: false },
		{ text: "hosting", marked: true },
		{ text: " with daily backups.", marked: false },
	]);
});

test("comparison decodes escaped text and ignores case, whitespace and snippet ellipses", () => {
	assert.deepEqual(searchExcerpt("Hosting & support", "...<mark>HOSTING</mark> &amp; support…", " Hosting & support ", "hosting"), []);
});

test("a useful native snippet retains its exact marked words as safe text parts", () => {
	assert.deepEqual(searchExcerpt("Hosting", "Daily <mark>backups</mark> &amp; monitoring", "A different summary", "backup"), [
		{ text: "Daily ", marked: false },
		{ text: "backups", marked: true },
		{ text: " & monitoring", marked: false },
	]);
});

test("CMS fallback markup stays text and never becomes renderer-supplied HTML", () => {
	assert.deepEqual(searchExcerpt("Hosting", "Hosting", '<img src=x onerror="alert(1)"> hosting', "hosting"), [
		{ text: '<img src=x onerror="alert(1)"> ', marked: false },
		{ text: "hosting", marked: true },
	]);
	assert.deepEqual(searchExcerpt("Hosting", "&lt;script&gt;alert(1)&lt;/script&gt; <mark>hosting</mark>", null, "hosting"), [
		{ text: "<script>alert(1)</script> ", marked: false },
		{ text: "hosting", marked: true },
	]);
});

test("missing or redundant summaries suppress the excerpt", () => {
	assert.deepEqual(searchExcerpt("Hosting", undefined, undefined, "hosting"), []);
	assert.deepEqual(searchExcerpt("Hosting", "<mark>Hosting</mark>", "hosting", "hosting"), []);
});

test("fallback text is limited without losing query highlighting", () => {
	const parts = searchExcerpt("Hosting", "Hosting", `Managed hosting ${"with backups ".repeat(30)}`, "hosting");
	const text = parts.map((part) => part.text).join("");
	assert.ok(text.length <= 240);
	assert.ok(text.endsWith("…"));
	assert.deepEqual(parts.filter((part) => part.marked), [{ text: "hosting", marked: true }]);
});

test("home variants and trailing slashes produce one canonical destination", () => {
	for (const path of ["/", "/home", "/home/"]) {
		assert.deepEqual(searchDestination(path), { collection: "pages", slug: "home", path: "/" });
	}
	assert.deepEqual(searchDestination("/hosting/"), { collection: "pages", slug: "hosting", path: "/hosting" });
	assert.deepEqual(searchDestination("/blog/a-guide"), { collection: "posts", slug: "a-guide", path: "/blog/a-guide" });
});

test("external URLs, reserved routes, unsupported paths and encoded path tricks are excluded", () => {
	for (const path of [
		"https://example.com/hosting", "//example.com/hosting", "hosting", "/\\example.com", "/hosting?preview=1",
		"/hosting#draft", "/../hosting", "/%2e%2e/hosting", "/blog/%2Fhosting", "/blog/%252fhosting", "/hosting%3fpreview",
		"/hosting\n", "/hosting//", "/api/enquiry", "/_emdash/admin", "/search", "/404", "/rss.xml", "/blog/category/news",
		"/products/widget", "/blog/../hosting", "/blog/%5cfoo", "/%00hosting", "/%zz",
	]) {
		assert.equal(searchDestination(path), null, path);
	}
});

test("full-text destinations require a supported collection and usable slug", () => {
	assert.deepEqual(searchResultDestination("pages", "home"), { collection: "pages", slug: "home", path: "/" });
	assert.equal(searchResultDestination("products", "widget"), null);
	assert.equal(searchResultDestination("posts", null), null);
	assert.equal(searchResultDestination("pages", "blog/draft"), null);
});
