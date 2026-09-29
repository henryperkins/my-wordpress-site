import type { PortableTextBlock } from "emdash";

export const BLOG_PATH = "/blog";
export const postPath = (slug?: string | null): string => `${BLOG_PATH}/${slug ?? ""}`;
export const categoryPath = (slug: string): string => `${BLOG_PATH}/category/${slug}`;
export const PAGE_SIZE = 12;

const WORDS_PER_MINUTE = 200;
const CJK_PER_MINUTE = 500;
const CJK = /\p{Script=Han}|\p{Script=Hangul}|\p{Script=Hiragana}|\p{Script=Katakana}/gu;

/** Plain text of a Portable Text document, including list items. */
export const plainText = (blocks: PortableTextBlock[] = []): string =>
	blocks
		.filter((block: any) => block?._type === "block" && Array.isArray(block.children))
		.map((block: any) => block.children.map((child: any) => (typeof child?.text === "string" ? child.text : "")).join(""))
		.join(" ");

/** Reading time in whole minutes (at least 1). */
export const readingTime = (blocks?: PortableTextBlock[]): number => {
	const text = plainText(blocks);
	const cjk = text.match(CJK)?.length ?? 0;
	const words = text.replace(CJK, " ").split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE + cjk / CJK_PER_MINUTE));
};

/** Initials for a byline without an avatar: "Jordan Reyes" → "JR". */
export const initials = (name: string): string =>
	name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]!.toUpperCase())
		.join("");
