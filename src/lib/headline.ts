// A headline's highlighted words (Current Teal in the hero and section headings). Kept free of imports so the unit
// tests can load it directly.

export interface HeadlineParts {
	before: string;
	highlight: string;
	after: string;
}

/**
 * Split a headline around its highlighted words. When the headline contains them, they're highlighted where they
 * stand ("We build, host and look after your website." with "look after"). Otherwise they follow the headline after
 * a space, as earlier content was written ("We build, host and" with "look after your website").
 */
export const splitHeadline = (headline?: string | null, highlight?: string | null): HeadlineParts => {
	const text = headline ?? "";
	const mark = (highlight ?? "").trim();
	if (!mark) return { before: text, highlight: "", after: "" };
	const at = text.indexOf(mark);
	if (at >= 0) return { before: text.slice(0, at), highlight: mark, after: text.slice(at + mark.length) };
	return { before: text ? `${text.trimEnd()} ` : "", highlight: mark, after: "" };
};

// Manrope 800 advances in em, at the headings' tight tracking, each rounded up to one of five widths. Anything else
// (digits aside, accented letters, emoji) counts as the widest, so the estimate only ever errs towards wrapping.
const advance = (ch: string): number =>
	ch === " " ? 0.17
	: "'Iijl,.|/:;!fr-[]t1()".includes(ch) ? 0.43
	: "mwMW".includes(ch) ? 0.96
	: /[a-z2-9BEFJL"*?+]/.test(ch) ? 0.61
	: /[A-Z0<>$&=~^_]/.test(ch) ? 0.73
	: 0.96;

/** An upper bound for a phrase's width in a Manrope 800 heading, in em. */
export const headingWidthEm = (phrase: string): number => [...phrase].reduce((em, ch) => em + advance(ch), 0);

/**
 * Whether highlighted words can be kept on one line (white-space: nowrap) in a heading whose narrowest line is
 * `capacityEm` wide. A phrase that might not fit wraps with the rest of the heading instead of running off a phone.
 */
export const keepsTogether = (highlight: string, capacityEm: number): boolean => !!highlight && headingWidthEm(highlight) <= capacityEm;
