# Temporary EmDash plugin sandbox workarounds

Prepared on 2026-09-29 for EmDash and `@emdash-cms/cloudflare` 1.0.1. There are
two: a larger subrequest budget for sandboxed plugins, and repairs for registry
plugins whose admin pages EmDash rejects (see "Admin page repairs" below).

Retained for the 2026-10-07 upgrade to EmDash and `@emdash-cms/cloudflare`
1.2.0. The installed integration still does not pass configurable sandbox
limits to the runner, and the upstream fixes below have not shipped in the
installed registry plugins. The production verification recorded here remains
specific to 1.0.1; the follow-up verification below records the 1.2.0 checks.

The Cloudflare runner defaults to 10 subrequests per plugin invocation. EmDash
1.0.1 does not pass resource limits when it creates the runner, so raising the
parent Worker's `limits.subrequests` does not change that plugin budget.

`astro.config.mjs` points to `src/lib/plugin-sandbox.ts` using an absolute path,
because EmDash imports the runner from a generated virtual module. The adapter
delegates to the installed Cloudflare runner with a 100-subrequest budget. It
preserves the remaining options, isolation, capabilities, and direct-network
restrictions. The `lakefront-subrequests-100-v1` isolate suffix prevents Worker
Loader from reusing a cached plugin with the previous limit. Bump the suffix if
the workaround's configuration changes.

Wrangler observability is enabled with a sampling rate of 1 so invocation logs
and plugin errors can be inspected after deployment.

## The 100 budget is verified

