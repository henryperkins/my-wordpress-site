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

## The 100 budget is verified

[Cloudflare documents a maximum of 32 Worker invocations per request](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/#limits),
with each service-binding call counting towards it. The first version of this
workaround assumed that covers bridge calls and capped the budget at 30.

It doesn't. On 2026-09-29 the budget was raised to 100 and tested in production.
An admin action of about 51 bridge calls (the backfill start of the since-removed
registry `ai-search` plugin) returned 200. Workers Logs showed no "Too many
subrequests" or ROUTE_ERROR events.

## Which plugins this covers

Only the sandboxed registry plugins: Cloudflare Email Sending and Webhook
Notifier. Site search uses the first-party `aiSearch()` plugin in
`astro.config.mjs`, which runs in the site Worker rather than the sandbox, so
this budget doesn't apply to it.

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
