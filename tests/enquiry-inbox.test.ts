import assert from "node:assert/strict";
import test from "node:test";
import type { FormDefinition } from "@emdash-cms/plugin-forms";
import type { ConditionalWriteResult, StorageCollection, VersionedValue } from "emdash";
import type { Enquiry } from "../src/lib/enquiry-data.ts";
import { ENQUIRY_FORM_IDS, initialEnquiryForms } from "../src/lib/enquiry-forms.ts";
import { deliverEnquiry, enquirySubmissionId, updateEnquiryTriage, type EnquiryInbox, type StoredEnquiry } from "../src/lib/enquiry-inbox.ts";

const token = "9d2c3b54-b94d-4fc8-b655-44df7aad5f9f";
const enquiry: Enquiry = {
	subject: "Project enquiry", name: "Jordan Reyes", email: "jordan@example.com", phone: "(312) 555-0142",
	website: "example.com", timeline: "This month", platform: "WordPress", needs: ["hosting", "seo"],
	notes: "Please help with an existing website.", page: "/contact",
};

/** Models only the real storage boundary: snapshots and atomic revision-fenced writes. */
class MemoryStorage<T> implements Pick<StorageCollection<T>, "getVersioned" | "compareAndSet" | "count"> {
	readonly rows = new Map<string, VersionedValue<T>>();
	private revision = 0;
	beforeWrite?: (id: string, expectedRevision: string | null, value: T) => void;
	onRead?: (id: string, value: T | undefined) => void;
	beforeReadReturn?: (id: string, value: T | undefined) => Promise<void>;

	seed(id: string, value: T) {
		this.rows.set(id, { value: structuredClone(value), revision: `revision-${++this.revision}` });
	}

	async getVersioned(id: string) {
		const record = this.rows.get(id);
		this.onRead?.(id, record?.value);
		await this.beforeReadReturn?.(id, record?.value);
		return record ? structuredClone(record) : null;
	}

	async compareAndSet(id: string, expectedRevision: string | null, value: T): Promise<ConditionalWriteResult> {
		this.beforeWrite?.(id, expectedRevision, value);
		const current = this.rows.get(id);
		if (expectedRevision === null ? current !== undefined : current?.revision !== expectedRevision) return { applied: false };
		this.seed(id, value);
		return { applied: true, revision: this.rows.get(id)!.revision };
	}

	async count(where: Parameters<StorageCollection<T>["count"]>[0] = {}) {
		return [...this.rows.values()].filter(({ value }) =>
			Object.entries(where ?? {}).every(([key, expected]) => (value as Record<string, unknown>)[key] === expected),
		).length;
	}
}

function fixture(send: EnquiryInbox["send"] = async () => {}) {
	const forms = new MemoryStorage<FormDefinition>();
	for (const { id, form } of initialEnquiryForms("2026-10-07T12:00:00Z")) forms.seed(id, form);
	const submissions = new MemoryStorage<StoredEnquiry>();
	const errors: string[] = [];
	const inbox: EnquiryInbox = { forms, submissions, send, logError: (message) => errors.push(message) };
	return { forms, submissions, errors, inbox };
}

function deferred() {
	let resolve!: () => void;
	const promise = new Promise<void>((done) => { resolve = done; });
	return { promise, resolve };
}

test("accepted enquiries are saved before email and finish as new inbox records with a sent notification", async () => {
	const state = fixture(async (sent) => {
		assert.deepEqual(sent, enquiry);
		assert.equal(state.submissions.rows.size, 1);
		const record = [...state.submissions.rows.values()][0]!.value;
		assert.equal(record.deliveryState, "sending");
		assert.equal(record.formId, ENQUIRY_FORM_IDS.project);
		assert.equal(record.data.name, enquiry.name);
		assert.equal(record.data.notes, enquiry.notes);
	});
	const id = await deliverEnquiry(enquiry, token, state.inbox);
	const record = state.submissions.rows.get(id)!.value;
	assert.equal(record.deliveryState, "sent");
	assert.match(String(record.data.email_notification), /sent/i);
	assert.equal(record.status, "new");
	assert.equal(record.starred, false);
	assert.ok(Number.isFinite(Date.parse(record.createdAt)));
	assert.equal(state.forms.rows.get(ENQUIRY_FORM_IDS.project)!.value.submissionCount, 1);
});