[Cloudflare documents a maximum of 32 Worker invocations per request](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/#limits),
with each service-binding call counting towards it. The first version of this
workaround assumed that covers bridge calls and capped the budget at 30.

It doesn't. On 2026-09-29 the budget was raised to 100 and tested in production.
An admin action of about 51 bridge calls (the backfill start of the since-removed
registry `ai-search` plugin) returned 200. Workers Logs showed no "Too many
subrequests" or ROUTE_ERROR events.

## Which plugins this covers

All sandboxed registry plugins, including audit-log and the installed but inactive
Cloudflare Email Sending, Webhook Notifier and Publish Check plugins. Site search
uses the first-party `aiSearch()` plugin in
`astro.config.mjs`, which runs in the site Worker rather than the sandbox, so
this budget doesn't apply to it.

## Admin page repairs

Since EmDash 0.39, the host validates what a sandboxed plugin's `admin` route
returns. One invalid block replaces the whole admin page with "Plugin responded
with 502: INVALID_BLOCK_RESPONSE". Two registry plugins from EmDash's own
publisher have never matched the Block Kit types:

- Webhook Notifier 0.2.2: its button uses `text` instead of `label`, and its
  banners use `text`/`style` instead of `title`/`variant`. The settings page
  fails. Fixed upstream in [#3362](https://github.com/emdash-cms/emdash/pull/3362),
  merged on 2026-10-06 and included in npm 0.2.3. The registry still advertises
  0.2.2 as of 2026-10-07; the installed bundle does not contain the fix.
- audit-log 0.2.2 (and 0.2.3 on npm): its table uses camelCase keys (`pageActionId`,
  `nextCursor`, `emptyText`, `blockId`), so Audit History fails. Its "Load more"
  handler also passes the whole `value` object on as the cursor. Reported as
  [#3616](https://github.com/emdash-cms/emdash/issues/3616).

`src/lib/plugin-admin-compat.ts` fills in a missing field from its old spelling,
and `plugin-sandbox.ts` applies it to `admin` route responses only. Valid
responses pass through unchanged. A camelCase table's page action gets a
`lakefront-compat:cursor:` prefix, and the matching "Load more" request reaches
the plugin with the raw cursor as `value`, which is the shape audit-log reads.

Not repaired in the installed 0.2.2 bundle: Webhook Notifier's dashboard widget
stays empty, because its handler answers `widget:webhook-status` but the manifest
declares `status`. npm 0.2.3 repairs this too. Webhook Notifier is inactive on
Lakefront because no destination was configured.

Publish Check 0.3.0 is also inactive. Its default blocking policy misses the
site's `summary` description, custom `lf_*` block links and legal `body` field.
An offline run of its actual bundle rejected all eight copied CMS pages for
missing descriptions and internal links. Keep it inactive until its inspector
matches this content model; warn mode avoids cancellation but retains false
findings. Its settings and reports pages make 16 and 18 bridge reads, so they
also need the larger sandbox budget if the plugin is enabled later.

CMS email now uses the native `cloudflareEmail()` provider and `CMS_EMAIL`
binding. Like native AI Search, it runs in the site Worker and does not use this
sandbox budget. See the CMS email configuration in `README.md`.

Verified on 2026-09-29:
- The plugins' production bundles were run against the 1.0.1 validator.
- A local `astro dev` run went through the Cloudflare runner, with both plugins
  installed from the registry. Without the repair, both pages returned 502;
  with it, they returned 200.
- Audit History paged to its last page.
- Webhook Notifier saved its settings and ran Test Webhook.

## Follow-up verification on EmDash 1.2.0 — 2026-10-07

Worker version `09ec6d05-0544-49f3-a401-8a84b8d73370` includes the native
`cloudflareEmail()` configuration and separate `CMS_EMAIL` binding. The native
email and AI Search plugins and registry audit-log remain active. The old
registry email provider, unconfigured Webhook Notifier and Publish Check are
inactive.

The native email provider was selected through the normal CMS settings API.
One test to the owner's verified address returned success, and the production
Worker logged a completed send through Cloudflare Email Sending with a message
ID. Inbox receipt has not been independently confirmed; Cloudflare's message
status lookup returned `message_not_found`. The old registry plugin's saved
plaintext API token was removed, with a database read confirming zero copies
under that option key. The shared deployment credential was not revoked.
The enquiry binding and existing Google Workspace MX configuration were retained.

An authenticated browser rendered the production dashboard, its Recent Activity
widget, Email Settings and Audit History. All six existing audit rows rendered
at 1440px and 390px without page overflow; the mobile table scrolls within its
container. The browser used a local proxy carrying the existing owner OAuth
credential to the production admin APIs; this did not exercise a fresh sign-in.

The six live audit records fit on one page. A read-only browser fixture split the
first response after two real records and supplied the cursor returned by the
production history API with `limit=2`. Clicking **Load more** sent that cursor
through the production adapter and plugin; the server returned 200 with the
remaining four records, which rendered with no further paging button. This
checks the paging request and response path without adding production records;
it does not establish behavior with a naturally full 50-record page.

The installed registry bundles were also checked offline against the 1.2.0
Block Kit validator. The audit and webhook repairs remain necessary, and the
Publish Check findings above use copies of existing CMS content. These offline
checks do not reproduce Worker Loader resource limits.

Node 24 unit tests (23), typecheck (63 files, zero errors, warnings or hints) and
the build passed. The production browser suite passed all 42 Chromium/WebKit
tests in a full serial run. An earlier run had one WebKit enquiry test time out
before submission; its targeted rerun and the final full run passed without a
code change. Enquiry submissions were intercepted throughout; only the single
authorized CMS email test reached a mail provider.

## Sending subdomain follow-up — 2026-10-07

CMS mail now sends from `welcome@webmail.lakefrontdigital.io`, with replies to
`hello@lakefrontdigital.io`. Cloudflare lists the sending subdomain as enabled
and its email DNS as `ready`. The native provider and `CMS_EMAIL` sender
restriction agree on that address. Enquiries keep their existing root-domain
sender and fixed destination.

The tested build was deployed without rebuilding as Worker version
`7da34d05-7238-4a86-99b9-88f45c100c28`. A single CMS test returned 200 and a
completed-send log from that version. Cloudflare's stored message preview
confirmed the actual From, Reply-To, recipient and subject headers. Inbox
receipt and a fresh magic-link sign-in were not independently exercised.

All 25 DNS records matched the before-deployment snapshot after the change,
including the root `smtp.google.com` MX. Email Routing remains disabled. The
existing owner account's email, admin role and passkey record also matched
before and after; the sender change does not move the receiving inbox.

All 23 unit tests, typecheck and build passed. The site returned 200. This was
a sender configuration change; the browser evidence above belongs to the
earlier deployment. No Cloudflare API token was added to CMS settings or source.

## Verify after deployment

1. Confirm the active deployment uses this build and has observability enabled.
2. Check delivery records before retrying an email test: a plugin route can
   complete its side effect and then fail while preparing the response.

Local builds and mocked Loader checks do not reproduce Cloudflare's production
resource limits and are not evidence that these production checks have passed.

## Remove the workaround

Track [EmDash PR #3383](https://github.com/emdash-cms/emdash/pull/3383). Once a stable
release includes a working configurable budget, verify the option survives the
Astro configuration/virtual-module path, upgrade, restore `sandboxRunner:
sandbox()`, and remove the local adapter. Use the released option for the chosen
budget and verify the resulting isolate configuration and live plugin behavior.
Keep observability enabled.

Remove the admin page repairs once fixed releases of both plugins are installed:
Webhook Notifier with #3362, and an audit-log release that fixes #3616. Delete
`src/lib/plugin-admin-compat.ts` and the `withAdminCompat` wiring in
`plugin-sandbox.ts`. Then open both admin pages and check Workers Logs for
"invalid Block Kit content".
