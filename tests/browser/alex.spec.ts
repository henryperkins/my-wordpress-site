import { expect, test, type Page } from "@playwright/test";

const vendorScript = "https://elevenlabs.io/convai-widget/index.js";

// A stand-in for the vendor's script, with the markup, state rules and size its compact widget had on 2026-11-23: an
// attribution at half strength, the start button, and a feedback row that is only faded out, which leaves its buttons
// focusable.
const vendorStub = `
	customElements.define("elevenlabs-convai", class extends HTMLElement {
		constructor() {
			super();
			this.attachShadow({ mode: "open" }).innerHTML = \`
				<style>
					._wrapper_1968y_18 { box-sizing: border-box; width: 266px; max-width: calc(100vw - 64px); height: 118px; }
					._poweredBy_1968y_252 a, ._poweredBy_1968y_252 span { opacity: .5; }
					._feedback_1968y_355 { opacity: 0; transition: all .1s; }
					._feedback_1968y_355._show_1968y_340 { opacity: .5; }
				</style>
				<div class="_wrapper_1968y_18 _compact_1968y_62 _open_1968y_57">
					<div class="_poweredBy_1968y_252"><span>Powered by ElevenLabs</span> <a href="https://elevenlabs.io/agents">Agents</a></div>
					<div class="_box_1968y_39"><button class="_btn_1968y_132" title="Talk with Alex">Talk with Alex</button></div>
					<div class="_feedback_1968y_355">
						<span class="_feedbackText_1968y_400">Is this response helpful?</span>
						<button class="_btn_1968y_132" title="Yes"></button>
						<button class="_btn_1968y_132" title="No"></button>
					</div>
				</div>\`;
		}
	});
`;

// Counts what the page asks ElevenLabs for, and answers the widget script with the stand-in.
async function watchVendor(page: Page) {
	const requests: string[] = [];
	await page.route("https://elevenlabs.io/**", (route) => {
		requests.push(route.request().url());
		return route.request().url() === vendorScript ? route.fulfill({ contentType: "text/javascript", body: vendorStub }) : route.abort();
	});
	return requests;
}

test("the assistant is a header button on wide screens and a menu link once the header collapses", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/");
	const banner = page.getByRole("banner");
	const launcher = banner.locator(".lfw-alex-trigger");
	await expect(launcher).toBeVisible();
	await expect(launcher).toHaveAccessibleName("Talk with Alex");
	// Its partner, the coral button, comes first.
	expect((await launcher.boundingBox())!.x).toBeGreaterThan((await banner.locator(".lfw-header__cta").boundingBox())!.x);

	for (const width of [1080, 390, 320]) {
		await page.setViewportSize({ width, height: 844 });
		await page.goto("/");
		await expect(launcher).toBeHidden();
		// The bar keeps the logo and the menu button; the page's own primary action stays clear.
		await page.getByRole("main").getByRole("link", { name: "Book a consultation" }).first().click({ trial: true });
		await page.getByRole("button", { name: "Open menu" }).click();
		const menu = page.getByRole("navigation", { name: "Menu", exact: true });
		const links = await menu.getByRole("link").allInnerTexts();
		expect(links.slice(-2)).toEqual(["Book a consultation", "Talk with Alex"]);
		expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
	}
});

test("nothing loads from ElevenLabs until a visitor asks for the assistant", async ({ page }) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	for (const width of [390, 1440]) {
		await page.setViewportSize({ width, height: 844 });
		const requests = await watchVendor(page);
		await page.goto("/");
		const section = page.getByRole("region", { name: "Talk with Alex" });
		const start = section.locator("[data-alex-start]");
		const widget = section.locator("elevenlabs-convai");

		// Reaching the band, as any visitor heading for the footer does, loads nothing.
		await section.scrollIntoViewIfNeeded();
		await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
		await expect(start).toBeVisible();
		await expect(start).toHaveAccessibleName("Talk with Alex");
		await expect(widget).toBeHidden();
		await page.waitForTimeout(500);
		expect(requests).toEqual([]);

		// Asking loads the widget into the space the band kept for it, so neither the band nor the footer moves.
		const before = (await section.boundingBox())!.height;
		await start.focus();
		await page.keyboard.press("Enter");
		await expect(widget).toBeVisible();
		await expect(start).toBeHidden();
		expect(requests).toEqual([vendorScript]);
		expect((await section.boundingBox())!.height).toBe(before);
		// The keyboard continues on the widget's own start button.
		await expect(widget.locator('button[title="Talk with Alex"]')).toBeFocused();
		await expect(section.getByRole("status")).toContainText("Alex is ready");
		await page.unroute("https://elevenlabs.io/**");
	}
});

