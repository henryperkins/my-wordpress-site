import { expect, test, type Locator, type Page } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const messages = {
	name: "Tell us who to reply to.",
	email: "Enter an email we can reply to.",
	phone: "Enter a phone number we can call, or leave it blank.",
	failed: "We couldn't send your request. Please try again, or email us directly.",
	offline: "We couldn't reach the server. Check your connection and try again.",
};

// Enhanced/valid enquiries stay inside the browser. The no-JS recovery test
// permits local invalid submissions and a honeypot hit; neither sends mail.
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
		const submittedTokens: string[] = [];
		await page.route("**/api/enquiry", async (route) => {
			// Enhanced submissions use multipart FormData; inspect the actual hidden field sent.
			const body = route.request().postData() ?? "";
			submittedTokens.push(body.match(/name="enquiry_token"\r\n\r\n([^\r\n]*)/)?.[1] ?? "");
			if (succeed) return route.fulfill({ json: { ok: true } });
			if (failure === "offline") return route.abort("connectionfailed");
			if (failure === "non-json") return route.fulfill({ status: 502, contentType: "text/html", body: "Temporary failure" });
			return route.fulfill({ status: 502, json: { ok: false, message: messages.failed } });
		});
		const form = await openEnquiry(page, "/consultation");
		const token = form.locator('input[name="enquiry_token"]');
		const initialToken = await token.inputValue();
		expect(initialToken).toMatch(UUID);
		await fillConsultation(form);
		const submit = form.locator('button[type="submit"]');
		const idleLabel = await submit.innerText();
		await clickSubmit(submit);
		const message = failure === "offline" ? messages.offline : messages.failed;
		const alert = form.getByRole("alert");
		await expect(alert).toBeVisible();
		await expect(alert).toBeFocused();
		await expect(alert).toBeInViewport({ ratio: 1 });
		await expectReadableMessage(alert.getByText(message, { exact: true }));
		expect(await alert.ariaSnapshot()).toContain(message);
		await expect(alert.locator('[data-icon="circle-alert"] svg')).toBeVisible();
		await expectConsultationValues(form);
		await expect(submit).toBeEnabled();
		await expect(submit).toHaveText(idleLabel);
		await expect(submit).not.toHaveAttribute("aria-busy", "true");
		await expect(token).toHaveValue(initialToken);

		// A second failure exercises alert clearing without destroying its icon.
		await clickSubmit(submit);
		await expect(alert).toBeVisible();
		await expectReadableMessage(alert.getByText(message, { exact: true }));
		await expect(alert.locator('[data-icon="circle-alert"] svg')).toBeVisible();
		await expectConsultationValues(form);
		await expect(token).toHaveValue(initialToken);

		succeed = true;
		await clickSubmit(submit);
		const done = page.locator("[data-enquiry-done]");
		await expect(done).toBeVisible();
		await expect(done).toBeFocused();
		await expect(done).toContainText("Jordan");
		await expect(done).toContainText("jordan@example.com");
		await expect(form).toBeHidden();
		await expect(done).not.toContainText(/\{name\}|\{email\}/);
		expect(submittedTokens).toEqual([initialToken, initialToken, initialToken]);
		await done.getByRole("link", { name: "Send another request" }).click();
		await expect(done).toBeHidden();
		await expect(form).toBeVisible();
		await expect(form.getByLabel("Your name", { exact: true })).toBeFocused();
		const nextToken = await token.inputValue();
		expect(nextToken).toMatch(UUID);
		expect(nextToken).not.toBe(initialToken);
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

test("a contact delivery error is focused and revealed above the long form", async ({ page }) => {
	await page.route("**/api/enquiry", (route) => route.fulfill({ status: 502, json: { ok: false, message: messages.failed } }));
	const form = await openEnquiry(page, "/contact");
	await form.getByLabel("Your name", { exact: true }).fill("Jordan Reyes");
	await form.getByLabel("Work email", { exact: true }).fill("jordan@example.com");
	await clickSubmit(form.locator('button[type="submit"]'));
	const alert = form.getByRole("alert");
	await expect(alert).toBeFocused();
	await expect(alert).toBeInViewport({ ratio: 1 });
	await expect(alert).toContainText(messages.failed);
	await expect(form.getByLabel("Your name", { exact: true })).toHaveValue("Jordan Reyes");
});

test("a recovered draft starts a blank request after an enhanced success", async ({ page }) => {
	const response = await page.request.post("/api/enquiry", {
		form: { page: "/consultation", anchor: "enquiry", name: "Jordan Reyes", email: "jordan@example.com", phone: "123", notes: "Recovered notes" },
		maxRedirects: 0,
	});
	expect(response.status()).toBe(303);
	await page.route("**/api/enquiry", (route) => route.fulfill({ json: { ok: true } }));
	const form = await openEnquiry(page, response.headers().location);
	await expect(form.locator('[name="notes"]')).toHaveValue("Recovered notes");
	await form.getByLabel("Phone", { exact: false }).fill("(312) 555-0142");
	await clickSubmit(form.locator('button[type="submit"]'));
	const done = page.locator("[data-enquiry-done]");
	await expect(done).toBeVisible();
	await done.getByRole("link", { name: "Send another request" }).click();
	for (const name of ["name", "email", "phone", "notes"]) await expect(form.locator(`[name="${name}"]`)).toHaveValue("");
	await expect(form.getByRole("alert")).toBeHidden();
	await expect(form.locator('[aria-invalid="true"]')).toHaveCount(0);
	await page.request.post("/api/enquiry", { form: { company_site: "bot" }, maxRedirects: 0 });
});

