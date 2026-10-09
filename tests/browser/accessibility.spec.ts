import { expect, test, type Locator } from "@playwright/test";

const resultChunks = (count: number) => Array.from({ length: count }, (_, index) => ({
	id: `result-${index}`,
	item: { key: index === 0 ? "/hosting" : "/services", metadata: {
		title: index === 0 ? "Hosting" : `Service ${index}`,
		description: "Website services",
	} },
}));

const focusableControls = (dialog: Locator) => dialog.locator("a[href], button, input, select, textarea, [tabindex]");
const visibleControlIndexes = async (dialog: Locator) => focusableControls(dialog).evaluateAll((elements) =>
	elements.flatMap((element, index) => element instanceof HTMLElement && element.tabIndex >= 0 &&
		!element.matches(":disabled") && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden" ? [index] : []));

test("AI search keeps named dialog and grid semantics across result states", async ({ page }) => {
	let releaseEmptyResults!: () => void;
	const emptyResultsReady = new Promise<void>((resolve) => { releaseEmptyResults = resolve; });
	await page.route("**/api/ai-search/search", async (route) => {
		const query = route.request().postDataJSON().messages[0].content;
		if (query === "failure") {
			await route.fulfill({ status: 503, json: { success: false, error: "Search is temporarily unavailable" } });
			return;
		}
		if (query === "nothing") await emptyResultsReady;
		await route.fulfill({ json: {
			success: true,
			result: { chunks: query === "nothing" ? [] : resultChunks(2) },
		} });
	});
	await page.goto("/");
	const opener = page.locator("[data-ai-search-open]");
	await opener.focus();
	await opener.press("Enter");
	const dialog = page.getByRole("dialog", { name: "Search", exact: true });
	const input = dialog.getByRole("combobox", { name: "Search", exact: true });
	await expect(dialog).toBeVisible();
	await expect(dialog).toHaveJSProperty("inert", false);
	await expect(input).toBeFocused();
	await expect(input).toHaveAttribute("aria-haspopup", "grid");
	await expect(input).toHaveAttribute("aria-expanded", "false");
	await expect(dialog.getByRole("grid")).toHaveCount(0);
	await expect(dialog.getByRole("status")).toContainText("Start typing");

	await input.fill("hosting");
	const grid = dialog.getByRole("grid", { name: "Search results" });
	await expect(grid.getByRole("row")).toHaveCount(2);
	await expect(grid.getByRole("gridcell")).toHaveCount(4);
	await expect(grid.getByRole("button")).toHaveCount(2);
	await expect(input).toHaveAttribute("aria-expanded", "true");
	await expect(input).toHaveAttribute("aria-activedescendant", "result-0");
	await input.press("ArrowDown");
	await expect(input).toHaveAttribute("aria-activedescendant", "result-1");
	await expect(grid.getByRole("gridcell", { selected: true })).toContainText("Service 1");
	await expect(grid.getByRole("listbox")).toHaveCount(0);
	await expect(grid.getByRole("option")).toHaveCount(0);

	await input.fill("nothing");
	await expect(dialog.getByRole("status").locator(".modal-loading")).toBeVisible();
	await expect(dialog.locator(".loading")).toHaveAttribute("role", "img");
	await expect(dialog.locator(".loading")).toHaveAccessibleName(/loading/i);
	await expect(input).toHaveAttribute("aria-expanded", "false");
	await expect(input).not.toHaveAttribute("aria-activedescendant", /./);
	releaseEmptyResults();
	await expect(dialog.getByRole("status")).toContainText("No results found");
	await expect(input).toHaveAttribute("aria-expanded", "false");
	await expect(input).not.toHaveAttribute("aria-activedescendant", /./);
	await expect(dialog.getByRole("grid")).toHaveCount(0);

	await input.fill("failure");
	await expect(dialog.getByRole("alert")).toContainText("503");
	await expect(input).toHaveAttribute("aria-expanded", "false");
	await input.press("Escape");
	await expect(dialog).toBeHidden();
	await expect(page.locator("#lfw-ai-search .modal-container")).toHaveJSProperty("inert", true);
	await expect(opener).toBeFocused();
	await page.keyboard.press("Control+k");
	await expect(dialog).toBeVisible();
	await expect(dialog).toHaveJSProperty("inert", false);
	await expect(input).toBeFocused();
	await expect(input).toHaveAttribute("aria-expanded", "false");
	await input.press("Escape");
	await expect(opener).toBeFocused();
});

test("search contains Tab and Escape across every control including favourites and see more", async ({ page }) => {
	await page.route("**/api/ai-search/search", (route) => route.fulfill({ json: {
		success: true, result: { chunks: resultChunks(11) },
	} }));
	await page.goto("/");
	const opener = page.locator("[data-ai-search-open]");
	const dialog = page.getByRole("dialog", { name: "Search", exact: true });
	const input = dialog.getByRole("combobox", { name: "Search", exact: true });
	const openWithResults = async () => {
		await opener.focus();
		await opener.press("Enter");
		await expect(input).toBeFocused();
		await input.fill("many");
		await expect(dialog.getByRole("grid").getByRole("row")).toHaveCount(11);
	};
	await openWithResults();
	const grid = dialog.getByRole("grid");
	const favorite = grid.getByRole("button").first();
	await favorite.click();
	await expect(favorite).toHaveAttribute("aria-pressed", "true");
	await expect(grid.locator(".modal-see-more")).toHaveAttribute("href", "/search?q=many");
	await expect(grid.locator(".modal-see-more").locator("..")).toHaveAttribute("role", "gridcell");
	await expect.poll(() => page.locator("[data-header]").evaluate((header) => (header as HTMLElement).inert)).toBe(true);

	const indexes = await visibleControlIndexes(dialog);
	const controls = focusableControls(dialog);
	await controls.nth(indexes[0]).focus();
	for (const index of indexes.slice(1)) {
		await page.keyboard.press("Tab");
		await expect(controls.nth(index)).toBeFocused();
	}
	await page.keyboard.press("Tab");
	await expect(input).toBeFocused();
	await page.keyboard.press("Shift+Tab");
	await expect(controls.nth(indexes.at(-1)!)).toBeFocused();

	// Every currently rendered tabbable control must dismiss the modal, not
	// only its input. Reopen with the same results after each dismissal.
	for (const index of indexes) {
		await controls.nth(index).focus();
		await page.keyboard.press("Escape");
		await expect(dialog).toBeHidden();
		await expect(opener).toBeFocused();
		await expect.poll(() => page.locator("[data-header]").evaluate((header) => (header as HTMLElement).inert)).toBe(false);
		if (index !== indexes.at(-1)) await openWithResults();
	}
});

test("search preserves favourite and recent result groups without changing their layout", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.addInitScript(() => {
		const result = (id: string, title: string, url: string) => ({ type: "result", id, title, description: "Saved result", url });
		localStorage.setItem("search-snippet:favorite-results", JSON.stringify([result("hosting", "Hosting", "/hosting")]));
		localStorage.setItem("search-snippet:recent-results", JSON.stringify([result("services", "Services", "/services")]));
	});
	await page.goto("/");
	await page.locator("[data-ai-search-open]").press("Enter");
	const dialog = page.getByRole("dialog", { name: "Search", exact: true });
	const grid = dialog.getByRole("grid", { name: "Search results" });
	await expect(grid.getByRole("rowgroup")).toHaveCount(2);
	await expect(grid.getByRole("rowgroup").first()).toContainText("Hosting");
	await expect(grid.getByRole("rowgroup").last()).toContainText("Services");
	await expect(grid.getByRole("row")).toHaveCount(4); // Two headings and two results.
	await expect(grid.getByRole("button").first()).toHaveAttribute("aria-pressed", "true");
	await expect(dialog.getByRole("combobox")).toHaveAttribute("aria-expanded", "true");
	expect(await grid.evaluate((element) => [...element.querySelectorAll<HTMLElement>("[data-lfw-search-wrapper]")]
		.every((wrapper) => getComputedStyle(wrapper).display === "contents"))).toBe(true);
	const geometry = await grid.locator(".modal-result-row").first().evaluate((row) => {
		const link = row.querySelector<HTMLElement>(".modal-result-item")!;
		const button = row.querySelector<HTMLElement>(".modal-favorite-button")!;
		const rowBox = row.getBoundingClientRect();
		const linkBox = link.getBoundingClientRect();
		const buttonBox = button.getBoundingClientRect();
		const svgBox = button.querySelector("svg")!.getBoundingClientRect();
		return { flex: getComputedStyle(row).display, fullWidth: Math.abs(rowBox.width - linkBox.width) < 1,
			buttonWidth: buttonBox.width, buttonHeight: buttonBox.height, svgWidth: svgBox.width,
			buttonInside: buttonBox.x >= rowBox.x && buttonBox.right <= rowBox.right && buttonBox.y >= rowBox.y && buttonBox.bottom <= rowBox.bottom };
	});
	expect(geometry).toEqual({ flex: "flex", fullWidth: true, buttonWidth: 44, buttonHeight: 44, svgWidth: 20, buttonInside: true });
	const motion = await dialog.evaluate((element) => {
		const durations = (value: string) => value.split(",").map((duration) => parseFloat(duration) * (duration.trim().endsWith("ms") ? 1 : 1000));
		const styles = [element, ...element.querySelectorAll("*")].map((node) => getComputedStyle(node));
		return { maxDuration: Math.max(...styles.flatMap((style) => [...durations(style.animationDuration), ...durations(style.transitionDuration)])),
			oneIteration: styles.every((style) => style.animationIterationCount === "1"), scroll: getComputedStyle(element).scrollBehavior };
	});
	expect(motion.maxDuration).toBeLessThanOrEqual(.01);
	expect(motion.oneIteration).toBe(true);
	expect(motion.scroll).toBe("auto");
	await dialog.getByRole("combobox").press("Escape");
});

test("closing search cancels its pending request and queued debounce", async ({ page }) => {
	let releasePending!: () => void;
	const pending = new Promise<void>((resolve) => { releasePending = resolve; });
	let requests = 0;
	await page.route("**/api/ai-search/search", async (route) => {
		requests++;
		await pending;
		try { await route.fulfill({ json: { success: true, result: { chunks: resultChunks(2) } } }); }
		catch { /* A dismissed request has already been aborted by the browser. */ }
	});
	await page.goto("/");
	const opener = page.locator("[data-ai-search-open]");
	await opener.press("Enter");
	const dialog = page.getByRole("dialog", { name: "Search", exact: true });
	const input = dialog.getByRole("combobox", { name: "Search", exact: true });
	await input.fill("pending");
	await expect(dialog.getByRole("status").locator(".modal-loading")).toBeVisible();
	await expect.poll(() => requests).toBe(1);
	const cancelled = page.waitForEvent("requestfailed", { predicate: (request) => request.url().endsWith("/api/ai-search/search") });
	await input.press("Escape");
	await cancelled;
	await expect(page.locator("#lfw-ai-search .modal-container")).toHaveJSProperty("inert", true);
	releasePending();
	await expect(opener).toBeFocused();
	await opener.press("Enter");
	await expect(dialog.getByRole("status")).toContainText("Start typing");
	await expect(input).not.toHaveAttribute("aria-activedescendant", /./);
	await input.fill("queued");
	await input.press("Escape");
	// The installed snippet debounces for 300ms. Wait past that boundary to
	// prove dismissal did not leave a search scheduled.
	await page.waitForTimeout(500);
	expect(requests).toBe(1);
	await expect(opener).toBeFocused();
});

for (const width of [390, 1440]) {
	test(`legal section jumps move keyboard focus at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto("/privacy");
		const link = page.locator("[data-toc-link]").nth(2);
		const targetId = await link.getAttribute("data-toc-link");
		const target = page.locator(`[id="${targetId}"]`);
		if (width < 901) {
			await page.getByRole("combobox", { name: "Jump to section" }).selectOption(targetId!);
		} else {
			await link.focus();
			await page.keyboard.press("Enter");
		}
		await expect(page).toHaveURL(new RegExp(`#${targetId}$`));
		await expect(target).toBeFocused();
		await expect(target).toHaveAttribute("tabindex", "-1");
		await expect.poll(async () => {
			const heading = await target.boundingBox();
			const header = await page.locator("[data-header]").boundingBox();
			return heading!.y >= header!.height && heading!.y < 200;
		}).toBe(true);
	});
}

test("legal contents links preserve modified clicks", async ({ page }) => {
	await page.goto("/privacy");
	const prevented = await page.locator("[data-toc-link]").nth(2).evaluate((link) => {
		let intercepted = false;
		link.addEventListener("click", (event) => {
			intercepted = event.defaultPrevented;
			event.preventDefault(); // Observe the handler without opening a new tab.
		}, { once: true });
		link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey: true }));
		return intercepted;
	});
	expect(prevented).toBe(false);
	await expect(page).toHaveURL(/\/privacy$/);
});

test("search and legal section links remain available without JavaScript", async ({ browser, baseURL }) => {
	const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
	const page = await context.newPage();
	await page.goto(`${baseURL}/privacy`);
	const link = page.locator("[data-toc-link]").nth(2);
	const targetId = await link.getAttribute("data-toc-link");
	await link.press("Enter");
	await expect(page).toHaveURL(new RegExp(`#${targetId}$`));
	await page.locator("[data-ai-search-open]").press("Enter");
	await expect(page).toHaveURL(/\/search$/);
	await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
	await context.close();
});
