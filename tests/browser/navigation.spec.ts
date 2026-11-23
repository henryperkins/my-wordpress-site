import { expect, test } from "@playwright/test";

test("mobile header leaves the primary action to the page", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/");
	await expect(page.locator(".lfw-header__cta")).toBeHidden();
	// The bar has no search button: search opens with Ctrl/Cmd+K, and the footer links to the /search page.
	await expect(page.getByRole("banner").getByRole("link", { name: "Search" })).toHaveCount(0);
	await expect(page.getByRole("contentinfo").getByRole("link", { name: "Search", exact: true })).toHaveAttribute("href", "/search");
	await page.getByRole("button", { name: "Open menu" }).click();
	const menu = page.getByRole("navigation", { name: "Menu", exact: true });
	await expect(menu.getByRole("link", { name: "Book a consultation" })).toBeVisible();
	await expect(menu.locator(".lf-btn")).toHaveCount(0);
	await expect(page.locator(".lfw-hero").getByRole("link", { name: "Book a consultation" })).toHaveCount(1);
});

test("menu links to part of a page are never marked as the current page", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	for (const path of ["/", "/services", "/consultation"]) {
		await page.goto(path);
		// The desktop links and the mobile panel (hidden here, but rendered) share the rule.
		const links = await page.locator('nav[aria-label="Primary"] a, nav[aria-label="Menu"] a').evaluateAll((elements) =>
			elements.map((a) => ({ href: a.getAttribute("href") ?? "", current: a.getAttribute("aria-current") })));
		expect(links.length).toBeGreaterThan(0);
		for (const { href, current } of links) {
			const target = new URL(href, page.url());
			const label = `${href} on ${path}`;
			if (target.hash) expect(current, label).toBeNull();
			else if (target.pathname.replace(/\/+$/, "") === path.replace(/\/+$/, "")) expect(current, label).toBe("page");
		}
	}
});

// Editors can give any block an anchor, and menus and buttons link to it (Growth goes to /services#growth). However the
// link is followed, the section's eyebrow and heading must stop below the pinned header, not under it.
for (const width of [390, 1440]) {
	test(`anchored sections stop clear of the pinned header at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 844 });
		await page.emulateMedia({ reducedMotion: "reduce" });
		const landing = (id: string) => page.evaluate((target) => {
			const header = document.querySelector<HTMLElement>("[data-header]")!;
			const covered = getComputedStyle(header).position === "sticky" ? header.getBoundingClientRect().bottom : 0;
			const section = document.getElementById(target)!;
			const lead = section.querySelector<HTMLElement>(".lf-eyebrow, h1, h2, h3") ?? section;
			const top = lead.getBoundingClientRect().top;
			return { clear: top >= covered, inView: top < innerHeight };
		}, id);
		let anchors = 0;
		for (const path of ["/", "/services", "/hosting"]) {
			await page.goto(path);
			const ids = await page.locator("main section[id]").evaluateAll((sections) => sections.map((section) => section.id));
			for (const id of ids) {
				anchors++;
				// Following a link on the page itself.
				await page.goto(path);
				await page.evaluate((target) => { location.hash = target; }, id);
				await expect.poll(() => landing(id), { message: `${path}#${id} followed on the page` }).toEqual({ clear: true, inView: true });
				// Arriving from another page, as from the header menu.
				await page.goto("about:blank");
				await page.goto(`${path}#${id}`);
				await expect.poll(() => landing(id), { message: `${path}#${id} opened from another page` }).toEqual({ clear: true, inView: true });
			}
		}
		expect(anchors).toBeGreaterThan(0);
	});
}

test("pages without their own image share the built-in card", async ({ page, request }) => {
	for (const path of ["/", "/contact", "/search"]) {
		await page.goto(path);
		const image = await page.locator('meta[property="og:image"]').getAttribute("content");
		expect(image).toMatch(/^https?:\/\/.+\/brand\/share-card\.jpg$/);
		await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
		await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
		await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
	}
	const card = await request.get("/brand/share-card.jpg");
	expect(card.ok()).toBe(true);
	expect(card.headers()["content-type"]).toBe("image/jpeg");
});

test("consultation navigation keeps entered details", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/consultation");
	await page.locator('input[name="name"]').fill("Alex Sample");
	await page.locator('textarea[name="notes"]').fill("Please keep this draft.");
	let documents = 0;
	page.on("request", (request) => { if (request.isNavigationRequest()) documents++; });
	await page.locator(".lfw-header__cta").click();
	await expect(page).toHaveURL(/\/consultation#enquiry$/);
	await expect(page.locator('input[name="name"]')).toHaveValue("Alex Sample");
	await expect(page.locator('textarea[name="notes"]')).toHaveValue("Please keep this draft.");
	expect(documents).toBe(0);
});

