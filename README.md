# Lakefront Digital — EmDash theme (Cloudflare)

The Lakefront Digital marketing site as an [EmDash](https://docs.emdashcms.com/themes/overview/) theme: an Astro project, server-rendered on Cloudflare Workers with D1 and R2, built from the Lakefront Digital design system.

## What's included

- **Home, Services and Hosting** built from 11 Lakefront blocks that editors add, reorder and edit in the admin
- **Contact and Website Consultation** with an enquiry form, emailed to you through Cloudflare Email Sending (no checkout; commerce is out of scope for now)
- **Terms and Conditions** and **Privacy Policy** on the legal layout: numbered sections, table of contents, print
- **Blog** with the copy book's four SEO guides: index with a featured post and category chips, category archives, articles with a help card and related posts, and an RSS feed
- **Search** (pages and posts): an AI search modal in the header (Cloudflare AI Search, Cmd/Ctrl+K) and full-text search at `/search`; and a **404** page
- Header and footer from CMS menus; logo, title and tagline from Site Settings
- Vector logo (SVG) in `public/brand/`, Manrope + Source Sans 3 (Astro fonts), Lucide icons, 13 bundled photos

## Routes

| Page | Route | Source |
| --- | --- | --- |
| Home | `/` | the page with slug `home` (`/home` redirects here) |
| Pages | `/:slug` | `pages` collection; Layout = `blocks` or `legal` |
| Blog | `/blog`, `/blog/:slug` | `posts` collection; intro from the page with slug `blog` |
| Blog category | `/blog/category/:slug` | `category` taxonomy |
| RSS | `/rss.xml` | 20 newest posts |
| Search | `/search?q=` | full-text search over published pages and posts |
| Enquiry endpoint | `POST /api/enquiry` | `src/lib/enquiry.ts` |
| AI search endpoint | `POST /api/ai-search/search` | `aiSearch()` plugin from `@emdash-cms/cloudflare/plugins` |
| 404 | fallback | `src/pages/404.astro` |

## Replacing the blog template in this repository

1. Copy this folder over the repository root. It keeps the package name, versions and pnpm settings.
2. Delete the blog files the theme doesn't use: `src/pages/posts/`, `src/pages/pages/`, `src/pages/category/`, `src/pages/tag/`, `src/utils/`. The theme's own `PostCard.astro` and `rss.xml.ts` replace the repository's.
3. Keep `.agents/`, `.cursor/` and `.vscode/`. Run `pnpm wrangler types` to refresh `worker-configuration.d.ts` for the new email binding.
4. **Use a fresh database.** A seed is applied only to an empty database whose setup hasn't run, so a D1 database that already went through the blog setup keeps the blog schema. Point `d1_databases` in `wrangler.jsonc` at a new database (or clear `.wrangler/` locally) before first run.

## Local development

```bash
pnpm install
pnpm dev
```

Open http://localhost:4321/_emdash/admin and complete the setup wizard. Choose to include sample content to get Home, Services, Hosting, Contact, Website Consultation, the blog intro page, four guides, Terms and Privacy Policy with the copy-book text; skip it to start from the schema, menus and blocks only.

## Enquiry email (Cloudflare Email Sending)

1. Onboard `lakefrontdigital.io` to Email Sending (dashboard: Email Service > Email Sending > Onboard Domain, or `pnpm wrangler email sending enable lakefrontdigital.io`). It adds DNS records on `cf-bounce.lakefrontdigital.io` plus DKIM, and leaves the domain's MX records alone. Don't enable Email Routing on the domain: it replaces the MX records, and the domain's mail is on Google Workspace.
2. In `wrangler.jsonc`: the `send_email` binding `ENQUIRY_EMAIL` sets `destination_address`; `ENQUIRY_FROM` must be an address on the domain; `ENQUIRY_TO` must match the destination.
3. `pnpm deploy`.

Locally, Wrangler simulates the binding and logs where it wrote the message. If the binding or vars are missing, dev logs the enquiry instead of sending; production returns an error to the visitor. The form works without JavaScript; a honeypot field drops most bots. Add Cloudflare Turnstile if spam gets through.

## AI search (Cloudflare AI Search)

The header's search icon opens a search modal served by EmDash's first-party `aiSearch()` plugin through the `AI_SEARCH` namespace binding. No API token is involved.

1. Create the namespace named in `wrangler.jsonc` before deploying: `pnpm wrangler ai-search namespace create emdash`. The plugin creates its instance (`instanceName` in `astro.config.mjs`) on first use if it doesn't exist.
2. `pnpm deploy`, then open **Cloudflare AI Search** in the admin: select **Fix metadata** if it asks, keep Posts and Pages selected, and select **Sync Content**. After that, content is indexed when it's published and removed when it's unpublished or deleted.
3. Result links follow `urlTemplates` in `astro.config.mjs` (posts live under `/blog`).

Locally, search is off. AI Search bindings only exist remotely, and `astro.config.mjs` sets `remoteBindings: false`, so `pnpm dev` answers searches with "Search is temporarily unavailable". With remote bindings on, content saved in the local database would be indexed into the production instance.

## Caching and photos

- **Pages come from Cloudflare's edge cache** (Workers Cache, `cache` in `astro.config.mjs`), so most visits don't start the Worker.
  - A page stays fresh for 5 minutes. After that it's served stale for up to a day while it refreshes in the background.
  - EmDash purges a page as soon as its content, a menu or the site settings change.
  - Search results and the 404 page are kept for a minute only, because publishing doesn't purge them.
  - Each deployment starts with an empty cache.
- **Signed in, you may see the cached public version of a page,** without the editing toolbar. Add a query string such as `?fresh=1` for a copy rendered for you.
- **With the cache on, every request counts toward the Workers request allowance,** including static files, which are otherwise free. The Paid plan includes 10 million requests a month, and cache hits use no CPU time.
- **Photos in `public/images` are resized at the edge** by Cloudflare Image Transformations.
  - `srcset` in `src/lib/photos.ts` points at `/cdn-cgi/image/...`, which serves AVIF or WebP.
  - Keep Transformations enabled for the zone. The bundled photos need about 70 of the free 5,000 unique transformations a month, and `onerror=redirect` falls back to the original file.
  - Locally, `src/pages/cdn-cgi/image/[...path].ts` redirects those URLs to the original.
- **Browser caching** (`public/_headers`): browsers keep photos and brand files for a week. Files under `/_astro/` are kept for a year, because their names change with their content.

## Editing pages

| Block | Use |
| --- | --- |
| Hero | Home introduction, with a "Built on" strip |
| Page intro | Page title, eyebrow, lead; night style and stats |
| Card grid | Icon cards; linked cards become clickable |
| Split feature | Copy beside a tall photo; night style adds a status card |
| Numbered steps | 3–5+ numbered steps with an optional button |
| Service tabs | Tabbed services; `/services#seo` opens the SEO tab |
| Specification tabs | Spec cards grouped into tabs by Group; `/hosting#e-commerce` |
| Offer card | Highlighted offer with a button |
| Call-to-action band | Photo band with headline and button |
| Service summary | Breadcrumb, photo, what's included, buttons |
| Enquiry form | The emailed enquiry form; `?service=seo` pre-ticks a need |

- Text fields that take lists use one item per line, and `label | value` where two parts are needed.
- A photo you upload replaces the block's bundled photo.
- Blocks aren't indexed by either search, so fill in each page's **Summary** and **Search keywords**.
- The block that comes first provides the page's `h1` (Hero, Page intro or Service summary).

## Blog

- The page with the slug `blog` sets the index's eyebrow, title and summary; any blocks on it (the sample has a call-to-action band) appear below the posts.
- The newest post with **Feature at the top of the blog** switched on leads the index; otherwise the newest post does.
- Posts use **Featured image**, or fall back to their **Bundled photo**. Numbered lists render as numbered tiles; bulleted lists get teal dashes.
- Articles show a help card with the header button (`header_cta` menu) and the site tagline.
- The four sample guides are short outlines from the copy book; replace them with full articles when you have them.

## Before launch

- Have the **Privacy Policy** reviewed. It's a draft dated September 29, 2026, written for this site: enquiries emailed via Cloudflare, Stripe and PayPal payments, client sites you host. Section 4 assumes you use Google Analytics, as the Terms mention it; the theme doesn't add it, so install it or edit that section. The retention periods in section 8 are placeholders to confirm.
- Set both legal pages' **Effective date** when you publish.

## Customising

- Tokens: `src/styles/tokens.css` (from the design system). Override them in `src/styles/theme.css`.
- Component (`lf-`) and layout (`lfw-`) styles: `src/styles/components.css`, `src/styles/site.css`.
- Icons: add a Lucide SVG to `src/icons/`, then add its name to the icon options in `seed/seed.json`.
- Brand files: `public/brand/` — vector crest, wordmark, lockup and horizontal logos. Files ending `-reversed` are for navy grounds (the crest sits on a white disc there, because its foam and sky are transparent). The footer always uses the reversed artwork.

## Not included yet

Commerce/checkout, comments, tags, and a one-color mark or favicon made from the vector logo.
