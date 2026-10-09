import type { Enquiry } from "./enquiry-data.ts";

export const ENQUIRY_DRAFT_COOKIE = "lf_enquiry_draft";
export const ENQUIRY_DRAFT_TTL = 30 * 60;
export const ENQUIRY_TOKEN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PREFIX = "lf-enquiry-draft:";

/** The Astro Cloudflare adapter already provides SESSION. Use KV expiry, not session TTL,
 * so abandoned drafts are removed from storage as well as hidden from the reader. */
export interface DraftStorage {
	get(key: string): Promise<string | null>;
	put(key: string, value: string, options: { expirationTtl: number }): Promise<void>;
	delete(key: string): Promise<void>;
}

export interface EnquiryDraft {
	status: "invalid" | "failed";
	page: string;
	anchor: string;
	values: Enquiry;
	errors: Record<string, string>;
	token: string;
	expiresAt: number;
}

export async function saveEnquiryDraft(storage: DraftStorage, draft: Omit<EnquiryDraft, "expiresAt">, now = Date.now()): Promise<string> {
	// A fresh key avoids KV's per-key write limit when a visitor corrects and retries quickly.
	const id = crypto.randomUUID();
	await storage.put(`${PREFIX}${id}`, JSON.stringify({ ...draft, expiresAt: now + ENQUIRY_DRAFT_TTL * 1000 }), {
		expirationTtl: ENQUIRY_DRAFT_TTL,
	});
	return id;
}

export async function deleteEnquiryDraft(storage: DraftStorage, id: string | undefined): Promise<void> {
	if (id && ENQUIRY_TOKEN.test(id)) await storage.delete(`${PREFIX}${id}`);
}

export async function readEnquiryDraft(
	storage: DraftStorage,
	id: string | undefined,
	request: { page: string; anchor: string; status: string | null; token: string },
	now = Date.now(),
): Promise<EnquiryDraft | null> {
	if (!id || !ENQUIRY_TOKEN.test(id) || !["invalid", "failed"].includes(request.status ?? "")) return null;
	const raw = await storage.get(`${PREFIX}${id}`);
	if (!raw) return null;
	let draft: EnquiryDraft;
	try { draft = JSON.parse(raw); } catch { return null; }
	if (!draft || typeof draft !== "object" || draft.status !== request.status || draft.page !== request.page || draft.anchor !== request.anchor ||
		!Number.isFinite(draft.expiresAt) || draft.expiresAt <= now || !ENQUIRY_TOKEN.test(draft.token ?? "") ||
		(request.status === "failed" && draft.token !== request.token)) return null;
	if (!draft.values || typeof draft.values !== "object" || !draft.errors || typeof draft.errors !== "object" ||
		!["subject", "name", "email", "phone", "website", "timeline", "platform", "notes", "page"].every((key) => typeof draft.values[key as keyof Enquiry] === "string") ||
		!Array.isArray(draft.values.needs) || !draft.values.needs.every((need) => typeof need === "string") ||
		!Object.values(draft.errors).every((error) => typeof error === "string")) return null;
	return draft;
}
