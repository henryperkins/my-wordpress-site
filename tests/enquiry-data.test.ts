import assert from "node:assert/strict";
import test from "node:test";
import { parseEnquiry } from "../src/lib/enquiry-data.ts";

function form(entries: Record<string, string | string[]> = {}) {
	const result = new FormData();
	for (const [name, values] of Object.entries(entries)) {
		for (const value of Array.isArray(values) ? values : [values]) result.append(name, value);
	}
	return result;
}

test("enquiry normalization preserves multiline notes, formatted phones and repeated needs", () => {
	const parsed = parseEnquiry(form({
		subject: " Project\r\nenquiry ", name: " Jordan\nReyes ", email: " jordan@example.com ",
		phone: "(312) 555-0142", website: "example.com", needs: [" hosting ", "seo", ""],
		notes: " First line\r\nSecond line\rThird line ",
	}), "/contact");
	assert.equal(parsed.spam, false);
	assert.deepEqual(parsed.errors, {});
	assert.deepEqual(parsed.enquiry, {
		subject: "Project enquiry", name: "Jordan Reyes", email: "jordan@example.com", phone: "(312) 555-0142",
		website: "example.com", timeline: "", platform: "", needs: ["hosting", "seo"],
		notes: "First line\nSecond line\nThird line", page: "/contact",
	});
});

test("honeypot submissions are dropped before field validation", () => {
	assert.deepEqual(parseEnquiry(form({ company_site: "https://spam.example" }), "/contact"), { spam: true, errors: {} });
});

test("name and email remain the only required fields, with unchanged field errors", () => {
	const invalid = parseEnquiry(form({ email: "not-an-email", phone: "123" }), "/consultation");
	assert.deepEqual(invalid.errors, {
		name: "Tell us who to reply to.", email: "Enter an email we can reply to.",
		phone: "Enter a phone number we can call, or leave it blank.",
	});
	assert.equal(invalid.enquiry, undefined);
	const valid = parseEnquiry(form({ name: "Jordan Reyes", email: "jordan@example.com" }), "/consultation");
	assert.deepEqual(valid.errors, {});
	assert.equal(valid.enquiry?.subject, "Website enquiry");
	assert.equal(valid.enquiry?.phone, "");
});

test("enquiry storage receives the existing bounded normalized payload", () => {
	const parsed = parseEnquiry(form({
		name: "N".repeat(200), email: "jordan@example.com", notes: "x".repeat(6000),
		needs: Array.from({ length: 20 }, (_, i) => `need-${i}-${"x".repeat(100)}`),
	}), "/contact");
	assert.equal(parsed.enquiry?.name.length, 120);
	assert.equal(parsed.enquiry?.notes.length, 5000);
	assert.equal(parsed.enquiry?.needs.length, 12);
	assert.ok(parsed.enquiry?.needs.every((need) => need.length <= 80));
});
