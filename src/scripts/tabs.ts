// Tabs for the Service tabs and Specification tabs blocks. Every panel is rendered on the server and,
// without JavaScript, they simply stack. A panel's id doubles as its anchor: /services#seo, /hosting#e-commerce.
export {};

interface TabSet {
	list: HTMLElement;
	root: HTMLElement;
	panels: HTMLElement[];
	select(index: number): void;
}

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const headerOffset = () => (document.querySelector<HTMLElement>("[data-header]")?.offsetHeight ?? 0) + 16;
const sets: TabSet[] = [];

for (const root of document.querySelectorAll<HTMLElement>("[data-tabs]")) {
	const list = root.querySelector<HTMLElement>('[role="tablist"]');
	if (!list) continue;
	const tabs = [...list.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
	const panels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls") ?? ""));
	if (!tabs.length || panels.some((panel) => !panel)) continue;
	const ink = list.querySelector<HTMLElement>(".lf-tabs__ink");
	const selector = root.querySelector("select[data-tab-select]") as HTMLSelectElement | null;

	const placeInk = () => {
		const tab = tabs.find((item) => item.getAttribute("aria-selected") === "true");
		if (!tab || !ink) return;
		ink.style.width = `${tab.offsetWidth}px`;
		ink.style.transform = `translateX(${tab.offsetLeft}px)`;
	};

	const select = (index: number, focus = false) => {
		tabs.forEach((tab, i) => {
			const on = i === index;
			tab.setAttribute("aria-selected", String(on));
			tab.tabIndex = on ? 0 : -1;
			panels[i]!.classList.toggle("is-active", on);
		});
		placeInk();
		const tab = tabs[index]!;
		if (selector) selector.value = panels[index]!.id;
		if (focus) tab.focus();
		// Keep the selected tab in view when the tab list scrolls sideways on small screens.
		if (tab.offsetLeft < list.scrollLeft || tab.offsetLeft + tab.offsetWidth > list.scrollLeft + list.clientWidth) {
			list.scrollTo({ left: Math.max(0, tab.offsetLeft - 16), behavior: reduced() ? "auto" : "smooth" });
		}
	};
	const choose = (index: number, focus = false) => {
		select(index, focus);
		history.replaceState(null, "", `#${panels[index]!.id}`);
	};
	selector?.addEventListener("change", () => {
		const index = panels.findIndex((panel) => panel!.id === selector.value);
		if (index >= 0) choose(index);
	});

	tabs.forEach((tab, i) => {
		tab.addEventListener("click", () => choose(i));
		tab.addEventListener("keydown", (event) => {
			const last = tabs.length - 1;
			const next =
				event.key === "ArrowRight" ? (i === last ? 0 : i + 1)
				: event.key === "ArrowLeft" ? (i === 0 ? last : i - 1)
				: event.key === "Home" ? 0
				: event.key === "End" ? last
				: -1;
			if (next < 0) return;
			event.preventDefault();
			choose(next, true);
		});
	});

	new ResizeObserver(placeInk).observe(list);
	document.fonts?.ready.then(placeInk);
	placeInk();
	requestAnimationFrame(() => ink?.classList.add("is-animated"));
	sets.push({ list, root, panels: panels as HTMLElement[], select });
}

const openFromHash = (smooth: boolean) => {
	let id: string;
	try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
	if (!id) return;
	for (const set of sets) {
		const index = set.panels.findIndex((panel) => panel.id === id);
		if (index < 0) continue;
		set.select(index);
		const anchor = set.list.getClientRects().length ? set.list : set.root;
		const top = anchor.getBoundingClientRect().top + window.scrollY - headerOffset();
		window.scrollTo({ top, behavior: smooth && !reduced() ? "smooth" : "auto" });
		return;
	}
};

openFromHash(false);
window.addEventListener("hashchange", () => openFromHash(true));