for (const width of [390, 1440]) {
	for (const javaScriptEnabled of [true, false]) {
		test(`consultation tracking URL keeps drafts at ${width}px with JavaScript ${javaScriptEnabled}`, async ({ browser, baseURL }) => {
			const context = await browser.newContext({ javaScriptEnabled, viewport: { width, height: 900 } });
			const page = await context.newPage();
			await page.goto(`${baseURL}/consultation?utm_source=referral&enquiry=failed`);
			await page.locator('input[name="name"]').fill("Alex Sample");
			await page.locator('textarea[name="notes"]').fill("Please keep this draft.");
			let documents = 0;
			page.on("request", (request) => { if (request.isNavigationRequest()) documents++; });
			if (width < 1081 && javaScriptEnabled) await page.getByRole("button", { name: "Open menu" }).click();
			const link = width < 1081
				? page.getByRole("navigation", { name: "Menu", exact: true }).getByRole("link", { name: "Book a consultation" })
				: page.locator(".lfw-header__cta");
			await expect(link).toHaveAttribute("href", "#enquiry");
			// Exercise native keyboard navigation in the no-JavaScript lane.
			if (javaScriptEnabled) await link.click();
			else await link.press("Enter");
			await expect(page).toHaveURL(/\/consultation\?utm_source=referral&enquiry=failed#enquiry$/);
			await expect(page.locator('input[name="name"]')).toHaveValue("Alex Sample");
			await expect(page.locator('textarea[name="notes"]')).toHaveValue("Please keep this draft.");
			expect(documents).toBe(0);
			await context.close();
		});
	}
}

test("consultation explanation precedes its photo and preparation follows the form", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/consultation");
	const summary = await page.locator(".lfw-product__summary").boundingBox();
	const photo = await page.locator(".lfw-product__media").boundingBox();
	expect(summary!.y).toBeLessThan(photo!.y);
	await expect(page.getByRole("heading", { level: 1 })).toHaveText("Website Consultation");
	const form = await page.locator("#enquiry").boundingBox();
	const prep = await page.getByRole("heading", { name: /Preparation tips/i }).boundingBox();
	expect(form!.y).toBeLessThan(prep!.y);
	await expect(page.getByText("Sample White Papers", { exact: true })).toHaveCount(0);
});

test("the Home starting point matches the WordPress icon on Services", async ({ page }) => {
	await page.goto("/");
	const card = page.locator(".lfw-path").filter({ has: page.getByRole("heading", { name: "A new website or store" }) });
	await expect(card.locator(".lfw-path__icon [data-icon]")).toHaveAttribute("data-icon", "layout-template");
	await page.goto("/services");
	await expect(page.getByRole("tab", { name: "WordPress", exact: true }).locator("[data-icon]")).toHaveAttribute("data-icon", "layout-template");
});

test("service links reveal accessible Analytics and SEO examples", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/services#analytics");
	await expect(page.getByRole("table", { name: "Sample data" })).toBeVisible();
	await expect(page.getByRole("row", { name: /Organic search.*45%/ })).toBeVisible();

	await page.getByRole("combobox", { name: "Services", exact: true }).selectOption("seo");
	await expect(page.getByText("Sample title tag")).toBeVisible();
	await expect(page.getByText("Bike repair in Chicago | Example Cycle Shop")).toBeVisible();
});

test("all six services are available in the mobile selector and keep deep links", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/services#seo");
	const selector = page.getByRole("combobox", { name: "Services", exact: true });
	await expect(selector).toBeVisible();
	await expect(selector.locator("option")).toHaveCount(6);
	await expect(selector).toHaveValue("seo");
	for (const value of ["content", "analytics", "wordpress", "social", "performance", "seo"]) {
		await selector.selectOption(value);
		await expect(page.locator(`[role="tabpanel"]#${value}`)).toBeVisible();
		await expect(page).toHaveURL(new RegExp(`#${value}$`));
	}
	await page.setViewportSize({ width: 1440, height: 900 });
	await expect(selector).toBeHidden();
	const selected = page.getByRole("tab", { selected: true });
	await expect(selected).toHaveAttribute("aria-controls", "seo");
	await selected.focus();
	await page.keyboard.press("End");
	await expect(page.getByRole("tab", { selected: true })).toHaveAttribute("aria-controls", "content");
});

test("without JavaScript navigation and every service remain available", async ({ browser, baseURL }) => {
	const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
	const page = await context.newPage();
	await page.goto(`${baseURL}/services`);
	await expect(page.getByRole("navigation", { name: "Menu", exact: true })).toBeVisible();
	await expect(page.locator('[data-tabs] [role="tabpanel"]:visible')).toHaveCount(6);
	await expect(page.locator("[data-tab-select]")).toBeHidden();
	await context.close();
});
