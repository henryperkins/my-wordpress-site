import { expect, test } from "@playwright/test";

test("mobile header leaves the primary action to the page", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/");
	await expect(page.locator(".lfw-header__cta")).toBeHidden();
	await expect(page.locator(".lfw-tools [data-ai-search-open]")).toBeVisible();
	await page.getByRole("button", { name: "Open menu" }).click();
	const menu = page.getByRole("navigation", { name: "Menu", exact: true });
	await expect(menu.getByRole("link", { name: "Book a consultation" })).toBeVisible();
	await expect(menu.locator(".lf-btn")).toHaveCount(0);
	await expect(page.locator(".lfw-hero").getByRole("link", { name: "Book a consultation" })).toHaveCount(1);
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
