import { getMenuWithCacheHint, sanitizeHref } from "emdash";
import type { Menu, MenuItem } from "./types";

// Every menu the layout renders. Editors manage them under Menus in the admin.
export const MENUS = ["primary", "header_cta", "footer_services", "footer_hosting", "footer_company", "footer_contact", "footer_legal"] as const;
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

/** A footer column heading: the menu's admin label without its "Footer:" prefix. */
export const menuHeading = (menu: Menu | null | undefined, fallback: string): string =>
	(menu as { label?: string } | null | undefined)?.label?.replace(/^footer\s*[:–—-]\s*/i, "").trim() || fallback;

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
