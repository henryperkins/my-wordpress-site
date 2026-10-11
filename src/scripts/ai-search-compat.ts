// Adapts @cloudflare/ai-search-snippet 0.0.42 to the site in two ways.
// Compatibility: dialog naming, grid semantics for results with favourite controls, keyboard containment and
// cancellation on close. Remove these once the installed snippet covers them.
// Lakefront: its stylesheet (styles/search-modal.css), the site's wording, a close button, popular searches from the
// search_popular menu (Header.astro's #lfw-ai-search-parts), and loading, no-results and error states that say what
// happened and offer a way on, including the /search page, which doesn't depend on AI Search.
import searchStyles from "../styles/search-modal.css?inline";

type SearchModal = HTMLElement & {
	close?: () => void;
	search?: (query: string) => Promise<void>;
	translations?: Record<string, unknown> | null;
};

// Replaces the snippet's own strings. The no-results description is only the query: sync() writes the message.
const TRANSLATIONS = {
	loadingMessages: ["Searching…"],
	modalNoResultsTitle: "No results",
	modalNoResultsDescription: "{query}",
};

const COPY = {
	noResults: (query: string) => `No results for “${query}”`,
	noResultsHint: "Check the spelling, or try a broader term.",
	slow: "Taking longer than usual.",
	searchPage: "See results on the search page",
	retry: "Try again",
	errors: {
		unavailable: ["Search is temporarily unavailable", "Try again in a moment, or use the search page."],
		network: ["Search couldn’t connect", "Check your connection, then try again."],
		offline: ["You’re offline", "Reconnect, then try again."],
		busy: ["Too many searches at once", "Wait a moment, then try again."],
	},
} as const;

// AI Search usually answers in two to eight seconds; past this, offer the /search page.
const SLOW_AFTER_MS = 4000;

const modal = document.getElementById("lfw-ai-search") as SearchModal | null;
const parts = document.getElementById("lfw-ai-search-parts") as HTMLTemplateElement | null;