test.describe("without JavaScript", () => {
	test.use({ javaScriptEnabled: false });

	test("the contact draft restores website, timeline, repeated needs and platform choices", async ({ page }) => {
		await page.goto("/contact");
		const form = page.locator("[data-enquiry] form");
		const timeline = await form.locator('[name="timeline"] option').nth(1).getAttribute("value");
		const platform = await form.locator('[name="platform"]').first().getAttribute("value");
		const needs = await form.locator('[name="needs"]').evaluateAll((inputs) => inputs.slice(0, 2).map((input) => (input as HTMLInputElement).value));
		const data = new URLSearchParams({ page: "/contact", anchor: "enquiry", name: "", email: "jordan@example.com", website: "example.com", timeline: timeline!, platform: platform!, notes: "Keep every choice" });
		for (const need of needs) data.append("needs", need);
		const response = await page.request.post("/api/enquiry", { data: data.toString(), headers: { "Content-Type": "application/x-www-form-urlencoded" }, maxRedirects: 0 });
		expect(response.status()).toBe(303);
		await page.goto(response.headers().location);
		await expect(form.locator('[name="website"]')).toHaveValue("example.com");
		await expect(form.locator('[name="timeline"]')).toHaveValue(timeline!);
		expect(await form.locator('[name="needs"]:checked').evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value))).toEqual(needs);
		await expect(form.locator('[name="platform"]:checked')).toHaveValue(platform!);
		await expectFieldError(form, form.getByLabel("Your name", { exact: true }), messages.name);
		await page.request.post("/api/enquiry", { form: { company_site: "bot" }, maxRedirects: 0 });
	});

	test("local invalid redirects recover private values and errors through reload and correction", async ({ page, browser, baseURL }) => {
		await page.unroute("**/api/enquiry");
		await page.goto("/consultation");
		const form = page.locator("[data-enquiry] form");
		await fillConsultation(form);
		await form.getByLabel("Phone", { exact: false }).fill("123");
		const notes = 'First line\n<keep this text> & "quotes"';
		await form.locator('[name="notes"]').fill(notes);
		const response = page.waitForResponse((response) => response.url().endsWith("/api/enquiry"));
		await form.locator('button[type="submit"]').press("Enter");
		expect((await response).status()).toBe(303);
		await expect(page).toHaveURL(/\/consultation\?enquiry=invalid#enquiry$/);
		await expect(form.getByLabel("Your name", { exact: true })).toHaveValue("Jordan Reyes");
		await expect(form.getByLabel("Work email", { exact: true })).toHaveValue("jordan@example.com");
		await expect(form.getByLabel("Phone", { exact: false })).toHaveValue("123");
		await expect(form.locator('[name="notes"]')).toHaveValue(notes);
		await expectFieldError(form, form.getByLabel("Phone", { exact: false }), messages.phone);
		const firstCookie = (await page.context().cookies()).find((cookie) => cookie.name === "lf_enquiry_draft")!;
		expect(firstCookie.httpOnly).toBe(true);
		expect(firstCookie.sameSite).toBe("Lax");
		expect(firstCookie.value).toMatch(UUID);
		expect(firstCookie.expires - Date.now() / 1000).toBeLessThanOrEqual(1800);
		expect(firstCookie.expires - Date.now() / 1000).toBeGreaterThan(1700);
		const reload = await page.reload();
		expect(reload!.headers()["cache-control"]).toContain("private");
		expect(reload!.headers()["cache-control"]).toContain("no-store");
		await expect(form.locator('[name="notes"]')).toHaveValue(notes);

		const isolated = await browser.newContext({ javaScriptEnabled: false });
		try {
			const other = await isolated.newPage();
			await other.goto(page.url());
			await expect(other.locator('[data-enquiry] [name="name"]')).toHaveValue("");
			await expect(other.locator('[data-enquiry] [name="notes"]')).toHaveValue("");
		} finally { await isolated.close(); }
		await page.goto("/contact?enquiry=invalid#enquiry");
		await expect(page.locator('[data-enquiry] [name="name"]')).toHaveValue("");
		await page.goto("/consultation?enquiry=invalid#enquiry");
		await form.locator('[name="notes"]').fill("Corrected notes");
		await Promise.all([page.waitForNavigation(), form.locator('button[type="submit"]').press("Enter")]);
		await expect(form.locator('[name="notes"]')).toHaveValue("Corrected notes");
		const replacement = (await page.context().cookies()).find((cookie) => cookie.name === "lf_enquiry_draft")!;
		expect(replacement.value).not.toBe(firstCookie.value);

		// The honeypot takes the success cleanup path without saving or sending an enquiry.
		const success = await page.request.post(`${baseURL}/api/enquiry`, { form: { company_site: "bot", page: "/consultation", anchor: "enquiry" }, maxRedirects: 0 });
		expect(success.status()).toBe(303);
		expect((await page.context().cookies()).some((cookie) => cookie.name === "lf_enquiry_draft")).toBe(false);
		await page.context().addCookies([replacement]);
		await page.reload();
		await expect(form.locator('[name="notes"]')).toHaveValue("");
	});

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
		expect(data.get("enquiry_token")).toBe("");
	});

	test("a failed return page keeps a valid retry token and rejects malformed tokens", async ({ page }) => {
		const retryToken = "9d2c3b54-b94d-4fc8-b655-44df7aad5f9f";
		await page.goto(`/consultation?enquiry=failed&enquiry_token=${retryToken}#enquiry`);
		const token = page.locator('[data-enquiry] input[name="enquiry_token"]');
		await expect(token).toHaveValue(retryToken);
		await page.goto("/consultation?enquiry=failed&enquiry_token=invalid%22%3Etoken#enquiry");
		await expect(token).toHaveValue("");
		await page.goto(`/consultation?enquiry=invalid&enquiry_token=${retryToken}#enquiry`);
		await expect(token).toHaveValue("");
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