test("provider failure retains the enquiry as failed and rejects the request", async () => {
	const state = fixture(async () => { throw new Error("Provider unavailable"); });
	await assert.rejects(deliverEnquiry(enquiry, token, state.inbox));
	assert.equal(state.submissions.rows.size, 1);
	const record = [...state.submissions.rows.values()][0]!.value;
	assert.equal(record.deliveryState, "failed");
	assert.match(String(record.data.email_notification), /fail|not sent|unsent/i);
	assert.equal(record.data.email, enquiry.email);
	assert.equal(record.data.notes, enquiry.notes);
});

test("retrying a failed delivery reuses its inbox record and a subsequent sent retry sends nothing", async () => {
	let sends = 0;
	const state = fixture(async () => {
		if (++sends === 1) throw new Error("Provider unavailable");
	});
	await assert.rejects(deliverEnquiry(enquiry, token, state.inbox));
	const id = await deliverEnquiry(enquiry, token, state.inbox);
	assert.equal(await deliverEnquiry(enquiry, token, state.inbox), id);
	assert.equal(sends, 2);
	assert.equal(state.submissions.rows.size, 1);
	assert.equal(state.submissions.rows.get(id)!.value.deliveryState, "sent");
	assert.equal(state.forms.rows.get(ENQUIRY_FORM_IDS.project)!.value.submissionCount, 1);
});

test("simultaneous retries cannot send the same enquiry twice", { timeout: 2000 }, async () => {
	const enteredSend = deferred();
	const releaseSend = deferred();
	const retryRead = deferred();
	let sends = 0;
	const state = fixture(async () => {
		sends++;
		enteredSend.resolve();
		await releaseSend.promise;
	});
	const first = deliverEnquiry(enquiry, token, state.inbox);
	void first.catch(() => enteredSend.resolve());
	await enteredSend.promise;
	assert.equal(sends, 1, "the first request reached the mail provider");
	state.submissions.onRead = (_id, value) => {
		if (value?.deliveryState === "sending") retryRead.resolve();
	};
	const second = deliverEnquiry(enquiry, token, state.inbox);
	const settled = Promise.allSettled([first, second]);
	// Observe the persisted in-flight record before allowing the provider to finish.
	await retryRead.promise;
	releaseSend.resolve();
	const results = await settled;
	assert.equal(results[0]!.status, "fulfilled");
	assert.equal(sends, 1);
	assert.equal(state.submissions.rows.size, 1);
	assert.equal([...state.submissions.rows.values()][0]!.value.deliveryState, "sent");
});

test("a storage failure prevents sending an email that has no saved enquiry", async () => {
	let sends = 0;
	const state = fixture(async () => { sends++; });
	state.submissions.beforeWrite = () => { throw new Error("Database unavailable"); };
	await assert.rejects(deliverEnquiry(enquiry, token, state.inbox), /Database unavailable/);
	assert.equal(sends, 0);
	assert.equal(state.submissions.rows.size, 0);
});

test("competing first submissions that both read an absent record use only one atomic insert and send", { timeout: 2000 }, async () => {
	const bothRead = deferred();
	let emptyReads = 0;
	let insertAttempts = 0;
	let sends = 0;
	const state = fixture(async () => { sends++; });
	state.submissions.beforeReadReturn = async (_id, value) => {
		if (value !== undefined) return;
		if (++emptyReads === 2) bothRead.resolve();
		await bothRead.promise;
	};
	state.submissions.beforeWrite = (_id, expectedRevision) => {
		if (expectedRevision === null) insertAttempts++;
	};
	const results = await Promise.allSettled([
		deliverEnquiry(enquiry, token, state.inbox),
		deliverEnquiry(enquiry, token, state.inbox),
	]);
	assert.equal(emptyReads, 2);
	assert.equal(insertAttempts, 2, "both requests attempted the insert-only persistence boundary");
	assert.ok(results.some((result) => result.status === "fulfilled"));
	assert.equal(sends, 1);
	assert.equal(state.submissions.rows.size, 1);
});

