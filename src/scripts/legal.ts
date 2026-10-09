// Legal layout: highlight the section in view, the mobile "Jump to section" select, and Print.
export {};

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const toc = document.querySelector<HTMLElement>("[data-toc]");

if (toc) {
	const links = [...toc.querySelectorAll<HTMLAnchorElement>("a[data-toc-link]")];
	const selectEl = toc.querySelector("[data-toc-select]");
	const select = selectEl instanceof HTMLSelectElement ? selectEl : null;
	const targets = links.map((link) => document.getElementById(link.dataset.tocLink ?? "")).filter((el): el is HTMLElement => !!el);

	const setActive = (id: string) => {
		for (const link of links) {
			if (link.dataset.tocLink === id) link.setAttribute("aria-current", "true");
			else link.removeAttribute("aria-current");
		}
		if (select && select.value !== id) select.value = id;
	};

	const jump = (id: string) => {
		const target = document.getElementById(id);
		if (!target) return;
		const offset = (document.querySelector<HTMLElement>("[data-header]")?.offsetHeight ?? 0) + 24;
		window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: reduced() ? "auto" : "smooth" });
		// Move the reading position as well as the viewport. The heading stays out
		// of the normal tab order; the next Tab continues from its section.
		if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
		target.focus({ preventScroll: true });
		history.replaceState(null, "", `#${id}`);
		setActive(id);
	};

	for (const link of links) {
		link.addEventListener("click", (event) => {
			if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
			event.preventDefault();
			jump(link.dataset.tocLink ?? "");
		});
	}
	select?.addEventListener("change", () => jump(select.value));

	if ("IntersectionObserver" in window && targets.length) {
		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				if (visible[0]) setActive(visible[0].target.id);
			},
			{ rootMargin: "-110px 0px -55% 0px" },
		);
		for (const target of targets) observer.observe(target);
	}
	const fromHash = decodeURIComponent(location.hash.slice(1));
	setActive(targets.some((target) => target.id === fromHash) ? fromHash : (targets[0]?.id ?? ""));
}

for (const button of document.querySelectorAll<HTMLElement>("[data-print]")) {
	button.addEventListener("click", () => window.print());
}
