# EmDash upgrade work order

This file is the handoff for upgrading the project at `/home/ubuntu/my-wordpress-site` to the npm `latest` release. The updater resolved the direct packages, changed and installed them where needed, refreshed the project EmDash skills, and compared the installed core migration manifests. It did not edit application code, apply a database migration, or deploy the site.

## Package changes

- `@emdash-cms/cloudflare`: `1.2.0` → `1.3.0` (`^1.2.0` → `^1.3.0`)
- `@emdash-cms/plugin-forms`: `0.2.9` → `0.2.10` (`0.2.9` → `0.2.10`)
- `emdash`: `1.2.0` → `1.3.0` (`^1.2.0` → `^1.3.0`)

## Release entries to assess

These are the complete authored major, minor, and patch entries crossed by the direct EmDash packages in this project. Changesets dependency-bump entries and attribution wrappers have been removed. Check whether each entry affects code or configuration in this project. Do not adopt an unrelated feature merely because it appears here.

### Change 1

Applies to: `@emdash-cms/cloudflare@1.3.0` (patch)  
Source: [#3886](https://github.com/emdash-cms/emdash/pull/3886)

Fixes sandboxed plugins' `ctx.media.readBytes()` calls failing with "Media storage is not configured" under concurrent requests on Cloudflare Workers with an R2 `MEDIA` binding. Sites without that binding continue to use the existing storage callback fallback.
  
  Updates `createPluginRuntimeTestHost()` to store media fixtures and uploads in its local R2 binding, so plugins can read their bytes through the production bridge.

### Change 2

Applies to: `@emdash-cms/cloudflare@1.3.0` (patch)  
Source: [#4047](https://github.com/emdash-cms/emdash/pull/4047)

Fixes the Playground toolbar covering the end of site pages on narrow screens. Site pages now leave room below their last content, so footer links and buttons such as the theme switcher can be scrolled clear of the toolbar and clicked.

### Change 3

Applies to: `@emdash-cms/cloudflare@1.3.0` (patch), `emdash@1.3.0` (patch)  
Source: [#4053](https://github.com/emdash-cms/emdash/pull/4053)

Fixes the `defaultRole` and `roleMapping` hover text for external auth providers and Cloudflare Access, which called role 30 "Editor" and role 40 "Developer". Role 30 is Author and can publish its own content, and role 40 is Editor. Only the descriptions and examples changed, not how roles resolve.
  
  #### What should I do?
  
  If you set `defaultRole` or a `roleMapping` entry to `30` because the hover text said Editor, check that Author access is what you meant. Use `20` (Contributor) for people who should not publish. The Access `defaultRole` still defaults to `30`.

### Change 4

Applies to: `@emdash-cms/plugin-forms@0.2.10` (patch)  
Source: [#3979](https://github.com/emdash-cms/emdash/pull/3979)

Fixes the daily digest. Creating a form with the digest on, or turning it on for an existing form, failed with an "Invalid task name" error, and a form created that way was saved with the digest on but never sent one. The digest is now scheduled, including for a duplicated form, and is rescheduled or cancelled when the form's digest settings change.

### Change 5

Applies to: `@emdash-cms/plugin-forms@0.2.10` (patch)  
Source: [#3031](https://github.com/emdash-cms/emdash/pull/3031)

Fixes duplicate element IDs when the same form is embedded more than once on a page. Field IDs were built from the form ID and the field name alone, so a form appearing in, say, a sidebar and a pop-up produced several elements sharing an ID: clicking a label focused the first copy rather than the one beside it, and anything resolving an ID — `aria-describedby`, a password manager, a test selector — reached the wrong instance. Each rendering now suffixes its IDs with a per-instance value, so labels, inputs and the honeypot stay paired within their own copy. Element IDs are not part of the plugin's API and nothing else references them; the client script scopes its lookups to the form element.

### Change 6

Applies to: `@emdash-cms/plugin-forms@0.2.10` (patch)  
Source: [#3032](https://github.com/emdash-cms/emdash/pull/3032)

Fixes embedded forms showing only the browser's validation bubble instead of the plugin's inline field errors. Native validation is turned off by the client script once it loads, so readers without JavaScript keep it.

### Change 7

Applies to: `emdash@1.3.0` (minor)  
Source: [#4117](https://github.com/emdash-cms/emdash/pull/4117)

Updates the visual-editing rich text editor's selection toolbar and slash menu to match the admin editor's.
  
  Selecting text now shows the admin's toolbar: a Turn into menu, link, bold, italic, underline, strikethrough, inline code, and a More menu with subscript, superscript, alignment, and Clear formatting. With the caret in a link, a bar shows where it goes, with buttons to edit or remove it, and clicking a link no longer opens it in a new tab. A typed bare domain such as `example.com` links to `https://example.com`, and a link the editor can't use is refused with a message.
  
  The slash menu now groups its commands, shows each one's Markdown shortcut and description, ranks matches as you type (`/bl` finds Bullet List), and finds Heading 4 to 6 by name. Headings 4 to 6 now show at their own size while editing instead of as Heading 1. Both menus follow the system's light or dark theme and stay readable in dark mode.

### Change 8

Applies to: `emdash@1.3.0` (minor)  
Source: [#4137](https://github.com/emdash-cms/emdash/pull/4137)

Adds an image picker and an image toolbar to the visual-editing rich text editor.
  
  Typing `/image` now opens a picker below the line instead of a full-screen dialog. It shows the media library nine images a page, newest first, with a tab for each media provider the site has set up. One click, or the arrow keys and Enter, inserts an image.
  
  The picker no longer uploads images. To use a new image, upload it to the media library in the admin first, then choose it with `/image`. When the library is empty, the picker links to the media library, which opens in a new tab.
  
  Images now show as they publish, with their alignment and a caption field right underneath. Selecting one shows a toolbar to replace it, edit its alt text, or delete it. Replacing an image keeps its caption and takes the new image's alt text.
  
  Typing `/image` now opens a picker only in the editor it was typed in, not in every editor on the page, and an inserted image no longer gets its file name as its alt text. An image inserted from a line inside a quote or list now goes after the quote or list; saving used to drop an image inside one.

### Change 9

Applies to: `emdash@1.3.0` (minor)  
Source: [#4068](https://github.com/emdash-cms/emdash/pull/4068)

Adds `emdash migrate --take-over-lock <id>`, which applies pending migrations under a stuck D1 migration lock without freeing it first. Releasing the lock with `--release-lock` and then running `emdash migrate` let a Worker in `auto` mode take the free lock in between, and the apply failed with a lock error.
  
  ```sh
  pnpm emdash migrate --take-over-lock 1788264000000
  ```
  
  Like `--release-lock`, it asks you to confirm the target, or needs `--expected-target-fingerprint` in a non-interactive shell.

### Change 10

Applies to: `emdash@1.3.0` (minor)  
Source: [#4136](https://github.com/emdash-cms/emdash/pull/4136)

Adds readable revision history to the content editor. Selecting a version in the **Revisions** panel shows it in place, read-only, with added text highlighted and removed text struck through in the color of the person who saved it. The selected version lists its changes in plain words, such as "Changed the title", and selecting one scrolls to it. **Restore** moves to a bar at the bottom of the editor, and a version that matches an earlier one is marked "Restored from" with that version's date. **Save** and **Publish** pause while a version is open. The panel no longer shows raw JSON.
  
  The revisions list API (`GET /_emdash/api/content/{collection}/{id}/revisions`) and the MCP `revision_list` tool include each revision's `author` as `{ id, name }`, or `null` when no author was recorded or the account no longer exists, so editors without access to user management can see who saved each version.
  
  `ContentEditor`'s `onRevisionRestored` callback can now return a promise. The restore stays pending until it settles, and the restore dialog shows the error if it rejects. When a host passes this callback, the restored version stays on screen until `item` carries the restored draft, and the writer can't go back to editing before then. The editor still refreshes the entry's `content` and `revisions` queries, so a host that reads `item` from the entry's `content` query needs no change. Other hosts must reload `item` from the callback.

### Change 11

Applies to: `emdash@1.3.0` (minor)  
Source: [#3623](https://github.com/emdash-cms/emdash/pull/3623)

Adds a **Disallow AI training** option to **Settings > SEO**. When it is on, `/robots.txt` disallows the AI training crawlers and opt-out tokens `Amazonbot`, `Applebot-Extended`, `Bytespider`, `CCBot`, `ClaudeBot`, `Google-Extended`, `GPTBot`, and `meta-externalagent`, and adds a `Content-Signal: search=yes, ai-train=no` line. Search engine access stays as your other rules define it. The rules are added to both the default and a custom `robots.txt`. The option is also available as `seo.disallowAiTraining` in the settings API and the MCP `settings_update` tool. It is off by default, so existing `robots.txt` output is unchanged.

### Change 12

Applies to: `emdash@1.3.0` (patch)  
Source: [#4034](https://github.com/emdash-cms/emdash/pull/4034)

Fixes `emdash whoami` failing on sites behind Cloudflare Access: it now sends the headers from `--header` and `EMDASH_HEADERS` and reads `EMDASH_URL`, like the other commands. Without a token on localhost, it now signs in through the dev bypass and reports the dev user, and exits 1 when no site answers or the site isn't running under `astro dev`, so scripts can use it as a reachability check.

### Change 13

Applies to: `emdash@1.3.0` (patch)  
Source: [#3955](https://github.com/emdash-cms/emdash/pull/3955)

Fixes `<CommentForm>` making right-to-left pages (`<html dir="rtl">`) about 10,000 pixels wider, with a horizontal scrollbar. This happened on every such page in Firefox, and in Chrome and Safari when the form or an element around it is positioned, for example with `position: relative`. On right-to-left pages, `<Comments>` now also indents threaded replies from the right, and the separator before a signed-in commenter's email in `<CommentForm>` no longer touches the email.

### Change 14

Applies to: `emdash@1.3.0` (patch)  
Source: [#3907](https://github.com/emdash-cms/emdash/pull/3907)

Reduces `getComments()` to a single database query when the approved comment list fits on one page.
  
  Pages rendering comments previously ran a `COUNT` query followed by the list query, even when the result was not truncated. `getComments()` now fetches the list first and derives the total from the returned rows whenever cursor pagination indicates there are no more pages, falling back to `COUNT` only for posts that exceed the page limit. Cache misses on sites without an object cache benefit most.

### Change 15

Applies to: `emdash@1.3.0` (patch)  
Source: [#4133](https://github.com/emdash-cms/emdash/pull/4133)

Fixes Contributors being unable to save changes to their own drafts. A Contributor could create an entry, but the next save, the entry lock, and setting categories or tags returned 403. Contributors can now edit their own entries while they are drafts, in the admin, the REST API, and the MCP `content_update` tool. They still cannot edit entries once they are published or scheduled, or publish them.
  
  The new `content:edit_own_drafts` permission grants this and is held by Contributor and every higher role. No other role's permissions change.

### Change 16

Applies to: `emdash@1.3.0` (patch)  
Source: [#3937](https://github.com/emdash-cms/emdash/pull/3937)

Fixes slower page loads for logged-out visitors on D1 with `session: "auto"` or `"primary-first"` and no `coalesce`. A session runs a request's queries one at a time, so EmDash's preload of site settings, menus, widget areas, and taxonomy terms for HTML pages delayed the page's own first query and added queries the page might never use. In that setup EmDash no longer preloads them; those queries run only when the page uses them. Sites with `coalesce: true` keep the preload, batched into one round trip.
  
  New Cloudflare sites from the templates now use `d1({ binding: "DB", session: "auto", coalesce: true })`, so reads issued together share one D1 round trip, with or without read replication. To get the same on an existing site, set `session: "auto"` (or `"primary-first"`) and `coalesce: true` in its `d1()` call; `coalesce` has no effect without a session. `coalesce` is experimental: a read and a write started together may run write-first, so await a read before a write that must not affect it.

### Change 17

Applies to: `emdash@1.3.0` (patch)  
Source: [#4171](https://github.com/emdash-cms/emdash/pull/4171)

Fixes the admin dashboard for users without `content:read_drafts`, such as Subscribers. Recent activity and collection counts now include only published entries, matching what these users can open elsewhere in the admin, and scheduled-publication policy notices are no longer shown to them. Contributors and above see the dashboard as before.

### Change 18

Applies to: `emdash@1.3.0` (patch)  
Source: [#4128](https://github.com/emdash-cms/emdash/pull/4128)

On sites that use a route cache such as Workers Cache, creating or duplicating an entry no longer purges cached pages. The new entry is a draft that no public page shows, so pages that list the collection stay cached until a later change to published content. This applies to `POST /_emdash/api/content/{collection}`, `POST /_emdash/api/content/{collection}/{id}/duplicate`, and the `content_create` and `content_duplicate` MCP tools. `content_create` with `status: "published"` still purges the collection and the new entry.

### Change 19

Applies to: `emdash@1.3.0` (patch)  
Source: [#4000](https://github.com/emdash-cms/emdash/pull/4000)

Fixes first-user passkey registration so the newly created Admin is authenticated immediately after registration verification. Clicking "Open the dashboard" now opens the dashboard instead of redirecting to the login page.

### Change 20

Applies to: `emdash@1.3.0` (patch)  
Source: [#4073](https://github.com/emdash-cms/emdash/pull/4073)

Fixes force-deleting a collection so it also removes the entries' records in shared tables: revisions, SEO data, comments, content bylines, taxonomy assignments, entry locks, and the revision prune queue. Previously these rows were left behind because only the content table, FTS table, and collection row were dropped.

### Change 21

Applies to: `emdash@1.3.0` (patch)  
Source: [#4045](https://github.com/emdash-cms/emdash/pull/4045)

Fixes site settings updates during a running export so the export's `write_epoch` bump happens inside the same transaction. If the export fence cannot record the write, the settings update now rolls back instead of committing invisibly to the export.

### Change 22

Applies to: `emdash@1.3.0` (patch)  
Source: [#3824](https://github.com/emdash-cms/emdash/pull/3824)

Fixes MCP `content_create` and `content_update` rejecting writes that omit a blocks field with "must be an array". A create that omits a blocks field treats it as empty, and an update keeps the stored blocks. Supplied non-array values are still rejected.

### Change 23

Applies to: `emdash@1.3.0` (patch)  
Source: [#3885](https://github.com/emdash-cms/emdash/pull/3885)

Fix plugin storage cursor behavior when the anchor row of an ordered page is deleted. `PluginStorageRepository.query()` now encodes scalar ordered field values into the cursor and compares subsequent pages against those values, so ascending walks no longer end early and descending walks no longer restart from the top. Cursors for non-scalar values (objects or arrays) or very long strings fall back to the anchor-row lookup used before this fix, keeping those pages working while still surfacing a clear invalid-cursor error when that anchor row has been deleted. Legacy cursors that do not contain the field values still work under the same fallback.

### Change 24

Applies to: `emdash@1.3.0` (patch)  
Source: [#3825](https://github.com/emdash-cms/emdash/pull/3825)

Fixes content writes to single-type blocks fields rejecting blocks that omit `_type`, including nested Markdown conversion over MCP and the TypeScript client. EmDash infers the only allowed type on ordinary writes; multiple allowed types, seed files, and stored blocks of a different type still require an explicit `_type`. Explicit invalid types remain errors.

### Change 25

Applies to: `emdash@1.3.0` (patch)  
Source: [#3942](https://github.com/emdash-cms/emdash/pull/3942)

Fixes the visual-editing rich text editor adding a revision to the entry's history every time it saves on blur. Its saves now replace the pending draft revision, like the admin editor's autosave.

### Change 26

Applies to: `emdash@1.3.0` (patch)  
Source: [#3982](https://github.com/emdash-cms/emdash/pull/3982)

Fixes new and changed redirects being ignored for pages already in the Workers Cache. Saving a redirect for an exact path now clears the cached page at that path.

### Change 27

Applies to: `emdash@1.3.0` (patch)  
Source: [#4102](https://github.com/emdash-cms/emdash/pull/4102)

Fixes the MCP `content_create` tool so it accepts optional `seo` and `publishedAt` fields and persists them in the same call. Agents no longer need to create a post and then call `content_update` just to set SEO metadata or backdate an item. `publishedAt` is gated behind the `content:publish_any` permission, matching the REST API and `content_update`.

### Change 28

Applies to: `emdash@1.3.0` (patch)  
Source: [#3791](https://github.com/emdash-cms/emdash/pull/3791)

Fixes two problems with number fields in the content editor. Clearing a number field now saves it as empty instead of `0`, which previously failed a field's minimum (such as `min: 1`) or silently stored zero. Decimal values such as `4.50` no longer block the Save button with the browser's "nearest valid values" message, while `integer` fields keep stepping in whole numbers.

### Change 29

Applies to: `emdash@1.3.0` (patch)  
Source: [#3202](https://github.com/emdash-cms/emdash/pull/3202)

Fixes full-text search so queries containing lowercase words like "and", "or", "not" or "near" are no longer parsed as FTS5 operators. This restores results for searches with possessive apostrophes and keeps prefix matching for those queries.

### Change 30

Applies to: `emdash@1.3.0` (patch)  
Source: [#4092](https://github.com/emdash-cms/emdash/pull/4092)

Fixes WordPress imports through the EmDash Exporter plugin losing Advanced Custom Fields values: a field stored on only one post was never created, and a repeater row that only one post had was lost. For ACF field groups assigned to a post type, the import now creates a field for every ACF field and stores selects, checkboxes, repeaters, groups, relationships and other structured values as JSON. Relationship, post object, user and taxonomy values that arrive as WordPress posts, users or terms keep only their IDs, so a related post's content and password or a user's password hash are not copied into EmDash. A collection from an earlier import keeps the fields it has, so its repeaters still arrive as one field per row and sub-field.
  
  #### What should I do?
  
  Running the import again skips entries that already exist, so if you imported ACF relationship, post object or user fields through the exporter with an earlier version, check those JSON fields for whole WordPress posts and users yourself.

### Change 31

Applies to: `emdash@1.3.0` (patch)  
Source: [#988](https://github.com/emdash-cms/emdash/pull/988)

Fixes MCP tool names for plugins with scoped IDs such as `@acme/calendar`: their tools are listed as `acme__calendar__<tool>`, which MCP clients accept. Update saved calls that use the old scoped names. Plugins with plain IDs keep their names, and the admin plugin list displays the generated names before consent.
  
  A plugin tool whose JSON Schema cannot be read no longer stops other tools from loading. Unreadable input schemas accept object inputs for route validation; unreadable output schemas are omitted. Duplicate generated names keep the first tool and log a warning instead of disabling the MCP endpoint.

### Change 32

Applies to: `emdash@1.3.0` (patch)  
Source: [#3584](https://github.com/emdash-cms/emdash/pull/3584)

Removes up to two database round trips from the first request after a cold start on sites with the plugin marketplace or registry enabled.
  
  With the sandbox disabled (`sandbox: false`), a failure to load the in-process plugin adapter now stops startup with an error instead of silently starting without any marketplace plugins, matching how sandboxed plugins listed in the integration config already behave.

### Change 33

Applies to: `emdash@1.3.0` (patch)  
Source: [#4005](https://github.com/emdash-cms/emdash/pull/4005)

Fixes server-rendered pages that inspect public plugin route metadata before dispatching, so logged-out visitors can load plugin data. Public metadata is available through `getPublicPluginRouteMeta` for both visitors and signed-in users. Private route metadata stays on the signed-in `getPluginRouteMeta` helper.

### Change 34

Applies to: `emdash@1.3.0` (patch)  
Source: [#2768](https://github.com/emdash-cms/emdash/pull/2768)

Fixes scheduled maintenance stopping after the initialization request in Cloudflare `astro dev`. EmDash now drives its own maintenance through a dev-only workerd route from the long-lived dev server, keeping plugin cron jobs, scheduled publishing, cleanup, and declared plugin storage index creation running between requests without invoking application-wide scheduled jobs. Also works with HTTPS dev servers, including self-signed certificates.

### Change 35

Applies to: `emdash@1.3.0` (patch)  
Source: [#3997](https://github.com/emdash-cms/emdash/pull/3997)

Fixes Astro's route cache, such as Workers Cache, storing a page at a redirect's source after the redirect was saved. A Worker isolate that had not yet reloaded its redirect rules could render the old page and the route cache kept it, even after the cached page was purged. Before the route cache stores a response, the redirect middleware now checks that its rules are current and answers with the redirect when they have changed. This costs one database read for each response the route cache stores; other responses are unchanged.

### Change 36

Applies to: `emdash@1.3.0` (patch)  
Source: [#4097](https://github.com/emdash-cms/emdash/pull/4097)

Fixes oversized plugin screenshots failing to load in the admin registry gallery with HTTP 413.
  
  The registry artifact proxy now requests the `feed_fullsize` image preset for screenshots instead of `feed_thumbnail`. This aligns the admin preview with the public plugin site and avoids the lossless upscaling that pushed modest source images over the 1 MiB proxy cap.

### Change 37

Applies to: `emdash@1.3.0` (patch)  
Source: [#4072](https://github.com/emdash-cms/emdash/pull/4072)

Fixes the datetime normalization migration taking hours on large Cloudflare D1 sites and starting over after every interruption. It now writes changed rows in batches, and running `emdash migrate` again after a failed write continues from the last written batch.

### Change 38

Applies to: `emdash@1.3.0` (patch)  
Source: [#4044](https://github.com/emdash-cms/emdash/pull/4044)

Fix saving a draft when retired fields remain only in the published content row. A full read-then-write update no longer fails validation for keys the entry already stores in its live data but that are absent from the current draft revision. Genuinely never-stored unknown keys are still rejected.

### Change 39

Applies to: `emdash@1.3.0` (patch)  
Source: [#3987](https://github.com/emdash-cms/emdash/pull/3987)

Fixes saves in the admin and through MCP reporting an error when the configured cache provider fails to purge, although the change was already saved. These saves now report success, and the failed purge is logged.

### Change 40

Applies to: `emdash@1.3.0` (patch)  
Source: [#3921](https://github.com/emdash-cms/emdash/pull/3921)

Fixes `emdash seed` to avoid leaking duplicate media rows and adds `--skip-media` for storage-less seeds.
  
  - `$media` references now deduplicate against existing ready media rows by content hash, so re-running `emdash seed ... --on-conflict=update` reuses the same rows instead of creating new ones each time.
  - New `--skip-media` flag resolves `$media` references to external URLs without downloading files or creating local `./uploads`, which is useful when seeding a site whose media lives in remote object storage.

### Change 41

Applies to: `emdash@1.3.0` (patch)  
Source: [#4014](https://github.com/emdash-cms/emdash/pull/4014)

Fixes visual editing selecting all of a text field's text when it is clicked, which made the first keystroke replace the whole value. A click now places the caret where it lands, including on a field inside a link, and text selected by dragging stays selected.

### Change 42

Applies to: `emdash@1.3.0` (patch)  
Source: [#3942](https://github.com/emdash-cms/emdash/pull/3942)

Fixes visual editing for empty Portable Text fields, such as the body of a new post. Edit mode now renders the inline editor for them, so the field can be written on the page instead of having no editor at all. The empty editor stays blank until it is clicked, then shows a "Type / for commands..." hint. In edit mode, an empty Portable Text field reads as an empty array instead of `null`.

### Change 43

Applies to: `emdash@1.3.0` (patch)  
Source: [#4058](https://github.com/emdash-cms/emdash/pull/4058)

Warns during `astro build` and `astro dev` when the installed `@emdash-cms/cloudflare` version differs from `emdash`. The adapter depends on the exact `emdash` version it was released with, so upgrading only one of the two packages installs a second copy of `emdash` that the adapter runs against. The warning names both versions and the command to install matching ones.

### Change 44

Applies to: `emdash@1.3.0` (patch)  
Source: [#3265](https://github.com/emdash-cms/emdash/pull/3265)

Fixes `getEmDashCollection`'s `where` filter so an object with none of `gt`, `gte`, `lt` or `lte` (such as `{ in: [...] }`) now logs a warning instead of silently returning unfiltered rows. Long array values no longer fail on Cloudflare D1 with "too many SQL variables": the longest arrays are each bound as one JSON parameter, keeping ordering and paging in the database on SQLite, D1 and PostgreSQL. Values bound that way compare as text.

### Change 45

Applies to: `emdash@1.3.0` (patch)  
Source: [#4056](https://github.com/emdash-cms/emdash/pull/4056)

Fixes WordPress WXR imports overcounting skipped items. The "skipped (already exists)" count in the admin, and the `skipped` value returned by `POST /_emdash/api/import/wordpress/execute`, now only include entries whose slug already exists in the target collection and locale. Menu items, reusable blocks (imported as sections), revisions and post types you disabled are no longer counted. The "X of Y" progress shown during the import no longer runs past the number of selected items.

### Change 46

Applies to: `emdash@1.3.0` (patch)  
Source: [#4113](https://github.com/emdash-cms/emdash/pull/4113)

Send an identifying `User-Agent: EmDash-Importer/1.0` header on all WordPress plugin importer requests. Without this header, hosts that block requests with an empty User-Agent (such as ScalaHosting's bot filter) returned 403 during analyze and media import. The plugin API fetcher now adds the header to every request, and direct media downloads from `fetchMedia` send the same value. This matches the existing media import route behavior.

### Change 47

Applies to: `emdash@1.3.0` (patch)  
Source: [#4150](https://github.com/emdash-cms/emdash/pull/4150)

Explains why the WordPress exporter import can't connect when Cloudflare's bot protection answers with a challenge page. The URL check and the analyze and import steps now say that bot protection blocked the request and how to let it through, instead of reporting that WordPress couldn't be detected or that the analysis failed. In this case the analyze and execute endpoints return the `WP_SITE_CHALLENGE` error code with status 502, and probe results include `challenged: true`.

### Change 48

Applies to: `emdash@1.3.0` (patch)  
Source: [#4150](https://github.com/emdash-cms/emdash/pull/4150)

Stops a WordPress exporter import with the bot-protection message when Cloudflare challenges a request for taxonomies, menus, site settings, or the media list. Previously the import skipped that part without telling you and finished without it. The analyze and execute endpoints now return `WP_SITE_CHALLENGE` with status 502 in these cases too.

### Change 49

Applies to: `emdash@1.3.0` (patch)  
Source: [#3892](https://github.com/emdash-cms/emdash/pull/3892)

Fixes the WordPress export file (WXR) import in the admin keeping links to the old WordPress domain in imported content. Links to the source site are now rewritten to root-relative paths. The WordPress permalink structure is kept (for example `/2024/05/my-post/`), so add redirects if your routes differ. Links to uploaded files stay absolute, including in raw HTML blocks, which the WordPress plugin import previously turned into broken relative `/wp-content/` links. Links inside reusable blocks imported as sections are not changed.
  
  The import analysis now also shows the real site title and address instead of a generic "WordPress Site" heading. For programmatic use, `parseWxrString` now returns the export's site metadata (it was always empty before), and content fetched through `wxrSource` gets the same link rewriting.

### Change 50

Applies to: `emdash@1.3.0` (patch)  
Source: [#4090](https://github.com/emdash-cms/emdash/pull/4090)

Fixes WordPress XML imports creating `acf_field` and `acf_field_group` collections full of serialized field settings on sites that use Advanced Custom Fields. The admin import now skips ACF's own post types, as it already does for WordPress internals such as revisions and menu items. Collections created by earlier imports stay in place; delete them in the admin if you don't need them.

### Change 51

Applies to: `emdash@1.3.0` (patch)  
Source: [#4123](https://github.com/emdash-cms/emdash/pull/4123)

Fixes `media:afterUpload` hooks being silently dropped for REST API multipart uploads and MCP `media_create` uploads on Cloudflare Workers. Both upload paths now defer hook execution through `after()`, matching the admin confirm flow so hooks that perform async work complete as expected.

## Agent skills

The updater ran:

```sh
npx --yes skills@1.7.0 add emdash-cms/skills -y
```

Use the refreshed `upgrading-emdash` skill for this work order. If the skills command reported a conflict or failure, resolve that before continuing.

## Core database migrations

Installed EmDash changed from `1.2.0` to `1.3.0`.

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