test("payload changes or a new token produce independent enquiry identities", async () => {
	const original = await enquirySubmissionId(token, enquiry);
	assert.equal(await enquirySubmissionId(token, structuredClone(enquiry)), original);
	for (const changed of [
		{ ...enquiry, notes: "A second project." },
		{ ...enquiry, page: "/consultation" },
		{ ...enquiry, needs: ["hosting"] },
	]) {
		assert.notEqual(await enquirySubmissionId(token, changed), original);
	}
	assert.notEqual(await enquirySubmissionId("acc8d981-3e21-41b8-8b56-e8685125329e", enquiry), original);
	assert.ok(!original.includes(enquiry.email), "stored identifiers do not expose the sender's email");
});

test("paused forms prevent saving and emailing enquiries", async () => {
	let sends = 0;
	const state = fixture(async () => { sends++; });
	const form = state.forms.rows.get(ENQUIRY_FORM_IDS.project)!.value;
	state.forms.seed(ENQUIRY_FORM_IDS.project, { ...form, status: "paused" });
	await assert.rejects(deliverEnquiry(enquiry, token, state.inbox), /paused/i);
	assert.equal(sends, 0);
	assert.equal(state.submissions.rows.size, 0);
});

test("an unacknowledged successful send returns success, logs the failure and is never automatically resent", async () => {
	let sends = 0;
	const state = fixture(async () => { sends++; });
	state.submissions.beforeWrite = (_id, _expectedRevision, value) => {
		if (value.deliveryState === "sent") throw new Error("Acknowledgement storage unavailable");
	};
	const id = await deliverEnquiry(enquiry, token, state.inbox);
	assert.equal(sends, 1);
	assert.equal(state.submissions.rows.size, 1);
	assert.equal(state.submissions.rows.get(id)!.value.deliveryState, "sending");
	assert.equal(state.errors.length, 1);
	assert.match(state.errors[0]!, /sent.*status.*could not be saved/i);
	await assert.rejects(deliverEnquiry(enquiry, token, state.inbox));
	assert.equal(sends, 1, "delivery was already accepted by the provider, so a retry must not send it again");
});

test("consultation enquiries are saved under the consultation inbox", async () => {
	const state = fixture();
	const id = await deliverEnquiry({ ...enquiry, page: "/consultation", subject: "Website Consultation" }, token, state.inbox);
	assert.equal(state.submissions.rows.get(id)!.value.formId, ENQUIRY_FORM_IDS.consultation);
	assert.equal(state.forms.rows.get(ENQUIRY_FORM_IDS.project)!.value.submissionCount, 0);
	assert.equal(state.forms.rows.get(ENQUIRY_FORM_IDS.consultation)!.value.submissionCount, 1);
});

test("counter updates preserve a form setting edited concurrently", async () => {
	const state = fixture();
	let changed = false;
	state.forms.beforeWrite = (id, expectedRevision) => {
		if (changed || expectedRevision === null) return;
		changed = true;
		const current = state.forms.rows.get(id)!.value;
		state.forms.seed(id, { ...current, settings: { ...current.settings, submitLabel: "Send project details" } });
	};
	await deliverEnquiry(enquiry, token, state.inbox);
	const updated = state.forms.rows.get(ENQUIRY_FORM_IDS.project)!.value;
	assert.equal(changed, true);
	assert.equal(updated.settings.submitLabel, "Send project details");
	assert.equal(updated.submissionCount, 1);
});

