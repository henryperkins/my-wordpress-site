---
name: Lakefront Digital
description: "The Civic Lakefront: Foam White pages, navy night-water sections, teal wayfinding and one coral action colour."
colors:
  lake-navy: "#082A3A"
  deep-water: "#075459"
  current-teal: "#278891"
  foam-aqua: "#73AFBC"
  lake-mist: "#C1DCE4"
  foam-white: "#F7FAF9"
  white: "#FFFFFF"
  sunset-coral: "#F26B5B"
  coral-600: "#EE5E4D"
  coral-700: "#B8392B"
  coral-300: "#F7A196"
  coral-100: "#FDE7E3"
  harbor-gold: "#D5A33A"
  gold-700: "#8A6414"
  gold-100: "#F7EDD6"
  seafoam-green: "#79B89C"
  seafoam-700: "#2B7355"
  seafoam-100: "#E2F1EA"
  night-success-fg: "#9FD3BA"
  teal-50: "#E6F1F4"
  teal-200: "#A3CAD4"
  navy-950: "#05202C"
  navy-800: "#0E394C"
  night-text-body: "#E3EEF1"
  text-inverse-muted: "#A7C3CC"
  ink-600: "#4A6370"
  ink-500: "#5B707A"
  ink-400: "#7A8E98"
  ink-300: "#A9B8BF"
  ink-200: "#D3DEE2"
  ink-100: "#E9EFF1"
  border-subtle: "#DCE8EC"
typography:
  display:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(38px, 4.3vw, 56px)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  h1:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(32px, 3.6vw, 46px)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.022em"
  h2:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(26px, 2.8vw, 34px)"
    fontWeight: 700
    lineHeight: 1.16
    letterSpacing: "-0.018em"
  h3:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.018em"
  h4:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  h5:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.35
  lead:
    fontFamily: "Source Sans 3, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Source Sans 3, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "Source Sans 3, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "Source Sans 3, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.2
  button:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.005em"
  eyebrow:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.24em"
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "14px"
  xl: "20px"
  2xl: "28px"
  full: "999px"
spacing:
  space-1: "4px"
  space-2: "8px"
  space-3: "12px"
  space-4: "16px"
  space-5: "20px"
  space-6: "24px"
  space-8: "32px"
  space-10: "40px"
  space-12: "48px"
  space-16: "64px"
  space-20: "80px"
  space-24: "96px"
  space-32: "128px"
  gutter: "24px"
  container-pad: "clamp(20px, 4vw, 40px)"
  section: "96px"
  section-sm: "64px"
components:
  button-primary:
    backgroundColor: "{colors.sunset-coral}"
    textColor: "{colors.lake-navy}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.coral-600}"
    textColor: "{colors.lake-navy}"
  button-secondary:
    backgroundColor: "{colors.lake-navy}"
    textColor: "{colors.foam-white}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.deep-water}"
    textColor: "{colors.foam-white}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.lake-navy}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-outline-hover:
    backgroundColor: "rgba(39,136,145,0.10)"
    textColor: "{colors.lake-navy}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.deep-water}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-lg:
    typography: "{typography.button}"
    padding: "0 26px"
    height: "52px"
  button-sm:
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "36px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.lake-navy}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "44px"
  tag:
    backgroundColor: "{colors.white}"
    textColor: "{colors.lake-navy}"
    rounded: "{rounded.full}"
    padding: "0 12px"
    height: "32px"
  tag-selected:
    backgroundColor: "{colors.lake-navy}"
    textColor: "{colors.foam-white}"
  badge-success:
    backgroundColor: "{colors.seafoam-100}"
    textColor: "{colors.seafoam-700}"
    rounded: "{rounded.full}"
    padding: "0 9px"
    height: "22px"
  card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.lake-navy}"
    rounded: "{rounded.lg}"
    padding: "24px"
  card-sunken:
    backgroundColor: "{colors.teal-50}"
    textColor: "{colors.lake-navy}"
    rounded: "{rounded.lg}"
    padding: "32px"
  icon-tile:
    backgroundColor: "{colors.teal-50}"
    textColor: "{colors.deep-water}"
    rounded: "12px"
    size: "48px"
  nav-link:
    textColor: "{colors.lake-navy}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "40px"
  nav-link-current:
    textColor: "{colors.deep-water}"
  eyebrow:
    textColor: "{colors.deep-water}"
    typography: "{typography.eyebrow}"
  night-section:
    backgroundColor: "{colors.lake-navy}"
    textColor: "{colors.night-text-body}"
  night-card:
    backgroundColor: "{colors.navy-800}"
    textColor: "{colors.night-text-body}"
    rounded: "{rounded.lg}"
    padding: "24px"
  photo-panel:
    backgroundColor: "{colors.teal-50}"
    rounded: "{rounded.2xl}"
