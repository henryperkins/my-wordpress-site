# Temporary EmDash plugin sandbox workaround

Prepared on 2026-09-29 for EmDash and `@emdash-cms/cloudflare` 1.0.1.

The Cloudflare runner defaults to 10 subrequests per plugin invocation. EmDash
1.0.1 does not pass resource limits when it creates the runner, so raising the
parent Worker's `limits.subrequests` does not change that plugin budget.

`astro.config.mjs` points to `src/lib/plugin-sandbox.ts` using an absolute path,
because EmDash imports the runner from a generated virtual module. The adapter
delegates to the installed Cloudflare runner with a 30-subrequest budget. It
preserves the remaining options, isolation, capabilities, and direct-network
restrictions. The `lakefront-subrequests-30-v1` isolate suffix prevents Worker
Loader from reusing a cached plugin with the previous limit. Bump the suffix if
the workaround's configuration changes.

Wrangler observability is enabled with a sampling rate of 1 so invocation logs
and plugin errors can be inspected after deployment.

## Remaining limits

[Cloudflare documents a maximum of 32 Worker invocations per request](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/#limits).
The host and one plugin leave at most 30 bridge calls. Other plugin invocations
and callbacks in the same request share this ceiling, so 30 is an upper bound,
not a guaranteed budget for every plugin. This platform limit has not been
experimentally tested on this site.

The production investigation supplied for this change found that AI Search
needs 11 settings reads before it can proceed. Its settings page, search, and
publish indexing should fit within 30 calls when invoked alone. These outcomes
still need verification after deploying the workaround.

The same investigation estimates 35–40 calls for saving AI Search settings and
excessive calls for larger reindex operations. A save can persist values before
the response fails: reload and inspect them before retrying. Backfill can make
partial progress across cron runs. These paths need batched settings/storage
access in the plugin; the adapter does not repair them or supply credentials.

## Verify after deployment

1. Confirm the active deployment uses this build and has observability enabled.
2. Open installed plugin admin pages and inspect their API responses and logs.
3. Observe several cron invocations for evidence that the old 10-call cutoff is
   gone, while distinguishing missing credentials and shared-budget failures.
4. Enter AI Search credentials through its authenticated settings page. If saving
   errors, reload and verify the saved state before repeating the operation.
5. Verify search and indexing with a controlled item after credentials are set.
6. Check delivery records before retrying an email test: the prior 10-call limit
   could let the email send and then fail while preparing the response.

Local builds and mocked Loader checks do not reproduce Cloudflare's production
resource limits and are not evidence that these production checks have passed.

## Remove the workaround

Track [EmDash PR #3383](https://github.com/emdash-cms/emdash/pull/3383). Once a stable
release includes a working configurable budget, verify the option survives the
Astro configuration/virtual-module path, upgrade, restore `sandboxRunner:
sandbox()`, and remove the local adapter. Use the released option for the chosen
budget and verify the resulting isolate configuration and live plugin behavior.
Keep observability enabled.
