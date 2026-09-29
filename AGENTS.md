This is an EmDash site -- a CMS built on Astro with a full admin UI. It runs the Lakefront Digital theme.

## Commands

```bash
pnpm dev              # Start the Astro dev server
pnpm deploy           # Build and deploy to Cloudflare Workers
npx emdash types      # Regenerate TypeScript types from a running site
pnpm wrangler types   # Regenerate worker-configuration.d.ts after changing bindings
```

The admin UI is at `http://localhost:4321/_emdash/admin`.

## Key Files

| File | Purpose |
| --- | --- |
| `astro.config.mjs` | Astro config: `emdash()` with D1 + R2 and the `aiSearch()` plugin, Manrope and Source Sans 3 fonts |
| `wrangler.jsonc` | D1, R2, the `AI_SEARCH` namespace binding, the `ENQUIRY_EMAIL` send_email binding and `ENQUIRY_FROM` / `ENQUIRY_TO` vars |
| `seed/seed.json` | Block types, the `pages` collection, menus, and optional sample content |
| `emdash-env.d.ts` | Generated types, including the `PageContentBlock` union |
| `src/layouts/Base.astro` | EmDash wiring (settings, menus, page contributions), header, footer |
| `src/components/PageBlocks.astro` | Maps each block `_type` to its renderer in `src/components/blocks/` |
| `src/components/LegalPage.astro` | Legal layout for pages whose Layout is `legal` |
| `src/components/BlogList.astro` | Blog index and category listing: chips, featured post, grid, paging |
| `src/pages/blog/` | Blog index, category archives and articles |
| `src/pages/rss.xml.ts` | RSS feed of the newest posts |
| `src/pages/api/enquiry.ts` | Enquiry endpoint; sends mail via `src/lib/enquiry.ts` |
| `src/pages/api/ai-search/search.ts` | AI search endpoint for the header's search modal (`aiSearch()` plugin; instance `emdash-ai-search` in AI Search namespace `emdash`) |
| `src/scripts/` | Header, tabs, enquiry and legal-page behaviour (progressive enhancement) |

## Skills

Agent skills are in `.agents/skills/`: **building-emdash-site** (start here), **creating-plugins**, **emdash-cli**.

## Documentation

The EmDash docs are available as an MCP server at `https://docs.emdashcms.com/mcp`. Verify APIs, field types and seed rules against the live docs rather than training-data recall.

## Rules

- All content pages are server-rendered (`output: "server"`). No `getStaticPaths()` for CMS content.
- Image fields are objects (`{ id, src, alt }`). Render them with `<Image>` from `"emdash/ui"` (see `Photo.astro`).
- `entry.id` is the slug; `entry.data.id` is the database ULID.
- Pass query `cacheHint`s to `Astro.cache.set()` when the route cache is enabled.
- Every block type in `seed.json` needs a renderer in `PageBlocks.astro`; `defineBlockComponents` enforces it. Ship a renderer before activating a new block version.
- Sanitize editor-supplied URLs with `sanitizeHref` (`cta()` and `href()` in `src/lib/text.ts` do this).

## This Template

A marketing site for Lakefront Digital, a Chicago web design, WordPress, hosting and SEO agency. Pages are composed from Lakefront blocks; the blog holds guides.

## Pages

| Page | Path | What it shows |
| --- | --- | --- |
| Home | `/` | Page with slug `home`: hero, services grid, about, night hosting band, consultation steps, CTA band |
| Page | `/[...slug]` | Any page: blocks layout, or legal layout (numbered sections, TOC, print) |
| Blog | `/blog` | Intro from the `blog` page, category chips, featured post, post grid, then the `blog` page's blocks |
| Category | `/blog/category/[slug]` | Posts in one category |
| Article | `/blog/[slug]` | Breadcrumb, title, byline, hero photo, Portable Text body, help card, related posts |
| RSS | `/rss.xml` | 20 newest posts |
| Search | `/search` | Full-text search over pages, popular searches, browse cards. The header's search icon opens the AI search modal instead; this page is its no-JS fallback and "see more" target |
| 404 | fallback | Night photo, search, quick links |

## Schema

- `pages` collection: `title`, `template` (`blocks` | `legal`), `summary`, `keywords`, `content` (blocks), `eyebrow`, `effective_date`, `body` (Portable Text). The legal fields are used only by the legal layout; the page with slug `blog` feeds the blog intro.
- `posts` collection: `title`, `excerpt`, `featured_image`, `photo` (bundled fallback), `featured` (boolean), `content` (Portable Text). `category` taxonomy (hierarchical). Bylines are optional.
- Block types (`lf_` prefix): hero, page_intro, card_grid, split, steps, service_tabs, spec_tabs, offer, cta_band, product, enquiry.
- Block text conventions: lists are one item per line; pairs are `label | value`; eyebrow items are separated with `·`.
- Menus: `primary`, `header_cta` (first item is the header button), `footer_services`, `footer_hosting`, `footer_company` (column headings come from the menu label minus `Footer:`), `footer_contact`, `footer_legal`, `search_popular`.
- Blocks aren't searchable (in full-text or AI search), so `summary` and `keywords` carry each page's search terms.

## Visual character

From the Lakefront Digital design system: Manrope (`--font-display`) for headings, nav, buttons and eyebrows; Source Sans 3 (`--font-body`) for body and forms. Lake Navy, Deep Water and Current Teal carry the brand; Sunset Coral is the one action colour (primary buttons). Night sections (`data-theme="night"`) flip to a navy canvas. Photos are tall, softly rounded panels.

## Customisation

Tokens are in `src/styles/tokens.css` (`@layer base`). Override them in `src/styles/theme.css`, which is unlayered and always wins. Component styles (`lf-`) are in `components.css`; layout styles (`lfw-`) in `site.css`. Fonts are configured in `astro.config.mjs`.

## What not to do

- Don't hard-code content that belongs in the CMS: menus, site title, tagline and page copy come from EmDash.
- Don't add a second action colour; coral is reserved for primary actions.
- Don't make block fields required on a populated site without backfilling content first.
- Don't remove the no-JavaScript paths: tabs stack, the enquiry form posts normally, the legal TOC links work.
