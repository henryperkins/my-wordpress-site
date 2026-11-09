# Lakefront Digital — Design Review and Refinement Brief

**Updated:** October 11, 2026  
**Baseline:** The owner-supplied current-site image, Home-selection 2(1).png.  
**Status:** Current-site content reviewed; revised desktop concept generated and visually inspected. No website code, routes or infrastructure were tested.

## Revised recommendation

Keep the current site's actual offer: websites, managed hosting, apps on other platforms, and growth services. Preserve Chicago and service to small businesses across the US. Apply the calmer visual treatment from the earlier light concept to that offer.

The first refinement narrowed the business too far. Its WordPress-only eyebrow, three service routes and single generic contact action should not become the content specification. The new desktop refinement restores the four service routes, consultation/project distinction, hosting details and qualified uptime target.

Use a light canvas for the introduction and service selection, and a focused navy section for hosting and management. Keep the curling-wave identity, restrained lake imagery, navy/teal/foam palette and coral actions.

## Source register and evidence limits

| ID | Source | Role |
| --- | --- | --- |
| C1 | Home-selection 2(1).png | Owner-supplied image of the current website; authoritative content baseline for this design pass |
| S1 | Generated Image October 11, 2026 - 8_40AM.jpg | Earlier managed-services concept with simulated dashboard |
| S2 | Generated Image October 11, 2026 - 8_39AM.jpeg | Earlier dark homepage concept |
| S3 | Generated Image October 11, 2026 - 8_37AM.jpeg | Earlier multi-section collage |
| S4 | Generated Image October 11, 2026 - 8_24AM.jpeg | Visual research and design-system board |
| S5 | Generated Image October 11, 2026 - 8_24AM 2.jpeg | Earlier PacketFlow/digital-systems concept |
| S6 | deep-research-report 3.md | Proposed visual strategy, palette and logo architecture |

C1 was opened successfully. It is an 860 × 10,968-pixel RGBA PNG with substantial fully transparent areas. Approximately 58.7% of its pixels have zero alpha. The black visible behind some text in the image viewer is therefore not evidence that the website uses a black page background.

C1 establishes the current site's published descriptions as supplied by the owner. This review did not independently verify infrastructure configuration, operational coverage, achieved performance, booking behavior or project-intake behavior.

It is a selected page-content export. Missing navigation or footer content in the selection does not demonstrate that the website lacks those elements.

## Corrections to the initial review

| Earlier decision or concern | What the current-site source establishes | Corrected direction |
| --- | --- | --- |
| Omit the location pending evidence | The hero and About content identify Chicago and service across the US | Preserve Chicago and national service area. Utah County in the earlier concept conflicts with C1. |
| Center the website exclusively on WordPress and care | The site also offers app/platform deployment and growth services | Preserve the full service breadth. |
| Replace four service routes with three | Each of the four current routes corresponds to a stated offer | Retain all four. Ongoing care supports multiple routes instead of replacing app hosting and growth. |
| Avoid sending an inherited WordPress site directly to migration | Moving the site to managed hosting is explicitly the offer in that card | Preserve the migration route and its intended action. |
| Replace consultation and project intake with one generic action | The closing section explains the difference: discuss needs, or start with an already clear scope | Keep both, with primary/secondary hierarchy and an explanation near the controls. |
| Remove care cadence and provider details as ungrounded | C1 describes daily backups, continuous monitoring and named providers | Retain them as the current site's stated service descriptions. Do not recast monitoring as continuous human support. |
| Treat every 99.9% appearance as an implied historical result | C1 explicitly says “Uptime target” | Preserve the qualifier. It is not achieved uptime or an SLA guarantee. |
| Change current coral buttons from white to navy text | C1 already uses dark text on coral | Preserve this treatment. The earlier correction concerned generated concepts. |
| Interpret large black regions as page styling | Much of the PNG is transparent | Do not diagnose a dark-background contrast failure from this export. |

The original concern about S1 remains distinct: its “99.9% Uptime” display and undefined percentage speed metric are not the same as C1's explicitly qualified target.

## What the current site already communicates well

### A direct service promise

