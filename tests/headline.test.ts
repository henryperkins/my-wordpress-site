import assert from "node:assert/strict";
import test from "node:test";
import { headingWidthEm, keepsTogether, splitHeadline } from "../src/lib/headline.ts";

test("highlighted words inside the headline are highlighted where they stand", () => {
	assert.deepEqual(splitHeadline("We build, host and look after your website.", "look after"), {
		before: "We build, host and ",
		highlight: "look after",
		after: " your website.",
	});
});

test("highlighted words at the end keep the headline's closing punctuation inside the highlight", () => {
	assert.deepEqual(splitHeadline("Know where your site stands and what to do next.", "what to do next."), {
		before: "Know where your site stands and ",
		highlight: "what to do next.",
		after: "",
	});
});

test("highlighted words the headline doesn't contain follow it after one space, as earlier content was written", () => {
	assert.deepEqual(splitHeadline("We build, host and", "look after your website"), {
		before: "We build, host and ",
		highlight: "look after your website",
		after: "",
	});
	assert.deepEqual(splitHeadline("We build, host and  ", " look after your website "), {
		before: "We build, host and ",
		highlight: "look after your website",
		after: "",
	});
});

test("without highlighted words the headline is left as it is", () => {
	for (const highlight of [undefined, null, "", "   "]) {
		assert.deepEqual(splitHeadline("One person, accountable for your site.", highlight), {
			before: "One person, accountable for your site.",
			highlight: "",
			after: "",
		});
	}
});

test("only the first occurrence is highlighted, and a highlight can be the whole headline", () => {
	assert.deepEqual(splitHeadline("Look after it, and we look after it.", "look after"), {
		before: "Look after it, and we ",
		highlight: "look after",
		after: " it.",
	});
	assert.deepEqual(splitHeadline("Look after it.", "Look after it."), { before: "", highlight: "Look after it.", after: "" });
	assert.deepEqual(splitHeadline("", "Look after it."), { before: "", highlight: "Look after it.", after: "" });
});

test("the concept's highlights stay on one line, at each heading's narrowest measure", () => {
	assert.equal(keepsTogether("look after", 6.9), true); // the wave hero: about 7em at 320 and 901px
	assert.equal(keepsTogether("what to do next.", 9.2), true); // the consultation heading: about 9.3em
});

test("a highlight that might not fit wraps with the heading instead of running off a phone", () => {
	assert.equal(keepsTogether("look after your website", 6.9), false); // older content, appended after the headline
	assert.equal(keepsTogether("maximum momentum", 9.2), false); // measured 314px at 30px, on a 280px line
	assert.equal(keepsTogether("MMMMMMMMMMMMM", 6.9), false); // thirteen wide letters
	assert.equal(keepsTogether("", 9.2), false);
});

test("the width estimate never undercounts: unknown characters count as the widest", () => {
	assert.ok(headingWidthEm("é") >= headingWidthEm("e"));
	assert.equal(headingWidthEm("🙂"), headingWidthEm("W"));
	assert.ok(headingWidthEm("look after") < headingWidthEm("look after your website"));
});