---

# Design System: Lakefront Digital

## Overview

**Creative North Star: "The Civic Lakefront"**

Chicago's lakefront is public infrastructure done well: orderly, open, clearly signed and built to last. This system brings that civic temperament to a business that runs other people's websites. Pages stand on a Foam White ground with Lake Navy type. Teal does the wayfinding: spaced uppercase eyebrows with a short rule, numbered steps, and a thin line of ink under the current page or tab. One warm colour, Sunset Coral, marks the action. Navy night-water sections change the pace of long pages. Tall, softly rounded photographs show three subjects only: the lake's water, the city's architecture, and real work.

The mood is crisp, technical and exact. The site shows its machinery instead of promising it: spec cards that name the real tools as tags, status panels written as label-and-value rows, numbered steps and large stat figures. Components are engineered and plainly labelled: solid buttons, crisp 1px borders, and labels that say exactly what happens. The spacing is measured. Sections breathe on a 96px rhythm inside a 1200px container, while the content inside them stays specific.

Surfaces stay flat and bordered until touched. Shadows are tinted navy. Motion slows to a stop like water and never bounces. The system is explicitly not a stock WordPress theme, not startup SaaS gloss and not big-agency spectacle.

**Key Characteristics:**
- Foam White daylight pages with Lake Navy type; navy night-water sections pace long pages.
- Teal as wayfinding: eyebrows, rules, current-state ink, step numbers and icons.
- One coral signal: Sunset Coral with a Lake Navy label marks every primary action.
- Two voices: Manrope names and directs; Source Sans 3 is for reading and typing.
- Flat surfaces with Lake Mist borders; navy-tinted shadows appear only when something floats or is touched.
- Tall photo panels with 28px corners, showing lake water, Chicago architecture and real work.
- One decelerating motion curve, no bounce, and reduced motion honoured.

## Colors

The palette follows a water-texture progression, from Lake Navy through Deep Water and Current Teal to Lake Mist and Foam White. Sunset Coral is the single warm signal.

