import { env } from "cloudflare:workers";
import { EmailMessage } from "cloudflare:email";

// Enquiries are emailed through Cloudflare Email Sending (send_email binding).
// Configure ENQUIRY_EMAIL, ENQUIRY_FROM and ENQUIRY_TO in wrangler.jsonc.

export interface Enquiry {
	subject: string;
	name: string;
	email: string;
	website: string;
	timeline: string;
	platform: string;
	needs: string[];
	notes: string;
	page: string;
}

export interface ParsedEnquiry {
	spam: boolean;
	errors: Record<string, string>;
	enquiry?: Enquiry;
}

interface EnquiryEnv {
	ENQUIRY_EMAIL?: { send(message: EmailMessage): Promise<void> };
	ENQUIRY_FROM?: string;
	ENQUIRY_TO?: string;
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const text = (value: FormDataEntryValue | null, max: number) =>
	typeof value === "string" ? value.replace(/\r\n?/g, "\n").trim().slice(0, max) : "";
const line = (value: FormDataEntryValue | null, max: number) => text(value, max).replace(/\s*\n\s*/g, " ");

export function parseEnquiry(form: FormData, page: string): ParsedEnquiry {
	// Honeypot: people never see this field; bots fill it in.
	if (text(form.get("company_site"), 200)) return { spam: true, errors: {} };

	const enquiry: Enquiry = {
		subject: line(form.get("subject"), 120) || "Website enquiry",
		name: line(form.get("name"), 120),
		email: line(form.get("email"), 200),
		website: line(form.get("website"), 200),
		timeline: line(form.get("timeline"), 80),
		platform: line(form.get("platform"), 80),
		needs: form
			.getAll("needs")
			.map((value) => line(value, 80))
			.filter(Boolean)
			.slice(0, 12),
		notes: text(form.get("notes"), 5000),
		page,
	};

	const errors: Record<string, string> = {};
	if (!enquiry.name) errors.name = "Tell us who to reply to.";
	if (!EMAIL.test(enquiry.email)) errors.email = "Enter an email we can reply to.";
	return Object.keys(errors).length ? { spam: false, errors } : { spam: false, errors, enquiry };
}

export async function sendEnquiry(enquiry: Enquiry, origin: string): Promise<void> {
	const config = env as unknown as EnquiryEnv;
	const body = [
		`${enquiry.subject} from ${origin}${enquiry.page}`,
		"",
		`Name: ${enquiry.name}`,
		`Email: ${enquiry.email}`,
		enquiry.website && `Website: ${enquiry.website}`,
		enquiry.timeline && `Timeline: ${enquiry.timeline}`,
		enquiry.platform && `Platform: ${enquiry.platform}`,
		enquiry.needs.length > 0 && `Needs: ${enquiry.needs.join(", ")}`,
		enquiry.notes && `\nNotes:\n${enquiry.notes}`,
	]
		.filter((part) => part !== false && part !== "")
		.join("\n");

	if (!config.ENQUIRY_EMAIL || !config.ENQUIRY_FROM || !config.ENQUIRY_TO) {
		if (import.meta.env.DEV) {
			console.info(`[enquiry] Email sending is not configured, so nothing was sent:\n\n${body}`);
			return;
		}
		throw new Error("Enquiry email is not configured: add the ENQUIRY_EMAIL binding and ENQUIRY_FROM / ENQUIRY_TO vars.");
	}

	const raw = mime({
		from: config.ENQUIRY_FROM,
		to: config.ENQUIRY_TO,
		replyTo: `${word(enquiry.name)} <${enquiry.email}>`,
		subject: `${enquiry.subject}: ${enquiry.name}`,
		body,
	});
	await config.ENQUIRY_EMAIL.send(new EmailMessage(config.ENQUIRY_FROM, config.ENQUIRY_TO, raw));
}

function base64(value: string): string {
	const bytes = new TextEncoder().encode(value);
	let binary = "";
	for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
	return btoa(binary);
}

/** RFC 2047 encoded word, so names and subjects can carry any characters. */
function word(value: string): string {
	return /^[\x20-\x7e]*$/.test(value) && !/["\\]/.test(value) ? `"${value}"` : `=?UTF-8?B?${base64(value)}?=`;
}

function mime(message: { from: string; to: string; replyTo: string; subject: string; body: string }): string {
	const domain = message.from.split("@")[1] || "localhost";
	const headers = [
		`From: ${word("Website enquiry")} <${message.from}>`,
		`To: <${message.to}>`,
		`Reply-To: ${message.replyTo}`,
		`Subject: =?UTF-8?B?${base64(message.subject)}?=`,
		`Date: ${new Date().toUTCString()}`,
		`Message-ID: <${crypto.randomUUID()}@${domain}>`,
		"MIME-Version: 1.0",
		'Content-Type: text/plain; charset="UTF-8"',
		"Content-Transfer-Encoding: base64",
	];
	return `${headers.join("\r\n")}\r\n\r\n${base64(message.body).replace(/.{76}/g, "$&\r\n")}\r\n`;
}
