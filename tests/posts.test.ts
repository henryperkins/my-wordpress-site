import assert from "node:assert/strict";
import test from "node:test";
import { plainText, readingTime } from "../src/lib/posts.ts";

test("published posts can have an empty CMS body", () => {
	for (const body of [null, undefined, []]) {
		assert.equal(plainText(body), "");
		assert.equal(readingTime(body), 1);
	}
});
