# Temporary EmDash plugin sandbox workaround

Prepared on 2026-09-29 for EmDash and `@emdash-cms/cloudflare` 1.0.1.

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

## The 100 budget is an experiment

[Cloudflare documents a maximum of 32 Worker invocations per request](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/#limits),
with each service-binding call counting towards it. The first version of this
workaround assumed that covers bridge calls and capped the budget at 30
(host + plugin isolate = 2 invocations). That assumption was never tested.

The budget is now 100 to test it. Two outcomes:

- If the ceiling applies per bridge call, the 31st call throws a platform
  exception — the same ROUTE_ERROR surface as before, possibly with a new
  message. Nothing gets worse; restore 30 and treat plugin-side batching as
  the only fix.
- If it doesn't apply, AI Search admin flows fit: settings render ~26 calls,
  settings save ~39, backfill start/cancel ~39, reindex of this site's
  largest collection ~48.

## Plugin call counts (ai-search 0.5.0, from the deployed bundle)

- Settings page render: ~26 bridge calls (two 11-setting reads, backfill status)
- Save settings: 9–13 writes, then a full re-render → ~35–39 total. Writes run
  before the render, so a save persists even when the response fails — reload
  and inspect before retrying.
- Publish/save content hooks: ~15 calls — fit any budget ≥ 30.
- Cron backfill batch: ~5–6 calls per document → ~4–5 documents per run at 30,
  more at 100. Partial progress every minute; crash-safe and resumable.
- Manual drain and whole-collection reindex scale with document count; keep
  using cron backfill for those regardless of budget.

Note: `selectedCollections: []` means "all collections" for publish hooks but
an empty queue for backfill. Set e.g. `["posts","pages"]` for archive indexing.

## Verify after deployment

1. Confirm the active deployment uses this build and has observability enabled.
2. The decisive check for the 100 budget: save AI Search settings once.
   - Success (toast "Settings saved", no 400): the 32-invocation ceiling does
     not apply per bridge call; the higher budget stands.
   - The same "Too many subrequests" ROUTE_ERROR: unexpected — inspect logs.
   - A ROUTE_ERROR with a new platform message around the 31st call: the
     ceiling is real; restore 30 (`lakefront-subrequests-30-v1`) and rely on
     cron backfill + publish hooks until the plugin batches its calls.
3. If saving errors, reload and verify the saved state before repeating the
   operation — writes persist before the failing re-render.
4. To index the existing archive, set Indexed collections to `["posts","pages"]`,
   save, then Start backfill; the every-minute cron drains it in batches.
   Verify indexing with a controlled item afterwards.
5. Check delivery records before retrying an email test: a plugin route can
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
