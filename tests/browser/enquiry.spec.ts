import { expect, test, type Locator, type Page } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

const messages = {
	name: "Tell us who to reply to.",
	email: "Enter an email we can reply to.",
	phone: "Enter a phone number we can call, or leave it blank.",
	failed: "We couldn't send your request. Please try again, or email us directly.",
	offline: "We couldn't reach the server. Check your connection and try again.",
};

// Every enquiry request stays inside the browser, including if validation regresses.
test.beforeEach(async ({ page }) => {
	await page.route("**/api/enquiry", (route) => route.abort("blockedbyclient"));
});

async function openEnquiry(page: Page, path: string) {
	await page.goto(path);
	const form = page.locator("[data-enquiry] form");
	await expect(form).toBeVisible();
	await expect(form).toHaveJSProperty("noValidate", true);
	return form;
}

async function clickSubmit(submit: Locator) {
	// WebKit's automatic pointer scrolling can return before CSS smooth scrolling ends.
	// Settle the viewport first, then exercise a normal pointer click and its validation.
	await submit.evaluate((button) => button.scrollIntoView({ block: "center", behavior: "instant" }));
	await submit.click();
}

async function expectReadableMessage(message: Locator) {
	await expect(message).toBeVisible();
	const geometry = await message.evaluate((element) => {
		const style = getComputedStyle(element);
		const box = element.getBoundingClientRect();
		const parent = element.parentElement!.getBoundingClientRect();
		return {
			fontSize: Number.parseFloat(style.fontSize),
			lineHeight: Number.parseFloat(style.lineHeight),
			width: box.width,
			height: box.height,
			insideContainer: box.left >= parent.left - 1 && box.right <= parent.right + 1 && box.bottom <= parent.bottom + 1,
			insideViewport: box.left >= 0 && box.right <= document.documentElement.clientWidth,
		};
	});
	expect(geometry.fontSize).toBeGreaterThanOrEqual(14);
	expect(geometry.lineHeight).toBeGreaterThanOrEqual(geometry.fontSize);
	expect(geometry.width).toBeGreaterThan(40);
	expect(geometry.height).toBeGreaterThanOrEqual(geometry.fontSize);
	expect(geometry.insideContainer).toBe(true);
	expect(geometry.insideViewport).toBe(true);
}

async function expectFieldError(form: Locator, input: Locator, message: string) {
	await expect(input).toHaveAttribute("aria-invalid", "true");
	await expect(input).toHaveAccessibleDescription(message);
	const text = form.getByText(message, { exact: true });
	await expectReadableMessage(text);
	await expect(text.locator("..").locator('[data-icon="circle-alert"] svg')).toBeVisible();
	expect(await form.ariaSnapshot()).toContain(message);
}

async function fillConsultation(form: Locator) {
	await form.getByLabel("Your name", { exact: true }).fill("Jordan Reyes");
	await form.getByLabel("Work email", { exact: true }).fill("jordan@example.com");
	await form.getByLabel("Phone", { exact: false }).fill("(312) 555-0142");
	await form.locator('textarea[name="notes"]').fill("Please help with an existing website.");
}

async function expectConsultationValues(form: Locator) {
	await expect(form.getByLabel("Your name", { exact: true })).toHaveValue("Jordan Reyes");
	await expect(form.getByLabel("Work email", { exact: true })).toHaveValue("jordan@example.com");
	await expect(form.getByLabel("Phone", { exact: false })).toHaveValue("(312) 555-0142");
	await expect(form.locator('textarea[name="notes"]')).toHaveValue("Please help with an existing website.");
}

