# EmDash upgrade work order

This file is the handoff for upgrading the project at `/home/ubuntu/my-wordpress-site` to the npm `latest` release. The updater resolved the direct packages, changed and installed them where needed, refreshed the project EmDash skills, and compared the installed core migration manifests. It did not edit application code, apply a database migration, or deploy the site.

## Package changes

- `@emdash-cms/cloudflare`: `1.3.0` → `1.4.0` (`^1.3.0` → `^1.4.0`)
- `@emdash-cms/plugin-forms`: `0.2.10` → `0.2.12` (`0.2.10` → `0.2.12`)
- `emdash`: `1.3.0` → `1.4.0` (`^1.3.0` → `^1.4.0`)

## Release entries to assess

These are the complete authored major, minor, and patch entries crossed by the direct EmDash packages in this project. Changesets dependency-bump entries and attribution wrappers have been removed. Check whether each entry affects code or configuration in this project. Do not adopt an unrelated feature merely because it appears here.

### Change 1

Applies to: `@emdash-cms/cloudflare@1.4.0` (patch)  
Source: [#4186](https://github.com/emdash-cms/emdash/pull/4186)

Fixes the Cloudflare image endpoint (`/_image` for EmDash media URLs) holding the R2 object read open after it answers with `304 Not Modified`, answers a `HEAD` request for a file it serves without transforming, or fails to transform an image.

### Change 2

Applies to: `@emdash-cms/cloudflare@1.4.0` (patch)  
Source: [#4281](https://github.com/emdash-cms/emdash/pull/4281)

Fixes sandboxed plugins with the `email:send` capability being unable to send mail on Cloudflare Workers. `ctx.email.send()` could reject with "Email is not configured" even though a host email provider was configured and the host's own emails were delivered.

### Change 3

Applies to: `@emdash-cms/cloudflare@1.4.0` (patch)  
Source: [#4278](https://github.com/emdash-cms/emdash/pull/4278)

Fixes `sandbox()` turning off sandboxed plugins in projects that have a `cloudflare.config.ts` (the config file used by `@astrojs/cloudflare` 15). When that file exists in the project root, `sandbox()` now selects the Worker Loader runner without reading any Wrangler config and without requiring `wrangler` to be installed. Add the binding with `LOADER: bindings.workerLoader()` under `worker.env`. If it is missing, EmDash logs a warning when the Worker starts instead of during the build.

### Change 4

Applies to: `@emdash-cms/cloudflare@1.4.0` (patch), `emdash@1.4.0` (patch)  
Source: [#4394](https://github.com/emdash-cms/emdash/pull/4394)

Fixes sandboxed plugin `ctx.taxonomies` mutations (`createTerm()`, `addEntryTerms()`, and `removeEntryTerms()`), `ctx.content.create()`, versioned content actions (`getVersioned()`, `publish()`, `unpublish()`, `schedule()`, `unschedule()`, `getTrashedVersioned()`, and `restore()`), and `ctx.comments.setStatus()` on Cloudflare when requests run across multiple Worker isolates. Content creation consistently uses runtime validation and hooks and preserves `translationOf` links instead of falling back to a plain database insert.
  
  Runner-created invocations without a content-create callback now receive `Content creation is not configured` rather than a database insert that bypasses runtime behavior. `createPluginTestHost()` supplies a database-backed callback with content-handler validation so transport-level tests can continue creating content and linked translations without starting the full EmDash runtime. It preserves the transport host's support for `data.slug` and `data.status`.
  
  Await these operation promises before returning from a plugin route or hook. Their RPC connection now lasts only for that invocation; unlike the previous loopback binding, it cannot support work that outlives the invocation.
  
  Publication after-hooks remain deferred. Same-entry actions attempted while an after-hook is running can return `CONTENT_ACTION_REENTRANT`; faster callback routing can expose this overlap in tests that assumed hooks had already finished. In runtime-host tests, call `await host.waitForDeferredTasks()` after an action before inspecting its after-hook effects or starting another action on the same entry. This method waits for queued deferred runtime work, including work those tasks enqueue; it does not run future scheduled tasks or wait for arbitrary unawaited plugin operations.

### Change 5

Applies to: `@emdash-cms/cloudflare@1.3.1` (patch)  
Source: [#4234](https://github.com/emdash-cms/emdash/pull/4234)

Fixes imports of `d1()`, `r2()`, `kvCache()`, and other config descriptors when `wrangler` is not installed. Wrangler is now an optional peer dependency and is only loaded when calling `sandbox()`. Projects using `sandbox()` must still install `wrangler`.

### Change 6

Applies to: `@emdash-cms/plugin-forms@0.2.12` (patch)  
Source: [#4377](https://github.com/emdash-cms/emdash/pull/4377)

Fixes embedded forms resetting custom submit button labels to "Submit" after successful or failed submissions.

### Change 7

Applies to: `@emdash-cms/plugin-forms@0.2.12` (patch)  
Source: [#3373](https://github.com/emdash-cms/emdash/pull/3373)

Editors can now view forms and all their submissions instead of seeing "Failed to load forms" or "No forms yet". The webhook URL stays hidden from them, and changing or deleting forms and submissions, and the export, stay admin-only. When a role still cannot read forms, the pages and the Recent Submissions widget now say so, and a write action that returns 403 shows a permission message instead of doing nothing.

### Change 8

Applies to: `@emdash-cms/plugin-forms@0.2.12` (patch)  
Source: [#4294](https://github.com/emdash-cms/emdash/pull/4294)

Hides submitters' IP addresses, user agents and referers from Editors. The `submissions/list` and `submissions/get` routes now return them to Admins only; the admin UI never showed them.

### Change 9

Applies to: `@emdash-cms/plugin-forms@0.2.12` (patch)  
Source: [#4144](https://github.com/emdash-cms/emdash/pull/4144)

Fixes form notification emails so that replying to one reaches the person who submitted the form. Instant notifications now set Reply-To to the address entered in the form's email field; before, a reply went to the site's sender address. The daily digest is unchanged. Reply-To is only set when the address is a plain, valid email: forms without an email field, submissions that leave it empty, or addresses like `"Name"<someone@example.com>` send notifications without a Reply-To, as before. On sites that set `replyTo` on the Cloudflare email provider, replies to these notifications now go to the visitor instead of that address. The site's email provider plugin must deliver `replyTo` (see the `email:deliver` hook).

### Change 10

Applies to: `@emdash-cms/plugin-forms@0.2.12` (patch)  
Source: [#4345](https://github.com/emdash-cms/emdash/pull/4345)

Fixes required select fields without a default value preselecting their first option, so visitors must now pick an option before the form submits. The empty first option shows the field's `placeholder` when one is set.

### Change 11

Applies to: `@emdash-cms/plugin-forms@0.2.12` (patch)  
Source: [#4295](https://github.com/emdash-cms/emdash/pull/4295)

Fixes the Submissions page sometimes showing the submissions or load error of an earlier selection after switching forms or the status filter while the list was still loading. The Recent Submissions widget now says "Failed to load submissions" when the submissions request fails with a network error.

### Change 12

Applies to: `@emdash-cms/plugin-forms@0.2.12` (patch)  
Source: [#4078](https://github.com/emdash-cms/emdash/pull/4078)

Fixes the `FormEmbed` textarea so it starts empty instead of containing indentation from the component source. Previously the caret began on a second line, an untouched `required` textarea passed the browser's validation, and the stray whitespace also surrounded a configured default value and returned after a successful submit reset the form.

### Change 13

Applies to: `@emdash-cms/plugin-forms@0.2.11` (patch)  
Source: [#4249](https://github.com/emdash-cms/emdash/pull/4249)

Fixes conditional form fields remaining visible when their condition is false on sites using the forms plugin's default stylesheet.

### Change 14

Applies to: `@emdash-cms/plugin-forms@0.2.11` (patch)  
Source: [#4247](https://github.com/emdash-cms/emdash/pull/4247)

Fixes single `checkbox` fields so the input keeps its intrinsic width and sits next to its label, instead of stretching to full width and pushing the label away.

### Change 15

Applies to: `@emdash-cms/plugin-forms@0.2.11` (patch)  
Source: [#4248](https://github.com/emdash-cms/emdash/pull/4248)

Fixes single checkbox fields so a checked box is stored as `true` when the default submitted value is `"1"`. Required checkbox fields that are not checked are still rejected during validation.

### Change 16

Applies to: `emdash@1.4.0` (minor)  
Source: [#3856](https://github.com/emdash-cms/emdash/pull/3856)

Adds `admin.hiddenNavItems` to hide built-in admin areas a site doesn't use. Set it to any of `calendar`, `media`, `comments`, `menus`, `redirects`, `widgets`, `sections`, `bylines`, and `import`, for example `admin: { hiddenNavItems: ["comments", "redirects"] }`. Hidden areas disappear from the sidebar and the command palette. On the dashboard, listing `media` hides the Upload Media button, and listing `calendar` keeps the Scheduled count but removes its link to the calendar. The pages and API routes stay reachable for users with the required role. An unknown name fails the build.

### Change 17

Applies to: `emdash@1.4.0` (patch)  
Source: [#4364](https://github.com/emdash-cms/emdash/pull/4364)

Fixes translating a menu on Cloudflare D1, which failed for larger menus and left an empty translated menu behind. On D1, translating or deleting a menu and reordering or replacing its items now either save completely or leave the menus unchanged.
  
  #### What should I do?
  
  If translating a menu failed before, delete the empty translated menu it left behind, then translate the menu again.

### Change 18

Applies to: `emdash@1.4.0` (patch)  
Source: [#4167](https://github.com/emdash-cms/emdash/pull/4167)

Fixes extra database round trips on `getEmDashEntry` and `getEmDashCollection` for sites that register byline custom fields or have entries with an author but no explicit byline credit. These reads now resolve bylines from the content query itself and load custom-field values in one batched step, instead of re-reading every entry's credits. On Cloudflare D1, a page that reads a few entries saves two to six sequential queries.

### Change 19

Applies to: `emdash@1.4.0` (patch)  
Source: [#4287](https://github.com/emdash-cms/emdash/pull/4287)

Fixes expired OAuth tokens and unused login codes from `emdash login` and MCP clients staying in the database forever. Scheduled cleanup now deletes them after they expire.

### Change 20

Applies to: `emdash@1.4.0` (patch)  
Source: [#4286](https://github.com/emdash-cms/emdash/pull/4286)

Fixes lost edits on D1, Durable Objects and PostgreSQL when two saves of the same entry, both based on the same version, arrive at once, for example from two MCP clients or from scripts using `emdash content update --rev`: both reported success, and the first was silently overwritten. The second save now returns `409 CONFLICT`, the same response a save based on an outdated version already gets.

### Change 21

Applies to: `emdash@1.4.0` (patch)  
Source: [#4459](https://github.com/emdash-cms/emdash/pull/4459)

Fixes `POST /_emdash/api/oauth/token` returning uppercase `INVALID_GRANT` for refresh-token and device-code failures. These responses now use the RFC-standard `invalid_grant` code so OAuth clients can recognize rejected grants and restart authorization.

### Change 22

Applies to: `emdash@1.4.0` (patch)  
Source: [#4243](https://github.com/emdash-cms/emdash/pull/4243)

Fixes Cloudflare-cached pages remaining outdated after content is deleted or unpublished. Pages using EmDash cache hints no longer send an automatic `Last-Modified` header, so Cloudflare stops answering `304 Not Modified` based on an entry timestamp that does not cover related lists or settings changes. This applies to entry, collection, publication-date, and reference-list hints. Sites using an object cache reload those content snapshots once after upgrading so cached validators from earlier versions are not reused.
  
  Taxonomy definitions and collection-to-taxonomy mappings also revalidate in the background after 30 seconds, so long-lived server processes pick up changes saved elsewhere without adding a blocking query to each render. A failed refresh retains the last good snapshot.
  
  #### What should I do?
  
  `cacheHint.lastModified` is no longer populated automatically. For an entry's displayed modification date, use `entry.data.updatedAt` instead; it is not a validator for the whole page.
  
  Pages relying on automatic validators also lose Astro's implicit `Cache-Control: no-cache` header. Set your own browser `Cache-Control` if you need a fresh check on every visit. If you want conditional requests, supply a custom `lastModified` hint to `Astro.cache.set()`. Its timestamp must advance whenever any part of the response changes, including settings, related entries, deletions, and unpublishes.

### Change 23

Applies to: `emdash@1.4.0` (patch)  
Source: [#4157](https://github.com/emdash-cms/emdash/pull/4157)

Fixes external auth providers, such as Cloudflare Access, writing the session store on every authenticated `/_emdash` request. EmDash now writes the session only when the signed-in user differs from the stored one, so sites on Cloudflare no longer spend one Workers KV write per request, which could exhaust the Workers Free plan's daily write limit and hit KV's one-write-per-second limit on a key for parallel requests.

### Change 24

Applies to: `emdash@1.4.0` (patch)  
Source: [#3192](https://github.com/emdash-cms/emdash/pull/3192)

Names media downloads after the file that was uploaded. The public media file route previously sent `Content-Disposition: attachment` with no `filename`, so browsers fell back to the last path segment of the URL and saved every PDF, DOCX or CSV under its storage key. The route now looks the original filename up by storage key and emits both the quoted ASCII `filename` and the RFC 5987 `filename*` form, so non-ASCII names survive.
  
  Media with no matching database row is served exactly as before, and a failed lookup never fails the download.

### Change 25

Applies to: `emdash@1.4.0` (patch)  
Source: [#3129](https://github.com/emdash-cms/emdash/pull/3129)

Fixes saving an entry turning an empty image or file field (`""`) into `{ "provider": "external", "id": "", "src": "" }`. A blank image or file field, or a blank image inside a repeater, is now saved as `null`, the canonical empty value. Entries with no image stop changing on every save after that.
  
  A required image or file field now returns a validation error for `""` instead of saving an empty image. This only affects API, MCP or import clients, because the admin never sends `""`.

### Change 26

Applies to: `emdash@1.4.0` (patch)  
Source: [#4296](https://github.com/emdash-cms/emdash/pull/4296)

Fixes media usage tracking in collections that have a reference field named `title` or `name`, where saving an entry recorded none of the images and files it uses. Saving now records them.
  
  #### What should I do?
  
  Entries in those collections that were saved before this release can still be missing from **Used in** after you upgrade. Open **Settings → Media usage tracking** and wait until it shows **Ready**. If it shows **Needs attention** instead, repair each affected collection once:
  
  ```sh
  npx emdash media repair-usage --collection <collection>
  ```

### Change 27

Applies to: `emdash@1.4.0` (patch)  
Source: [#4285](https://github.com/emdash-cms/emdash/pull/4285)

Fixes menus showing dead links to entries that are in the trash or not published. `getMenu()` leaves those items out. Any item `getMenu()` leaves out now takes its child items with it, instead of moving them to the top level of the menu. In edit mode, menus still link to unpublished entries. With the object cache enabled, a cached menu now refreshes when an entry or taxonomy term it links to changes.

### Change 28

Applies to: `emdash@1.4.0` (patch)  
Source: [#4365](https://github.com/emdash-cms/emdash/pull/4365)

Fixes creating a child menu item through the menu items API on PostgreSQL. A request with a `parentId` and no `sortOrder` failed; the item is now placed after its existing siblings.

### Change 29

Applies to: `emdash@1.4.0` (patch)  
Source: [#4208](https://github.com/emdash-cms/emdash/pull/4208)

Fixes content list search, in the admin and through the content list API's `q` parameter, failing when the collection has a reference field named `title` or `name`. The search now leaves out a reference field bound to a relation and matches the entry's other fields.

### Change 30

Applies to: `emdash@1.4.0` (patch)  
Source: [#4205](https://github.com/emdash-cms/emdash/pull/4205)

Fixes entry creation, entry saves and content-list search failing with `no such column` in a collection that has a reference field marked `searchable`. Adding such a field to a search-enabled collection failed, and after a seed turned search on, creating or saving any entry in that collection failed. Site search and content-list search now ignore the `searchable` flag on a reference field bound to a relation.
  
  #### What should I do?
  
  If creating or saving entries in a collection still fails after upgrading and the server log shows `no such column`, open the collection under **Content Types**, untick **Search** and save, then tick it again and save. This rebuilds the collection's search index.

### Change 31

Applies to: `emdash@1.4.0` (patch)  
Source: [#4386](https://github.com/emdash-cms/emdash/pull/4386)

Fixes entry slugs being generated from a field named `title` instead of the collection's configured title field. In a collection whose `titleField` is `name` and which also has a `title` field (a person's job title, say), typing in the editor now fills the slug from the name, and entries created through the API without a slug get one from the name too, so two people with the same job title no longer collide with `SLUG_CONFLICT`. Collections without a `titleField` keep the previous `title`, then `name`, order.

### Change 32

Applies to: `emdash@1.4.0` (patch)  
Source: [#4380](https://github.com/emdash-cms/emdash/pull/4380)

Fixes `emdash site import` failing with `COLLECTION_EXISTS` when manually deleted target collections still have media-usage cleanup pending. For these manually deleted collections, import now runs as many cleanup steps as the request budget allows, then imports the collection in the same request if enough budget remains. It waits for active deletion leases or retry delays before reusing a slug. Cancellation during this per-collection cleanup stops before importing the collection. Failed cleanup of a manually deleted collection includes recovery instructions, and collection schema error messages are preserved in status `errorDetail`.

### Change 33

Applies to: `emdash@1.4.0` (patch)  
Source: [#4276](https://github.com/emdash-cms/emdash/pull/4276)

Fixes site builds using `zustand/traditional` or other dependencies that default-import `use-sync-external-store` shims, which previously failed with a missing default export error.

### Change 34

Applies to: `emdash@1.4.0` (patch)  
Source: [#4396](https://github.com/emdash-cms/emdash/pull/4396)

Fixes keyboard navigation and entrance animations in the admin and visual editor's floating toolbars with Tiptap 3.20.3 and later. Escape closes image alt-text editing, Shift+Tab returns to the caption, and arrow keys move between toolbar controls again.

### Change 35

Applies to: `emdash@1.4.0` (patch)  
Source: [#3279](https://github.com/emdash-cms/emdash/pull/3279)

Fixes the visual editing toolbar's "Open in admin" so each entry gets its own admin window. The window name was a single constant shared by the whole site, so opening the admin for one entry navigated away from another already open in that tab. A repeat click on the same entry still reuses that entry's window.

### Change 36

Applies to: `emdash@1.4.0` (patch)  
Source: [#3596](https://github.com/emdash-cms/emdash/pull/3596)

Caches widget areas in the object cache. With an object cache configured, `<WidgetArea>`, `getWidgetArea()`, `getWidgetAreaWithCacheHint()` and `getWidgetAreas()` no longer query the database on each page load. Widget changes made in the admin, by seeding or by a site transfer invalidate the cached areas; code that writes the widget tables directly should call the new `invalidateWidgetObjectCache()` export.

### Change 37

Applies to: `emdash@1.4.0` (patch)  
Source: [#3890](https://github.com/emdash-cms/emdash/pull/3890)

Fixes importing WordPress custom post types with a hyphen in their name (such as `team-member`) through the EmDash Exporter plugin. The import created the `team_member` collection but then failed every entry with `Collection "team-member" does not exist`, and custom taxonomies for that post type were not linked to the collection. The review step now shows the collection the import will use and recognizes it on a repeated import, so field type conflicts with it are reported. The `wxrSource` import source now suggests the same valid collection names, such as `team_member` for `team-member` and `wp_content` for a post type named `content`.

### Change 38

Applies to: `emdash@1.3.1` (patch)  
Source: [#4069](https://github.com/emdash-cms/emdash/pull/4069)

Fixes sites on Cloudflare Workers in the default `auto` migration mode serving pages without their content, with a 200 status, after an upgrade whose migrations a request could not finish.
  
  Such a site now answers with a 503 response until its migrations are applied, so uptime checks notice it. A deployed Worker also no longer starts a migration that processes every entry and revision of a large site, such as the datetime normalization from 0.39.0; it answers with 503 until `emdash migrate` applies it.
  
  #### What should I do?
  
  If your site runs on Workers in `auto` mode and upgrades from 0.38 or earlier, run `emdash migrate` before you deploy, as described in [Apply large content migrations from the CLI](https://docs.emdashcms.com/deployment/core-migrations/#apply-large-content-migrations-from-the-cli).
  
  If a site answers with 503 after an upgrade, read the Worker log. When it names a pending migration, apply it with `emdash migrate`. When it reports a held migration lock, follow [Release a stuck migration lock](https://docs.emdashcms.com/deployment/core-migrations/#release-a-stuck-migration-lock).

### Change 39

Applies to: `emdash@1.3.1` (patch)  
Source: [#4226](https://github.com/emdash-cms/emdash/pull/4226)

Fixes purged pages being cached again with stale site settings, including SEO verification tags, titles, and logos, on sites with or without an object cache. Route-cache fills with an object cache read settings directly from the database. Without an object cache, responses using an outdated settings snapshot are kept out of the route cache, and the next render reloads the settings. Warm settings snapshots also revalidate in the background after 30 seconds, retaining the last good value if a reload fails.

### Change 40

Applies to: `emdash@1.3.1` (patch)  
Source: [#4180](https://github.com/emdash-cms/emdash/pull/4180)

Fixes `emdash login` and `emdash logout` ignoring `EMDASH_URL`. Without `--url`, they now use the site in `EMDASH_URL`, like the other commands, instead of always going to `http://localhost:4321`.

### Change 41

Applies to: `emdash@1.3.1` (patch)  
Source: [#4239](https://github.com/emdash-cms/emdash/pull/4239)

Fixes CLI commands failing behind Cloudflare Access once the EmDash access token saved by `emdash login` has expired. Refreshing the token now sends the custom headers from `--header`, `EMDASH_HEADERS` and `emdash login`, as every other request does. `EmDashClient` from `emdash/client` now also runs the `interceptors` you pass on its automatic token refresh request.

### Change 42

Applies to: `emdash@1.3.1` (patch)  
Source: [#4070](https://github.com/emdash-cms/emdash/pull/4070)

Fixes `createField` on D1 leaving a field in the schema without a backing column when the collection reaches the column limit. Failed fields can now be created after freeing a column, without a `FIELD_EXISTS` error.

### Change 43

Applies to: `emdash@1.3.1` (patch)  
Source: [#4161](https://github.com/emdash-cms/emdash/pull/4161)

Fix an issue where the redirect middleware would rerun a route and hide the original error when the route (or later middleware) threw. The catch block is now narrowed to the redirect lookup, so `next()` is called exactly once and route errors propagate to Astro. Failures during the middleware's own post-response work (404 logging and cache handling) are still caught and logged rather than propagated.

### Change 44

Applies to: `emdash@1.3.1` (patch)  
Source: [#4181](https://github.com/emdash-cms/emdash/pull/4181)

Fixes the admin dashboard showing the number of users to roles that cannot list users. The Users card, and `userCount` in the `GET /_emdash/api/dashboard` response, are now limited to Administrators.

### Change 45

Applies to: `emdash@1.3.1` (patch)  
Source: [#4170](https://github.com/emdash-cms/emdash/pull/4170)

Fixes `<Image>` from `emdash/ui` so images with a blurhash placeholder keep their focal point. The generated style previously omitted the separating semicolon between the placeholder background and `object-position`, which caused browsers to discard both declarations.

### Change 46

Applies to: `emdash@1.3.1` (patch)  
Source: [#4013](https://github.com/emdash-cms/emdash/pull/4013)

Fixes the admin login page so the help text under a provider's `LoginForm` is no longer hard-coded to "Enter your handle to sign in." for every provider.
  
  Providers can now export an optional `loginHelp` string or component from their admin entry. When `loginHelp` is absent, the page falls back to a neutral "Continue with {label}." message.
  
  The built-in AT Protocol provider keeps its handle-specific prompt and translates it using the admin's active locale. It requires `@lingui/react` as a peer dependency; if your package manager does not install peers automatically, install a compatible Lingui 5 version alongside the provider.

### Change 47

Applies to: `emdash@1.3.1` (patch)  
Source: [#4043](https://github.com/emdash-cms/emdash/pull/4043)

Fixes media previews and file downloads timing out on Node.js sites using S3-compatible storage, including Cloudflare R2, after repeated cache revalidation or HEAD requests.

### Change 48

Applies to: `emdash@1.3.1` (patch)  
Source: [#4024](https://github.com/emdash-cms/emdash/pull/4024)

Fixes `getEmDashCollection()` returning empty results when `where` or `orderBy` uses a custom field while migration `086_relations_structural` is pending. Reference fields become available on the next request after migrating, without waiting for the object cache to expire. Missing columns unrelated to caller fields are reported as collection-loading errors rather than filter warnings.

### Change 49

Applies to: `emdash@1.3.1` (patch)  
Source: [#4255](https://github.com/emdash-cms/emdash/pull/4255)

Fixes menu item create, update, and reorder requests accepting missing, cross-menu, or cyclic parents that can hide items from rendered menus. Invalid parent changes now return a validation error without changing the menu; reorder validation uses the final state of the batch.
  
  Unchanged parent links from older writes do not block label edits or reorders, so menus with legacy invalid data remain editable.

### Change 50

Applies to: `emdash@1.3.1` (patch)  
Source: [#4224](https://github.com/emdash-cms/emdash/pull/4224)

Fixes locale-aware queries when Astro locales use custom paths and codes, such as `{ path: "en", codes: ["en-US"] }`. Passing `Astro.currentLocale` to content, menu, taxonomy, and byline queries now matches rows stored under either the configured path or its codes. New writes use the path, while existing code-stamped rows keep their IDs, locale values, and associations. Reapplying seeds using either spelling reuses existing rows instead of creating duplicates.
  
  When both path- and code-stamped rows exist for the same slug or name, lookups and seed matching prefer the path, then codes in configuration order. Public content queries consider only published rows, so a draft path row does not hide a published code row. Existing rows are not merged or deleted: listings retain both, and row-ID lookups remain available. This read-side compatibility avoids a destructive data migration or manual renaming during upgrade.

### Change 51

Applies to: `emdash@1.3.1` (patch)  
Source: [#4229](https://github.com/emdash-cms/emdash/pull/4229)

Fixes repeated plugin storage index registration so unchanged declarations no longer rewrite the `_plugin_indexes` registry rows on every sync. This reduces background write traffic on D1 and other SQLite-backed deployments when index declarations have not changed.

### Change 52

Applies to: `emdash@1.3.1` (patch)  
Source: [#4220](https://github.com/emdash-cms/emdash/pull/4220)

Reduces database round trips for the `search()`, `searchCollection()`, and `getSuggestions()` helpers, including searches with no matches, to improve response times on Cloudflare D1. Empty or whitespace-only queries no longer query the database. Autocomplete also skips collections whose search indexes are missing.

### Change 53

Applies to: `emdash@1.3.1` (patch)  
Source: [#4201](https://github.com/emdash-cms/emdash/pull/4201)

Fixes captions being omitted from image field values and their generated TypeScript types. Image selection, content saves, and seed export/import preserve captions, including explicitly empty captions. Seed exports keep library defaults separately from per-use captions. Image and focal-point edits retain per-use captions unless the caption is explicitly edited. Templates should read the top-level `caption`; the legacy `meta.caption` alias stays consistent when present.
  
  For existing image fields whose captions were previously omitted, reselect the image or explicitly edit its caption, then save and publish the content entry. Upgrading alone does not fill captions into previously stored content values.

### Change 54

Applies to: `emdash@1.3.1` (patch)  
Source: [#4256](https://github.com/emdash-cms/emdash/pull/4256)

Fixes D1 parameter-limit errors when updating the status of up to 100 comments at once or saving content with more than 100 byline credits.

### Change 55

Applies to: `emdash@1.3.1` (patch)  
Source: [#4225](https://github.com/emdash-cms/emdash/pull/4225)

Fixes duplicate menu items and widgets when concurrent first requests apply the same seed through D1 bindings. Menu and widget replacements are atomic on D1 bindings, transactional SQLite, and PostgreSQL, so a failed replacement retains the previous items. This does not make replacements atomic on the Durable Object SQL backend.

### Change 56

Applies to: `emdash@1.3.1` (patch)  
Source: [#4221](https://github.com/emdash-cms/emdash/pull/4221)

Fixes the `Image` component from `emdash/ui` rejecting the `quality` prop during `astro check`. Quality now reaches both Astro image rendering paths and providers that support it, without leaking onto unoptimized `<img>` elements.
  
  Fixes EmDash's internal-media transforms on Cloudflare serving the full-size original for Astro quality presets or fractional and out-of-range numbers. Presets `low`, `mid`, `high`, and `max` map to 25, 50, 80, and 100; finite numbers are rounded and clamped to 1–100.

### Change 57

Applies to: `emdash@1.3.1` (patch)  
Source: [#4074](https://github.com/emdash-cms/emdash/pull/4074)

Fixes stale automatic slug-change redirects hiding new entries published at the old URL. Publishing an entry now removes the automatic redirect from its URL, so visitors can reach the new page.

### Change 58

Applies to: `emdash@1.3.1` (patch)  
Source: [#4179](https://github.com/emdash-cms/emdash/pull/4179)

Fixes Subscribers, and other users without `content:read_drafts`, seeing unpublished content through the content API and MCP tools. Asking for the terms or translations of a draft or scheduled entry now returns not found, and MCP `content_get` returns only the published version of an entry with unpublished changes.

### Change 59

Applies to: `emdash@1.3.1` (patch)  
Source: [#4203](https://github.com/emdash-cms/emdash/pull/4203)

Fixes pages that show categories, tags or term counts hanging with a 524 error for every visitor on a Cloudflare Workers isolate after one visitor disconnected while the isolate was loading taxonomy definitions or its list of collections.

### Change 60

Applies to: `emdash@1.3.1` (patch)  
Source: [#4106](https://github.com/emdash-cms/emdash/pull/4106)

Stop forcing `blank: true` on every new text link.
  
  TipTap's Link extension defaults `HTMLAttributes.target` to `"_blank"`. Because both the admin rich-text editor and the inline visual editor configured Link with only styling classes, the default survived deep-merge, so every link created with `setLink()` was serialized as `blank: true` and rendered with `target="_blank" rel="noopener noreferrer"`. Both editors now set `target: null` in their Link `HTMLAttributes`, so newly saved text links no longer open in a new tab unless an author explicitly chooses that option (available only for image links today).
  
  Existing content that already has `blank: true` is unchanged and will continue to open in a new tab.

### Change 61

Applies to: `emdash@1.3.1` (patch)  
Source: [#4207](https://github.com/emdash-cms/emdash/pull/4207)

Fixes edits disappearing after unpublishing an entry in a collection without revisions: the editor showed the previously published content after every save, and the next save wrote it back over the edits. Saves now keep the edits, including on entries unpublished before this release.

## Agent skills

The updater ran:

```sh
npx --yes skills@1.7.0 add emdash-cms/skills -y
```

Use the refreshed `upgrading-emdash` skill for this work order. If the skills command reported a conflict or failure, resolve that before continuing.

## Core database migrations

Installed EmDash changed from `1.3.0` to `1.4.0`.

No core migrations were added by this upgrade.

Build the upgraded project and inspect the exact database target:

```sh
pnpm build
pnpm exec emdash migrate --status
```

If the status reports pending migrations, stop before starting or deploying the upgraded application. Follow [Backups and recovery](https://docs.emdashcms.com/guides/backups/) to create a restorable recovery point. A JSON backup is not a recovery point. After a human has reviewed the target and backup, apply the pending migrations:

```sh
pnpm exec emdash migrate
```

The command shows the target and asks for confirmation. In a non-interactive shell, add `--expected-target-fingerprint` with the target fingerprint that the status command printed for the reviewed database.

Deploy the same build artifact with the project's deployment workflow, without rebuilding it. On Cloudflare Workers, run `wrangler deploy`.

Verify the deployed database against that artifact:

```sh
pnpm exec emdash migrate --check
```

## Verification

1. Assess every release entry above and make the project changes it requires.
2. Run the project's format, tests, typecheck, and build commands.
3. Inspect the migration target and pending names before applying them.
4. Verify the public site, admin sign-in, content editing, media reads, and encrypted plugin settings after deployment.
