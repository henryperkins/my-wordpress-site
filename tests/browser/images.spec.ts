import { expect, test, type Locator } from "@playwright/test";

async function expectSuitableSource(image: Locator) {
	await image.evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
	await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
	const metrics = await image.evaluate((element: HTMLImageElement) => {
		const { width, height } = element.getBoundingClientRect();
		const originalWidth = Number(element.getAttribute("width"));
		const originalHeight = Number(element.getAttribute("height"));
		// A cover crop may need more pixels than the panel's visible width.
		const required = Math.min(originalWidth, Math.max(width, height * originalWidth / originalHeight) * devicePixelRatio);
		const candidates = element.srcset.split(", ").map((candidate) => Number(candidate.match(/ (\d+)w$/)?.[1])).filter(Boolean).sort((a, b) => a - b);
		return {
			width, height, required,
			selected: Number(element.currentSrc.match(/width=(\d+)/)?.[1]),
			budget: candidates.find((candidate) => candidate >= required - 1) ?? originalWidth,
		};
	});
	expect(metrics.width).toBeGreaterThan(0);
	// Browser selection can trade a little density for bandwidth or choose the
	// next candidate. Bound that discretion without assuming an exact UA choice.
	expect(metrics.selected, `source preserves detail in ${metrics.width} × ${metrics.height} panel`).toBeGreaterThanOrEqual(metrics.required * 0.9 - 1);
	expect(metrics.selected, "source stays within the responsive image budget").toBeLessThanOrEqual(metrics.budget * 1.35);
}

for (const [width, density] of [[390, 1], [700, 1], [930, 1], [1440, 1], [930, 2], [1440, 2]] as const) {
	test(`photos preserve crop detail without oversized sources at ${width}px and ${density}x`, async ({ browser, baseURL }) => {
		for (const [path, selectors] of [
			["/", [".lfw-hero__media img", ".lfw-about__media img", ".lfw-night__media img", ".lfw-band img"]],
			["/services", [".lfw-panel.is-active .lfw-panel__media img"]],
			["/consultation", [".lfw-product__media img"]],
			["/contact", [".lfw-aside__img img"]],
			["/blog", [".lfw-featured__media img", ".lfw-postcard .lf-card__media img", ".lfw-band img"]],
		] as const) {
			// Isolate the HTTP cache: another layout can need a wider copy of the same photo.
			const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: density, reducedMotion: "reduce" });
			try {
				const page = await context.newPage();
				await page.goto(`${baseURL}${path}`);
				await page.evaluate(() => document.fonts.ready);
				for (const selector of selectors) await expectSuitableSource(page.locator(selector).first());
				if (path === "/blog") {
					const article = await page.locator(".lfw-featured").getAttribute("href");
					await page.goto(`${baseURL}${article}`);
					await expectSuitableSource(page.locator(".lfw-article__hero img"));
				}
			} finally {
				await context.close();
			}
		}
	});
}


for (const javaScriptEnabled of [true, false]) {
	test(`footer brand images ${javaScriptEnabled ? "load when approaching the footer" : "render through the native no-JavaScript path"}`, async ({ browser, baseURL }) => {
		const context = await browser.newContext({ javaScriptEnabled, viewport: { width: 390, height: 844 } });
		try {
			const page = await context.newPage();
			const requests: string[] = [];
			page.on("request", (request) => { if (/\/brand\/.*-reversed\.svg$/.test(request.url())) requests.push(request.url()); });
			await page.goto(`${baseURL}/`);
			await page.evaluate(() => document.fonts.ready);
			const footer = page.locator(".lfw-footer__brand");
			expect(await footer.evaluate((element) => element.getBoundingClientRect().top)).toBeGreaterThan(3 * 844);
			// HTML disables native lazy loading when scripting is disabled.
			if (javaScriptEnabled) expect(requests).toEqual([]);
			else await expect.poll(() => requests.length).toBe(2);
			await footer.evaluate((element) => element.scrollIntoView({ behavior: "instant" }));
			await expect.poll(() => requests.length).toBe(2);
			for (const image of await footer.locator("img").all()) {
				await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
			}
			await expect(footer.getByRole("link", { name: /home/ })).toBeVisible();
		} finally {
			await context.close();
		}
	});
}
