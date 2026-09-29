// Header: scrolled border, the mobile menu, and collapsing the nav into the menu whenever a long CMS menu would overflow.
const header = document.querySelector<HTMLElement>("[data-header]");
const inner = header?.querySelector<HTMLElement>(".lfw-header__in");
const toggle = header?.querySelector<HTMLButtonElement>("[data-menu-toggle]");
const panel = header?.querySelector<HTMLElement>("[data-mobile-nav]");

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

	toggle?.addEventListener("click", () => setOpen(!isOpen()));
	panel?.addEventListener("click", (event) => {
		if ((event.target as Element).closest("a")) setOpen(false);
	});
	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && isOpen()) {
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
