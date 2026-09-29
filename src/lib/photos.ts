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
