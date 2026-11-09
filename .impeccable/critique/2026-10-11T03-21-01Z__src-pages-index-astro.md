---
target: the main page
total_score: 20
max_score: 28
na_heuristics: 7,9,10
p0_count: 0
p1_count: 3
target_identity: "file:/home/ubuntu/my-wordpress-site/src/pages/index.astro"
target_fingerprint: "sha256:ab67887b0b0ea104c0bf2f72684bc51d9b6af523be346e488da1d202400832ba"
target_path: /home/ubuntu/my-wordpress-site/src/pages/index.astro
timestamp: 2026-10-11T03-21-01Z
slug: src-pages-index-astro
closed: true
---
Method: dual-agent (A: design-review sub-agent · B: detector sub-agent)

# Homepage critique

I reviewed `src/pages/index.astro` as production renders it at lakefrontdigital.io, at 1440, 1280, 768, 390 and 360px wide. Production runs current `main`, including the 92f8dd1 phone and tablet fixes. The local database still has an older homepage, so I didn't use it.

## Design health score

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | Focus, menu and scroll states are clear. But three of the four "Book a consultation" buttons land at the top of /consultation, about 1,060px above the form. |
| 2 | Match system / real world | 2 | Abstract marketing copy ("Empower…", "This environment is designed to…") and tool names a small-business owner can't decode (NGINX caching, New Relic, DDoS). |
| 3 | User control and freedom | 3 | Escape and the close button return focus. The phone menu stays open after a tap outside it. |
| 4 | Consistency and standards | 3 | One label goes to two places (`/consultation` and `/consultation#enquiry`). A "Start a project" eyebrow sits over a "Book a consultation" button. |
| 5 | Error prevention | 3 | No inputs on the page. The risk is the wrong route: project intent goes to the consultation, and nothing says the first consultation is free. |
| 6 | Recognition rather than recall | 3 | "Start a project", the email address and the phone number appear only in the footer. |
| 7 | Flexibility and efficiency | n/a | Marketing page, so not applicable. A skip link and Cmd/Ctrl+K search exist. |
| 8 | Aesthetic and minimalist design | 3 | The visuals are disciplined but the copy is padded: the goal strip repeats the lead, the steps are bare titles, and there are six equal service cards. |
| 9 | Error recovery | n/a | No inputs or error states on this page; the forms are on /consultation and /contact. |
| 10 | Help and documentation | n/a | Marketing page, so not applicable. Search and footer contact details exist. |
| **Total** | | **20/28 (71%)** | **Good, at the bottom of the band** |

**Cognitive load:** 2 of the 8 checks fail (chunking and minimal choices), which counts as moderate load. The one decision point with more than four options is the services grid: six equal "Learn more" cards with no recommended path.

## Design specificity verdict

**Design review.** The visual system is clearly Lakefront's: the navy hosting section with the crest watermark, teal eyebrows with coral dots, the Chicago L at night, and coral buttons with navy labels.

The layout and copy, though, follow a stock agency template:
- a tagline hero and tool chips;
- a feature section and four icon steps;
- a 3×2 grid of icon cards, each with "Learn more";
- an About section beside a photo of someone at a laptop;
- a closing photo banner (the CTA band).

None of the six headlines says anything only Lakefront could say: "Transform Your Online Presence", "Tailored to Deliver Exceptional Results", "Your One-Stop Solution". Swap the logo and colours and an agency in any city could ship it. The hosting status card is the one design element that is unmistakably Lakefront's.

What's missing is what PRODUCT.md says sets Lakefront apart:
- what happens after launch;
- the three ways in: a new site, a WordPress site someone else built, or an app;
- one accountable person;
- national reach: "Chicago" appears once, in the eyebrow, and nothing says Lakefront takes clients anywhere in the US.

**Detector.**
- **Source scan:** 0 findings across `index.astro`, the layouts and the components. A test file with known problems did produce findings, so the clean result is genuine.
- **Scans of the rendered live page:** 10 findings at 1280, 6 at 390 and 12 at 768, covering 12 distinct elements. There were no advisories.
  - `kicker-above-heading` (6 eyebrows), `hero-eyebrow-chip` (the hero eyebrow, at 1280 only) and `icon-tile-stack` (the 4 step tiles) are false positives, because DESIGN.md sanctions both patterns. They still support the verdict above: all six sections open with the same eyebrow-then-heading stack, and the "Hosting and E-commerce" eyebrow just repeats its own heading.
  - `line-length` (2 findings, both About paragraphs) is **real, and the design review missed it.** When the About section stacks to one column (960px and below), its paragraphs have no width cap. They run about 96 characters per line at 768 and 117–121 at 960 (`site.css:31`, `site.css:110`). The CTA band already caps its stacked text at 60ch.
  - The false positives from earlier runs (side-tab, the eyebrow-list clip, the "cyan gradient" scrim and the "dark glow" shadow) did not come up.

