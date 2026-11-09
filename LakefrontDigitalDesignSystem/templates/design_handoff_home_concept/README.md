# Handoff: Home concept (October 2026 homepage refinement)

## Overview
This is a new homepage for **lakefrontdigital.io**, a Chicago web studio that builds, hosts and looks after websites for small businesses across the US. It replaces the current home page in the EmDash theme (repo `henryperkins/my-wordpress-site`, branch `main`).

The page runs in this order: **header → hero → four starting points → hosting (navy) → consultation → accountability (pale teal band) → closing invitation (navy) → footer.** It keeps everything the current site offers:
- four service routes: new site or store, existing WordPress site, app or other platform, growth;
- the two ways to begin: **Book a consultation** (primary) and **Start a project** (secondary);
- the named hosting providers and the **"Uptime target 99.9%"** qualifier;
- Chicago, plus service to small businesses across the US.

Two system-wide style changes ship with it and apply to every page (see [System-wide changes](#system-wide-changes-apply-to-every-page)):
- a larger, fluid heading scale;
- Deep Water outline buttons.

## About the design files
The files in this bundle are **design references built in HTML**: prototypes that show the intended look and behaviour. They are **not production code to copy**. Recreate the design in the repo's existing environment: Astro components in `src/components/`, EmDash blocks seeded from `seed/seed.json`, and the shared CSS in `src/styles/`. Use the theme's existing patterns (`Button.astro`, `Eyebrow.astro`, `Icon.astro`, `Logo.astro`, `Photo.astro`, `SectionHead.astro`, the block components).

The live reference is `templates/home-concept/HomeConcept.dc.html` in the Lakefront Digital design-system project. `reference/HomeConcept.dc.html` is a copy for reading: it renders only inside that project, because it loads the design system's runtime and bundle.

## Fidelity
**High fidelity.** The colours, type, spacing, rules, states and breakpoints below are final. Recreate them exactly. These parts are placeholders or still need the owner's decision:
- **Hero photo:** rippling teal water (`pexels-36229964.jpg`) stands in for a real lake photograph the owner will supply.
- **Wave drawings:** the hero's wave edge, the accountability curl and the closing band's lines were drawn for this concept. The owner's review asks for one canonical wave design in the end, so a designer should redraw them from the logo crest. Until then, use the SVGs in `assets/brand/`.
- **Navigation:** Services · Hosting · Growth · About is the review's proposal. It drops Work and Blog from the header, so confirm it with the owner.
- **Footer:** the concept footer replaces the Night-water footer and its three link columns on every page. Confirm with the owner before shipping it site-wide.

## Where this lands in the repo
The design system's copy of the theme was last synced from commit `f6f8c419b2d06220855a59569c6bd3d41a6a68f8` (11 October 2026). If the repo has moved on, read its current files first.

| Concept section | Repo files to change |
| --- | --- |
| Header | `src/components/Header.astro`, `seed/seed.json` (`primary` and `header_cta` menus) |
| Hero | `src/components/blocks/Hero.astro`, `src/components/Ctas.astro`, `src/styles/site.css` |
| Starting points | the home page's route rows (`src/components/blocks/CardGrid.astro`, rows layout), `site.css` |
| Hosting | `src/components/blocks/Split.astro` (night split), `site.css` |
| Consultation | `src/components/blocks/Steps.astro`, `site.css` |
| Accountability | `src/components/blocks/Split.astro` (about split), `site.css` |
| Closing invitation | `src/components/blocks/CtaBand.astro`, `site.css` |
| Footer | `src/components/Footer.astro`, `seed/seed.json` (footer menus) |
| Page order and content | `seed/seed.json` (`page-home` blocks), `src/pages/index.astro` |
| Heading scale, outline buttons | `src/styles/tokens.css`, `src/styles/site.css`, `src/styles/components.css`, `DESIGN.md` |

Today the repo's page runs hero, starting points, About, hosting, steps and the closing band. Move About so it follows the consultation steps.

## Global layout
- **Container:** `max-width: 1200px; margin: 0 auto; padding: 0 clamp(20px,4vw,40px); box-sizing: border-box`. That leaves at most 1120px of content.
- **Section rhythm:** 96px between sections, 64px at 760px and below.
- **Breakpoints:** 1000, 960, 900, 760, 600 and 480px, all `max-width`. The rules are listed per section below.
- **Fonts:** Manrope (headings, labels, buttons, links) and Source Sans 3 (body). Both come from Google Fonts; the theme already loads them.
- **Page background:** Foam White `#F7FAF9`. Navy sections set `data-theme="night"`, which swaps the semantic tokens.

## Screens / Views
There is one screen, the home page. Sections are listed in order.

### 1. Header (existing component, menu changes only)
- Sticky header, 76px tall, as now. It keeps the coral **Book a consultation** button (→ `/consultation#enquiry`) at 1080px and up, and collapses to the menu button below 1080px, as now.
- **Primary menu:** Services (`/services`), Hosting (`/hosting`), Growth (`/services#seo`), About (`#about`, or `/about` if that page exists).
- The concept hides the header search button. The site has AI search, so confirm with the owner before removing it.

### 2. Hero
**Layout.** A four-track grid, so the photo bleeds to the right edge of the page:
`grid-template-columns: minmax(var(--container-pad),1fr) minmax(0,540px) minmax(0,580px) minmax(var(--container-pad),1fr)`.
- The copy sits in track 2, with `padding: 64px 32px 48px 0`, as a flex column with a 24px gap.
- The photo spans tracks 3–4, has `min-height: 600px` and sits directly under the header.
- The section has a 72px bottom margin (56px at 760px and below).

**Photo panel.** `position: relative; overflow: hidden; background: #E6F1F4`.
- The photo is `object-fit: cover; object-position: 50% 50%` and fills the panel. Its alt text is "Rippling teal water in soft daylight"; replace that with the real photo's description.
- **Wave edge:** `assets/brand/wave-edge-vertical.svg` (viewBox 0 0 240 1000, `preserveAspectRatio="none"`) sits over the photo's left edge. It's absolutely positioned at `left:-1px; top:-1px; width: clamp(170px,18vw,260px); height: calc(100% + 2px)`, with `aria-hidden="true"`.
- The edge has three bands from the outside in: `#73AFBC`, `#C1DCE4`, and `#F7FAF9`, which merges into the page.

**Copy, top to bottom:**
1. **Eyebrow tagline:** CHICAGO · WEBSITES · HOSTING · GROWTH. Manrope 700, 13px/1.2, letter-spacing 0.24em, uppercase, Deep Water `#075459`, with 5px Sunset Coral `#F26B5B` dot separators (`Eyebrow` with items).
2. **H1:** "We build, host and **look after** your website."
   - Set in `--type-hero`: Manrope 800, `clamp(38px, calc(3.2vw + 26px), 76px)`, line-height 1.03, letter-spacing −0.03em.
   - Lake Navy `#082A3A`, `text-wrap: balance`.
   - "look after" is Current Teal `#278891` with `white-space: nowrap`.
3. **Lead:** "New websites, existing WordPress sites, and apps—hosted on infrastructure we manage. Updates, backups, and monitoring, from Chicago for small businesses across the US."
   - Source Sans 3 400, 20px/1.55 (18px at 600px and below), Ink 500 `#5B707A`, `max-width: 34em`, `text-wrap: pretty`.
4. **Button group:** `margin-top: 8px`, flex-wrap, gap 12px 16px.
   - **Book a consultation** with a trailing arrow: large primary button → `/consultation#enquiry`.
   - **Start a project:** large outline button → `/contact#enquiry`.
   - **Note** on its own line (`flex-basis: 100%`): "First consultation free. Have a clear brief? Start a project. We reply by email." Source Sans 3 400, 15px/1.5, `#5B707A`, max 52ch.
   - At 480px and below, and again from 901 to 1000px (where the copy column is too narrow for two large buttons), the group becomes a column: both buttons run full width and the note returns to `flex-basis: auto`.
5. **Technology line:** `<ul aria-label="What we build and host on">` with WordPress · WooCommerce · AWS · Cloudflare.
   - `margin-top: 8px; padding-top: 20px; border-top: 1px solid #C1DCE4; max-width: 440px`.
   - Flex-wrap, gap 8px 12px. Text is Source Sans 3 15px/1.5 in `#082A3A`.
   - Separators are 4px Current Teal circles drawn in CSS with `aria-hidden`, not Unicode dots.

**Stacked (900px and below):**
- The grid becomes `var(--container-pad) minmax(0,1fr) var(--container-pad)`.
- The photo moves above the copy, spans the full width (`grid-column: 1 / -1`) and is `clamp(200px,46vw,340px)` tall.
- The vertical edge is replaced by `assets/brand/wave-edge-horizontal.svg` along the photo's bottom edge: `left:0; bottom:-1px; width:100%; height: clamp(56px,14vw,96px)`.
- The copy padding becomes `8px 0 0`.

**Alternative (design option, not the default):** a 28px-radius framed photo instead of the wave.
- Track 3 only, `margin: 24px 0 24px 16px`, `min-height: 520px`, no wave.
- Stacked: track 2, `margin-top: 8px`, and the copy padding becomes `28px 0 0`.

### 3. Starting points — "Where are you starting from?"
`margin-bottom` is 96px (64px at 760px and below).

**Head:** a column with a 20px gap and `margin-bottom: 48px` (32px at 760px and below).
- A 44 × 2px Current Teal rule with 2px radius.
- **H2** in `--type-section-title` (see tokens), letter-spacing −0.025em, `#082A3A`, `text-wrap: balance`.

**Grid:** a `<ul role="list">` with two equal columns (`repeat(2, minmax(0,1fr))`), one column at 760px and below.

**Each item** is `position: relative`, a grid of `[icon] minmax(0,1fr)` with column-gap 28px (20px at 960px and below), aligned to the top.

| Item | Desktop padding (P = 40px, 32px at 960px and below) | 760px and below |
| --- | --- | --- |
| 1 (top left) | `8px P P 0` | `0 0 24px` |
| 2 (top right) | `8px 0 P P` | `24px 0` |
| 3 (bottom left) | `P P 8px 0` | `24px 0` |
| 4 (bottom right) | `P 0 8px P` | `24px 0 0` |

**Rules** are 1px `#C1DCE4`, absolutely positioned, and stop short of the centre crossing:
- Item 1: a right-edge rule from `top:0` to `bottom:16px`, and a bottom rule from `left:0` to `right:16px`.
- Item 2: a bottom rule from `left:16px` to `right:0`.
- Item 3: a right-edge rule from `top:16px` to `bottom:0`.
- At 760px and below there are no vertical rules, and items 1–3 carry full-width bottom rules.

**Icon circle:**
- Size: 80px (64px at 960px and below, 56px at 760px and below), `border-radius: 50%`.
- Fill: Teal 50 `#E6F1F4`, which turns Teal 100 `#C1DCE4` when the item is hovered (140ms, ease-current).
- Glyph: Lucide, 2px stroke, Deep Water `#075459`, 32px (28px and 24px at those breakpoints).
- This circle is a sanctioned exception to the system's 48px rounded tiles, for these four routes only.

**Text column:** `padding-top: 10px` (6px at 960px and below, 2px at 760px and below), a flex column with a 10px gap.
- **Title (h3):** Manrope 700, `clamp(19px, calc(.5vw + 15px), 22px)`/1.25, letter-spacing −0.01em, `#082A3A`. It turns Deep Water `#075459` when the item is hovered.
- **Text:** Source Sans 3 400, 17px/1.5, `#5B707A`, max 40ch.
- **Link:**
  - Layout: `margin-top: 6px`, inline-flex with a 10px gap, `padding: 2px 0 5px`, `border-bottom: 1.5px solid currentColor`.
  - Type: Manrope 700, 16px/1.2, Deep Water `#075459`, which turns Lake Navy `#082A3A` on item hover.
  - A trailing 18px `arrow-right` moves 3px right on hover (220ms ease-current).
- **Whole item is the target:** the link contains an `aria-hidden` span at `position:absolute; inset:0` (over the item) with a 14px radius. That span draws the focus ring on `:focus-visible`. The link's accessible name stays its short text.

| Icon | Title | Text | Link → href |
| --- | --- | --- | --- |
| `panels-top-left` | A new website or store | WordPress and WooCommerce, with hosting and ongoing care. | Plan a new site → `/contact?service=wordpress#enquiry` |
| `settings` | An existing WordPress site | Move to managed hosting, with updates, backups and monitoring. | Move your site to us → `/contact?service=hosting#enquiry` |
| `code-xml` | An app or another platform | Deploy on infrastructure we manage and keep it running. | Talk about your app → `/contact?service=hosting#enquiry` |
| `chart-column` | A site that needs more customers | SEO, content, social media and analytics to help people find you. | See growth services → `/services#seo` |

### 4. Hosting and management (navy)
`<section id="hosting" data-theme="night">`: background Lake Navy `#082A3A`, `padding: 96px 0` (64px at 760px and below).

**Grid:** `minmax(0,1fr) minmax(0,400px)` with a 40px 72px gap, `align-items: center`.
- At 960px and below it becomes one column with a 40px gap, and the panel caps at 560px wide.
- If the panel is turned off, the grid is one column at every width.

**Copy column**, a flex column with a 24px gap:
1. **Eyebrow with leading rule:** "— HOSTING AND MANAGEMENT". The rule is 28 × 2px teal; text and rule are Foam Aqua `#73AFBC` on night.
2. **H2:** "Your site, looked after every day." in `--type-section-title`, Foam White `#F7FAF9`.
3. **Lead:** "Managed hosting, WordPress updates, daily backups and round-the-clock monitoring." 20px/1.55, `#A7C3CC`, max 34em.
4. **Checklist:**
   - Layout: a `<ul role="list">` grid with 2 columns × 3 rows, flowing down each column (`grid-auto-flow: column`), gap 14px 32px, `margin-top: 4px`. One column at 600px and below.
   - Each item is flex with a 12px gap: a 20px Lucide `check` in `#73AFBC` (`margin-top: 2px`), then the label in Source Sans 3 17px/1.45, `#E3EEF1`.
   - Labels, column 1: **AWS hosting**, **Cloudflare protection**, **NGINX caching**. Column 2: **Jetpack daily backups**, **New Relic monitoring**, **WooCommerce stores**. The owner chose these short labels over the review's longer wording.
5. **Actions:** `margin-top: 12px`, flex-wrap, gap 20px 32px, centred.
   - **View hosting details:** large primary button → `/hosting`.
   - **Move your site to us →** text link → `/contact?service=hosting#enquiry`.
     - Manrope 700 16px/1.2, Foam Aqua `#73AFBC`, hover Foam White.
     - 1.5px currentColor underline border, `padding: 2px 0 5px`, 2px radius, arrow nudge on hover, focus ring.
   - At 480px and below they stack, and the button runs full width.

**Example hosting setup panel** (`<figure>`): `padding: 28px` (20px at 600px and below), `border: 1px solid rgba(193,220,228,.16)`, radius 14px, background Navy 800 `#0E394C`.
- **Caption** (`<figcaption>`): "EXAMPLE HOSTING SETUP". Manrope 700 12px/1.2, letter-spacing 0.2em, uppercase, `#73AFBC`, `padding-bottom: 16px`, a bottom border in the same 16% mist.
- **Domain:** "yourbusiness.com". Manrope 700 22px/1.25, −0.01em, `#F7FAF9`, `padding: 18px 0 16px`.
- **Rows** (`<dl>`):
  - Each row is flex, `justify-content: space-between`, baseline-aligned, gap 16px, `padding: 14px 0` (the last row `14px 0 0`), with a 16%-mist top border.
  - `<dt>`: Source Sans 3 15px/1.5, `#A7C3CC`. `<dd>`: Source Sans 3 600 15px/1.35, `#F7FAF9`, right-aligned.

  | Label (dt) | Value (dd) |
  | --- | --- |
  | Uptime target | 99.9% |
  | SSL | Let's Encrypt |
  | CDN | Cloudflare |
  | Monitoring | New Relic · 24/7 |

- **No "Online" badge.** The panel is illustrative and must not imply a live reading. Never write "99.9% uptime" without "target".

### 5. Website consultation
`<section id="consultation">` with `margin: 96px 0` (64px at 760px and below).

**Grid:** `minmax(0,1fr) 1px minmax(0,1fr)` with column-gap 56px, top-aligned. The middle track holds the divider: 1px `#C1DCE4` with `align-self: stretch`, so it runs the row's full height. At 960px and below the grid is one column with a 40px gap, and the divider is hidden.

**Left column**, a flex column with a 24px gap:
1. **Eyebrow without rule:** "WEBSITE CONSULTATION" in Deep Water.
2. **H2:** "Know where your site stands and **what to do next.**" in `--type-section-title`, −0.025em. "what to do next." is Current Teal `#278891` with `white-space: nowrap`.
3. **Lead:** "A practical conversation about your website and what your business needs next." 20px/1.55, `#5B707A`, max 30em.
4. **Action group:** `margin-top: 8px`, a column with a 14px gap.
   - **Book a consultation** with a trailing arrow: large primary button → `/consultation#enquiry`. Full width at 480px and below.
   - **Note:** "First consultation free." 15px/1.5, `#5B707A`.

**Right column**, a flex column with an 8px gap:
- **H3:** "What we can work through". Manrope 700 20px/1.3, −0.01em, `#082A3A`.
- **List:** an `<ol>` with no list style and four rows.
  - Each row is a grid of `72px minmax(0,1fr)` (52px at 600px and below), column-gap 16px, top-aligned.
  - Padding: row 1 is `12px 0 22px`; rows 2–3 are `22px 0` with a 1px `#C1DCE4` top border; row 4 is `22px 0 0` with the same border.
  - **Number** (`aria-hidden`; the `<ol>` carries the order): Manrope 600 36px/1 (30px at 600px and below), −0.02em, `font-variant-numeric: tabular-nums`, Current Teal `#278891`.
  - **Title (h4):** Manrope 700 20px/1.3, −0.01em, `#082A3A`.
  - **Text:** Source Sans 3 17px/1.5, `#5B707A`, max 40ch. There's a 6px gap between title and text.

| # | Title | Text |
| --- | --- | --- |
| 01 | Website analysis | Review how the site looks, performs and gets found today. |
| 02 | Business planning | Work out what the site needs to do for the business. |
| 03 | Recommendations for your goals | Identify specific changes matched to those goals. |
| 04 | Growth roadmap | Explain what to do next and what can wait. |

### 6. Accountability — pale teal band
`<section id="about">`: full-bleed background Teal 50 `#E6F1F4`, `padding: 88px 0` (64px at 760px and below), `position: relative; overflow: hidden`.

**Motif:** `assets/brand/wave-curl-outline.svg` (viewBox 0 0 600 520; five 2px strokes in Foam Aqua `#73AFBC` at 55% opacity, using `vector-effect: non-scaling-stroke`).
- Position: `position:absolute; right:-40px; bottom:-56px; width: clamp(420px,46vw,640px); height:auto`.
- `aria-hidden="true"`, `pointer-events:none`.
- **Shown only above 1000px.** At narrower widths it would reach the text, so it's hidden.

**Content** (`position: relative`, inside the container): a column capped at 620px, flex with a 24px gap.
1. **Eyebrow without rule:** "ONE POINT OF CONTACT".
2. **H2:** "One person, accountable for your site." in `--type-section-title`, −0.025em.
3. **Paragraph:** "Lakefront Digital is run by Henry Perkins in Chicago. Henry is your point of contact for planning, delivery, and ongoing care, so the person you speak with at the start stays connected to the work."
   - Source Sans 3 20px/1.55, Lake Navy `#082A3A`, max 27em.
4. **Name block:** `margin-top: 8px`, a column with a 4px gap.
   - "Henry Perkins": Manrope 700 20px/1.3, −0.01em.
   - "Lakefront Digital · Chicago": 15px/1.5, `#5B707A`, with a 4px currentColor dot and a 10px gap.
5. **Link:** "About Henry →" → `/about`. It uses the same link style as the starting-point links: Deep Water, Lake Navy on hover, arrow nudge, focus ring.

The review warns against inventing a founder photo. Add a portrait here only if the owner supplies a real one.

### 7. Closing invitation (navy, full bleed)
`<section data-theme="night">`: full-bleed Lake Navy `#082A3A` with no radius and no photo. `padding: 80px 0` (56px at 760px and below); `position: relative; overflow: hidden`.

**Motif:** `assets/brand/wave-lines.svg` (viewBox 0 0 640 320, `preserveAspectRatio="none"`; nine 1.5px strokes in Current Teal `#278891` at 80% opacity, using `vector-effect: non-scaling-stroke`).
- Desktop: `position:absolute; right:0; bottom:0; width:48%; height:100%`.
- At 900px and below it becomes a strip under the buttons: `width:100%; height:120px` (104px at 760px and below). The section's bottom padding grows to 160px (144px at 760px and below) so the strip never sits behind text.
- `aria-hidden`.

**Content:** a column capped at 600px (no cap at 900px and below), flex with a 20px gap.
1. **H2:** "Hand your site to someone who'll look after it." in `--type-section-title`, Foam White. Use a typographic apostrophe (’).
2. **Paragraph:** "Book a free first consultation to talk it through, or start a project if you already know what you need. Either way, we reply by email."
   - 20px/1.55, `#E3EEF1`, max 34em.
3. **Buttons:** `margin-top: 8px`, gap 12px 16px.
   - **Book a consultation →** (large primary) → `/consultation#enquiry`.
   - **Start a project** (large outline; Foam White border and label on night) → `/contact#enquiry`.
   - At 480px and below they stack full width.

### 8. Footer (light)
`<footer>` on Foam White `#F7FAF9`. The inner container's padding is `48px var(--container-pad) 32px` (`40px … 28px` at 760px and below).

**Top row:** flex, `justify-content: space-between`, centred, wrapping, gap 24px 48px, `padding-bottom: 28px`, `border-bottom: 1px solid #C1DCE4`.
- **Left**, a column with a 12px gap:
  - The horizontal logo (crest | rule | wordmark), 44px tall, linking to `/`.
  - The line "Chicago · Serving small businesses across the US": 15px/1.5, `#5B707A`.
  - Lay the line out as a nowrap flex row, baseline-aligned, with a 10px gap:
    - "Chicago";
    - a 4px currentColor dot (`transform: translateY(-.14em)`);
    - the rest of the line in a `min-width:0` span, so it wraps inside its own box and "Chicago ·" never ends a line on its own.
- **Right:** `<nav aria-label="Footer">` containing a list, flex-wrap with a 4px 40px gap.
  - Links: Services `/services`, Hosting `/hosting`, Growth `/services#seo`, About `#about` (or `/about`).
  - Style: Manrope 600 15px/1.3, Deep Water `#075459`, `padding: 6px 0`; on hover, Lake Navy with an underline (4px offset). Focus ring with 4px radius.

**Bottom row:** `padding-top: 12px`, flex, `justify-content: space-between`, centred, wrapping, gap 4px 32px.
- **Left group** (wrapping, gap 0 24px):
  - "© {current year} Lakefront Digital" (15px, `#5B707A`, `padding: 6px 0`);
  - **Terms and Conditions** → `/terms`;
  - **Privacy Policy** → `/privacy`.
- **Right group** (wrapping, gap 0 24px):
  - **hello@lakefrontdigital.io** → `mailto:hello@lakefrontdigital.io`;
  - **(773) 231-8020** → `tel:+17732318020`;
  - **Back to top** with a 16px `arrow-up` → `#top` (Manrope 600 15px/1.3, Deep Water, Lake Navy on hover). Put `id="top"` on the page root or a skip target.
- Legal and contact links are 15px/1.5, `#5B707A`, with a transparent 3px-offset underline. On hover they turn Deep Water and the underline appears.

## Interactions & Behavior
- **Navigation:** every action is a plain link (the hrefs are listed above). There is no client-side state on this page beyond the existing header script.
- **Hover:** coral buttons deepen to `#EE5E4D`, and outline buttons gain a teal wash (`rgba(39,136,145,.10)`; `rgba(115,175,188,.14)` on night). Links darken (Deep Water → Lake Navy, or Foam Aqua → Foam White on night). Trailing arrows move 3px right. In the starting-point routes, the title turns Deep Water and the circle Teal 100.
- **Timing:** colour changes take 140ms and movement 220ms, all on `cubic-bezier(.22,.61,.36,1)`. Drop the arrow movement under `prefers-reduced-motion: reduce`.
- **Press:** buttons translate 1px down, with no colour change.
- **Focus:** keyboard only (`:focus-visible`). The ring is `0 0 0 2px <canvas>, 0 0 0 4px #278891` on light and `0 0 0 2px #082A3A, 0 0 0 4px #73AFBC` on night. It's drawn over a transparent 2px outline so forced-colours mode keeps a visible ring.
- **Motifs:** all three wave drawings are decorative (`aria-hidden`, `pointer-events:none`), never behind text, and drop out or move at the breakpoints given above.
- **Responsive summary:**
  - 1000px: the curl hides; the hero button pair stacks from 901 to 1000px.
  - 960px: the consultation and hosting grids stack; starting-point padding becomes 32px and the circles 64px.
  - 900px: the hero stacks with the photo strip on top; the closing lines move under the buttons.
  - 760px: the routes go to one column; section spacing becomes 64px; the circles become 56px.
  - 600px: the hosting checklist goes to one column; leads drop to 18px; numbers drop to 30px.
  - 480px: every primary and partner pair stacks full width.
  - Test reflow at 320px.
- **No loading or error states:** the page is static content. The enquiry forms on `/contact` and `/consultation` are unchanged.

## State Management
- None is new. The header keeps its existing behaviour: it collapses below 1080px or when the nav would overflow, the menu toggles, and it gains a hairline once the page scrolls.
- The footer year is the current year at render time.
- The prototype exposes four **design-time options**. Build the defaults; exposing the others as block fields is optional.

  | Option | Values | Default |
  | --- | --- | --- |
  | Hero photo edge | `wave` or `frame` | `wave` |
  | Hero photo | ripple, shore or workspace | ripple |
  | Example hosting setup panel | on or off | on |
  | Wave motifs (accountability and closing band) | on or off | on |

## Design Tokens
**Colours (light):**
- **Navy and neutrals:** Lake Navy `#082A3A` (headings, body, button labels on coral) · Ink 500 `#5B707A` (muted text).
- **Teals:** Deep Water `#075459` (links, eyebrows, outline buttons, icon glyphs) · Current Teal `#278891` (large-type emphasis, rules, numbers, separators; graphics only at small sizes) · Foam Aqua `#73AFBC`.
- **Pales:** Lake Mist / Teal 100 `#C1DCE4` (rules, borders) · Teal 50 `#E6F1F4` (accountability band, icon circles, photo fallback) · Foam White `#F7FAF9` (canvas).
- **Coral:** Sunset Coral `#F26B5B` (primary buttons, always with a Lake Navy label), hover `#EE5E4D`.

**Colours (night, `data-theme="night"`):**
- **Surfaces:** canvas Lake Navy `#082A3A` · card Navy 800 `#0E394C`.
- **Text:** strong text Foam White `#F7FAF9` · body `#E3EEF1` · muted `#A7C3CC`.
- **Accents:** links, eyebrows and checks Foam Aqua `#73AFBC` · borders `rgba(193,220,228,.16)`.

**Contrast:**

| Pair | Ratio |
| --- | --- |
| Navy on Foam White | 14.26:1 |
| Deep Water on Foam White | 8.26:1 |
| Current Teal on Foam White | 3.99:1 (large type and graphics only) |
| Navy on Coral | 5.01:1 |
| Foam Aqua on Navy | 6.12:1 |

White on coral is not allowed.

**Type (fluid page headings, new):**

| Token | Value | At 1440 / 1280 / 1024 / 768 / 390px |
| --- | --- | --- |
| `--type-hero` | 800 `clamp(38px, calc(3.2vw + 26px), 76px)`/1.03 Manrope | 72 / 67 / 59 / 51 / 39 |
| `--type-page-title` | 800 `clamp(34px, calc(2.6vw + 22px), 60px)`/1.06 Manrope | 59 / 55 / 49 / 42 / 34 |
| `--type-section-title` | 800 `clamp(30px, calc(2.2vw + 20px), 52px)`/1.08 Manrope | 52 / 48 / 43 / 37 / 30 |

Each heading stays larger than the next at every width. `--type-h2` (700 34px/1.15) remains for headings inside content such as article prose and legal text.

**Type (existing, used here):**
- `--type-lead`: Source Sans 3 400 20px/1.55.
- `--type-body`: Source Sans 3 400 17px/1.6 (1.5 in this page's cards).
- `--type-body-sm`: 400 15px/1.5.
- `--type-h4`: Manrope 700 20px/1.3.
- Eyebrow: Manrope 700 13px/1.2, letter-spacing 0.24em.
- Buttons: Manrope 700 15px (16px in the large size).
- Letter-spacing: −0.03em display · −0.025em to −0.018em headings · −0.01em small headings.

**Spacing:** a 4px base. Container 1200px, side padding `clamp(20px,4vw,40px)`, sections 96px (64px on small screens), header 76px.

**Buttons:**
- Medium: 44px tall, `padding: 0 20px`.
- Large: 52px tall, `padding: 0 26px`, gap 10px.
- Both have 8px radius and a 1.5px border.

**Radii:** 2px (link focus) · 4px (small links) · 8px (buttons) · 14px (cards and panels, route focus) · 28px (framed photo option) · 50% (icon circles).

**Shadows:** none on this page; cards use borders.

## System-wide changes (apply to every page)
These are already applied in the design system and in its copy of the theme. The files in `theme/src/styles/` are the design system's copies of the repo files (from commit `f6f8c41`) with the changes made. Apply them as **diffs** rather than overwriting, in case the repo has moved on.

**1. `src/styles/tokens.css`**
- In `:root`, after `--type-h2`:
  ```css
  /* Fluid page headings: hero > page title > section title at every width. --type-h2 stays for headings inside content. */
  --fs-hero:clamp(38px,calc(3.2vw + 26px),76px);
  --fs-page-title:clamp(34px,calc(2.6vw + 22px),60px);
  --fs-section-title:clamp(30px,calc(2.2vw + 20px),52px);
  --type-hero:800 var(--fs-hero)/1.03 var(--font-display);
  --type-page-title:800 var(--fs-page-title)/1.06 var(--font-display);
  --type-section-title:800 var(--fs-section-title)/1.08 var(--font-display);
  ```
- In `:root`, after `--action-ghost-bg-hover:rgba(39,136,145,.10);`:
  ```css
  --action-outline-fg:var(--deep-water);
  ```
- In `[data-theme="night"]`, after `--action-ghost-bg-hover:rgba(115,175,188,.14);`:
  ```css
  --action-outline-fg:var(--foam-white);
  ```

**2. `src/styles/site.css`:** replace only the `font` declarations of the heading helpers.
```css
.lfw-display{ … font:var(--type-hero); … }        /* was 800 clamp(38px,4.3vw,56px)/1.05 */
.lfw-h1{ … font:var(--type-page-title); … }       /* was 700 clamp(32px,3.6vw,46px)/1.1 */
.lfw-h2{ … font:var(--type-section-title); … }    /* was 700 clamp(26px,2.8vw,34px)/1.16 */
```
Search the theme for any other inline copies of the three old `clamp()` values and switch them to the tokens.

**3. `src/styles/components.css`:** outline buttons.
```css
.lf-btn--outline{background:transparent;color:var(--action-outline-fg);border-color:var(--action-outline-fg)}
.lf-btn--outline:hover{background:var(--action-ghost-bg-hover);color:var(--action-outline-fg)}
```

**4. `DESIGN.md`:** update the display, h1 and h2 tokens; the Hierarchy section; the outline button token; and the Borders and Buttons rules. `theme/DESIGN.md` is the updated copy.

**5. Icons:** add `src/icons/arrow-up.svg` (in `assets/icons/`). `panels-top-left`, `settings`, `code-xml`, `chart-column`, `check` and `arrow-right` are already in the theme.

Every other SVG in `src/icons/` carries a C2PA `<metadata>` block of about 8KB, which is inlined with each icon. This page inlines about 20 icons, so strip those blocks (SVGO's `removeMetadata` does it). The namespaced block also stops DOM-to-image tools from capturing any part of a page that contains an icon.

## Assets
| File | Use | Source |
| --- | --- | --- |
| `assets/brand/wave-edge-vertical.svg` | Hero photo edge (desktop) | Drawn for the concept; a designer redraw from the crest is pending |
| `assets/brand/wave-edge-horizontal.svg` | Hero photo edge (stacked) | Same as above |
| `assets/brand/wave-curl-outline.svg` | Accountability motif | Same as above |
| `assets/brand/wave-lines.svg` | Closing-band motif | Same as above |
| `assets/photography/pexels-36229964.jpg` | Hero photo (stand-in) | Pexels #36229964; to be replaced with the owner's lake photo |
| `assets/icons/arrow-up.svg` | "Back to top" | Lucide (ISC), matching the theme's set |
| Logo (horizontal) | Header and footer | Already in the repo (`Logo.astro`) |

Serve the hero photo through the theme's photo pipeline (`Photo.astro` / `src/lib/photos.ts`) at the sizes the layout needs. It's about 660px wide at 1280px, and full width when stacked.

## Copy source
All copy follows the owner's brief, `reference/lakefront-digital-design-review.md` (Revised page and copy specification), with these owner decisions on top:
- The hosting checklist uses the short labels shown above.
- The consultation lead ("A practical conversation…") and the note "First consultation free." come from the concept images.
- The accountability eyebrow is "One point of contact", the name block reads "Henry Perkins / Lakefront Digital · Chicago", and the link is "About Henry".
- The footer adds Terms and Conditions, Privacy Policy, email and phone.

## Files
- `README.md`: this document.
- `reference/HomeConcept.dc.html`: the design reference, with all markup, inline styles and responsive values. Live copy: `templates/home-concept/HomeConcept.dc.html` in the design-system project.
- `reference/lakefront-digital-design-review.md`: the owner's review and copy specification.
- `theme/src/styles/tokens.css`, `site.css`, `components.css`: the theme styles with the system-wide changes.
- `theme/DESIGN.md`: the theme's design document, updated.
- `assets/`: wave SVGs, the hero stand-in photo and the `arrow-up` icon.
- `screenshots/desktop-1280/`: the full page (`00-full-page.png`) and each section (`01`–`07`) at 1280px, 1x.
- `screenshots/phone-430/`: each section (`01`–`07`) at 430px, 2x.

The screenshots were captured from the reference with the default options. Where a screenshot and this README differ, follow the README.

## Open items for the owner
1. Supply the real lake photograph for the hero.
2. Commission a redraw of the three wave drawings from the logo crest.
3. Confirm the header menu (Services · Hosting · Growth · About) and whether to keep the header search.
4. Confirm the light footer for every page, and the `/about`, `/terms` and `/privacy` routes.
5. After implementing, test keyboard focus, the menu, contact flows, contrast on the real pages and 320px reflow, as the review asks.