for (const [path, width] of [["/contact", 390], ["/contact", 1440], ["/consultation", 390], ["/consultation", 1440]] as const) {
	test(`${path} at ${width}px: blank and invalid fields expose readable descriptions after correction and retry`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		let requests = 0;
		await page.route("**/api/enquiry", async (route) => {
			requests += 1;
			await route.abort("blockedbyclient");
		});
		const form = await openEnquiry(page, path);
		const name = form.getByLabel("Your name", { exact: true });
		const email = form.getByLabel("Work email", { exact: true });
		const submit = form.locator('button[type="submit"]');

		await clickSubmit(submit);
		await expect(name).toBeFocused();
		await expect(name).toBeInViewport();
		await expectFieldError(form, name, messages.name);
		await expectFieldError(form, email, messages.email);

		await name.fill("Jordan Reyes");
		await email.fill("not-an-email");
		await expect(name).not.toHaveAttribute("aria-invalid", "true");
		await expect(name).toHaveAccessibleDescription("");
		await expect(email).toHaveAccessibleDescription("");
		await clickSubmit(submit);
		await expect(email).toBeFocused();
		await expectFieldError(form, email, messages.email);

		await name.fill("");
		await clickSubmit(submit);
		await expectFieldError(form, name, messages.name);
		await expectFieldError(form, email, messages.email);
		expect(requests).toBe(0);
	});
}

test("an invalid optional phone is explained and can be cleared before retrying", async ({ page }) => {
	await page.route("**/api/enquiry", (route) => route.fulfill({ status: 502, json: { ok: false, message: messages.failed } }));
	const form = await openEnquiry(page, "/consultation");
	await fillConsultation(form);
	const phone = form.getByLabel("Phone", { exact: false });
	await phone.fill("123");
	await clickSubmit(form.locator('button[type="submit"]'));
	await expect(phone).toBeFocused();
	await expectFieldError(form, phone, messages.phone);

	await phone.fill("");
	await expect(phone).not.toHaveAttribute("aria-invalid", "true");
	await expect(phone).toHaveAccessibleDescription("");
	await clickSubmit(form.locator('button[type="submit"]'));
	await expect(form.getByRole("alert")).toContainText(messages.failed);
	await expectReadableMessage(form.getByText(messages.failed, { exact: true }));
	await expect(phone).toHaveValue("");
});

test("server field errors preserve details and describe the fields", async ({ page }) => {
	await page.route("**/api/enquiry", (route) => route.fulfill({
		status: 422,
		json: { ok: false, errors: { name: messages.name, email: messages.email, phone: messages.phone } },
	}));
	const form = await openEnquiry(page, "/consultation");
	await fillConsultation(form);
	const request = page.waitForRequest("**/api/enquiry");
	await clickSubmit(form.locator('button[type="submit"]'));
	expect((await request).headers().accept).toContain("application/json");
	await expectConsultationValues(form);
	await expect(form.getByLabel("Your name", { exact: true })).toBeFocused();
	await expectFieldError(form, form.getByLabel("Your name", { exact: true }), messages.name);
	await expectFieldError(form, form.getByLabel("Work email", { exact: true }), messages.email);
	await expectFieldError(form, form.getByLabel("Phone", { exact: false }), messages.phone);
	await expect(form.locator('button[type="submit"]')).toBeEnabled();
});

