import { expect, test, type Page } from "@playwright/test";

async function expectTouchNavigation(page: Page) {
	const sizes = await page.locator(".lfw-tools .lf-iconbtn, .lfw-menu, .lfw-footer ul a, .lfw-footer__base a").evaluateAll((elements) =>
		elements.filter((element) => element.getClientRects().length > 0).map((element) => {
			const { width, height } = element.getBoundingClientRect();
			return { label: element.getAttribute("aria-label") || element.textContent, width, height };
		}),
	);
	expect(sizes.length).toBeGreaterThan(1);
	for (const target of sizes) {
		expect(target.width, `${target.label} hit-area width`).toBeGreaterThanOrEqual(44);
		expect(target.height, `${target.label} hit-area height`).toBeGreaterThanOrEqual(44);
	}
	const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
	expect(overflow, "navigation and page remain within the viewport").toBeLessThanOrEqual(1);
}

test("touch navigation fits phone and tablet orientations and wide touch screens", async ({ browser, baseURL }) => {
	const context = await browser.newContext({ hasTouch: true, viewport: { width: 320, height: 844 }, reducedMotion: "reduce" });
	try {
		const page = await context.newPage();
		await page.goto(`${baseURL}/`);
		await page.evaluate(() => document.fonts.ready);
		for (const viewport of [{ width: 320, height: 844 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1440, height: 900 }]) {
			await page.setViewportSize(viewport);
			await expectTouchNavigation(page);
		}
		// The added area below the text activates the link on touch too.
		const privacy = page.locator('.lfw-footer__base a[href="/privacy"]');
		const bounds = await privacy.boundingBox();
		await privacy.tap({ position: { x: 8, y: bounds!.height - 3 } });
		await expect(page).toHaveURL(/\/privacy$/);
	} finally {
		await context.close();
	}
});

test("narrow navigation retains usable touch links without JavaScript", async ({ browser, baseURL }) => {
	const context = await browser.newContext({ javaScriptEnabled: false, hasTouch: true, viewport: { width: 320, height: 844 }, reducedMotion: "reduce" });
	try {
		const page = await context.newPage();
		await page.goto(`${baseURL}/`);
		await page.evaluate(() => document.fonts.ready);
		await expect(page.getByRole("navigation", { name: "Menu", exact: true })).toBeVisible();
		await expectTouchNavigation(page);
		const privacy = page.locator('.lfw-footer__base a[href="/privacy"]');
		const bounds = await privacy.boundingBox();
		await privacy.tap({ position: { x: 8, y: bounds!.height - 3 } });
		await expect(page).toHaveURL(/\/privacy$/);
	} finally {
		await context.close();
	}
});

test("consultation summary, legal date and footer reflow with enlarged text", async ({ page }) => {
	await page.setViewportSize({ width: 320, height: 844 });
	for (const path of ["/consultation", "/privacy"]) {
		await page.goto(path);
		await page.evaluate(() => document.fonts.ready);
		// A controlled text-size stress check, distinct from browser page zoom.
		await page.evaluate(() => {
			const elements = new Set<HTMLElement>();
			for (const region of document.querySelectorAll<HTMLElement>(".lfw-product__summary, .lfw-legal-meta, .lfw-footer")) {
				elements.add(region);
				for (const element of region.querySelectorAll<HTMLElement>("*")) if (!element.closest("svg")) elements.add(element);
			}
			const originalSizes = [...elements].map((element) => ({ element, size: parseFloat(getComputedStyle(element).fontSize) }));
			for (const { element, size } of originalSizes) element.style.fontSize = `${size * 2}px`;
		});
		const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
		expect(overflow, `${path} remains readable without horizontal scrolling`).toBeLessThanOrEqual(1);
		const regions = await page.locator(".lfw-product__summary, .lfw-legal-meta .lf-badge, .lfw-footer ul a, .lfw-footer__base a").evaluateAll((elements) => elements.map((element) => {
			const { left, right } = element.getBoundingClientRect();
			return { text: element.textContent, left, right };
		}));
		for (const region of regions) {
			expect(region.left, `${region.text} left edge`).toBeGreaterThanOrEqual(0);
			expect(region.right, `${region.text} right edge`).toBeLessThanOrEqual(320);
		}
	}
});
