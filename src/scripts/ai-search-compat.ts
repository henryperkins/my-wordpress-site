// Compatibility for @cloudflare/ai-search-snippet 0.0.42: dialog naming, grid
// semantics for results with favourite controls, keyboard containment and
// cancellation on close. Remove after the installed snippet covers these paths.
export {};

const modal = document.getElementById("lfw-ai-search");

if (modal) {
	void customElements.whenDefined("search-modal-snippet").then(() => {
		const shadow = modal.shadowRoot;
		if (!modal.isConnected || !shadow) return;
		// Site CSS cannot cross the snippet's shadow boundary.
		const style = document.createElement("style");
		style.textContent = `
			@media (max-width: 1080px), (any-pointer: coarse) {
				.modal-favorite-button { width: 44px; height: 44px; }
				a.modal-result-item { padding-right: calc(44px + var(--search-snippet-spacing-md) + var(--search-snippet-spacing-md)); }
			}
			@media (prefers-reduced-motion: reduce) {
				*, *::before, *::after {
					animation-duration: .01ms !important;
					animation-iteration-count: 1 !important;
					transition-duration: .01ms !important;
					scroll-behavior: auto !important;
				}
			}
		`;
		shadow.append(style);

		const setAttribute = (element: Element, name: string, value: string) => {
			if (element.getAttribute(name) !== value) element.setAttribute(name, value);
		};
		const isOpen = () => !!shadow.querySelector(".modal-container.open");
		const wrap = (element: HTMLElement, role: "row" | "gridcell") => {
			if (element.parentElement?.dataset.lfwSearchWrapper === role) return element.parentElement;
			const wrapper = document.createElement("div");
			wrapper.dataset.lfwSearchWrapper = role;
			wrapper.setAttribute("role", role);
			// The snippet's links remain direct flex items, and group headings
			// retain their sticky containing block. This adds only semantics.
			wrapper.style.display = "contents";
			element.parentNode?.insertBefore(wrapper, element);
			wrapper.appendChild(element);
			return wrapper;
		};
		const sync = () => {
			const dialog = shadow.querySelector<HTMLElement>('[role="dialog"]');
			const input = shadow.querySelector<HTMLInputElement>(".modal-search-input");
			const results = shadow.querySelector<HTMLElement>(".modal-results");
			if (!dialog || !input || !results) return;
			// The snippet queues focus across two animation frames on open.
			// Inert prevents that callback from stealing focus during dismissal.
			dialog.inert = !isOpen();
			const loading = results.querySelector(".loading");
			if (loading) setAttribute(loading, "role", "img");

			const labelledBy = dialog.getAttribute("aria-labelledby");
			if (labelledBy && !labelledBy.split(/\s+/).some((id) => shadow.getElementById(id)?.textContent?.trim())) {
				dialog.removeAttribute("aria-labelledby");
				// Reuse the snippet's translated field name rather than inventing page copy.
				if (!dialog.getAttribute("aria-label")) setAttribute(dialog, "aria-label", input.getAttribute("aria-label") || "Search");
			}

			setAttribute(input, "role", "combobox");
			setAttribute(input, "aria-haspopup", "grid");
			const items = results.querySelectorAll<HTMLElement>(".modal-result-item");
			setAttribute(input, "aria-expanded", String(isOpen() && items.length > 0));
			const activeId = input.getAttribute("aria-activedescendant");
			if (activeId && ![...items].some((item) => item.id === activeId)) input.removeAttribute("aria-activedescendant");

			if (items.length > 0) {
				// A grid supports the independently operable favourite buttons and
				// See more link. Keep the snippet's classes, selection and layout.
				setAttribute(results, "role", "grid");
				results.removeAttribute("aria-live");
				for (const row of results.querySelectorAll(".modal-result-row")) setAttribute(row, "role", "row");
				for (const item of items) setAttribute(item, "role", "gridcell");
				for (const button of results.querySelectorAll<HTMLElement>(".modal-favorite-button")) wrap(button, "gridcell");
				for (const group of results.querySelectorAll(".modal-initial-section, .result-group")) setAttribute(group, "role", "rowgroup");
				for (const heading of results.querySelectorAll<HTMLElement>(".modal-initial-section-title, .result-group-header")) wrap(wrap(heading, "gridcell"), "row");
				for (const link of results.querySelectorAll<HTMLElement>(".modal-see-more")) wrap(wrap(link, "gridcell"), "row");
			} else {
				setAttribute(results, "role", results.querySelector(".error") ? "alert" : "status");
				setAttribute(results, "aria-live", results.querySelector(".error") ? "assertive" : "polite");
			}
		};

		const background = new Map<HTMLElement, boolean>();
		const containBackground = () => {
			// The modal shares .lfw with the header/main/footer. Inert siblings at
			// each ancestor level rather than making that shared ancestor inert.
			for (let branch: Element = modal; branch.parentElement; branch = branch.parentElement) {
				const parent = branch.parentElement;
				for (const sibling of parent.children) {
					if (sibling === branch || !(sibling instanceof HTMLElement) || background.has(sibling)) continue;
					background.set(sibling, sibling.inert);
					sibling.inert = true;
				}
				if (parent === document.body) break;
			}
		};
		const keydown = (event: KeyboardEvent) => {
			if (!isOpen()) return;
			if (event.key === "Escape") {
				event.preventDefault();
				event.stopPropagation();
				(modal as HTMLElement & { close?: () => void }).close?.();
				return;
			}
			if (event.key !== "Tab") return;
			const dialog = shadow.querySelector<HTMLElement>('[role="dialog"]');
			if (!dialog) return;
			const controls = [...dialog.querySelectorAll<HTMLElement>("a[href], button, input, select, textarea, [tabindex]")]
				.filter((element) => element.tabIndex >= 0 && !element.matches(":disabled") && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden");
			const first = controls[0];
			const last = controls.at(-1);
			const active = shadow.activeElement;
			if (!first || !last) return;
			if (!active || !dialog.contains(active) || (event.shiftKey ? active === first : active === last)) {
				event.preventDefault();
				(event.shiftKey ? last : first).focus();
			}
		};
		const observer = new MutationObserver(sync);
		const start = () => {
			sync();
			// Let header.ts record the focused opener before inert can move it
			// to the body. A close in the same task must not inert the page.
			queueMicrotask(() => { if (isOpen()) containBackground(); });
			document.addEventListener("keydown", keydown, true);
			observer.observe(shadow, {
				subtree: true,
				childList: true,
				attributes: true,
				attributeFilter: ["aria-expanded", "aria-activedescendant", "aria-labelledby"],
			});
		};
		const stop = () => {
			observer.disconnect();
			document.removeEventListener("keydown", keydown, true);
			for (const [element, inert] of background) element.inert = inert;
			background.clear();
		};
		modal.addEventListener("open", start);
		modal.addEventListener("close", () => {
			// Capture restores the background before header.ts returns focus to
			// the opener. The snippet's empty-input handler cancels debounce and
			// in-flight fetches, preventing a late response after dismissal.
			stop();
			const input = shadow.querySelector<HTMLInputElement>(".modal-search-input");
			if (input) {
				input.value = "";
				input.dispatchEvent(new Event("input", { bubbles: true }));
			}
			sync();
		}, { capture: true });
		window.addEventListener("pagehide", stop);
		window.addEventListener("pageshow", () => { if (modal.isConnected && isOpen()) start(); });
		sync();
		if (isOpen()) start();
	});
}
