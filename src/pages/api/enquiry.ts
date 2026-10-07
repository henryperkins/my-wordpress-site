import type { APIRoute } from "astro";
import { PluginStorageRepository } from "emdash";
import { getDb } from "emdash/runtime";
import type { FormDefinition } from "@emdash-cms/plugin-forms";
import { parseEnquiry, sendEnquiry } from "../../lib/enquiry";
import { ENQUIRY_PLUGIN_ID, ENQUIRY_SUBMISSION_INDEXES } from "../../lib/enquiry-forms";
import { deliverEnquiry, type StoredEnquiry } from "../../lib/enquiry-inbox";

export const prerender = false;

// Saves Lakefront enquiries in the Forms inbox, then emails them via Cloudflare Email Sending.
// JavaScript clients ask for JSON; plain form posts are redirected back to the page with ?enquiry=<status>.
const ANCHOR = /^[a-z][a-z0-9_-]*$/;
const FAILED = "We couldn't send your request. Please try again, or email us directly.";
const RETRY_TOKEN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
	});

/** Only same-site paths are accepted as the return address. */
const localPath = (value: FormDataEntryValue | null): string => {
	const path = typeof value === "string" ? value.trim() : "";
	return /^\/(?![/\\])[^\s?#]*$/.test(path) ? path : "/";
};

export const POST: APIRoute = async ({ request, url, locals }) => {
	const wantsJson = (request.headers.get("accept") ?? "").includes("application/json");

	let form: FormData;
	try {
		form = await request.formData();
	} catch {
		return wantsJson ? json({ ok: false, message: FAILED }, 400) : new Response("Bad request", { status: 400 });
	}

	const page = localPath(form.get("page"));
	const anchorValue = form.get("anchor");
	const anchor = typeof anchorValue === "string" && ANCHOR.test(anchorValue) ? anchorValue : "enquiry";
	const tokenValue = form.get("enquiry_token");
	const token = typeof tokenValue === "string" && RETRY_TOKEN.test(tokenValue) ? tokenValue : crypto.randomUUID();
	const back = (status: "sent" | "invalid" | "failed") => {
		const destination = new URL(`${page}?enquiry=${status}#${anchor}`, url);
		// A no-JavaScript retry reuses this opaque key. It grants no read access to the saved enquiry.
		if (status === "failed") destination.searchParams.set("enquiry_token", token);
		return new Response(null, { status: 303, headers: { Location: destination.toString() } });
	};

	const parsed = parseEnquiry(form, page);
	// Honeypot hit: pretend it worked.
	if (parsed.spam) return wantsJson ? json({ ok: true }) : back("sent");
	if (!parsed.enquiry) return wantsJson ? json({ ok: false, errors: parsed.errors }, 422) : back("invalid");

	try {
		// Anonymous site routes use EmDash's lightweight middleware and do not receive locals.emdash.
		// getDb() reads the same request-scoped D1 session, including primary routing for this POST.
		const db = locals.emdash?.db ?? await getDb();
		const plugin = await db.selectFrom("_plugin_state").select("status").where("plugin_id", "=", ENQUIRY_PLUGIN_ID).executeTakeFirst();
		if (plugin?.status !== "active") throw new Error("The enquiry inbox plugin is inactive");
		await deliverEnquiry(parsed.enquiry, token, {
			forms: new PluginStorageRepository<FormDefinition>(db, ENQUIRY_PLUGIN_ID, "forms", ["status", "createdAt", "slug"]),
			submissions: new PluginStorageRepository<StoredEnquiry>(db, ENQUIRY_PLUGIN_ID, "submissions", ENQUIRY_SUBMISSION_INDEXES),
			send: (enquiry) => sendEnquiry(enquiry, url.origin),
			logError: (message) => console.error("[enquiry] inbox metadata update failed", message),
		});
	} catch (error) {
		console.error("[enquiry] send failed", error);
		return wantsJson ? json({ ok: false, message: FAILED }, 502) : back("failed");
	}
	return wantsJson ? json({ ok: true }) : back("sent");
};

export const ALL: APIRoute = () => new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