“We build, host and look after your website” is specific and understandable. Hosting is part of the central offer, not incidental implementation detail. The supporting paragraph makes clear that the business can work with new sites, inherited WordPress sites and apps.

### Four meaningful entry routes

| Current starting point | Source-described offer | Proposed concise heading | Action to preserve |
| --- | --- | --- | --- |
| No website yet | WordPress, WooCommerce where relevant, hosting and care | A new website or store | Plan a new site |
| A WordPress site someone else built | Move to managed hosting; take over updates, backups and monitoring | An existing WordPress site | Move your site to us |
| An app or a site on another platform | Deployment on managed infrastructure and ongoing operation | An app or another platform | Talk about your app |
| A site that needs more customers | SEO, content, social media and analytics | A site that needs more customers | See growth services |

These routes should remain visible in a refinement. A generic “Ongoing care” card does not cover the app or growth offers.

### A concrete consultation service

The consultation section already names four useful activities:

1. Website analysis.
2. Business planning.
3. Recommendations for the visitor's goals.
4. A growth roadmap.

Keep that substance. The design opportunity is to organize it more compactly and make its relationship to the consultation action clearer.

### A meaningful intake distinction

The closing section states that a visitor can book a free first consultation to discuss needs, or start a project when the need is already clear. Both lead to an email response according to the copy.

This is a legitimate reason for two actions. The improvement is to bring the distinction closer to the first pair of controls, where a visitor is making the choice.

### Personal accountability

The About section identifies Henry directly and explains that the person involved in the initial conversation remains the contact for the site. Preserve that accountability proposition.

When refining the wording, distinguish planning, technical direction, delivery coordination, diagnosis, review and ongoing responsibility from personally authoring all code. “Henry is your point of contact for planning, delivery, and ongoing care” expresses responsibility without that ambiguity.

## Remaining design opportunities

### 1. Move service selection earlier

In the supplied sequence, the visitor encounters the hero, hosting section and consultation explanation before the four starting-point routes.

Proposed sequence: hero, service selection, hosting/management, consultation, accountability, final intake.

This makes the app and growth paths discoverable before a long WordPress-hosting explanation. It is a design recommendation, not a measured conversion result.

### 2. Keep related hosting content together

The current export places a large gap between hosting actions and the example summary panel. Group the description, inclusions, actions and summary into a single connected section.

On desktop, use a content column with a nearby configuration summary. On mobile, stack the summary immediately after the actions. Avoid large fixed-height spaces.

The gap is observable in this export, but its cause is unresolved. It could reflect layout, a reserved asset area or export behavior. Inspect the actual rendered page before treating it as a confirmed CSS defect.

### 3. Preserve specificity while reducing first-screen jargon

Keep managed hosting prominent in the hero. Use the hosting section for the provider-level explanation.

A compact technology line can remain below the hero: WordPress · WooCommerce · AWS · Cloudflare. The detailed section can retain NGINX, Jetpack, New Relic and Let's Encrypt where they explain the actual offer.

The names are published service descriptions in C1; no infrastructure audit was performed.

### 4. Clarify the summary panel

C1's “yourbusiness.com” panel reads as an example configuration. Make that purpose explicit with an “Example hosting setup” label.

Keep “Uptime target — 99.9%.” Do not convert it to “99.9% uptime,” a historical measurement or “Always up.”

An “Online” badge is unnecessary in an illustrative panel because it can imply a live observation. A clean configuration summary communicates the service more accurately.

### 5. Resolve export gaps before diagnosing missing assets

The pale rounded block above the About section contains no visible portrait in the supplied image. This does not establish whether the live site has a broken asset, an intentionally blank slot or an export omission.

A future design can use a supplied real portrait or a text-led accountability section. Do not invent a founder photograph.

### 6. Consolidate the wave asset

The earlier concepts and generated refinements use related but different wave drawings. The new homepage should eventually reuse one canonical logo asset.

The research report's G-initial rationale remains incorrect: Lakefront Digital has L and D as initials. Preserve the wave as an abstract wave without assigning it an unrelated monogram meaning.

## Revised page and copy specification

This is proposed presentation of the current site's offer. It is not a claim that these routes or interfaces have been implemented.