if (modal) {
	void customElements.whenDefined("search-modal-snippet").then(() => {
		const shadow = modal.shadowRoot;
		if (!modal.isConnected || !shadow) return;
		// Re-renders the snippet once, closed, with the site's wording.
		modal.translations = TRANSLATIONS;

		// Site CSS cannot cross the snippet's shadow boundary. An adopted sheet also survives the snippet's re-renders.
		let adopted = false;
		try {
			const sheet = new CSSStyleSheet();
			sheet.replaceSync(searchStyles);
			shadow.adoptedStyleSheets = [...shadow.adoptedStyleSheets, sheet];
			adopted = true;
		} catch {
			// Older engines take a <style> element, which decorate() puts back after a re-render.
		}

		// appendChild rather than append(): the Workers types' HTMLRewriter Element shadows the DOM's.
		const part = <T extends Element>(selector: string) => parts?.content.querySelector(selector)?.cloneNode(true) as T | undefined;
		const decorate = () => {
			if (!adopted && !shadow.querySelector("style[data-lfw]")) {
				const style = document.createElement("style");
				style.dataset.lfw = "";
				style.textContent = searchStyles;
				shadow.append(style);
			}
			const icon = shadow.querySelector(".modal-header > svg.modal-search-icon");
			const lucide = icon && part(".modal-search-icon");
			if (icon && lucide) icon.replaceWith(lucide);
			const header = shadow.querySelector(".modal-header");
			const close = header && !header.querySelector(".lfw-search-close") && part(".lfw-search-close");
			if (header && close) header.appendChild(close);
			const content = shadow.querySelector(".modal-content");
			const more = content && !content.querySelector(".lfw-search-more") && part(".lfw-search-more");
			if (content && more) content.appendChild(more);
			const dialog = shadow.querySelector<HTMLElement>('[role="dialog"]');
			if (dialog) dialog.toggleAttribute("data-lfw-popular", !!shadow.querySelector(".lfw-search-chip"));
		};

		const setAttribute = (element: Element, name: string, value: string) => {
			if (element.getAttribute(name) !== value) element.setAttribute(name, value);
		};
		const isOpen = () => !!shadow.querySelector(".modal-container.open");
		const currentQuery = () => shadow.querySelector<HTMLInputElement>(".modal-search-input")?.value.trim() ?? "";
		const searchPageLink = (query: string) => {
			const link = document.createElement("a");
			link.className = "lfw-search-link";
			link.href = `/search?q=${encodeURIComponent(query)}`;
			const label = document.createElement("span");
			label.textContent = COPY.searchPage;
			link.appendChild(label);
			const arrow = part(".lfw-search-arrow");
			if (arrow) link.appendChild(arrow);
			return link;
		};
		const paragraph = (className: string, text: string) => {
			const element = document.createElement("p");
			element.className = className;
			element.textContent = text;
			return element;
		};
		// The snippet reports failures as text: "HTTP error! status: 503", or the browser's fetch message.
		const failureKind = (message: string): keyof typeof COPY.errors => {
			const status = Number(/status:\s*(\d{3})/.exec(message)?.[1] ?? 0);
			if (!navigator.onLine) return "offline";
			if (status === 429) return "busy";
			if (!status && /fetch|network|load failed/i.test(message)) return "network";
			return "unavailable";
		};

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

		let slowLoading: Element | null = null;
		let slowTimer = 0;
		const sync = () => {
			decorate();
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

			// Name the state for search-modal.css: popular searches show while idle and after nothing is found.
			const failed = results.querySelector<HTMLElement>(".error");
			const emptyTitle = results.querySelector<HTMLElement>(".modal-empty-title");
			setAttribute(dialog, "data-lfw-state", results.querySelector(".modal-loading") ? "loading" : failed ? "error"
				: emptyTitle ? "empty" : items.length > 0 && input.value.trim() ? "results" : "idle");

			// The snippet rendered the bare query (TRANSLATIONS); put it in the /search page's sentence.
			const emptyText = results.querySelector<HTMLElement>(".modal-empty-description");
			if (emptyTitle && emptyText && emptyTitle.dataset.lfwQuery === undefined) {
				emptyTitle.dataset.lfwQuery = emptyText.textContent?.trim() ?? "";
				emptyTitle.textContent = COPY.noResults(emptyTitle.dataset.lfwQuery);
				emptyText.textContent = COPY.noResultsHint;
			}

			// Replace "Error: HTTP error! status: 503" with what happened and what to do next.
			if (failed && !failed.dataset.lfwFailure) {
				const kind = failureKind(failed.textContent ?? "");
				const [title, text] = COPY.errors[kind];
				const retry = document.createElement("button");
				retry.type = "button";
				retry.className = "lfw-search-retry";
				retry.textContent = COPY.retry;
				const actions = document.createElement("div");
				actions.className = "lfw-search-actions";
				actions.appendChild(retry);
				const query = currentQuery();
				if (query && (kind === "unavailable" || kind === "network")) actions.appendChild(searchPageLink(query));
				failed.dataset.lfwFailure = kind;
				failed.replaceChildren(paragraph("lfw-search-title", title), paragraph("lfw-search-text", text), actions);
			}

			// A slow answer offers the /search page, which runs on the site's own full-text index.
			const searching = results.querySelector(".modal-loading");
			if (searching !== slowLoading) {
				window.clearTimeout(slowTimer);
				slowLoading = searching;
				if (searching) {
					slowTimer = window.setTimeout(() => {
						const query = currentQuery();
						if (!searching.isConnected || !isOpen() || !query || searching.querySelector(".lfw-search-slow")) return;
						const note = document.createElement("div");
						note.className = "lfw-search-slow";
						note.replaceChildren(paragraph("lfw-search-text", COPY.slow), searchPageLink(query));
						searching.appendChild(note);
					}, SLOW_AFTER_MS);
				}
			}
		};

		// Runs a search from a popular search or Try again. Keyboard and fine-pointer users stay in the field;
		// a tap keeps the phone keyboard down, with focus on the dialog so Tab and Escape still work there.
		const run = (query: string, event: MouseEvent) => {
			const input = shadow.querySelector<HTMLInputElement>(".modal-search-input");
			const dialog = shadow.querySelector<HTMLElement>('[role="dialog"]');
			if (!input || !dialog || typeof modal.search !== "function") return false;
			// Clearing first cancels the snippet's queued debounce and any request in flight.
			input.value = "";
			input.dispatchEvent(new Event("input", { bubbles: true }));
			if (event.detail === 0 || matchMedia("(pointer: fine)").matches) {
				input.focus();
			} else {
				dialog.tabIndex = -1;
				dialog.focus({ preventScroll: true });
			}
			void modal.search(query);
			return true;
		};
		const modified = (event: MouseEvent) => event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
		shadow.addEventListener("click", (event) => {
			if (!(event instanceof MouseEvent) || !(event.target instanceof Element)) return;
			const target = event.target;
			if (target.closest(".lfw-search-close")) {
				modal.close?.();
				return;
			}
			if (target.closest(".lfw-search-retry")) {
				const query = currentQuery();
				if (query) run(query, event);
				return;
			}
			const link = target.closest<HTMLAnchorElement>("a[href]");
			if (!link || modified(event)) return;
			const url = new URL(link.href, location.href);
			const query = url.searchParams.get("q")?.trim();
			// A popular search for /search?q=… runs here instead of leaving the page.
			if (link.matches(".lfw-search-chip") && url.origin === location.origin && url.pathname === "/search" && query) {
				if (run(query, event)) event.preventDefault();
				return;
			}
			// A link to a part of this page can't scroll it while the modal locks the body, so close first.
			if (url.origin === location.origin && url.pathname === location.pathname && url.hash) modal.close?.();
		});

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
				modal.close?.();
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
			if (!active || !dialog.contains(active) || active === dialog || (event.shiftKey ? active === first : active === last)) {
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
			window.clearTimeout(slowTimer);
			slowLoading = null;
			for (const [element, inert] of background) element.inert = inert;
			background.clear();
		};
		modal.addEventListener("open", start);
		modal.addEventListener("close", () => {
			// Capture restores the background before header.ts returns focus to
			// the opener. The snippet's empty-input handler cancels debounce and
			// in-flight fetches, preventing a late response after dismissal.
			stop();
			const dialog = shadow.querySelector<HTMLElement>('[role="dialog"]');
			dialog?.removeAttribute("tabindex");
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