**Visual overlays: none.** The only connected Chrome runs on a remote Windows machine, which can't reach this machine's local helper. The skill also doesn't support injecting its overlay into a deployed site, so the rendered scans ran in local headless Chromium and there is no overlay tab to look at.

## Overall impression

The page is well built but sells the wrong thing. It's fast and accessible, it holds together at every width, and the hosting section is excellent. But the copy is interchangeable agency language. The core offer, looking after the site after launch, is never put into words, and the second way in, "Start a project", exists only in the footer. The biggest opportunity is to write the hero, the About section and the CTA band the way the hosting section already shows the service.

## What's working

1. **The hosting section and its status card.** They show the machinery instead of promising it: real tools in label-and-value rows, and an honest "Uptime target 99.9%". Because the section comes second, the core offer is on screen early. It's the model for the rest of the page.
2. **A disciplined, accessible system.**
   - There is one coral action per screen, with a navy label at 5.0:1 contrast.
   - The CTA band's eyebrow holds at least 5.0:1 against its photo at 1440.
   - All 24 keyboard stops show a focus ring, and the skip link works.
   - The page works without JavaScript and has no layout shift.
   - Cached pages arrive in about 44ms.
3. **The main button is on the first screen at every width** (at 574px down at 1280, 529 at 390, 560 at 360). On phones the two hero buttons stack as one choice, cards put the icon beside the title, and the CTA band moves its photo above the text so the text sits on solid navy.

## Priority issues

**1. [P1] The page sells a "one-stop" agency, not the ongoing relationship.**
- **What:**
  - The H1 is the tagline, "Empower Your Business Online with Lakefront Digital", and its teal highlight falls on the company name rather than a promise.
  - "One-stop solution" appears twice: in the goal strip under the hero and as the closing headline.
  - The page's 415 words never say "after launch", "look after", "existing site", "take over" or "migrate".
  - The hosting section's lead opens "This environment is designed to…".
- **Why it matters:** PRODUCT.md says success means long-term hosting and management clients, and that this is the edge. A visitor comparing Lakefront with a freelancer or a DIY builder never reads the one thing that's different, and the page ends on the framing the positioning has moved past.
- **Fix:**
  - Lead the hero with a promise only Lakefront makes, such as "We build, host and look after small-business websites", with the teal on "look after".
  - Keep the tagline in the footer, where it already appears, or in the eyebrow.
  - Have the lead name the three ways in.
  - Rewrite the hosting section's lead as the routine, in plain English and from the published stack: daily Jetpack backups, New Relic monitoring with 24/7 alerts, and Cloudflare in front.
  - Replace "Your One-Stop Solution" with a closing line about the relationship, and drop the goal strip.
  - All of this is CMS copy, so it needs your approval.
- **Command:** /impeccable clarify

**2. [P1] "Start a project" has no button on the page, and the CTA band labels a consultation as a project.**
- **What:**
  - `/contact` is the second main conversion, and its "Is your site on WordPress?" question is built for taking over an existing site.
  - The page links to it once, in the footer at the very end. It isn't in the hero, any section, or the phone menu (Services, Hosting, Book a consultation).
  - The CTA band's "START A PROJECT" eyebrow sits over a "Book a consultation" button. This was left open in the 09-29 round.
- **Why it matters:** Someone with an existing site that needs a host is the core-offer visitor, and no button matches their situation. "Website Consultation" sounds like analysis and planning, not "take my site off my hands".
- **Fix:**
  - At minimum, make the band's eyebrow match its button.
  - Better, give the band a second, ghost-style "Start a project" button linking to `/contact#enquiry`. `CtaBand.astro` takes only one action today, so this needs a new block version, with its renderer shipped first.
  - Use the hosting section's second link, currently "E-commerce solutions", for it too, and consider adding it to the main menu.
- **Command:** /impeccable layout

**3. [P1] Nothing reassures the visitor at the point of booking, and no person is shown.**
- **What:**
  - "Free" appears nowhere on the homepage, /consultation or /contact, even though the first consultation is free.
  - Nothing near a button says who replies, or how.
  - The About section is "a technology company…" copy beside an unnamed person at a laptop (`window.jpg`, also the /consultation hero image). Visitors can't tell whether that's the founder, an employee or a stock photo.
- **Why it matters:** One accountable person is a founder-run business's strongest asset, and the page hides it. Company-voice copy next to an unnamed person also drifts toward implying a team.
- **Fix:**
  - Put "Your first consultation is free. We reply by email." under the hero and band buttons.
  - Keep "free" off the full Website Consultation until PRODUCT.md's open question about its price is settled.
  - Rewrite About around one accountable person, based in Chicago and working with clients across the US.
  - Use a name or photo only if you supply them. Otherwise use a Chicago or lake photograph.
