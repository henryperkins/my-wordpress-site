// Header: scrolled border, the mobile menu, menu groups (Services › SEO), collapsing the nav into the menu whenever a
// long CMS menu would overflow, and returning focus when the search modal closes.
const header = document.querySelector<HTMLElement>("[data-header]");
const inner = header?.querySelector<HTMLElement>(".lfw-header__in");
const toggle = header?.querySelector<HTMLButtonElement>("[data-menu-toggle]");
const panel = header?.querySelector<HTMLElement>("[data-mobile-nav]");
const groups = [...(header?.querySelectorAll<HTMLElement>("[data-navgroup]") ?? [])];
const page = document.querySelector<HTMLElement>("main");

if (header && inner) {
	const isOpen = () => toggle?.getAttribute("aria-expanded") === "true";
	const syncScrolled = () => header.classList.toggle("is-scrolled", window.scrollY > 8 || isOpen());
	const setOpen = (open: boolean) => {
		if (!toggle || !panel) return;
		// Closing the panel while the header is pinned would pull the page up under the visitor by the panel's height.
		// Chrome's scroll anchoring holds the page still; Safari has none, so measure the page and scroll it back.
		const before = !open && isOpen() ? page?.getBoundingClientRect().top : undefined;
		toggle.setAttribute("aria-expanded", String(open));
		toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
		panel.hidden = !open;
		syncScrolled();
		if (page && before !== undefined) {
			const moved = page.getBoundingClientRect().top - before;
			if (Math.abs(moved) > 1) window.scrollBy({ top: moved, behavior: "instant" });
		}
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
	// A press outside an open menu closes it. The mobile panel's press goes no further: closing the panel can move the
	// page under the pointer, so the click that ends the same press is dropped rather than landing on whatever slid
	// into its place.
	let dropClick = false;
	document.addEventListener("pointerdown", (event) => {
		const target = event.target as Node;
		for (const group of groups) if (groupOpen(group) && !group.contains(target)) setGroup(group, false);
		dropClick = isOpen() && menuShown() && !header.contains(target);
		if (dropClick) setOpen(false);
	});
	// A press that turns into a scroll ends without a click.
	document.addEventListener("pointercancel", () => {
		dropClick = false;
	});
	document.addEventListener(
		"click",
		(event) => {
			// A click from the keyboard (detail 0) never ends a press.
			if (!dropClick || event.detail === 0) return;
			dropClick = false;
			event.preventDefault();
			event.stopPropagation();
		},
		true,
	);
	// Focus leaving the header closes the menu too, so the open panel never covers the control that has focus.
	header.addEventListener("focusout", (event) => {
		const next = event.relatedTarget;
		if (isOpen() && menuShown() && next instanceof Node && !header.contains(next)) setOpen(false);
	});
	// So does the search dialog opening over the page (Ctrl/Cmd+K from anywhere), before any press in it.
	document.getElementById("lfw-ai-search")?.addEventListener("open", () => {
		if (isOpen()) setOpen(false);
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

// The AI search modal (Header.astro) has no button in the bar: it opens with Ctrl/Cmd+K from anywhere, and the
// footer and the 404 page link to /search. The modal leaves focus on the page body when it closes (Escape, the
// backdrop, a result), so hand it back to the element that had focus when the modal opened. If nothing had focus, or
// responsive navigation has since hidden that element, focus goes to a visible header control: the menu button while
// the menu is collapsed, otherwise the first control in the bar (the logo's home link).
const searchModal = document.getElementById("lfw-ai-search");
if (searchModal) {
	const shown = (el: HTMLElement) => el.isConnected && el.getClientRects().length > 0;
	let opener: HTMLElement | null = null;
	searchModal.addEventListener("open", () => {
		const active = document.activeElement;
		opener = active instanceof HTMLElement && active !== document.body ? active : null;
	});
	searchModal.addEventListener("close", () => {
		const controls = [toggle, ...(inner?.querySelectorAll<HTMLElement>("a[href], button") ?? [])];
		const fallback = controls.find((el): el is HTMLElement => !!el && shown(el));
		(opener && shown(opener) ? opener : fallback)?.focus();
		opener = null;
	});
}
