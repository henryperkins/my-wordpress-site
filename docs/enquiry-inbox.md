# Lakefront enquiry inbox

`@emdash-cms/plugin-forms` 0.2.9 runs natively in the site Worker. The adapter in
`src/lib/forms-plugin.ts` retains the official Forms admin pages, submissions
management, CSV/JSON export and Recent Submissions widget. Its first activation
creates `lakefront-project-enquiry` and `lakefront-website-consultation` using
insert-only writes. Existing definitions and submissions survive deployment and
reactivation.

## Public submission path

The CMS-owned `lf_enquiry` blocks keep their existing fields, choices and copy.
They post to `POST /api/enquiry`, which:

1. Keeps the existing normalization, validation and `company_site` honeypot.
2. Uses the request-scoped database, including EmDash's anonymous middleware path.
3. Checks that Forms and the destination inbox are active.
4. Saves a new submission before sending through `ENQUIRY_EMAIL`.
5. Returns the existing JSON response or ordinary form-post 303 redirect.

The native adapter removes Forms' stock public `submit` and `definition` routes,
its Portable Text block and its Astro component registration. There is no second
anonymous endpoint, file-upload path or public form embed. Forms editor changes
affect inbox definitions; they do not change a Lakefront page block. Field rules,
spam settings, notification recipients, autoresponders and webhooks in the Forms
editor do not control `/api/enquiry`. That endpoint retains Lakefront's existing
validation, honeypot, sender, recipient and visitor Reply-To.

## Delivery and retries

**Email notification** in submission details records `Sending`, `Sent` or
`Failed`. `Sent` means provider acceptance, not proven recipient delivery.

An opaque UUID and a hash of the normalized enquiry identify a submission.
Enhanced forms retain the UUID through retries and rotate it for a new enquiry.
Without JavaScript, a failed return URL carries the UUID back to its hidden
field. The key is not authentication and grants no read access. Changed details
or a new key create a separate enquiry.

Insert-only and revision-fenced writes prevent concurrent requests from claiming
the same send and preserve owner triage changes. The adapter also replaces the
stock admin update handler with revision-fenced writes, so an owner edit cannot
restore an old delivery state over an accepted send. A failed mail attempt retains
the enquiry and can be retried. A recorded successful send is never automatically
repeated. If the Worker ends after provider acceptance but before recording it,
the enquiry stays `Sending`; inspect delivery logs before manually handling it.
Provider errors can themselves be ambiguous, so exactly-once email is not
guaranteed. Mail acceptance followed by an acknowledgement-write failure returns
success, logs the issue and leaves the saved record for review.

Submission counters are updated after persistence without overwriting current
form settings. Counter failures are logged and do not discard enquiries.

## Inbox operations

Open **Forms** in the admin, then choose **Submissions** for the relevant form.
Submissions can be marked read, starred, annotated, archived or exported.
Pausing a managed form stops new submissions for that destination.

The official 0.2.9 inbox displays the newest 50 matching records without a paging
control. CSV and JSON export paginate through all matching records; select the
stored form in the admin, which supplies its actual ID. Exporting via the plugin
API should likewise use the actual ID, not a slug alias.

The upstream inbox has a cramped mobile split view: opening details collapses
the adjacent submissions list at narrow widths. Details remain readable; return
to the list before choosing another record, or use a wider screen.

Initial definitions use no additional notification recipients, daily digest,
autoresponder or webhook. The existing enquiry email remains the single immediate
notification. Retention defaults to `0` (no automatic deletion); choose a policy
in Forms settings when the business retention period is decided. The existing
scheduled Worker handles Forms' weekly cleanup if retention is later configured.
The adapter grants only `email:send`, with no wildcard network or media-write
capability. Additional visitor IP, user-agent, referer and country metadata is
not collected by the enquiry integration.

## Verification

Run `pnpm test` on Node 24, `pnpm typecheck`, `pnpm build`, and
`pnpm exec playwright test --workers=1` against a populated local instance.
Browser tests intercept mail submissions. Exercise the real local endpoint with
Wrangler's email simulation to verify persistence, duplicate retries, the
honeypot, invalid fields and the ordinary 303 path. No production binding should
be used during these checks.

After deployment, verify Forms is active, both definitions exist, the inbox
loads while signed in, private routes reject anonymous access, and the stock
submit route is absent. A single marked live test can verify saved data and
provider submission; inspect its stored delivery state and logs before retrying.
Cloudflare Email Routing and Google Workspace DNS are unrelated to this inbox
and need no changes.
