# UI remediation — 30 September 2026

All seven findings from the 29 September review and its content follow-ups were repaired and verified on `https://lakefrontdigital.io`.

| Finding | Released behavior |
| --- | --- |
| F1: Unreadable enquiry errors | Dedicated message nodes preserve icons, readable wrapping and accessible descriptions. The first invalid field receives focus and is brought into view immediately. Failure/retry retains entered values. |
| F2: Booking reloads an unfinished form | The CMS booking destination is `/consultation#enquiry`. On the consultation page the header renders `#enquiry`, preserving tracking/error query parameters and entered details, including without JavaScript. |
| F3: Three prominent mobile booking actions | The collapsed header contains the full logo, search and menu. Booking is an ordinary menu link; the page owns the primary coral action. |
| F4: Consultation content and form buried | The concise Website Consultation explanation and action precede the mobile photograph. The request form follows the summary, before preparation tips. Unavailable white-paper cards were removed. |
| F5: Services hidden in a sideways strip | A labelled native selector exposes all six services on small screens. Selection, desktop tabs and URL anchors remain synchronized; panels stack without JavaScript. |
| F6: Search descriptions repeat headings | Full-text results use useful published summaries/excerpts when snippets repeat the title. Text and highlights are safely rendered; redundant descriptions are omitted. |
| F7: Duplicate/stale AI results | Results are canonicalized and deduplicated, then checked against bounded queries for current published CMS content. Titles/descriptions come from those live records. Failed verification returns an unavailable response rather than stale content. |

Five CMS pages were updated and published: Home, Services, Hosting, Website Consultation and Contact. Team claims now use the founder-run business voice, uptime is described as a target, and consultation keywords no longer advertise missing white papers. The owner confirmed there are no hosting customers or support destination yet, so the returning-customer support item was removed. PRODUCT.md, DESIGN.md and the fresh-install seed reflect these decisions. Blog/article outlines remain drafts.

The search index contained 19 documents: seven production records and twelve records whose IDs exactly matched the local development seed database. The twelve foreign records were backed up, removed, and the search cache purged. The index now contains seven completed production records. The existing `remoteBindings: false` safeguard remains in place. See [search implementation and safeguards](plugin-ai-search.md).

## Verification

- `pnpm typecheck`: 63 files, zero errors/warnings/hints.
- `pnpm test`: 22 search regression tests passed, including stale/draft metadata, publication states, canonical URLs, unsafe snippets, bounded lookups and error responses.
- `pnpm build`: passed. The existing large-chunk build advisory remains; this work did not change dependencies used by the public runtime.
- Seed validation passed; all eleven block types have renderers.
- 42 Playwright tests passed against the built local preview and again against the live site, using Chromium and WebKit. Coverage includes form errors, failure/retry/reset, mobile navigation, same-page booking with query parameters, desktop/mobile service controls and no-JavaScript behavior.
- An independent reviewer confirmed the final focus behavior in sixteen browser/width/form/motion combinations and booking draft retention in eight browser/width/JavaScript combinations.
- Eighteen live route/viewport scans at 390px and 1440px reported no automated accessibility violations, horizontal overflow or page-script errors. Routes: home, Services, Hosting, Consultation, Contact, Terms, Privacy, search, and the 404 page.
- Additional local checks covered 320px and 768px widths, reduced motion, error-state accessibility, no-JavaScript search and menu focus. The service selector was independently checked through 1440px, including both sides of the navigation breakpoint.
- Live AI queries for hosting and link building returned unique published destinations, all HTTP 200. The live modal showed current descriptions, no draft article, and restored focus after Escape. Five referenced production assets matched local build hashes.
- Enquiry requests were intercepted in browser tests; no test emails were sent. An actual invalid ordinary form POST was checked locally and returned the expected 303 redirect. Real email delivery, physical iPhones and VoiceOver were not tested.

## Release and recovery

Deployed on 30 September 2026 at 03:11 UTC:

- Worker version: `f7ffebe6-a3a5-4f53-b05b-8d05b29197bc`, confirmed active at 100%.
- Previous Worker version: `e0bc55db-2825-41f8-b226-a745279f9946`.
- Working branch: `codex/ui-remediation`, based on `6edff518ba5df5701283965409541a02334f1328`, which includes the preceding deployed audit fixes.
- Implementation checkout: `/home/ubuntu/my-wordpress-site-ui-remediation`. The initial Worker deployment preceded Git integration. This change records the deployed implementation, regression tests and supporting guidance for integration into `main`; pre-existing local files were backed up before synchronizing the primary checkout.
- CMS revisions remain available. Full before/proposed/published snapshots, the previous deployment, removed index metadata and content, test logs, screenshots and asset hashes are saved in `/tmp/lakefront-ui-remediation-2026-09-30/`. These are local evidence files, not production assets.

Worker rollback and CMS rollback are separate operations. Restore page/menu values from the before snapshots through EmDash if content rollback is required; do not restore the foreign development documents to the search index. No database schema, plugin sandbox, email binding or production dependency upgrade was made.
