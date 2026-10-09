// Enquiry forms post to /api/enquiry for the CMS inbox and email. Without JavaScript the browser
// submits normally and the endpoint redirects back with ?enquiry=sent. With it, the form validates
// inline, sends in the background and swaps in the thank-you message.
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MESSAGES = {
	name: "Tell us who to reply to.",
	email: "Enter an email we can reply to.",
	phone: "Enter a phone number we can call, or leave it blank.",
	failed: "We couldn't send your request. Please try again, or email us directly.",
	offline: "We couldn't reach the server. Check your connection and try again.",
};

/** Success copy supports {name} and {email}; mirrors fillTemplate in lib/text. */
const fill = (template: string, name: string, email: string) =>
	template.replace(/,?\s*\{name\}/g, name ? `, ${name}` : "").replace(/\{email\}/g, email || "you");

for (const root of document.querySelectorAll<HTMLElement>("[data-enquiry]")) {
	const form = root.querySelector<HTMLFormElement>("form");
	const done = root.querySelector<HTMLElement>("[data-enquiry-done]");
	if (!form || !done) continue;
	const alertBox = root.querySelector<HTMLElement>("[data-enquiry-alert]");
	const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
	const submitLabel = submit?.querySelector<HTMLElement>(".lf-btn__label");
	const idleLabel = submitLabel?.textContent ?? "";
	const enquiryToken = form.querySelector<HTMLInputElement>('input[name="enquiry_token"]');
	// Keep one idempotency key across retries; it does not authenticate a request.
	if (enquiryToken && !enquiryToken.value) enquiryToken.value = crypto.randomUUID();
	form.noValidate = true;

	const setError = (name: string, message: string): HTMLElement | null => {
		const input = form.elements.namedItem(name);
		const error = root.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
		if (input instanceof HTMLElement) {
			if (message) input.setAttribute("aria-invalid", "true");
			else input.removeAttribute("aria-invalid");
		}
		if (error) {
			error.hidden = !message;
			const text = error.querySelector<HTMLElement>("[data-error-text]");
			if (text) text.textContent = message;
		}
		return input instanceof HTMLElement ? input : null;
	};

	const applyErrors = (errors: Record<string, string>) => {
		let first: HTMLElement | null = null;
		for (const name of ["name", "email", "phone"]) {
			const input = setError(name, errors[name] ?? "");
			if (errors[name] && !first) first = input;
		}
		if (first) {
			// Validation changes the layout. Reveal the field explicitly instead of relying
			// on browser focus scrolling, which can leave it offscreen during a smooth scroll.
			first.focus({ preventScroll: true });
			first.scrollIntoView({ block: "center", behavior: "instant" });
		}
	};

	const showAlert = (message: string) => {
		if (!alertBox) return;
		alertBox.hidden = !message;
		const text = alertBox.querySelector<HTMLElement>("[data-enquiry-alert-text]");
		if (text) text.textContent = message;
		if (message) {
			alertBox.focus({ preventScroll: true });
			alertBox.scrollIntoView({ block: "center", behavior: "instant" });
		}
	};

	const setBusy = (busy: boolean) => {
		if (!submit) return;
		submit.disabled = busy;
		if (busy) submit.setAttribute("aria-busy", "true");
		else submit.removeAttribute("aria-busy");
		if (submitLabel) submitLabel.textContent = busy ? "Sending…" : idleLabel;
	};

	form.addEventListener("input", (event) => {
		const target = event.target as HTMLInputElement;
		if (target.name && target.getAttribute("aria-invalid") === "true") setError(target.name, "");
	});
	form.addEventListener("change", (event) => {
		if (event.target instanceof HTMLSelectElement) event.target.classList.toggle("is-placeholder", !event.target.value);
	});

	form.addEventListener("submit", async (event) => {
		event.preventDefault();
		showAlert("");
		const data = new FormData(form);
		const name = String(data.get("name") ?? "").trim();
		const email = String(data.get("email") ?? "").trim();
		const errors: Record<string, string> = {};
		if (!name) errors.name = MESSAGES.name;
		if (!EMAIL.test(email)) errors.email = MESSAGES.email;
		const phone = String(data.get("phone") ?? "").trim();
		if (phone && phone.replace(/\D/g, "").length < 7) errors.phone = MESSAGES.phone;
		applyErrors(errors);
		if (Object.keys(errors).length) return;

		setBusy(true);
		try {
			const response = await fetch(form.action, { method: "POST", body: data, headers: { Accept: "application/json" } });
			const result = (await response.json().catch(() => ({}))) as { ok?: boolean; errors?: Record<string, string>; message?: string };
			if (response.ok && result.ok) {
				const first = name.split(/\s+/)[0] ?? "";
				for (const el of done.querySelectorAll<HTMLElement>("[data-template]")) el.textContent = fill(el.dataset.template ?? "", first, email);
				form.hidden = true;
				done.hidden = false;
				done.focus();
				return;
			}
			if (result.errors && Object.keys(result.errors).length) {
				applyErrors(result.errors);
				return;
			}
			showAlert(result.message || MESSAGES.failed);
		} catch {
			showAlert(MESSAGES.offline);
		} finally {
			setBusy(false);
		}
	});

	done.querySelector<HTMLElement>("[data-enquiry-again]")?.addEventListener("click", (event) => {
		event.preventDefault();
		form.reset();
		// A recovered server draft is also the browser's reset default. Start a
		// fresh request explicitly so those previous details cannot return here.
		for (const name of ["name", "email", "phone", "website", "notes"]) {
			const field = form.elements.namedItem(name);
			if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) field.value = field.defaultValue = "";
		}
		for (const choice of form.querySelectorAll<HTMLInputElement>('input[type="checkbox"], input[type="radio"]')) {
			choice.checked = choice.defaultChecked = choice.hasAttribute("data-enquiry-preset");
		}
		for (const select of form.querySelectorAll("select")) {
			for (const option of select.options) option.defaultSelected = option.value === "";
			select.value = "";
		}
		applyErrors({});
		showAlert("");
		if (enquiryToken) enquiryToken.value = crypto.randomUUID();
		for (const select of form.querySelectorAll("select")) select.classList.toggle("is-placeholder", !select.value);
		done.hidden = true;
		form.hidden = false;
		if (location.search.includes("enquiry=")) history.replaceState(null, "", `${location.pathname}${location.hash}`);
		form.querySelector<HTMLInputElement>('input:not([type="hidden"]):not([tabindex="-1"])')?.focus();
	});
}