- **Command:** /impeccable clarify

**4. [P2] "Book a consultation" makes visitors click twice.**
- **What:** The hero, steps and CTA band buttons link to `/consultation`. That lands at the top of the page under another "Book a consultation" button, with the form 1,059px down at 1440 (1,166px at 390). Only the header button and the phone menu link to `/consultation#enquiry`, the destination PRODUCT.md specifies.
- **Fix:** Point those three CMS links at `/consultation#enquiry`.
- **Command:** /impeccable polish

**5. [P2] On phones, the middle of the page is a long, generic stretch.**
- **What:**
  - At 390px the page is 7,774px tall, 9.2 screens for 415 words.
  - After the steps button there are 3,700px (4.4 screens) with no booking button. That's because the header button leaves the bar at 1080px and below (`site.css:329`), which is by design.
  - The six service cards take up 1,544px, with fragment copy such as "Increase traffic, brand visibility, and leads/sales."
  - The steps are four titles with no explanation.
- **Fix:**
  - Replace the six cards with three cards, one for each visitor's situation: a new website; your WordPress site, looked after; apps and other platforms. Link each to `/contact?service=<slug>#enquiry`. Alternatively, group the services as Build, Run and Grow, with hosting first.
  - Give each step one sentence.
  - Add a booking button after the About section.
- **Command:** /impeccable distill

## Persona red flags

- **Jordan, a first-time visitor:**
  - Fails the 5-second test: neither the H1 nor the lead says whether Lakefront builds sites, hosts them or does marketing.
  - Meets NGINX, New Relic, "CDN and DDoS protection" and Let's Encrypt with no explanation.
  - Can't tell whether booking is free, how long it takes or who it's with.
  - After clicking, is asked to "Book a consultation" again.
- **Riley, who tests edge cases:**
  - The same label leads to two destinations, and "START A PROJECT" leads to a consultation.
  - The "ONLINE" badge on "yourbusiness.com" looks like a live monitor but is static.
  - "Automated backups" undersells the published "daily Jetpack backups".
  - Tabbing backwards leaves the top 40px of the first service card under the sticky header.
  - In Windows high-contrast mode the header wordmark turns navy on black and nearly disappears.
- **Casey, on a phone:**
  - The first screen has no image; the photo starts 927px down.
  - About 4.4 screens pass with no booking button.
  - The three-link menu has no "Start a project" and no tap-to-call; the phone link is at the very bottom.
  - After the hero button, the form is still 1,166px down.
- **"Dana", whose WordPress site was built by a freelancer who then disappeared** (from PRODUCT.md's audience):
  - Nothing says "we'll take over and look after your existing site".
  - The hosting section reads like a new "environment", not a move.
  - The form built for this case is a footer link.
  - "CHICAGO" above a skyline, with no mention of clients across the US, suggests a local-only business.
- **"Morgan", who runs an app on another platform:**
  - "Comprehensive WordPress Hosting…" reads as WordPress-only.
  - "Efficient application deployment" is one checklist line in the About copy.
  - PRODUCT.md lists the app stack and routine as unwritten, so this case needs content from you first.

## Minor observations

- **Tablet line length (found by the detector only):** the About paragraphs run 96–121 characters per line at 768–960px. Cap them at about 65 characters, as the CTA band does.
- **High-contrast logo:** the header wordmark `<img>` has no high-contrast-mode version (`Logo.astro:26`).
- **Focus under the sticky header:** there's no `scroll-padding-top`. This partial overlap doesn't fail WCAG 2.4.11 at AA, but it's a one-line fix.
- **Phone menu:** it doesn't close on an outside tap. `header.ts:43-50` closes only the dropdowns.
- **Hero layout at desktop:** the H1 runs to 4 lines in a 489px column at 1280 and 1440, and at 1280×800 the fold cuts off the "Built on" strip.
- **Headline style:** the headings are Title Case keyword strings ("…for Small Businesses" twice), while the rest of the interface uses sentence case.
- **Page title:** the `<title>` is just "Lakefront Digital", and the meta description is the generic lead.
- **Entrance fade:** the 360ms fade on `main` makes Chrome report the header button or the wordmark as the largest paint, not the hero.
- **Uncached load time:** an uncached page takes 1.7–1.9s to start arriving (cached: 44ms). This was already on the audit list.

## Questions to consider

- If the status card is the most Lakefront thing on the page, why does a visitor see a skyline and a tagline first? What if the hero showed the machinery?
- Someone's WordPress site was built by a freelancer who vanished. Which button on this page is theirs?
- What would the About section say if the one person who answers the email wrote it?
- Would three cards for three visitor situations sell better than six service cards?
- Why does the page end on "one-stop solution" when the edge is what happens after launch?
