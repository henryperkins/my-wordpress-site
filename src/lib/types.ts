import type { getMenuWithCacheHint } from "emdash";

type MenuResult = Awaited<ReturnType<typeof getMenuWithCacheHint>>;
export type Menu = NonNullable<MenuResult["data"]>;
export type MenuItem = Menu["items"][number];

/** Media value stored by EmDash image fields. Render it with <Image> from "emdash/ui". */
export interface EmDashImage {
	id: string;
	src?: string;
	alt?: string;
	width?: number;
	height?: number;
	filename?: string;
	mimeType?: string;
	blurhash?: string;
	dominantColor?: string;
	focalX?: number;
	focalY?: number;
	provider?: string;
	previewUrl?: string;
	meta?: Record<string, unknown>;
}

export interface SiteLogo {
	url: string;
	alt?: string;
	width?: number;
	height?: number;
}
