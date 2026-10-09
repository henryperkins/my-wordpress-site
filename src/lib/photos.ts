// Photos bundled with the theme (public/images). Blocks fall back to these when no photo is uploaded.
export interface BundledPhoto {
	src: string;
	alt: string;
	width: number;
	height: number;
	position?: string;
}

export const PHOTOS: Record<string, BundledPhoto> = {
	"shore": { src: "/images/shore.jpg", alt: "Aerial view of turquoise water breaking on a sandy shore", width: 1200, height: 1500, position: "50% 38%" },
	"window": { src: "/images/window.jpg", alt: "Person working on a laptop beside a window overlooking the water", width: 1600, height: 1067, position: "60% 50%" },
	"glass": { src: "/images/glass.jpg", alt: "Teal frosted glass texture", width: 1600, height: 1067 },
	"ripple": { src: "/images/ripple.jpg", alt: "Close-up of rippling turquoise water", width: 1600, height: 1067 },
	"dock": { src: "/images/dock.jpg", alt: "Laptop on a wooden dock beside the lake", width: 1600, height: 1067, position: "60% 50%" },
	"wave": { src: "/images/wave.jpg", alt: "A wave curling over clear water", width: 1600, height: 1067 },
	"aqua-tower": { src: "/images/aqua-tower.jpg", alt: "Aqua Tower's rippling balconies in Chicago", width: 444, height: 1023 },
	"loop-night": { src: "/images/loop-night.jpg", alt: "Chicago Loop towers lit at night above empty parking decks", width: 1800, height: 1125, position: "50% 40%" },
	"el-night": { src: "/images/el-night.jpg", alt: "Elevated train tracks curving between lit towers in the Chicago Loop at night", width: 1464, height: 1800, position: "50% 60%" },
	"willis-fog": { src: "/images/willis-fog.jpg", alt: "Willis Tower disappearing into low cloud at blue hour", width: 798, height: 1800, position: "50% 30%" },
	"brick-lane": { src: "/images/brick-lane.jpg", alt: "Red-brick townhouse lane in Chicago with a coral-red gate in the foreground", width: 1280, height: 1600, position: "50% 58%" },
	"alley-night": { src: "/images/alley-night.jpg", alt: "An empty Chicago alley under a dark teal sky", width: 1800, height: 1200, position: "60% 50%" },
	"alley-dusk": { src: "/images/alley-dusk.jpg", alt: "A Chicago service alley between brick buildings at dusk", width: 1800, height: 1800 },
};

export const photoFor = (key?: string | null, fallback = "shore"): BundledPhoto =>
	PHOTOS[key ?? ""] ?? PHOTOS[fallback] ?? PHOTOS.shore;

// Cloudflare Image Transformations resizes the originals at the edge and sends AVIF or WebP to browsers that take them.
// pages/cdn-cgi/image/[...path].ts answers the same URLs locally, where there is no resizer.
const WIDTHS = [480, 640, 800, 1000, 1200, 1600, 2000];
const resized = (src: string, width: number) => `/cdn-cgi/image/width=${width},quality=75,format=auto,fit=scale-down,onerror=redirect${src}`;

/** Resized copies at the standard widths below the photo's own, plus one at its own width. */
export const srcsetFor = (photo: BundledPhoto): string =>
	[...WIDTHS.filter((width) => width < photo.width), photo.width].map((width) => `${resized(photo.src, width)} ${width}w`).join(", ");

// Match site.css: a 1200px container with clamp(20px, 4vw, 40px) padding.
const CONTAINER_WIDTH = "calc(min(100vw, 1200px) - clamp(40px, 8vw, 80px))";
const column = (fraction: number, gap: number) =>
	`calc((min(100vw, 1200px) - clamp(40px, 8vw, 80px) - ${gap}px) * ${fraction})`;

interface ImageSlot {
	media?: string;
	width: string;
	height?: string;
}

const stacked = (breakpoint: number, height: number): ImageSlot => ({
	media: `(max-width: ${breakpoint}px)`, width: CONTAINER_WIDTH, height: `${height}px`,
});
const FEATURED_COLUMN = column(0.5, 56);
const CARD_SINGLE = `calc(${CONTAINER_WIDTH} - 2px)`;
const CARD_DOUBLE = `calc(${column(0.5, 24)} - 2px)`;
const CARD_TRIPLE = `calc(${column(1 / 3, 48)} - 2px)`;

// Layout widths, stack breakpoints and photo heights come from site.css. Cards
// subtract their 1px borders; auto-fill changes columns at 624/948px of content.
const LAYOUTS = {
	hero: [stacked(900, 340), { width: column(0.54, 56), height: "clamp(420px, 44vw, 580px)" }],
	about: [stacked(960, 320), { width: column(0.45, 64), height: "560px" }],
	split: [stacked(960, 420), { width: column(0.5, 64), height: "500px" }],
	service: [stacked(900, 280), { width: column(1 / 2.05, 56), height: "520px" }],
	product: [stacked(900, 240), { width: column(0.5, 56), height: "600px" }],
	aside: [stacked(960, 280), { width: column(1 / 2.4, 48), height: "280px" }],
	featured: [
		{ media: "(max-width: 973.913043px)", width: CONTAINER_WIDTH, height: `calc(${CONTAINER_WIDTH} * 0.75)` },
		{ width: FEATURED_COLUMN, height: `calc(${FEATURED_COLUMN} * 0.75)` },
	],
	card: [
		{ media: "(max-width: 678.260869px)", width: CARD_SINGLE, height: `calc(${CARD_SINGLE} * ${2 / 3})` },
		{ media: "(max-width: 1027.999999px)", width: CARD_DOUBLE, height: `calc(${CARD_DOUBLE} * ${2 / 3})` },
		{ width: CARD_TRIPLE, height: `calc(${CARD_TRIPLE} * ${2 / 3})` },
	],
	article: [{ width: CONTAINER_WIDTH, height: `max(260px, calc(${CONTAINER_WIDTH} * ${9 / 21}))` }],
	// The band has a 380px minimum; longer CMS copy may make its crop taller.
	band: [{ width: CONTAINER_WIDTH, height: "380px" }],
	container: [{ width: CONTAINER_WIDTH }],
	viewport: [{ width: "100vw" }],
} satisfies Record<string, ImageSlot[]>;

export type PhotoLayout = keyof typeof LAYOUTS;

/**
 * Select enough source detail for object-fit: cover in both dimensions. A tall
 * panel with a landscape photo may need more pixels than its CSS width alone.
 * Missing CMS dimensions retain accurate slot widths without guessing a ratio.
 */
export const sizesFor = (layout: PhotoLayout, source?: { width?: number; height?: number }): string => {
	const ratio = source?.width && source?.height && Number.isFinite(source.width) && Number.isFinite(source.height)
		&& source.width > 0 && source.height > 0 ? source.width / source.height : undefined;
	const slots: ImageSlot[] = LAYOUTS[layout];
	return slots.map(({ media, width, height }) => {
		const size = ratio && height ? `max(${width}, calc(${height} * ${ratio}))` : width;
		return media ? `${media} ${size}` : size;
	}).join(", ");
};

/** Full-bleed sizing for native image callers. */
export const SIZES = {
	viewport: sizesFor("viewport"),
};
