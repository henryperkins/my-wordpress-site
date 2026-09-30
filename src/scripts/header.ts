// Header: scrolled border, the mobile menu, menu groups (Services › SEO), and collapsing the nav into the menu
// whenever a long CMS menu would overflow.
const header = document.querySelector<HTMLElement>("[data-header]");
const inner = header?.querySelector<HTMLElement>(".lfw-header__in");
const toggle = header?.querySelector<HTMLButtonElement>("[data-menu-toggle]");
const panel = header?.querySelector<HTMLElement>("[data-mobile-nav]");
const groups = [...(header?.querySelectorAll<HTMLElement>("[data-navgroup]") ?? [])];

if (header && inner) {
	const isOpen = () => toggle?.getAttribute("aria-expanded") === "true";
	const syncScrolled = () => header.classList.toggle("is-scrolled", window.scrollY > 8 || isOpen());
	const setOpen = (open: boolean) => {
		if (!toggle || !panel) return;
		toggle.setAttribute("aria-expanded", String(open));
		toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
		panel.hidden = !open;
		syncScrolled();
	};
	const menuShown = () => !!toggle && getComputedStyle(toggle).display !== "none";

	// Menu groups: the button toggles its panel; a click elsewhere, Escape or tabbing out closes it.
	const parts = (group: HTMLElement) => ({
		button: group.querySelector<HTMLButtonElement>(".lfw-nav__btn"),
		list: group.querySelector<HTMLElement>(".lfw-subnav"),
	});
	const setGroup = (group: HTMLElement, open: boolean) => {
		const { button, list } = parts(group);
		if (!button || !list) return;
		button.setAttribute("aria-expanded", String(open));
		list.hidden = !open;
	};
	const groupOpen = (group: HTMLElement) => parts(group).button?.getAttribute("aria-expanded") === "true";
	for (const group of groups) {
		parts(group).button?.addEventListener("click", () => {
			const open = !groupOpen(group);
			for (const other of groups) if (other !== group) setGroup(other, false);
			setGroup(group, open);
		});
		group.addEventListener("focusout", (event) => {
			if (!group.contains(event.relatedTarget as Node | null)) setGroup(group, false);
		});
	}
	document.addEventListener("pointerdown", (event) => {
		for (const group of groups) if (groupOpen(group) && !group.contains(event.target as Node)) setGroup(group, false);
	});

	toggle?.addEventListener("click", () => setOpen(!isOpen()));
	panel?.addEventListener("click", (event) => {
		if ((event.target as Element).closest("a")) setOpen(false);
	});
	document.addEventListener("keydown", (event) => {
		if (event.key !== "Escape") return;
		const openGroup = groups.find(groupOpen);
		if (openGroup) {
			setGroup(openGroup, false);
			parts(openGroup).button?.focus();
			return;
		}
		if (isOpen()) {
			setOpen(false);
			toggle?.focus();
		}
	});

	const measure = () => {
		header.removeAttribute("data-collapsed");
		if (inner.scrollWidth > inner.clientWidth + 1) header.setAttribute("data-collapsed", "");
		if (isOpen() && !menuShown()) setOpen(false);
	};

	window.addEventListener("scroll", syncScrolled, { passive: true });
	new ResizeObserver(measure).observe(inner);
	document.fonts?.ready.then(measure);
	measure();
	syncScrolled();
}

// The bar's search icon opens the AI search modal (Header.astro)
// instead of navigating. Modified clicks, and visitors whose modal never loads, still get the /search page.
type SearchModal = HTMLElement & { open?: () => void };
const searchLinks = [...(header?.querySelectorAll<HTMLAnchorElement>("[data-ai-search-open]") ?? [])];
const searchModal = document.getElementById("lfw-ai-search") as SearchModal | null;
if (searchLinks.length > 0 && searchModal) {
	const shown = (el: HTMLElement) => el.isConnected && el.getClientRects().length > 0;
	customElements.whenDefined("search-modal-snippet").then(() => {
		for (const link of searchLinks) link.setAttribute("aria-haspopup", "dialog");
	});
	for (const link of searchLinks) {
		link.addEventListener("click", (event) => {
			if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
			if (typeof searchModal.open !== "function") return;
			event.preventDefault();
			searchModal.open();
		});
	}
	// The modal leaves focus on the page body when it closes (Escape, the backdrop, a result), so hand it back to
	// whatever opened it: a search link, or the element that had focus when the Ctrl/Cmd+K shortcut was used.
	// If responsive navigation hides the opener, focus falls back to a visible header control.
	let opener: HTMLElement | null = null;
	searchModal.addEventListener("open", () => {
		const active = document.activeElement;
		opener = active instanceof HTMLElement && active !== document.body ? active : null;
	});
	searchModal.addEventListener("close", () => {
		const fallback = [toggle, ...searchLinks].find((el) => !!el && shown(el));
		(opener && shown(opener) ? opener : fallback)?.focus();
		opener = null;
	});
}
