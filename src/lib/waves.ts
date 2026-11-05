import { cleanSvg } from "./icons";

// Decorative wave drawings from src/waves: the hero photo's edge, the accountability band's curl and the closing band's
// lines. They were drawn for the home concept and stand in until a designer redraws one canonical wave from the logo
// crest. Each is a few hundred bytes to 3.5KB once its provenance metadata is dropped, so it is inlined: no request,
// nothing to fail to load. The source files keep their metadata.
const files = import.meta.glob<string>("../waves/*.svg", { query: "?raw", import: "default", eager: true });

const waves = new Map<string, string>();
for (const [path, svg] of Object.entries(files)) {
	waves.set(path.slice(path.lastIndexOf("/") + 1, -4), cleanSvg(svg));
}

export type WaveName = "wave-edge-vertical" | "wave-edge-horizontal" | "wave-curl-outline" | "wave-lines";

/** The drawing as inline SVG markup, hidden from assistive technology. `className` is set by the theme, never by the CMS. */
export const waveSvg = (name: WaveName, className?: string): string => {
	const svg = waves.get(name);
	if (!svg) return "";
	const attrs = `${className ? ` class="${className}"` : ""} aria-hidden="true" focusable="false"`;
	return svg.replace(/^<svg\b/, `<svg${attrs}`);
};