### Header

Suggested navigation: Services · Hosting · Growth · About.

Primary action: **Book a consultation**.

The current image does not include a header, so this navigation is a proposed design addition to the concept, not a reconstruction of observed navigation.

### Hero

**Eyebrow**

CHICAGO · WEBSITES · HOSTING · GROWTH

**Headline**

We build, host and look after your website.

**Recommended supporting paragraph**

New websites, existing WordPress sites, and apps—hosted on infrastructure we manage. Updates, backups, and monitoring, from Chicago for small businesses across the US.

**Primary action**

Book a consultation

**Secondary action**

Start a project

**Helper copy near both actions**

First consultation free. Have a clear brief? Start a project. We reply by email.

An alternative, more explanatory version is: “Not sure what you need? Start with a free consultation. Already have a clear brief? Start a project. We reply by email.”

**Technology line**

WordPress · WooCommerce · AWS · Cloudflare

The revised raster study uses a shorter supporting line ending with “one point of contact in Chicago.” Keep the explicit national service area in the final text specification even if it appears elsewhere on the rendered page.

### Starting-point section

**Heading**

Where are you starting from?

| Title | Supporting copy | Action |
| --- | --- | --- |
| A new website or store | WordPress and WooCommerce, with hosting and ongoing care. | Plan a new site |
| An existing WordPress site | Move to managed hosting, with updates, backups and monitoring. | Move your site to us |
| An app or another platform | Deploy on infrastructure we manage and keep it running. | Talk about your app |
| A site that needs more customers | SEO, content, social media and analytics to help people find you. | See growth services |

Use a two-by-two arrangement on desktop and a single column on mobile. Each entry needs one clear action rather than several nested controls.

### Hosting and management

**Heading**

Your site, looked after every day.

**Supporting copy**

Managed hosting, WordPress updates, daily backups and round-the-clock monitoring.

**Source-described inclusions**

- Hosting on AWS.
- Cloudflare speed and protection.
- NGINX caching.
- Daily backups with Jetpack.
- 24/7 monitoring with New Relic.
- WooCommerce online stores.

**Actions**

View hosting details · Move your site to us

**Example summary**

| Field | Value |
| --- | --- |
| Label | Example hosting setup |
| Example domain | yourbusiness.com |
| Uptime target | 99.9% |
| SSL | Let's Encrypt |
| CDN | Cloudflare |
| Monitoring | New Relic · 24/7 |

Continuous monitoring does not mean continuous human availability. The design should preserve that distinction without adding a human-response promise.

### Consultation

**Heading**

Know where your site stands and what to do next.

**Action**

Book a consultation

| Activity | Supporting copy grounded in the current section |
| --- | --- |
| Website analysis | Review how the site looks, performs and gets found today. |
| Business planning | Work out what the site needs to do for the business. |
| Recommendations for your goals | Identify specific changes matched to those goals. |
| Growth roadmap | Explain what to do next and what can wait. |

### Accountability

**Heading**

One person, accountable for your site.

**Proposed supporting copy**

Lakefront Digital is run by Henry Perkins in Chicago. Henry is your point of contact for planning, delivery, and ongoing care, so the person you speak with at the start stays connected to the work.

Use actual project evidence and a real portrait if available. Explain Henry's role accurately rather than implying that every line of code was personally authored.

### Closing intake

**Heading**

Hand your site to someone who'll look after it.

**Supporting copy**

Book a free first consultation to talk it through, or start a project if you already know what you need. Either way, we reply by email.

**Actions**

Book a consultation · Start a project

## Design system to retain

### Color roles

| Role | Token |
| --- | --- |
| Light canvas | Foam White #F7FAF9 |
| Main text on light surfaces | Lake Navy #082A3A |
| Normal-size labels and links on light | Deep Water #075459 |
| Decorative teal and qualifying large display emphasis | Current Teal #278891 |
| Dark canvas | Lake Navy #082A3A |
| Main text on dark | Foam White #F7FAF9 |
| Links/supporting text on navy | Foam Aqua #73AFBC |
| Decorative dividers and pale surfaces | Lake Mist #C1DCE4 |
| Primary button background | Coral #F26B5B |
| Primary button label/arrow | Lake Navy #082A3A |