for (const failure of ["server", "offline", "non-json"] as const) {
	test(`${failure} failure keeps the request available for a successful retry`, async ({ page }) => {
		let succeed = false;
		await page.route("**/api/enquiry", async (route) => {
			if (succeed) return route.fulfill({ json: { ok: true } });
			if (failure === "offline") return route.abort("connectionfailed");
			if (failure === "non-json") return route.fulfill({ status: 502, contentType: "text/html", body: "Temporary failure" });
			return route.fulfill({ status: 502, json: { ok: false, message: messages.failed } });
		});
		const form = await openEnquiry(page, "/consultation");
		await fillConsultation(form);
		const submit = form.locator('button[type="submit"]');
		const idleLabel = await submit.innerText();
		await clickSubmit(submit);
		const message = failure === "offline" ? messages.offline : messages.failed;
		const alert = form.getByRole("alert");
		await expect(alert).toBeVisible();
		await expectReadableMessage(alert.getByText(message, { exact: true }));
		expect(await alert.ariaSnapshot()).toContain(message);
		await expect(alert.locator('[data-icon="circle-alert"] svg')).toBeVisible();
		await expectConsultationValues(form);
		await expect(submit).toBeEnabled();
		await expect(submit).toHaveText(idleLabel);
		await expect(submit).not.toHaveAttribute("aria-busy", "true");

		// A second failure exercises alert clearing without destroying its icon.
		await clickSubmit(submit);
		await expect(alert).toBeVisible();
		await expectReadableMessage(alert.getByText(message, { exact: true }));
		await expect(alert.locator('[data-icon="circle-alert"] svg')).toBeVisible();
		await expectConsultationValues(form);

		succeed = true;
		await clickSubmit(submit);
		const done = page.locator("[data-enquiry-done]");
		await expect(done).toBeVisible();
		await expect(done).toBeFocused();
		await expect(done).toContainText("Jordan");
		await expect(done).toContainText("jordan@example.com");
		await expect(form).toBeHidden();
		await expect(done).not.toContainText(/\{name\}|\{email\}/);
		await done.getByRole("link", { name: "Send another request" }).click();
		await expect(done).toBeHidden();
		await expect(form).toBeVisible();
		await expect(form.getByLabel("Your name", { exact: true })).toBeFocused();
		for (const field of ["name", "email", "phone", "notes"]) {
			await expect(form.locator(`[name="${field}"]`)).toHaveValue("");
		}
		await expect(alert).toBeHidden();
		await expect(form.locator('[aria-invalid="true"]')).toHaveCount(0);
		await expect(submit).toBeEnabled();
		await expect(submit).toHaveText(idleLabel);
		await clickSubmit(submit);
		await expectFieldError(form, form.getByLabel("Your name", { exact: true }), messages.name);
	});
}

test.describe("without JavaScript", () => {
	test.use({ javaScriptEnabled: false });

	test("the form posts its details normally without JSON enhancement", async ({ page }) => {
		await page.route("**/api/enquiry", (route) => route.fulfill({ status: 200, contentType: "text/plain", body: "Request captured" }));
		await page.goto("/consultation");
		const form = page.locator("[data-enquiry] form");
		await expect(form).toHaveJSProperty("noValidate", false);
		await fillConsultation(form);
		const [request] = await Promise.all([
			page.waitForRequest("**/api/enquiry"),
			form.locator('button[type="submit"]').press("Enter"),
		]);
		expect(request.method()).toBe("POST");
		expect(request.headers().accept).not.toContain("application/json");
		const data = new URLSearchParams(request.postData() ?? "");
		expect(data.get("name")).toBe("Jordan Reyes");
		expect(data.get("email")).toBe("jordan@example.com");
		expect(data.get("phone")).toBe("(312) 555-0142");
		expect(data.get("notes")).toBe("Please help with an existing website.");
		expect(data.get("page")).toBe("/consultation");
		expect(data.get("anchor")).toBe("enquiry");
		expect(data.get("company_site")).toBe("");
	});

	for (const status of ["invalid", "failed"] as const) {
		test(`the ${status} return page renders a readable alert`, async ({ page }) => {
			// Load the endpoint's return destination directly; no mail is sent.
			await page.goto(`/consultation?enquiry=${status}#enquiry`);
			const form = page.locator("[data-enquiry] form");
			await expect(form).toHaveJSProperty("noValidate", false);
			const message = status === "failed" ? messages.failed : "Check your name, email and phone number, then send the form again.";
			const alert = form.getByRole("alert");
			await expect(alert).toBeVisible();
			await expectReadableMessage(alert.getByText(message, { exact: true }));
			expect(await alert.ariaSnapshot()).toContain(message);
			await expect(alert.locator('[data-icon="circle-alert"] svg')).toBeVisible();
			await expect(form).toBeVisible();
		});
	}
});
