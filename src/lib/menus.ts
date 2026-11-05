import { getMenuWithCacheHint, sanitizeHref } from "emdash";
import type { Menu, MenuItem } from "./types";

// Every menu the layout renders, including search_popular for the search modal. The footer lists the primary menu's
// top-level links beside footer_legal and footer_contact. Editors manage them under Menus in the admin.
export const MENUS = ["primary", "header_cta", "footer_contact", "footer_legal", "search_popular"] as const;
export type MenuName = (typeof MENUS)[number];

export async function loadMenus() {
	const results = await Promise.all(MENUS.map((name) => getMenuWithCacheHint(name)));
	const menus = {} as Record<MenuName, Menu | null>;
	MENUS.forEach((name, i) => {
		menus[name] = results[i]?.data ?? null;
	});
	return { menus, hints: results.map((result) => result.cacheHint) };
}

export const itemsOf = (menu?: Menu | null): MenuItem[] => menu?.items ?? [];

export const linkAttrs = (item: { url: string; target?: string | null }) => ({
	href: sanitizeHref(item.url),
	target: item.target || undefined,
	rel: item.target === "_blank" ? "noopener noreferrer" : undefined,
});

/** True when a menu URL points at the page being rendered (hash and query ignored). */
export const isCurrent = (url: string, current: URL): boolean => {
	try {
		const target = new URL(url, current);
		const trim = (path: string) => path.replace(/\/+$/, "") || "/";
		return target.origin === current.origin && trim(target.pathname) === trim(current.pathname);
	} catch {
		return false;
	}
};

/**
 * True when a menu link should carry aria-current="page". A URL with a fragment (/#about, /services#seo) points at part
 * of a page rather than the page, so it never does, even on that page.
 */
export const isCurrentPage = (url: string, current: URL): boolean => {
	try {
		return !new URL(url, current).hash && isCurrent(url, current);
	} catch {
		return false;
	}
};