test("delivery finalization preserves inbox triage changes made while the provider was sending", async () => {
	const state = fixture(async () => {
		const [id, current] = [...state.submissions.rows.entries()][0]!;
		state.submissions.seed(id, { ...current.value, status: "read", starred: true, notes: "Owner follow-up note" });
	});
	const id = await deliverEnquiry(enquiry, token, state.inbox);
	const saved = state.submissions.rows.get(id)!.value;
	assert.equal(saved.deliveryState, "sent");
	assert.equal(saved.status, "read");
	assert.equal(saved.starred, true);
	assert.equal(saved.notes, "Owner follow-up note");
});

test("an owner edit retries a conflicting write and preserves a completed delivery without enabling a resend", async () => {
	for (const initialState of ["failed", "sending"] as const) {
		let sends = 0;
		const state = fixture(async () => { sends++; });
		const id = await enquirySubmissionId(token, enquiry);
		state.submissions.seed(id, {
			formId: ENQUIRY_FORM_IDS.project,
			data: { ...enquiry, email_notification: initialState === "failed" ? "Failed" : "Sending" },
			status: "new", starred: false, createdAt: "2026-10-07T12:00:00Z", deliveryState: initialState,
			meta: { ip: null, userAgent: null, referer: null, country: null },
		});
		let writeAttempts = 0;
		state.submissions.beforeWrite = (submissionId, _expectedRevision, attempted) => {
			if (++writeAttempts !== 1) return;
			assert.equal(attempted.deliveryState, initialState, "the owner edit began from a stale delivery snapshot");
			const current = state.submissions.rows.get(submissionId)!.value;
			// The sender finishes after the admin read, but before its first compare-and-set.
			state.submissions.seed(submissionId, {
				...current, deliveryState: "sent", data: { ...current.data, email_notification: "Sent" },
			});
		};
		const updated = await updateEnquiryTriage(id, { status: "read", starred: true, notes: "Reply tomorrow" }, state.submissions);
		assert.equal(writeAttempts, 2, "the conflicting owner write must reload the completed delivery");
		assert.equal(updated.deliveryState, "sent");
		assert.equal(updated.data.email_notification, "Sent");
		assert.equal(updated.status, "read");
		assert.equal(updated.starred, true);
		assert.equal(updated.notes, "Reply tomorrow");
		assert.deepEqual(state.submissions.rows.get(id)!.value, updated);
		assert.equal(await deliverEnquiry(enquiry, token, state.inbox), id);
		assert.equal(sends, 0, "owner triage must not restore a failed delivery claim or resend accepted mail");
	}
});

test("a counter update failure is logged without rejecting a durably saved and mailed enquiry", async () => {
	let sends = 0;
	const state = fixture(async () => { sends++; });
	state.forms.beforeWrite = () => { throw new Error("Counter update unavailable"); };
	const id = await deliverEnquiry(enquiry, token, state.inbox);
	assert.equal(sends, 1);
	assert.equal(state.submissions.rows.get(id)!.value.deliveryState, "sent");
	assert.equal(state.errors.length, 1);
	assert.match(state.errors[0]!, /counter/i);
});

test("initial inbox definitions do not enable additional mail or automatic deletion", () => {
	const forms = initialEnquiryForms("2026-10-07T12:00:00Z");
	assert.deepEqual(forms.map(({ id }) => id).sort(), Object.values(ENQUIRY_FORM_IDS).sort());
	for (const { form } of forms) {
		assert.equal(form.status, "active");
		assert.deepEqual(form.settings.notifyEmails, []);
		assert.equal(form.settings.digestEnabled, false);
		assert.equal(form.settings.autoresponder, undefined);
		assert.equal(form.settings.webhookUrl, undefined);
		assert.equal(form.settings.retentionDays, 0);
		assert.equal(form.settings.spamProtection, "honeypot");
		assert.deepEqual(form.pages.flatMap((page) => page.fields).filter((field) => field.required).map((field) => field.name).sort(), ["email", "name"]);
	}
});