test("the menu's assistant link closes the menu, jumps to the band and loads the assistant", async ({ page }) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.setViewportSize({ width: 390, height: 844 });
	const requests = await watchVendor(page);
	await page.goto("/");
	await page.getByRole("button", { name: "Open menu" }).click();
	await page.getByRole("navigation", { name: "Menu", exact: true }).getByRole("link", { name: "Talk with Alex" }).click();
	await expect(page).toHaveURL(/#talk-with-alex$/);
	await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
	const section = page.getByRole("region", { name: "Talk with Alex" });
	await expect(section).toBeInViewport();
	await expect(section.locator("elevenlabs-convai")).toBeVisible();
	expect(requests).toEqual([vendorScript]);
});

test("the Alex link leads to the band, and a failed load says so and leaves the contact form", async ({ page }) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.route(vendorScript, (route) => route.abort());
	await page.goto("/");
	const launcher = page.getByRole("banner").getByRole("link", { name: "Talk with Alex" });
	const section = page.getByRole("region", { name: "Talk with Alex" });
	await launcher.press("Enter");
	await expect(page).toHaveURL(/#talk-with-alex$/);
	await expect(section).toBeInViewport();
	await expect(section.locator("elevenlabs-convai")).toHaveAttribute("avatar-image-url", "/favicon.png");
	await expect(section.getByRole("status")).toContainText("temporarily unavailable");
	await expect(section.getByRole("status")).toBeVisible();
	await expect(section.getByRole("link", { name: "use the contact form" })).toHaveAttribute("href", "/contact#enquiry");
	// The start button is back, so the visitor can try again.
	const start = section.getByRole("button", { name: "Talk with Alex" });
	await expect(start).toBeVisible();
	await expect(start).not.toHaveAttribute("aria-busy", "true");
});

test("the widget's faded-out controls leave the tab order until they show", async ({ page }) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.setViewportSize({ width: 1440, height: 900 });
	await watchVendor(page);
	await page.goto("/");
	await page.getByRole("banner").getByRole("link", { name: "Talk with Alex" }).press("Enter");
	const widget = page.locator("elevenlabs-convai");
	await expect(widget).toBeVisible();
	const feedback = widget.locator('[class^="_feedback_"]');
	const yes = feedback.locator('button[title="Yes"]');
	const takesFocus = () => yes.evaluate((button: HTMLButtonElement) => {
		button.focus();
		return (button.getRootNode() as ShadowRoot).activeElement === button;
	});

	// Faded out: the row is inert, so Tab passes from the start button straight out of the widget.
	await expect(feedback).toHaveJSProperty("inert", true);
	expect(await takesFocus()).toBe(false);
	await widget.locator('button[title="Talk with Alex"]').focus();
	await page.keyboard.press("Tab");
	await expect(widget).not.toBeFocused();
	expect(await widget.evaluate((host) => host.shadowRoot!.activeElement)).toBeNull();

	// Shown by the vendor: the row is reachable again, and it and the attribution read at full strength.
	await feedback.evaluate((row) => row.classList.add("_show_1968y_340"));
	await expect(feedback).toHaveJSProperty("inert", false);
	expect(await takesFocus()).toBe(true);
	await expect(feedback).toHaveCSS("opacity", "1");
	await expect(widget.locator('[class^="_poweredBy_"] a')).toHaveCSS("opacity", "1");
	await expect(widget.locator('[class^="_poweredBy_"] span')).toHaveCSS("opacity", "1");

	// Faded out again, it leaves once more.
	await feedback.evaluate((row) => row.classList.remove("_show_1968y_340"));
	await expect(feedback).toHaveJSProperty("inert", true);
});

test("without JavaScript the assistant and its links are not offered", async ({ browser, baseURL }) => {
	for (const width of [390, 1440]) {
		const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 844 } });
		const page = await context.newPage();
		await page.goto(`${baseURL}/`);
		await expect(page.getByRole("navigation", { name: width === 390 ? "Menu" : "Primary", exact: true })).toBeVisible();
		await expect(page.locator("[data-alex-trigger]").first()).toBeAttached();
		for (const trigger of await page.locator("[data-alex-trigger]").all()) await expect(trigger).toBeHidden();
		await expect(page.locator("#talk-with-alex")).toBeHidden();
		// The contact routes that work without JavaScript are still there.
		await expect(page.getByRole("main").getByRole("link", { name: "Book a consultation" }).first()).toBeVisible();
		await context.close();
	}
});
