---
target: layout mobile homepage
total_score: 18
max_score: 28
na_heuristics: 7,9,10
p0_count: 0
p1_count: 3
target_identity: "file:/home/ubuntu/my-wordpress-site/src/pages/index.astro"
target_fingerprint: "sha256:1266cafee2aaa3619be6f0d0d62463585cc956ded2182e3d0765a2a8ce261968"
target_path: /home/ubuntu/my-wordpress-site/src/pages/index.astro
timestamp: 2026-09-29T17-22-31Z
slug: src-pages-index-astro
closed: true
---
Method: dual-agent (A: design review · B: detector + browser evidence), run in isolation. Evidence: live site at 89bff03, headless Chromium and WebKit at 320, 360, 390 and 430px, plus 844×390 landscape, 768 and 1280.

# Critique: homepage layout on phones

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Menu and scroll states are clear; once the hero scrolls away, nothing shows where booking went |
| 2 | Match System / Real World | 2 | Stock agency lines ("Tailored to Deliver Exceptional Results"); NGINX caching and New Relic named without the plain-English gloss PRODUCT.md promises |
| 3 | User Control and Freedom | 3 | Menu closes via X, Escape or a link; without JS it stays open and pinned at 257px |
| 4 | Consistency and Standards | 3 | A "Start a project" eyebrow over a "Book a consultation" button; the ghost button's label sits 20px in from the coral button's edge |
| 5 | Error Prevention | 2 | Project enquirers are routed into the consultation form; footer email and phone links are 18px tall and 20px apart |
| 6 | Recognition Rather Than Recall | 3 | What the consultation is arrives 6.4 screens after the first button; that it's free, never |
| 7 | Flexibility and Efficiency | n/a | Persuade surface with no repeat-use tasks |
| 8 | Aesthetic and Minimalist Design | 2 | Clean surfaces, padded phone content: the goal line repeats the lead's promise, a 2.2-screen card wall, two About paragraphs |
| 9 | Error Recovery | n/a | No inputs on this surface |
| 10 | Help and Documentation | n/a | Marketing page; the consultation is the help path |
| **Total** | | **18/28** | **Acceptable (64%)** |

## Design Specificity Verdict

**LLM assessment.** The components are unmistakably Lakefront: Foam White ground, navy type, teal eyebrow rules, one coral action with navy labels, the night band with its crest watermark and the "yourbusiness.com · ONLINE" status card. The phone composition is not. Every block collapses into the same eyebrow → H2 → lead → stacked-content column, so the split, grid and band shapes that carry the desktop page disappear. The only change of pace left is colour, and it comes late. The first five screens (a beach photo, six identical icon cards, a person at a laptop) could front any agency. Phone photos go square rather than tall (hero 350×340, About 350×320). None of the seven bundled Chicago photographs (src/lib/photos.ts:17-23) is used, though PRODUCT.md puts Chicago "in the name and the photography". Specific in the parts, interchangeable in the arrangement.

**Deterministic scan.** `impeccable detect` on the homepage markup (index.astro, Base.astro, PageBlocks.astro, blocks/): exit 0, 0 findings, including with --no-config. A wider `detect src/` found two hits, plus 36 radius and font-size advisories outside the token scales:
- `layout-transition` at components.css:198: the tab ink animates `width`. Real, but not on the homepage.
- `side-tab` at site.css:475: the blockquote rule. A false positive (DESIGN.md sanctions it; blog-only).