### Primary
- **Lake Navy** (#082A3A): the system's ink.
  - All headings and body text on light grounds.
  - The night-water canvas.
  - The secondary button, selected chips and tooltip bubbles.
  - The browser theme colour.
- **Deep Water** (#075459): teal for words at small sizes.
  - Links and eyebrows.
  - The current nav item.
  - Icon glyphs inside tiles, info badges, and checked checkboxes and radios.
  - Step numbers and numbered-list counters.
  - It reaches 8.3:1 on Foam White.
- **Current Teal** (#278891): for large type and graphics only.
  - The hero's highlighted brand words.
  - Eyebrow rules, and the current-page and tab underline ink.
  - Check marks, legal section numbers (20px bold, which counts as large text) and prose bullet dashes.
  - The focus ring and the input focus border.
- **Foam Aqua** (#73AFBC): Current Teal's night-water counterpart.
  - On navy it carries links, eyebrows, tab ink, check marks and the focus ring, and footer links turn to it on hover.
  - The same value is the hover border for tags and choice cards.
- **Lake Mist** (#C1DCE4): the default border.
  - Cards, dropdowns, the tab baseline, and the header hairline once the page scrolls.
  - Step rules.
  - Text selection and search-result highlights.

### Secondary
- **Sunset Coral** (#F26B5B): the one action colour.
  - Primary buttons, always with Lake Navy labels at 5:1. The hover deepens to Coral 600 (#EE5E4D).
  - Primary icon buttons, and the play button on case-study video.
  - Small signal marks: the dots between eyebrow items, and the large stat figures in night sections.

### Tertiary
- **Seafoam Green** (#79B89C): success.
  - Seafoam 700 (#2B7355) text on Seafoam 100 (#E2F1EA): the enquiry thank-you tile and success badges.
  - On navy the text lifts to #9FD3BA, as in the "Online" badge on the hosting status card.
- **Harbor Gold** (#D5A33A): warnings and notes.
  - Gold 700 (#8A6414) on Gold 100 (#F7EDD6) for inline notes and the sample-content banner.
  - Gold is a status colour, never an action.
- **Coral 700** (#B8392B): errors.
  - Coral 700 on Coral 100 (#FDE7E3) for field errors and the form error banner.
  - On navy, errors use Coral 300 (#F7A196).

### Neutral
- **Foam White** (#F7FAF9): the daylight canvas, and headings on night-water.
- **White** (#FFFFFF): cards, fields, tags, dropdown panels and the header dropdown.
- **Teal 50** (#E6F1F4): sunken surfaces.
  - Icon tiles and benefit boxes.
  - The offer card and the article help card.
  - The related-posts band and the segmented-tab tray.
  - The current item in a dropdown.
- **Teal 200** (#A3CAD4): the border an interactive card takes on hover.
- **Ink 500** (#5B707A): muted text, at 4.9:1 on Foam White.
  - Leads, card text and captions.
  - Inactive tabs and footer headings.
- **Ink 400** (#7A8E98): the strong border on inputs and unchecked controls.
- **Ink 600** (#4A6370): the hover border on inputs and choices.
- **Ink 300, 200 and 100** (#A9B8BF, #D3DEE2, #E9EFF1): disabled text, disabled borders and disabled fills.
- **Border Subtle** (#DCE8EC): the quietest divider.
  - Card footers, benefit rules and legal section rules.
  - The border of raised cards.
- **Navy 800** (#0E394C) and **Navy 950** (#05202C): night cards (such as the hosting status card), and night fields and sunken wells.
- **Night text** (#E3EEF1) and **Text inverse muted** (#A7C3CC): body text and muted text on night-water.

### Named Rules
**The One Signal Rule.** Sunset Coral is the only action colour, and a primary button always carries a Lake Navy label on it. Outside actions, coral appears only as small signal marks and night-section stat figures. Never add a second action colour. Never use coral for surfaces, borders or body text. Never put a white label on coral, which reaches only 3:1.

**The Deep Water for Words Rule.** Teal text at body or label size is always Deep Water. Current Teal reaches only 3.99:1 on Foam White, so it carries large type and graphics only.

**The Crest Colours Rule.** The logo artwork has its own navy (#012A53), teal (#178F96) and sun yellow (#FEBE38). They exist only inside the crest; never use them in UI.

## Typography

**Display Font:** Manrope (with ui-sans-serif, system-ui, sans-serif)
**Body Font:** Source Sans 3 (with ui-sans-serif, system-ui, sans-serif)
**Label/Mono Font:** Manrope for labels. There is no brand mono; code uses the system monospace stack.

**Character:** Manrope is the engineered voice. It's geometric and contemporary, tightly tracked at display sizes, and used for everything that names, directs or acts. Source Sans 3 is the service voice. It's plain and readable, and used for everything a visitor reads or types.

### Hierarchy
- **Display** (800, clamp(38px, 4.3vw, 56px), 1.05, -0.03em): the home hero headline only. Its closing words can switch to Current Teal as the brand highlight.
- **H1** (700, clamp(32px, 3.6vw, 46px), 1.1, -0.022em): page intros, service-summary titles and article titles.
- **H2** (700, clamp(26px, 2.8vw, 34px), 1.16, -0.018em): section headlines, service-tab titles and the CTA band headline.
- **H3** (700, 26px, 1.2): the offer headline, and h2 inside article prose.
- **H4** (700, 20px, 1.3, -0.01em): card titles, step titles, legal section headings and search-result titles.
- **H5** (700, 17px, 1.35): feature names, the status-card head and fact values.
- **Lead** (Source Sans 3, 400, 20px, 1.55): the paragraph under a page or section headline. It's set in Ink 500 at no more than 60ch.
- **Body** (400, 17px, 1.6): body and legal text, with prose capped at 720px. Card, list and feature text steps down to 16px.
- **Body small** (400, 15px, 1.5): footer lists, spec rows and meta lines.
- **Caption** (400, 13px, 1.4): the footer base row and post meta. Field hints and errors use it at 14px.
- **Label** (Manrope, 600, 15px, 1.2): nav links and tabs. Field labels and table-of-contents links use it at 14px.
- **Button** (Manrope, 700, 15px, 1, 0.005em): 14px on small buttons and 16px on large ones.
- **Eyebrow** (Manrope, 700, 13px, 0.24em, uppercase): section wayfinding.
  - Lists of eyebrow items tighten to 0.16em.
  - Micro labels use Manrope 700 at 11–12px and 0.16em, uppercase: footer headings, the "Built on" label, "Benefit" labels and the table-of-contents label.

### Named Rules
**The Wordmark Echo Rule.** Uppercase text is always short, set in Manrope 700–800 and widely tracked (0.08em for badges, 0.16–0.24em for eyebrows and labels), echoing the spaced D I G I T A L of the wordmark. Never set a sentence in capitals.

**The Two Voices Rule.** Manrope names and directs: headings, nav, buttons, eyebrows, labels, numbers and category chips. Source Sans 3 is for reading and typing: body, leads, form fields, and the tags that name tools. Don't swap them.

## Layout

The page is a single 1200px column, padded clamp(20px, 4vw, 40px) at the sides. Section heads cap at 760px, intros at 860px, prose at 720px and leads at 60ch.

**Grids:**
- A 24px gutter throughout.
- Card grids run three across, drop to two at 960px, and to one at 600px. Grids of two or four cards use two columns.

**Splits:**
- **Hero:** two equal columns with a 56px gap, and the "Built on" strip 48px below them. It stacks at 900px, with a 340px photo. Stacked, the strip comes straight after the buttons and the photo closes the hero.
- **About split:** 1.1fr copy beside a 0.9fr photo, reversed when the photo leads, with a 64px gap. It stacks at 960px.
- **Service tabs:** 1.05fr copy beside a 1fr photo, with a 56px gap. At 760px and below, a labelled native service selector replaces the tab strip.
- **Consultation summary:** the explanation and action precede the photo in reading order. At 900px and below the photo follows the summary at 240px tall; the form comes before preparation material.
- **Legal pages:** a 260px sticky table of contents beside a 720px body, with a 64px gap. They go to one column at 900px.

**Rhythm:**
- Sections sit 96px apart, or 64px at 760px and below.
- Section heads sit 48px above their content, or 32px on phones.
- Page intros start 72px below the header, and night intros 80px, with 72px below.
- The hero keeps the same 96px (64px on phones) before whatever follows it, so a night section can come straight after it.

**The header:**
- A sticky 76px bar.
- At 1080px, or whenever its menu would overflow, the links collapse into a menu button and the coral header button leaves the bar.
- The collapsed bar keeps the full logo, search and menu. Booking becomes an ordinary menu link; the page owns the primary action.
- Without JavaScript the menu panel is always open, so the header scrolls with the page instead of pinning it.

**Breakpoints in use:** 1080px, 960px, 900px, 860px (the footer goes to two columns), 760px, 700px, 600px and 480px (full-width button pairs).

**Stacking order:** header 100, dropdown 500, overlay 1000, toast 1100, tooltip 1200.

### Named Rules
**The Collapsing Margin Rule.** Light sections are spaced with vertical margins (96px, or 64px on phones), which collapse, so any two blocks stack cleanly without doubling up. Only night sections use padding, inside their own navy background.

**The Night Pacing Rule.** A night-water section (`data-theme="night"`) is a pacing device. Use one wherever a long page needs a change of pace, whatever the topic. The footer is always night.

## Elevation & Depth

Depth comes from tone, not shadow. Surfaces separate as a Foam White canvas, White cards and Teal 50 wells, each edged with a 1px Lake Mist border. Shadows appear in two cases: when something floats above the page (the header dropdown, tooltips, the status card on its photo), or when something responds to touch (a hovered interactive card). Every shadow is tinted Lake Navy.

Photographs that carry text sit under navy protection:
- a left-to-right gradient, from 94% navy to clear by 78% of the width;
- on phones, a flat 72% navy scrim instead.

### Shadow Vocabulary
- **xs** (`box-shadow: 0 1px 2px rgba(8,42,58,.06)`): a hairline lift. It's rare.
- **sm** (`box-shadow: 0 1px 2px rgba(8,42,58,.06), 0 2px 8px rgba(8,42,58,.06)`): the thumb of a segmented tab.
- **md** (`box-shadow: 0 2px 4px rgba(8,42,58,.05), 0 10px 24px rgba(8,42,58,.09)`): raised cards.
- **lg** (`box-shadow: 0 4px 10px rgba(8,42,58,.06), 0 24px 48px rgba(8,42,58,.14)`): hovered interactive cards, the header dropdown, tooltip bubbles and the video play button.
- **xl** (`box-shadow: 0 8px 16px rgba(8,42,58,.08), 0 40px 80px rgba(8,42,58,.20)`): the night status card floating on its photograph.
- **inset** (`box-shadow: inset 0 1px 2px rgba(8,42,58,.08)`): pressed wells.
- **Focus ring** (`box-shadow: 0 0 0 2px <canvas>, 0 0 0 4px <Current Teal>`): a double ring, with Foam Aqua in night sections. It's drawn over a transparent 2px outline, which forced-colours mode turns into the visible ring.

### Named Rules
**The Flat Until Touched Rule.** Cards rest flat, with a Lake Mist border. Only an interactive card responds to hover:
- it rises 2px and takes the lg shadow;
- its border turns Teal 200;
- its photograph zooms to 1.03.

**The Navy Shadow Rule.** Every shadow, scrim and protection gradient is tinted Lake Navy. No grey, no black and no coloured glows.

## Shapes

The system is structured and softly rounded, and the corner radius grows with the size of the element:
- **4px:** link focus and highlight marks.
- **6px:** small buttons, and the focus on a tab.
- **8px:** buttons, inputs, nav items and tooltips.
- **12px:** icon tiles, and the numbered tiles in prose lists.
- **14px:** cards, dropdowns, benefit boxes and choice cards.
- **20px:** photos in tab panels and asides, and images in prose.
- **28px:** hero, about and service-summary photos, the CTA band, and featured-post and article-hero images.
- **Full pill:** tags, chips, badges, switches and round icon buttons.

**Borders:**
- 1px Lake Mist on cards and containers.
- 1px Ink 400 on inputs.
- 1.5px Lake Navy on outline buttons. Every button reserves a 1.5px border, transparent unless it's the outline style.
- Steps and case-study rows are marked by a 2px Lake Mist rule along the top, not by a box.

**Small geometry:**
- Icon tiles are 48px squares, or 64px with 16px corners for the offer.
- The eyebrow rule is 28 × 2px with rounded ends.
- Eyebrow separators are 5px coral circles.
- The current-page underline is a 2px rounded bar, inset 14px.

### Named Rules
**The Tall Panel Rule.** Photographs are tall panels that crop to fill:
- **Heights:** the hero is clamp(420px, 44vw, 580px); about 560px; service summary 600px; tab panels 520px; night media 500px.
- **Corners:** 28px at page scale, and 20px inside tabs and asides.
- **Full bleed:** only on night moments under navy protection, such as the 404 page and case-study results.

## Components

Components are engineered and plainly labelled. Every control looks built rather than decorated, and says exactly what it does.

**The Say What Happens Rule.** Labels name the outcome: "Book a consultation", "Request consultation", "View hosting details". Primary actions carry a trailing arrow, or a send icon on a form submit.

### Buttons
- **Shape:** gently squared corners (8px, or 6px on small buttons).
- **Primary:** Sunset Coral with a Lake Navy label.
  - Manrope 700 at 15px, 44px tall, with 20px sides.
  - Large: 52px tall, 26px sides, 16px text.
  - Small: 36px tall, 14px sides, 14px text.
  - The trailing arrow slides 3px right on hover.
- **Hover, focus, press, disabled:**
  - Hover moves to Coral 600 over 140ms on the water curve.
  - Press drops 1px.
  - Focus shows the double ring.
  - Disabled is an Ink 100 fill with Ink 400 text.
- **Secondary:** Lake Navy with a Foam White label, turning Deep Water on hover.
  - It's the side action in a section head.
  - On night-water it inverts: Foam White with a navy label.
- **Outline:** transparent, with a 1.5px Lake Navy border and label, and a teal wash on hover. It's the partner to a primary button on light grounds.
- **Ghost:** transparent, with Deep Water text (Foam Aqua on night). It's the secondary action in night sections.
- **Link:** a label with a 1.5px underline at 35% opacity that fills in on hover, plus a trailing arrow. It's used for "Learn more" on cards.
- **Icon buttons:** 40px squares with 8px corners, transparent, with a teal wash on hover.
  - The outline version adds a Lake Mist border, as on the mobile menu button. That button is 44px square at 600px and below.
- **Pairs on phones:** at 480px and below, a stacked primary and its partner run full width, so the two read as one decision.
- **Unused variant:** a Deep Water brand button exists in the kit but not on the site.

### Chips
- **Tags:** name real tools, such as AWS, Cloudflare and Jetpack, in spec cards and the hero's "Built on" strip.
  - A White pill with a 1px Lake Mist border.
  - Lake Navy Source Sans 3 at 600 and 14px, 32px tall. The small size is 26px tall with 13px text.
  - Linked tags take a Foam Aqua border and a Teal 50 fill on hover.
  - A selected tag fills Lake Navy, with Foam White text.
- **Category chips:** navigation rather than information.
  - 40px pills in Manrope 600 at 14px, with the post count in Manrope 800 and Ink 500.
  - The current chip fills Lake Navy, with Foam White text and a Foam Aqua count.
- **Badges:** 22px pills in Manrope 800 at 11px, uppercase with 0.08em tracking.
  - Tones: neutral, info (Teal 50 with Deep Water), success (with a status dot), warning, danger, coral accent, gold and brand.

### Cards / Containers
- **Corner Style:** 14px.
- **Background:**
  - White on Foam White.
  - Teal 50 for sunken containers: the offer, benefit boxes and the article help card.
  - Navy 800 on night-water.
- **Shadow Strategy:** flat at rest, as the Flat Until Touched Rule sets out.
- **Border:** 1px Lake Mist. Raised cards switch to Border Subtle plus the md shadow.
- **Internal Padding:** 24px as standard, 16px small, and 32px for specs, offers and two-card grids.
- **Anatomy, top to bottom:**
  - An icon tile at top left: 48px, Teal 50, with a Deep Water glyph.
  - An optional badge or info tip at top right.
  - An H4 title.
  - Text in Ink 500 at 16px.
  - Either a "Benefit" micro label above a Border Subtle rule, or a link-style "Learn more →".
- **On phones** (600px and below), the tile sits beside the title, in a 48px column with a 16px gap, and everything else runs full width below. A card with a badge keeps the stacked anatomy. "Learn more →" stays: on touch it's the only sign that the whole card is a link.

### Inputs / Fields
- **Style:**
  - A White field with a 1px Ink 400 border and 8px corners.
  - 44px tall, with 14px sides.
  - Source Sans 3 at 16px in Lake Navy, with Ink 500 placeholders.
  - Labels sit above in Manrope 600 at 14px, with "Optional" in Ink 500 on the right.
  - A leading icon sits 14px in, pushing the text to 42px.
  - Textareas start at 112px tall.
- **Focus:** the border turns Current Teal, with a 3px teal glow (rgba(39,136,145,.22)).
- **Error and disabled:**
  - An invalid field takes a Coral 700 border and a coral glow on focus.
  - The message below is Coral 700 Source Sans 3 at 600 and 14px, with a circle-alert icon, and it matches the server's message word for word.
  - Disabled fields take an Ink 100 fill, an Ink 200 border and Ink 300 text.
- **Choices:**
  - Checkboxes are 20px with 5px corners; radios are round. Both have a 1.5px Ink 400 border and fill Deep Water when checked.
  - Choice cards are bordered 14px tiles. When checked they gain a Deep Water ring and a Teal 50 fill.
  - Switches are 40 × 24px pill tracks.

### Navigation
- **Header:**
  - A sticky 76px bar at 90% Foam White with a light blur. A Lake Mist hairline appears once the page scrolls.
  - The order runs: the 40px horizontal logo, the links, the search icon, then the coral header button.
- **Links:**
  - Manrope 600 at 15px, 40px tall, with 14px sides and 8px corners, and a teal wash on hover.
  - The current page shows Deep Water text over a 2px Current Teal bar, sitting 2px above the bottom and inset 14px.
- **Groups:**
  - A button with a chevron that turns 180° when open.
  - The dropdown is a White panel at least 220px wide, with 14px corners, a Lake Mist border and the lg shadow. It rises 8px as it enters.
  - The current item takes a Teal 50 fill and Deep Water text.
- **Mobile, at 1080px or whenever the menu would overflow:**
  - The links collapse into an outline menu button that toggles between menu and close icons. Search stays in the bar; the coral header action leaves it.
  - A panel of links in Manrope 700 at 18px, on a solid Foam White ground.
  - The current page is Deep Water, underlined by a 2px Current Teal line 6px below the text. The search icon uses Deep Water on /search.
  - Child links indent 16px behind a 2px Lake Mist rule.
  - The consultation action is an ordinary text link. On its destination page it uses a fragment link, preserving query parameters and entered enquiry details.
- **Phones, at 600px and below:**
  - The bar keeps the full horizontal logo, search icon and 44px menu button, with 8px gaps.
  - Search opens the AI search modal and returns focus to its opener when closed. Without JavaScript it links to /search.
  - The page owns the coral primary action, including while the menu is expanded.
- **Tabs:**
  - Underline tabs: Manrope 600 at 15px and 48px tall, turning from Ink 500 to Lake Navy when selected, over a 2px Current Teal ink bar that slides in 360ms.
  - Segmented tabs sit in a Teal 50 tray with 10px corners, with a White thumb carrying the sm shadow.
  - Service tabs become a labelled, full-width native select at 760px and below. Every service remains discoverable; the selected option, panel and URL anchor stay synchronized when resizing or following deep links.
  - Without JavaScript, the panels simply stack.
- **Footer:** always night-water.
  - The reversed lockup at 44px, beside the tagline.
  - Column heads in Manrope 700 at 12px, spaced 0.16em and in capitals.
  - Links in body small that turn Foam Aqua on hover.
  - A base row with the legal links, contact details and a "Websites · Hosting · Growth" eyebrow.

### Forced Colours
Windows high-contrast mode swaps the palette for system colours and drops box-shadows and painted backgrounds, so every state keeps a mark that survives:
- **Focus:** each focus ring sits over a transparent 2px outline, which becomes the visible ring. Tabs draw theirs inside.
- **Current and selected:** the current-page bar, the tab ink, the current contents entry and the current chip switch to Highlight. A selected chip or tag fills Highlight, with HighlightText.
- **Marks:** the radio dot and the prose bullet dashes turn CanvasText.

### Eyebrows
The system's signature wayfinding: short uppercase labels above headlines.
- Manrope 700 at 13px, spaced 0.24em, in Deep Water (Foam Aqua on night-water).
- A single eyebrow leads with a 28 × 2px Current Teal rule.
- A list, such as "Chicago · Websites · Hosting · Growth", separates its items with 5px Sunset Coral dots. Editors type the list with `·`.
- A list wraps between items into balanced lines, and no line starts or ends on a dot.

### Night-water Sections
- **`data-theme="night"` switches any section to the navy canvas:**
  - Foam White headings, and body text at #E3EEF1.
  - Foam Aqua links, eyebrows, tab ink and check marks.
  - Navy 800 cards and Navy 950 fields.
  - Translucent mist borders.
  - Coral buttons, unchanged.
- **The hosting band** adds the crest as a watermark at 6% opacity.
- **The status card** floats on its photograph with the xl shadow. It has:
  - a head row with a title and a success badge with a status dot;
  - label-and-value rows split by translucent rules.
  - On phones it sits 12px in from the photo's edges with 16px padding, and its labels wrap before its values do.
- **Stat figures** are Sunset Coral Manrope 800, at clamp(40px, 4vw, 56px), over muted labels.

### Photo Panels and CTA Band
- **Photo panels** follow the Tall Panel Rule, with a Teal 50 placeholder while they load. Each photo loads at the width it renders, resized at the edge and sent as AVIF or WebP.
- **The CTA band:**
  - A 28px-cornered navy band at least 380px tall.
  - Its photograph sits under the left-hand navy protection, which switches to a full scrim on phones.
  - The copy is capped at 520px, with 56px padding (32px on phones), and ends in a large coral button.

### Numbered Steps
- Steps are numbered 01 to 05 in Manrope 800 at 13px, spaced 0.16em, in the eyebrow colour: Deep Water, or Foam Aqua on night-water.
- Each sits under a 2px Lake Mist rule, above an icon tile and an H4 title. On phones the number stays under the rule and the tile sits beside the title.
- Four steps make a grid of deliverables; five make a row of preparation tips.

### Legal Pages
- **Table of contents:** 260px and sticky, with each entry numbered. The current entry is Deep Water, with a 2px Current Teal bar on its left.
- **Sections:**
  - Numbered in Current Teal by a CSS counter.
  - Separated by Border Subtle rules.
  - Body text indented 40px.
- **Print:** the print stylesheet removes the header, footer and table of contents.

### Prose
- **Bullets:** 14 × 2px Current Teal dashes.
- **Numbered lists:** a grid of Teal 50 tiles in Manrope 600 at 16px, led by Deep Water counters (01, 02…) in Manrope 800 at 13px.
- **Blockquotes:** a 3px Current Teal rule on the left, with the text in lead type.
- **Code blocks:** Lake Navy, with Foam White text.

### Icons and Logo
- **Icons:** Lucide line glyphs.
  - A 2px stroke with round caps and joins, drawn in the current text colour.
  - 20px by default: 16px on small buttons, 18px on standard buttons, and 22–24px inside tiles.
- **The logo:** a horizontal lockup of crest, rule and wordmark.
  - 40px in the header and 44px in the footer.
  - The reversed files are for navy grounds. There, the crest sits on a white disc, because its foam and sky are transparent.

## Do's and Don'ts

### Do:
- **Do** put every primary action on Sunset Coral with a Lake Navy label and a trailing arrow. Pair it with an outline button on light grounds, or a ghost button on night-water.
- **Do** open sections with the eyebrow, headline, lead stack: an eyebrow with a 28px teal rule, then an H2, then a 20px Ink 500 lead no wider than 60ch.
- **Do** name the machinery. Use spec cards with tool tags, label-and-value status rows, numbered steps and stat figures, set crisply and labelled plainly.
- **Do** use a night-water section wherever a long page needs a change of pace, whatever the topic. The footer is always night.
- **Do** choose photography from three subjects: lake-water textures, Chicago architecture, and real work. Real work means people working and, on /work, real client sites shown as screenshots.
- **Do** space light sections with the collapsing 96px/64px margins, and pad only night sections.
- **Do** tint every shadow and scrim Lake Navy, and keep cards flat unless they're interactive and hovered.
- **Do** keep motion on the water curve, cubic-bezier(.22,.61,.36,1):
  - 140ms for hovers;
  - 220ms for lifts and panels;
  - 360ms for page and panel entrances with an 8px rise.
  Honour reduced motion.
- **Do** keep every no-JavaScript path working: tabs stack, forms post, dropdowns open on hover or focus, and the legal table of contents is a plain list.

### Don't:
- **Don't** add a second action colour, or use coral for surfaces, borders or body text. Never put a white label on coral.
- **Don't** set Current Teal text at body or label size. Use Deep Water.
- **Don't** use the crest's artwork colours (#012A53, #178F96, #FEBE38) in UI.
- **Don't** let it look like a stock WordPress theme: no template layouts, stock handshake photos, walls of icons or sliders.
- **Don't** add startup SaaS gloss: no purple gradients, glowing blobs, frosted-glass cards or dashboard screenshots as the hero. The sticky header's light blur is the only translucent surface.
- **Don't** reach for big-agency spectacle: no oversized type stunts, scroll-jacking, heavy or bouncy motion, or theatrical case-study reveals.
- **Don't** use grey or black shadows, or coloured glows.
- **Don't** present generated or stock images as client work. Client sites appear only as real screenshots, used with permission.
- **Don't** set sentences in capitals. Uppercase is for short Manrope labels only.
- **Don't** hard-code colours or sizes. Use the tokens, and retheme through `src/styles/theme.css`.
