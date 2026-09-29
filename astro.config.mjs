import { fileURLToPath } from "node:url";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { d1, r2, sandbox } from "@emdash-cms/cloudflare";
import { aiSearch } from "@emdash-cms/cloudflare/plugins";
import { defineConfig, fontProviders } from "astro/config";
import emdash from "emdash/astro";

// EmDash imports this from a virtual module, so a relative path will not resolve.
// Preserve sandbox()'s check that the LOADER binding is configured.
const sandboxRunner = sandbox()
	? fileURLToPath(new URL("./src/lib/plugin-sandbox.ts", import.meta.url))
	: undefined;

export default defineConfig({
	output: "server",
	adapter: cloudflare(),
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	integrations: [
		react(),
		emdash({
			database: d1({ binding: "DB", session: "auto" }),
			storage: r2({ binding: "MEDIA" }),
			sandboxRunner,
			// Site search: Cloudflare AI Search through the AI_SEARCH namespace binding in wrangler.jsonc.
			// Posts live under /blog, so their result links need their own template.
			plugins: [
				aiSearch({
					instanceName: "emdash-ai-search",
					urlTemplates: { posts: "/blog/{slug}", pages: "/{slug}" },
				}),
			],
		}),
	],
	// Lakefront Digital type pairing: Manrope (headings, nav, buttons) + Source Sans 3 (body, forms).
	fonts: [
		{
			provider: fontProviders.google(),
			name: "Manrope",
			cssVariable: "--font-display",
			weights: [400, 500, 600, 700, 800],
			fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
		},
		{
			provider: fontProviders.google(),
			name: "Source Sans 3",
			cssVariable: "--font-body",
			weights: [400, 600, 700],
			styles: ["normal", "italic"],
			fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
		},
	],
	devToolbar: { enabled: false },
});
