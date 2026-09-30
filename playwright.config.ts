import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/browser",
	fullyParallel: true,
	workers: 3,
	timeout: 30_000,
	use: {
		baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4332",
		trace: "retain-on-failure",
	},
	projects: [
		{ name: "chromium", use: { ...devices["Desktop Chrome"] } },
		{ name: "webkit", use: { ...devices["Desktop Safari"] } },
	],
});
