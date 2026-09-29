import { sanitizeHref } from "emdash";
import type { PortableTextBlock } from "emdash";

// Block fields are plain text so editors can work without nested groups.
// These helpers turn "one per line" and "a | b" values into structured data.

export const lines = (value?: string | null): string[] =>
	(value ?? "")
		.split(/\r?\n/)
		.map((s) => s.trim())
		.filter(Boolean);

export const paragraphs = (value?: string | null): string[] =>
	(value ?? "")
		.split(/\r?\n\s*\r?\n/)
		.map((s) => s.replace(/\s*\r?\n\s*/g, " ").trim())
		.filter(Boolean);

export const cells = (line: string): string[] => line.split("|").map((s) => s.trim());

/** "Label | Value" per line. */
export const pairs = (value?: string | null): [string, string][] =>
	lines(value).map((line) => {
		const [first = "", ...rest] = cells(line);
		return [first, rest.join(" | ")];
	});

/** Comma-, dot- or line-separated list: "WordPress, AWS" or "Chicago · Websites". */
export const list = (value?: string | null): string[] =>
	(value ?? "")
		.split(/\s*[,·•]\s*|\r?\n/)
		.map((s) => s.trim())
		.filter(Boolean);

/** Eyebrow items are separated with "·": "Chicago · Websites · Hosting". */
export const eyebrowItems = (value?: string | null): string[] =>
	(value ?? "")
		.split("·")
		.map((s) => s.trim())
		.filter(Boolean);

export interface Cta {
	label: string;
	url: string;
}

export const cta = (label?: string | null, url?: string | null): Cta | undefined =>
	label && url ? { label, url: sanitizeHref(url) } : undefined;

export const href = (url?: string | null): string | undefined => (url ? sanitizeHref(url) : undefined);

export const slugify = (value: string): string =>
	value
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "") || "section";

export const pad2 = (n: number): string => String(n).padStart(2, "0");

export const truncate = (value: string, max: number): string =>
	value.length <= max ? value : `${value.slice(0, value.lastIndexOf(" ", max) > 0 ? value.lastIndexOf(" ", max) : max)}…`;

export const formatDate = (value?: string | Date | null): string | null => {
	if (!value) return null;
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return null;
	return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
};

/** Success copy supports {name} and {email}; server-rendered copy has neither. */
export const fillTemplate = (template: string, name?: string, email?: string): string =>
	template
		.replace(/,?\s*\{name\}/g, name ? `, ${name}` : "")
		.replace(/\{email\}/g, email || "you");

/** h2 headings of a Portable Text document, with unique slugs, for a table of contents. */
export const headings = (blocks: PortableTextBlock[] = []): { id: string; text: string }[] => {
	const seen = new Map<string, number>();
	return blocks
		.filter((block: any) => block?._type === "block" && block.style === "h2")
		.map((block: any) => {
			const text = (block.children ?? []).map((child: any) => child?.text ?? "").join("").trim();
			const base = slugify(text);
			const count = seen.get(base) ?? 0;
			seen.set(base, count + 1);
			return { id: count ? `${base}-${count + 1}` : base, text };
		});
};