C1 already uses dark primary-button labels. Retain them.

### Token contrast

Calculated for opaque sRGB values from the research report, not against the transparent export:

| Foreground / background | Ratio |
| --- | ---: |
| Navy / Foam White | 14.26:1 |
| Deep Water / Foam White | 8.26:1 |
| Current Teal / Foam White | 3.99:1 |
| Foam Aqua / Navy | 6.12:1 |
| Navy / Coral | 5.01:1 |
| Pure White / Coral | 2.99:1 |
| Foam White / Coral | 2.84:1 |

Ordinary text needs 4.5:1; qualifying large text uses 3:1. Do not round a failing value upward. [W1]

Use Deep Water for ordinary light-surface links. Keep coral labels navy. Test hover/focus states as their own foreground/background pairs.

### Typography, spacing and imagery

Proposed targets:

- Manrope headings; Source Sans 3 body/UI.
- Desktop hero text around 64–76px; mobile around 38–42px.
- Readable body text around 18–20px desktop and 17–18px mobile.
- Body line height around 1.45–1.6.
- Desktop gutters approximately 64–80px; mobile around 24px.
- Primary controls approximately 48–52px tall.
- Keep “look after” together where the intended width allows; do not force desktop breaks at narrow widths.
- Use one deliberate lake image rather than a stack of devices and simulated dashboards.
- Use the wave at selected identity moments; keep service content and controls visually quiet.

The transparent source cannot establish contrast on the live page without knowing the background behind those pixels. Do not sample the viewer's black background as a site token.

## Mobile follow-through

The revised service structure should remain complete on mobile:

1. Service headline and explanation.
2. Consultation and project actions with their distinction.
3. Compact technology line.
4. All four starting-point routes.
5. Connected hosting details and example summary.
6. Consultation activities.
7. Accountability and final intake.

A shorter hero image is appropriate if needed to bring the service choices closer to the top. Preserve the app and growth routes during responsive adaptation.

The earlier generated mobile image demonstrates a useful reading order, but its WordPress-only copy and three-route concept are superseded. It should not be treated as the final content source.

Keyboard focus, menu behavior, accessible names, real hit areas and contact flows remain untested. Test reflow at 320 CSS pixels. [W5] The proposed larger main controls are a design target; WCAG's minimum target rule is 24×24 CSS pixels with defined exceptions. [W4]

## Verification and remaining work

### Completed in this update

- Opened and read the supplied current-site image.
- Inspected PNG dimensions, mode and alpha channel.
- Distinguished transparent export areas from actual dark section backgrounds.
- Reassessed the prior recommendations against the current offer.
- Restored four service routes, Chicago positioning, the intake distinction and named hosting details.
- Preserved the “Uptime target” qualifier.
- Generated and visually inspected a revised desktop homepage concept.
- Updated this existing review rather than leaving the original content assumptions in place.

### Revised visual check

The new concept visibly includes all four service routes, both intake choices, Chicago, the compact technology line, named hosting inclusions, a connected example panel and “Uptime target — 99.9%.” The primary controls use dark labels on coral, and no visible text clipping was found.

The national service area is explicit in this copy specification; the raster hero uses a shorter Chicago line. Logo geometry, exact fonts, exact rendered colors and all responsive/interactive states still need production assets and implementation checks.

### Unknown from the screenshot

- Whether the exported gaps exist in the rendered site.
- Whether the empty portrait-shaped region represents a live asset problem.
- The page's actual background behind transparent areas.
- Current navigation outside the selection.
- Actual consultation and project-intake destinations.
- Infrastructure deployment, monitoring coverage and operational performance.
- Achieved uptime or contractual commitments.

The screenshot is sufficient to ground a faithful design refinement. None of these unknowns requires removing the current service categories from the design.

## References

- C1: Owner-supplied Home-selection 2(1).png.
- S1–S6: Supplied concept images and research report listed above.
- [W1 — W3C text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [W2 — W3C non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- [W3 — W3C use of color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)
- [W4 — W3C target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [W5 — W3C reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