**Visual overlays.** detect.js was injected into the live page at 390, 360 and 1280px (no CSP; Chromium's local-network-access permission was needed): 12 findings on phones, 13 on desktop.
- kicker-above-heading ×6
- icon-tile-stack ×4
- buried-raster (the crest watermark)
- dark-glow (the status card's navy xl shadow)
- at 1280: hero-eyebrow-chip, and ai-color-palette on the navy protection gradient

All are false positives against DESIGN.md. A further dark-glow on body (#ffba00) was the overlay's own highlight colour. Two flags point at real phone problems, though not for the reasons the detector gives:
- icon-tile-stack marks the steps, where the stacked anatomy is exactly what eats the height (issue 4).
- The hero kicker-above-heading marks the eyebrow that orphans GROWTH (issue 5).

The detector can't see any of the three P1s: clipping hidden by overflow:hidden, a CTA hidden by a media query, and block order. Overlays ran in headless pages only, so there's no [Human] tab to open.

## Overall Impression

On desktop this reads as the Civic Lakefront. On a 390px phone it reads as a well-built template for five screens, and becomes Lakefront only at the night hosting band. It's technically clean (no overflow from 320 to 1280, even 64px rhythm, zero layout shift), but the order works against the product. Cognitive load is moderate: 3 of 8 checks fail (chunking, minimal choices, working memory). The emotional valley is screens 2 to 5, the peak is the night band, and the ending is a generic CTA band claiming "our experienced team". The biggest opportunity is cheap: move the night band up, and give phones a persistent way to book.

## What's Working

- **The night hosting band is the authored moment.** It shows rather than claims: named tools, label/value rows, and "Uptime target 99.9%" honestly labelled a target.
- **System discipline survives the phone.**
  - One coral action with navy labels.
  - 52px hero buttons above the fold from 360 to 430px.
  - Every section gap an even 64px.
  - No horizontal overflow at any width.
  - Layout shift of 0 even throttled.
- **It degrades gracefully.** Blocked images keep every panel's shape via placeholders. The phone menu is short and generous: three 46px rows and a full-width coral button.

## Priority Issues

**[P1] The core offer starts on screen 5.2**
- **What:**
  - At 390px the page is 7,945px (9.4 screens).
  - The hosting night band, the only section about the ongoing relationship, starts at y=4,410.
  - Before it: the hero (1.4 screens), six service cards (2.2) and About (1.3).
  - That's about 4,300px of unbroken daylight, the long run the Night Pacing Rule exists to break.
- **Why it matters:** "Sell the relationship, not the launch" (PRODUCT.md). A phone visitor meets six interchangeable capability cards at the steepest drop-off, and many never reach what makes Lakefront different.
- **Fix:**
  - Reorder the `home` page's blocks in EmDash: hero → hosting (night) → consultation steps → services → About → CTA band. No code: PageBlocks renders in content order, and the order works on desktop too.
  - At 390px the night band would start around y=1,344 (screen 1.6), and the steps' booking button would move from y≈6,006 to y≈2,940.
  - It's a live content change, so it needs your sign-off.
- **Suggested command:** /impeccable layout

**[P1] Phones lose the way to book after the hero**
- **What:**
  - site.css:20 hides `.lfw-header__cta` at ≤1080px. After the hero button (y=526), booking takes two taps via a 40px menu.
  - The next in-page button is at y=6,006, 6.4 screens later.
  - "Start a project" (/contact) has no button anywhere, only a footer link at y≈7,703.
  - The CTA band's eyebrow says START A PROJECT, but its button books a consultation. All five conversion buttons go to /consultation.
  - None says the first consultation is free.
- **Why it matters:** Persuade visitors decide after the proof, and there's nothing under the thumb at that moment. The second route, for people who already know they need a build or a host, is invisible.
- **Fix:**
  - **Header, at ≤600px:**
    - crest-only logo, the 36px small "Book a consultation" (measured 197px wide) and the menu button, with 8px gaps
    - search moves into the menu panel
    - That's 293px, which fits the 320px content width of a 360px phone. At 320 the existing overflow guard (header.ts:65-69 with site.css:307) hides it again.
    - Keeping search in the header needs 341px, so 360px Android phones would never see the button.
    - This changes the design system's mobile header, so DESIGN.md and the design-system project change with it.
  - **CTA band:** give it a real "Start a project" → /contact route, or make its eyebrow match its button.
  - **Reassurance:** put "Your first consultation is free" beside the hero and band buttons.
- **Suggested command:** /impeccable adapt (header), then /impeccable clarify (band route and reassurance)

**[P1] The status card, the brand's best proof, clips on common Android widths**
- **What:**
  - At 360px, "Cloudflare" renders as "Cloudflar" and the ONLINE badge is cut off at the card edge. At 320: "Clo" and "• O".
  - Causes:
    - the panel is inset 28px (site.css:109)
    - the card body has 24px padding (components.css:73)
    - `.lfw-spec dt{flex:none}` stops the labels wrapping (site.css:114)
    - `.lfw-panelhead` can't wrap (site.css:110)
  - `.lf-card{overflow:hidden}` (components.css:71) clips the overflow silently.
- **Why it matters:** a web company's own homepage breaking at 360px, on the element a sceptic reads most closely, costs exactly the credibility the band is there to build. The values are CMS text, so longer labels clip too.
- **Fix:** at ≤600px:
  - `.lfw-night__panel{left:12px;right:12px;bottom:12px}`
  - `.lfw-statuscard .lf-card__body{padding:18px}`
  - `.lfw-spec dt{flex:0 1 auto;min-width:0}` and `.lfw-spec dd{flex:none}`, so labels wrap and values stay whole
  - `.lfw-panelhead{flex-wrap:wrap}`
- **Suggested command:** /impeccable adapt

**[P2] Stacked grids spend three screens on structure**
- **What:**
  - Each service card stacks a 48px tile above its title, text and "Learn more", at 234–260px per card. Six equal-weight choices take 1,854px (2.2 screens).
  - The four consultation steps stack number, tile and title (site.css:86): 901px for 11 words of step titles.
- **Why it matters:** chunking fails (six equal options, more than the four per group), and the valley between hero and proof gets deeper.
- **Fix:**
  - At ≤600px, put the tile beside the title in both anatomies (a 48px column + 1fr).
  - Keep the step number in the row.
  - Keep "Learn more →" on cards: on touch it's the only cue that the whole card is a link (CardGrid.astro:24-26).
  - Estimated saving: roughly 600px, about three-quarters of a screen.
- **Suggested command:** /impeccable layout

**[P2] The phone hero spends its second screen on decoration and buries its proof**
- **What:**
  - The hero is 1,203px: copy → a 350×340 photo → the "Built on" strip (WordPress, WooCommerce, AWS, Cloudflare) at y≈1,070–1,280 (Hero.astro:21-47).
  - The photo is the `shore` fallback, "turquoise water breaking on a sandy shore". At a phone crop it reads as a tropical beach.
  - The fixed 340px height at ≤900px (site.css:52) turns DESIGN.md's tall panel into a square on phones and a 707×340 letterbox on tablets.
  - The eyebrow ends line 1 on a coral dot and orphans GROWTH at every phone width, because separators are independent flex items (Eyebrow.astro:20-26, components.css:15).
  - The stacked buttons are ragged: 247px and 163px.
- **Why it matters:** "Show the machinery" (PRODUCT.md) is pushed below a decorative photo, and the first picture of "Chicago" is a beach that could be anywhere.
- **Fix:**
  - At ≤600px, lift the strip above the photo: `.lfw-hero > .lfw-container{display:flex;flex-direction:column}`, `.lfw-hero__grid{display:contents}`, then `order` on the strip and media.
  - Bind each separator to the item after it, so no line ends on a dot.
  - Make stacked buttons full-width at ≤480px (site.css:45).
  - In EmDash, consider a tall Chicago photo for the hero (aqua-tower 444×1023, el-night or willis-fog).
- **Suggested command:** /impeccable layout

site.css and components.css are copies of the design-system project (PRODUCT.md), so each CSS fix goes back there too.

## Persona Red Flags

**Jordan (first-timer)**
- Screen 1 says who, not what: the headline is the tagline plus the company name.
- Nothing says whether booking costs money, and the steps' "a comprehensive website consultation and business plan service" reads as a paid product.
- The band reads START A PROJECT, but the button says "Book a consultation".

**Riley (stress tester)**
- The status card clips at 360 and 320px.
- `text-wrap:balance` (site.css:26) splits "One-/Stop" at the hyphen in Chromium and WebKit, and "E-/commerce" at 768.
- Deep links to /#services land with the heading under the 77px header, since only tab panels have scroll-margin (site.css:326).
- In landscape (844×390), no button is in the first viewport.

**Casey (one thumb, slow connection)**
- After the hero, booking means reaching the top-right 40×40 menu and tapping twice.
- Throttled: server response 3.8s, largest paint 8.0s (the 630KB hero photo, which has no srcset).
- 19 tap targets are under 44px, all in the header and footer.

**Out-of-state WordPress owner** (from PRODUCT.md: a site someone else built, looking for a host who'll look after it)
- Nothing in the first four screens says Lakefront takes over sites others built.
- The eyebrow leads with CHICAGO, and nothing says clients are US-wide.
- Their need fits the project form (WordPress: Yes), but "Start a project" has no button.

## Minor Observations

- **Not layout, but P1:** "Our team specializes in…" (About) and "our experienced team of web consultants" (CTA band) are live. PRODUCT.md already marks these lines for rewording. The band headline "Your One-Stop Solution" keeps the positioning PRODUCT.md is retiring.
- Step numbers are Current Teal at 13px (site.css:87). Already fixed on the uncommitted `impeccable-audit-fixes` branch.
- The open phone menu has no background of its own (site.css:302). It inherits the 90% translucent header, so the hero's coral button shows through.
- Without JS the menu is always open inside the sticky header (site.css:311), pinning 30% of the screen. Make the header static without JS.
- Header icon buttons are 40×40 (components.css:55), and they're the only phone navigation. 44px would match the in-page buttons.
- Background photos under scrims (CTA band, night media) carry descriptive alt text; they should use `alt=""`.
- Out of scope: the tab ink `width` animation (components.css:198) is a real detector hit on pages with tabs.

## Questions to Consider

- If hosting and management is the edge, what if the night band were the phone's second screen, or the phone hero itself?
- What would the page look like organised around the three situations people arrive with (a new site, a WordPress site someone else built, an app that needs running) instead of six capability cards?
- Is a tidy phone header worth 6.4 screens with no booking button?
- Which one Chicago photograph would make a visitor in Denver believe the "Lakefront" in the name?
