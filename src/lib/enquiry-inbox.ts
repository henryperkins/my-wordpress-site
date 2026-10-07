import type { FormDefinition, Submission } from "@emdash-cms/plugin-forms";
import type { StorageCollection } from "emdash";
import type { Enquiry } from "./enquiry-data.ts";
import { ENQUIRY_FORM_IDS } from "./enquiry-forms.ts";

export interface StoredEnquiry extends Submission {
	deliveryState: "sending" | "failed" | "sent";
}

export interface EnquiryInbox {
	forms: Pick<StorageCollection<FormDefinition>, "getVersioned" | "compareAndSet">;
	submissions: Pick<StorageCollection<StoredEnquiry>, "getVersioned" | "compareAndSet" | "count">;
	send: (enquiry: Enquiry) => Promise<void>;
	logError?: (message: string) => void;
}

/** Owner triage must not write an old delivery state over a newly acknowledged send. */
export async function updateEnquiryTriage(
	id: string,
	changes: { status?: StoredEnquiry["status"]; starred?: boolean; notes?: string },
	submissions: EnquiryInbox["submissions"],
): Promise<StoredEnquiry> {
	for (let attempt = 0; attempt < 5; attempt++) {
		const current = await submissions.getVersioned(id);
		if (!current) throw new Error("The saved enquiry is missing");
		const updated: StoredEnquiry = {
			...current.value,
			status: changes.status ?? current.value.status,
			starred: changes.starred ?? current.value.starred,
			notes: changes.notes !== undefined ? changes.notes : current.value.notes,
		};
		const result = await submissions.compareAndSet(id, current.revision, updated);
		if (result.applied) return updated;
	}
	throw new Error("The saved enquiry changed concurrently");
}

export async function enquirySubmissionId(token: string, enquiry: Enquiry): Promise<string> {
	// Scope the retry token to its normalized payload. A reused or cached token cannot overwrite another enquiry.
	const payload = JSON.stringify([token, enquiry.subject, enquiry.name, enquiry.email, enquiry.phone, enquiry.website, enquiry.timeline, enquiry.platform, enquiry.needs, enquiry.notes, enquiry.page]);
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
	return `enquiry-${Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

/** Persist before mailing; successful sends are never repeated by a retry of the same request. */
export async function deliverEnquiry(enquiry: Enquiry, token: string, inbox: EnquiryInbox): Promise<string> {
	const formId = enquiry.page === "/consultation" ? ENQUIRY_FORM_IDS.consultation : ENQUIRY_FORM_IDS.project;
	const form = await inbox.forms.getVersioned(formId);
	if (!form) throw new Error("The enquiry form is unavailable");
	if (form.value.status !== "active") throw new Error("The enquiry form is paused");
	const id = await enquirySubmissionId(token, enquiry);
	let claimed = false;
	let inserted = false;
	for (let attempt = 0; attempt < 5; attempt++) {
		const existing = await inbox.submissions.getVersioned(id);
		if (existing?.value.deliveryState === "sent") return id;
		// A provider outcome can be ambiguous if the Worker stops after sending. Leave that record for review.
		if (existing && existing.value.deliveryState !== "failed") throw new Error("This enquiry's email delivery is already in progress or needs review");
		const submission: StoredEnquiry = existing ? {
			...existing.value,
			data: { ...existing.value.data, email_notification: "Sending" },
			deliveryState: "sending",
		} : {
			formId, data: { ...enquiry, email_notification: "Sending" },
			status: "new", starred: false, createdAt: new Date().toISOString(), deliveryState: "sending",
			// Enquiries do not need additional visitor tracking metadata.
			meta: { ip: null, userAgent: null, referer: null, country: null },
		};
		const result = await inbox.submissions.compareAndSet(id, existing?.revision ?? null, submission);
		if (result.applied) {
			claimed = true;
			inserted = !existing;
			break;
		}
	}
	if (!claimed) throw new Error("The enquiry could not be claimed for delivery");

	if (inserted) {
		try {
			for (let attempt = 0; attempt < 5; attempt++) {
				const current = await inbox.forms.getVersioned(formId);
				if (!current) break;
				const submissionCount = await inbox.submissions.count({ formId });
				const update = await inbox.forms.compareAndSet(formId, current.revision, {
					...current.value, submissionCount, lastSubmissionAt: new Date().toISOString(),
				});
				if (update.applied) break;
				if (attempt === 4) throw new Error("The enquiry counter changed concurrently");
			}
		} catch (error) {
			inbox.logError?.(`Form counter update failed: ${String(error)}`);
		}
	}

	try {
		await inbox.send(enquiry);
	} catch (error) {
		try { await markDelivery(id, "failed", inbox); }
		catch (updateError) { inbox.logError?.(`Failed delivery status could not be saved: ${String(updateError)}`); }
		throw error;
	}
	try { await markDelivery(id, "sent", inbox); }
	catch (error) {
		// Mail was accepted. Do not invite a second send because its acknowledgement write failed.
		inbox.logError?.(`Sent delivery status could not be saved for ${id}: ${String(error)}`);
	}
	return id;
}

async function markDelivery(id: string, state: "sent" | "failed", inbox: EnquiryInbox): Promise<void> {
	for (let attempt = 0; attempt < 5; attempt++) {
		const current = await inbox.submissions.getVersioned(id);
		if (!current) throw new Error("The saved enquiry is missing");
		if (current.value.deliveryState === state) return;
		const update = await inbox.submissions.compareAndSet(id, current.revision, {
			...current.value, deliveryState: state,
			data: { ...current.value.data, email_notification: state === "sent" ? "Sent" : "Failed" },
		});
		if (update.applied) return;
	}
	throw new Error("The saved enquiry changed concurrently");
}
