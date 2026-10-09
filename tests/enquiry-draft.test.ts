import assert from "node:assert/strict";
import test from "node:test";
import { parseEnquiry } from "../src/lib/enquiry-data.ts";
import { deleteEnquiryDraft, readEnquiryDraft, saveEnquiryDraft, ENQUIRY_DRAFT_TTL, type DraftStorage } from "../src/lib/enquiry-draft.ts";

function memoryStorage() {
	const records = new Map<string, string>();
	const writes: { key: string; expirationTtl: number }[] = [];
	const deleted: string[] = [];
	const storage: DraftStorage = {
		async get(key) { return records.get(key) ?? null; },
		async put(key, value, options) { records.set(key, value); writes.push({ key, ...options }); },
		async delete(key) { records.delete(key); deleted.push(key); },
	};
	return { storage, records, writes, deleted };
}

const token = "9d2c3b54-b94d-4fc8-b655-44df7aad5f9f";
const form = new FormData();
for (const [key, value] of Object.entries({ name: "Jordan Reyes", email: "jordan@example.com", phone: "123", notes: "First line\n<keep this text>" })) form.set(key, value);
const parsed = parseEnquiry(form, "/consultation");
const draft = { status: "invalid" as const, page: "/consultation", anchor: "enquiry", values: parsed.draft!, errors: parsed.errors, token };
const request = { page: draft.page, anchor: draft.anchor, status: draft.status, token: "" };

test("draft recovery round-trips bounded invalid fields and supplies a physical KV expiry", async () => {
	const { storage, writes } = memoryStorage();
	const id = await saveEnquiryDraft(storage, draft, 1000);
	assert.equal(writes[0].expirationTtl, ENQUIRY_DRAFT_TTL);
	assert.deepEqual(await readEnquiryDraft(storage, id, request, 1001), { ...draft, expiresAt: 1000 + ENQUIRY_DRAFT_TTL * 1000 });
	assert.equal(await readEnquiryDraft(storage, id, request, 1000 + ENQUIRY_DRAFT_TTL * 1000), null);
});

test("a draft belongs to its return page, form anchor, failure status and retry token", async () => {
	const { storage } = memoryStorage();
	const id = await saveEnquiryDraft(storage, { ...draft, status: "failed", errors: {} });
	const failed = { ...request, status: "failed", token };
	assert.ok(await readEnquiryDraft(storage, id, failed));
	for (const changed of [{ page: "/contact" }, { anchor: "other" }, { status: "invalid" }, { status: "sent" }, { token: crypto.randomUUID() }]) {
		assert.equal(await readEnquiryDraft(storage, id, { ...failed, ...changed }), null);
	}
});

test("missing, forged and malformed drafts do not expose values or cause rendering errors", async () => {
	const { storage, records } = memoryStorage();
	for (const id of [undefined, "../another-record", crypto.randomUUID()]) assert.equal(await readEnquiryDraft(storage, id, request), null);
	const id = await saveEnquiryDraft(storage, draft);
	const key = `lf-enquiry-draft:${id}`;
	for (const raw of ["broken JSON", "null", "{}", JSON.stringify({ ...draft, expiresAt: Date.now() + 1000, values: { name: "Jordan" } })]) {
		records.set(key, raw);
		assert.equal(await readEnquiryDraft(storage, id, request), null);
	}
});

test("rapid retries use fresh KV keys and cleanup only accepts a valid draft ID", async () => {
	const { storage, records, deleted } = memoryStorage();
	const first = await saveEnquiryDraft(storage, draft);
	const second = await saveEnquiryDraft(storage, draft);
	assert.notEqual(first, second);
	await deleteEnquiryDraft(storage, "../another-record");
	assert.equal(deleted.length, 0);
	await deleteEnquiryDraft(storage, first);
	assert.equal(await readEnquiryDraft(storage, first, request), null);
	assert.ok(await readEnquiryDraft(storage, second, request));
	assert.equal(records.size, 1);
});
