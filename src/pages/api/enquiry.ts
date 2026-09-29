import type { APIRoute } from "astro";
import { parseEnquiry, sendEnquiry } from "../../lib/enquiry";

export const prerender = false;

// Receives the Lakefront enquiry form (Contact, Consultation) and emails it via Cloudflare Email Sending.
// JavaScript clients ask for JSON; plain form posts are redirected back to the page with ?enquiry=<status>.
const ANCHOR = /^[a-z][a-z0-9_-]*$/;
const FAILED = "We couldn't send your request. Please try again, or email us directly.";

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

export const POST: APIRoute = async ({ request, url }) => {
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
	const back = (status: "sent" | "invalid" | "failed") =>
		new Response(null, { status: 303, headers: { Location: new URL(`${page}?enquiry=${status}#${anchor}`, url).toString() } });

	const parsed = parseEnquiry(form, page);
	// Honeypot hit: pretend it worked.
	if (parsed.spam) return wantsJson ? json({ ok: true }) : back("sent");
	if (!parsed.enquiry) return wantsJson ? json({ ok: false, errors: parsed.errors }, 422) : back("invalid");

	try {
		await sendEnquiry(parsed.enquiry, url.origin);
	} catch (error) {
		console.error("[enquiry] send failed", error);
		return wantsJson ? json({ ok: false, message: FAILED }, 502) : back("failed");
	}
	return wantsJson ? json({ ok: true }) : back("sent");
};

export const ALL: APIRoute = () => new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
