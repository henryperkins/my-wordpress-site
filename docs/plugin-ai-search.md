# Public search results

The site uses the native `aiSearch()` plugin from `@emdash-cms/cloudflare` 1.0.1. Keep its `AI_SEARCH` binding, `emdash-ai-search` instance, and URL templates in `astro.config.mjs`. The public endpoint adds a publication check after the native plugin responds; it does not replace the plugin or its indexing hooks.

The September 2026 UI review found duplicate destinations and a draft article returning 404. Investigation found documents from a local development database in the same search instance as the production documents. Preserve `adapter: cloudflare({ remoteBindings: false })`: local seed content must not be indexed into the production namespace. Removing stale index items is a separate operational repair, and is insufficient by itself to protect later responses.

`src/lib/search-results.ts` checks successful responses before the modal receives them:

- Accept only supported local page and article destinations. Canonicalize `/home` to `/` and retain the highest-scoring hit for each destination.
- Query only candidate slugs in `pages` and `posts`, with `status: "published"`. Each collection query is limited to 50 entries, with at most three cursor pages. Missing, draft, archived, scheduled and future-published entries are excluded. A published entry with a scheduled future revision keeps its current live content.
- Replace the index title, description and ID with fields from the current published entry. Page descriptions use `summary`; article descriptions use `excerpt`. Index descriptions and images never cross this boundary.
- Treat query errors and incomplete or repeated pagination as unavailability, returning 503 without stale results. Preserve native request-validation, disabled-plugin and provider-error responses. Every POST response uses `Cache-Control: no-store`.

EmDash 1.0.1's collection loader applies the explicit published filter to the live collection fields and excludes deleted rows. It does not overlay preview revisions on a collection result, including during an authenticated edit request. `getEmDashEntry()` is preview-aware and is intentionally not used here. This contract was checked in the installed `src/query.ts`, `src/loader.ts` and `src/database/dialect-helpers.ts`, alongside the live [querying documentation](https://docs.emdashcms.com/guides/querying-content/) and [content lifecycle reference](https://docs.emdashcms.com/reference/content-lifecycle/). Recheck it before upgrading EmDash.

The destination parser follows this site's current flat page slugs and `/blog/{slug}` article routes. Extend it deliberately when introducing nested page slugs or translated route prefixes. It rejects external URLs, query strings, fragments, reserved routes and encoded path separators; it does not issue HTTP requests to candidate destinations.

`/search` uses the same publication check. A native snippet that only repeats its heading falls back to the published summary/excerpt, or is omitted when no useful description exists. Text and search highlights are rendered as Astro text nodes and `<mark>` elements, rather than inserting CMS text as HTML. Successful search pages retain a one-minute edge lifetime and collection cache tags; query failures show an unavailable state with status 503 and no storage.

Run the focused regression suite with Node 24:

```bash
node --test tests/search-results.test.ts tests/search-public.test.ts
```

It covers safe excerpts, canonical duplicates, publication states, current metadata, candidate restrictions, bounded work, pagination and error preservation. The local development server can verify full-text rendering and the native empty/invalid/unavailable request paths. Successful AI retrieval needs either controlled response fixtures or live verification because remote bindings are disabled locally. Build and typecheck remain required before release.
