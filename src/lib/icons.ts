// Lucide line icons (ISC), bundled as raw SVG from src/icons. Add a file there to add an icon;
// to offer it in the admin, also add its name to the icon options in seed/seed.json.
const files = import.meta.glob<string>("../icons/*.svg", { query: "?raw", import: "default", eager: true });

const icons = new Map<string, string>();
for (const [path, svg] of Object.entries(files)) {
	icons.set(path.slice(path.lastIndexOf("/") + 1, -4), svg);
}

export const iconSvg = (name?: string | null): string => (name ? icons.get(name) ?? "" : "");
