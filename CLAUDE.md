# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

AGENTS.md, imported above, holds this repository's rules: content scope, the schema and seed workflow, runtime constraints, verification and what not to do. A CLAUDE.md stops Claude Code from loading AGENTS.md by itself, so keep that import. [PRODUCT.md](PRODUCT.md) and [DESIGN.md](DESIGN.md) cover positioning and the visual system. This file adds commands and the architecture that spans several files; it doesn't repeat those rules.

## Commands

```bash
pnpm install          # pnpm version pinned in package.json (`corepack pnpm` if pnpm isn't on PATH)
pnpm dev              # http://localhost:4321, admin at /_emdash/admin
pnpm typecheck        # astro check; there is no linter
pnpm test             # node --test tests/*.test.ts (Node 24)
pnpm build
pnpm preview
pnpm test:browser     # Playwright (Chromium + WebKit) against a running, populated instance
pnpm deploy           # build, then wrangler deploy to production

# Single tests
node --test tests/search-results.test.ts
node --test --test-name-pattern="honeypot" tests/enquiry-data.test.ts
pnpm test:browser tests/browser/enquiry.spec.ts --project=chromium -g "phone"
```

- Astro 7's `astro dev` and `astro preview` start a background server for the project directory and return. Use `pnpm exec astro dev stop|status|logs` (and the same for `preview`). Killing the CLI doesn't stop the server. A second `preview` exits with "already running" while the old build keeps serving, so stop it before previewing a new build.
- Browser tests default to `http://127.0.0.1:4332`, so start `pnpm dev --port 4332`. For runs without dev reloads, use `pnpm build && pnpm preview --port 4333` with `PLAYWRIGHT_BASE_URL=http://127.0.0.1:4333`. They need a populated local database with the current Lakefront pages and `header_cta` pointing to `/consultation#enquiry`. Install the browsers with `pnpm exec playwright install chromium webkit`.
- Unit tests run TypeScript directly through Node's type stripping, without Astro or Vite. The modules they import (`src/lib/enquiry-*.ts`, `src/lib/search-results.ts`) use explicit `.ts` relative imports and avoid `astro:*` and `cloudflare:workers`. Put testable logic in modules like these and leave binding access to the route.

## Architecture

**Request path.** `src/worker.ts` is the Worker. It exports EmDash's Cloudflare handler (the built Astro app), the `PluginBridge` that sandboxed plugins call back through, and the cron `scheduled` handler. Every route renders on request. Content comes from D1 (`DB`) through a single live collection, `_emdash` (`src/live.config.ts`), queried with `getEmDashEntry` and `getEmDashCollection` from `emdash`. Media is in R2 (`MEDIA`).

**Schema and types.** The running database owns the schema, and `seed/seed.json` affects only fresh installs. The generated `emdash-env.d.ts` types the collections (`Page`, `Post`) and the `PageContentBlock` union of `lf_*` blocks. The generated `worker-configuration.d.ts` types the bindings.

**Pages.** `src/pages/[...slug].astro` loads a `pages` entry. It renders `LegalPage.astro` when `template` is `legal`, and `PageBlocks.astro` otherwise. `PageBlocks.astro` maps each block `_type` to a renderer in `src/components/blocks/` through `defineBlockComponents`, which enforces a renderer for every block type. Block fields are plain strings, which `src/lib/text.ts` parses into lines, `label | value` pairs, eyebrows and sanitized CTAs. `src/layouts/Base.astro` loads site settings and every menu in `MENUS` (`src/lib/menus.ts`), renders the header and footer, and emits SEO and plugin contributions through `EmDashHead`, `EmDashBodyStart` and `EmDashBodyEnd`.

**Edge caching.** Workers Cache (`cache` in `astro.config.mjs`) serves public pages without starting the Worker. A route opts in from its own frontmatter: it sets each query's `cacheHint`, then calls `cachePage(Astro)` from `src/lib/cache.ts` last. `cachePage` adds settings and menu tags so EmDash purges the page on change. It skips signed-in users and `?enquiry=` result pages. Signed in, add `?fresh=1` to see an uncached render. Don't cache through `routeRules`, because a pattern matching `/_emdash` would share admin responses.

**Plugins** (`astro.config.mjs`):
- `src/lib/forms-plugin.ts` wraps `@emdash-cms/plugin-forms`. It keeps the admin inbox and drops the public `submit` and `definition` routes. It makes triage updates revision-fenced and creates the two Lakefront inbox definitions on activation.
- `cloudflareEmail()` sends CMS login and invitation mail through `CMS_EMAIL`, separately from enquiries.
- `aiSearch()` indexes pages and posts into the `emdash-ai-search` instance through `AI_SEARCH`.
- Registry plugins installed from the admin run sandboxed in Worker Loader (`LOADER`) through `src/lib/plugin-sandbox.ts`. It raises their subrequest budget, and `plugin-admin-compat.ts` repairs their invalid admin Block Kit responses. Both fixes are temporary; see `docs/plugin-sandbox.md`.

**Enquiries.** An `lf_enquiry` block renders a form that works without JavaScript; `src/scripts/enquiry.ts` enhances it. Both versions post to `src/pages/api/enquiry.ts`, which runs three steps:
1. `parseEnquiry` (`enquiry-data.ts`) validates the fields and checks the `company_site` honeypot.
2. `deliverEnquiry` (`enquiry-inbox.ts`) saves the enquiry to the Forms inbox first. A token plus a content hash makes retries idempotent, and a recorded send is never repeated.
3. `sendEnquiry` (`enquiry.ts`) emails it through `ENQUIRY_EMAIL`.

Requests sent with `Accept: application/json` get JSON. Ordinary posts get a 303 back to `?enquiry=sent|invalid|failed#anchor`. When an ordinary post fails, its values are kept for 30 minutes in KV behind an HttpOnly cookie (`enquiry-draft.ts`). The KV namespace is `SESSION`, which the Astro Cloudflare adapter provides rather than `wrangler.jsonc`. See `docs/enquiry-inbox.md`.

**Search.** Two paths share `src/lib/search-results.ts`:
- The header modal posts to `src/pages/api/ai-search/search.ts`. It calls the native plugin's handler, and `filterAISearchResponse` then drops results that aren't currently published and replaces index metadata with live CMS fields.
- `/search` runs EmDash's full-text `search()` and applies the same publication check.

`withPublishedContent()` reads in a fresh request context with edit mode off, because EmDash overlays drafts during edit and preview requests. AI search is unavailable under `pnpm dev`, which has no remote bindings. See `docs/plugin-ai-search.md`.

**Front end.**
- Scripts in `src/scripts/` progressively enhance server-rendered markup: the header menu, tabs, the legal table of contents and enquiries. `ai-search-compat.ts` adapts `@cloudflare/ai-search-snippet`: accessibility fixes, plus Lakefront styling (`src/styles/search-modal.css`, adopted into its shadow root), a close button, popular searches and recoverable states.
- `Photo.astro` renders CMS images with `<Image>` from `emdash/ui`. Without one, it uses a bundled photo from `src/lib/photos.ts` with a `/cdn-cgi/image` `srcset` (Cloudflare Image Transformations). Locally, `src/pages/cdn-cgi/image/[...path].ts` redirects those URLs to the original files.
- Icons are Lucide SVGs in `src/icons/`, inlined by `src/lib/icons.ts`. To offer a new icon in the admin, also add it to the icon options in `seed/seed.json`.
