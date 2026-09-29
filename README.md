# Lakefront Digital — EmDash theme (Cloudflare)

The Lakefront Digital marketing site as an [EmDash](https://docs.emdashcms.com/themes/overview/) theme: an Astro project, server-rendered on Cloudflare Workers with D1 and R2, built from the Lakefront Digital design system.

## What's included

- **Home, Services and Hosting** built from 11 Lakefront blocks that editors add, reorder and edit in the admin
- **Contact and Website Consultation** with an enquiry form, emailed to you through Cloudflare Email Sending (no checkout; commerce is out of scope for now)
- **Terms and Conditions** on the legal layout: numbered sections, table of contents, print
- **Search** and a **404** page
- Header and footer from CMS menus; logo, title and tagline from Site Settings
- Manrope + Source Sans 3 (Astro fonts), Lucide icons, 13 bundled photos

## Routes

| Page | Route | Source |
| --- | --- | --- |
| Home | `/` | the page with slug `home` (`/home` redirects here) |
| Pages | `/:slug` | `pages` collection; Layout = `blocks` or `legal` |
| Search | `/search?q=` | full-text search over published pages |
| Enquiry endpoint | `POST /api/enquiry` | `src/lib/enquiry.ts` |
| 404 | fallback | `src/pages/404.astro` |

## Replacing the blog template in this repository

1. Copy this folder over the repository root. It keeps the package name, versions and pnpm settings.
2. Delete the blog files the theme doesn't use: `src/components/PostCard.astro`, `src/pages/posts/`, `src/pages/pages/`, `src/pages/category/`, `src/pages/tag/`, `src/pages/rss.xml.ts`, `src/utils/`.
3. Keep `.agents/`, `.cursor/` and `.vscode/`. Run `pnpm wrangler types` to refresh `worker-configuration.d.ts` for the new email binding.
4. **Use a fresh database.** A seed is applied only to an empty database whose setup hasn't run, so a D1 database that already went through the blog setup keeps the blog schema. Point `d1_databases` in `wrangler.jsonc` at a new database (or clear `.wrangler/` locally) before first run.

## Local development

```bash
pnpm install
pnpm dev
```

Open http://localhost:4321/_emdash/admin and complete the setup wizard. Choose to include sample content to get Home, Services, Hosting, Contact, Website Consultation and Terms with the copy-book text; skip it to start from the schema, menus and blocks only.

## Enquiry email (Cloudflare Email Sending)

1. Onboard `lakefrontdigital.io` to Email Sending (dashboard: Email Service > Email Sending > Onboard Domain, or `pnpm wrangler email sending enable lakefrontdigital.io`). It adds DNS records on `cf-bounce.lakefrontdigital.io` plus DKIM, and leaves the domain's MX records alone. Don't enable Email Routing on the domain: it replaces the MX records, and the domain's mail is on Google Workspace.
2. In `wrangler.jsonc`: the `send_email` binding `ENQUIRY_EMAIL` sets `destination_address`; `ENQUIRY_FROM` must be an address on the domain; `ENQUIRY_TO` must match the destination.
3. `pnpm deploy`.

Locally, Wrangler simulates the binding and logs where it wrote the message. If the binding or vars are missing, dev logs the enquiry instead of sending; production returns an error to the visitor. The form works without JavaScript; a honeypot field drops most bots. Add Cloudflare Turnstile if spam gets through.

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
- Blocks aren't indexed for search, so fill in each page's **Summary** and **Search keywords**.
- The block that comes first provides the page's `h1` (Hero, Page intro or Service summary).

## Customising

- Tokens: `src/styles/tokens.css` (from the design system). Override them in `src/styles/theme.css`.
- Component (`lf-`) and layout (`lfw-`) styles: `src/styles/components.css`, `src/styles/site.css`.
- Icons: add a Lucide SVG to `src/icons/`, then add its name to the icon options in `seed/seed.json`.
- Brand files: `public/brand/`. The footer always uses the reversed lockup from there.

## Not included yet

Blog and article templates, commerce/checkout, a Privacy Policy (the legal layout is ready for one), and a vector logo.
