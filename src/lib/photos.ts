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

/** How wide photos render, so the browser picks the smallest copy that stays sharp. Panels stack below 960px. */
export const SIZES = {
	panel: "(max-width: 960px) calc(100vw - 40px), 540px",
	container: "(max-width: 1200px) calc(100vw - 40px), 1120px",
	card: "(max-width: 700px) calc(100vw - 40px), (max-width: 1080px) calc(50vw - 40px), 380px",
	viewport: "100vw",
};
