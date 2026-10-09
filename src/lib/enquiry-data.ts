export interface Enquiry {
	subject: string;
	name: string;
	email: string;
	phone: string;
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
	/** Bounded values retained for an ordinary form's validation retry. Never delivered. */
	draft?: Enquiry;
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
		phone: line(form.get("phone"), 40),
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
	if (enquiry.phone && enquiry.phone.replace(/\D/g, "").length < 7) errors.phone = "Enter a phone number we can call, or leave it blank.";
	return Object.keys(errors).length ? { spam: false, errors, draft: enquiry } : { spam: false, errors, enquiry };
}
