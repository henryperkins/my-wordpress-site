import { expect, test } from "@playwright/test";

test("the Alex launcher leaves the narrow hero and contact form clear", async ({ page }) => {
	await page.setViewportSize({ width: 320, height: 740 });
	await page.goto("/");
	const launcher = page.getByRole("banner").getByRole("link", { name: "Talk with Alex" });
	await expect(launcher).toBeVisible();
	expect((await launcher.boundingBox())?.width).toBeGreaterThanOrEqual(44);
	await page.getByRole("main").getByRole("link", { name: "Book a consultation" }).first().click({ trial: true });
	await expect(page.locator("elevenlabs-convai")).toBeHidden();

	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/contact");
	await page.getByText("WordPress Design", { exact: true }).click();
	await expect(page.getByRole("checkbox", { name: /WordPress Design/ })).toBeChecked();
	await expect(page.locator("elevenlabs-convai")).toBeHidden();
});

test("the Alex link leads to inline call controls and a contact fallback", async ({ page }) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.route("https://elevenlabs.io/convai-widget/index.js", (route) => route.abort());
	await page.goto("/");
	const launcher = page.getByRole("banner").getByRole("link", { name: "Talk with Alex" });
	const section = page.getByRole("region", { name: "Talk with Alex" });
	await launcher.press("Enter");
	await expect(page).toHaveURL(/#talk-with-alex$/);
	await expect(section).toBeInViewport();
	await expect(section.locator("elevenlabs-convai")).toHaveAttribute("avatar-image-url", "/favicon.png");
	await expect(section.getByRole("status")).toContainText("temporarily unavailable");
	await expect(section.getByRole("link", { name: "use the contact form" })).toHaveAttribute("href", "/contact#enquiry");
});
