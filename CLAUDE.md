# Discover LT — working agreement

## Approval gates

These are standing instructions from Niv. They hold unless he says otherwise
in the current conversation.

- **No visual changes without explicit approval.** Anything a visitor can see
  on the page — layout, copy, colours, components. Ask first, every time.
- **Never write or publish site content.** No blog posts, no place
  descriptions, no marketing copy. Technical/SEO work only.
- **Never push or deploy without explicit approval.** Committing locally is
  fine; `git push` is not.

Meta tags, structured data, headers, and robots/sitemap are not visual — those
can be changed freely, but they still follow the derived-data rules below.

## Run the check first

```
node check.js
```

Run it before every push. It encodes the invariants below and every rule in it
exists because that invariant was broken in production at least once. A
non-zero exit means do not deploy.

## Source of truth

`supabase-data.js` builds `window.LT_DATA` from two sources: the published rows
of the Supabase `places` table, **plus** a handful of places it appends inline
with `PLACES.push({...})`. The live list is both together — querying only
Supabase undercounts.

- **Never derive the place count from the number of directories under
  `/places/`.** Those drift. Counting directories is exactly how the count
  became 175 when the real number was 169.
- `data.js` holds ~30 regions/landmarks and an inline fallback. It is **not**
  the place list, despite the name.
- `docs/PROJECT_SPEC.md` is stale (it lists 12 regions; there are 10). Read it
  for intent, never for current numbers.

Copy phrased as an approximation — "over 160", "160+" — stays valid as long as
the real count is higher, so it does not have to move on every addition.

## Two languages, two URLs

Every indexable page exists twice: `/thing/` in English and `/thing/he/` in
Hebrew. Both are real files whose served HTML is already in that language —
title, meta description, Open Graph and schema `inLanguage` included. They
declare each other with hreflang in the page and in the sitemap.

Hebrew is **not** the English page with its text swapped after load. That was
the old `?lang=he` behaviour, and because the title and description stayed
English, Google indexed those URLs as English pages and Hebrew queries sat at
position 50-78. `?lang=he` still works for visitors and now canonicals to the
`/he/` page.

- Place pages: `node generate-place-pages.js` writes both languages.
- Region and section pages: `node generate-section-pages.js` writes both.
- `app.jsx` treats a trailing `/he` path segment as Hebrew, and skips its own
  metadata handling on pages carrying `<meta name="lt-static-seo">` — those
  ship hand-tuned titles that the SPA must not overwrite.

Titles and descriptions for section pages live in `generate-section-pages.js`,
each with the Search Console query and impression count it targets. Change them
there, not in the HTML, or the next run reverts them.

## Derived data — update together or not at all

Each row is one fact stored in several places. Changing one copy and not the
others is the bug pattern that has bitten this repo repeatedly.

| Change | Also update |
|---|---|
| Add/remove a place | static page under `/places/<id>/`, `sitemap.xml`, the count everywhere below |
| Place count | `app.jsx`, `index.html`, `explore/`, `routes/*`, `food/`, `stays/`, `blog/5-days-in-lithuania.html`, `manifest.json`, `llms.txt`, `feed.xml` |
| Region count | same file set as the place count |
| Canonical logic in `app.jsx` | confirm `robots.txt` does not block the new target |
| A `Disallow` rule in `robots.txt` | grep `app.jsx` for anything that canonicals into that pattern |
| Cache headers in `_headers` | confirm every matched asset is versioned with `?v=`, and that `netlify.toml` does not set a conflicting rule for the same path |

Cache headers live in **two** files — `_headers` and `netlify.toml`. When they
disagree the result is unpredictable, so any file needing a non-default policy
must be listed in both.

## Hosting — read this before touching any config

The site is served by **GitHub Pages** (`source: main /`) behind **Cloudflare**.
It is not served by Netlify, despite what the repo looks like.

That means **`_headers` and `netlify.toml` are inert**. GitHub Pages does not
read either file, so nothing in them reaches a visitor. Anything that has to
arrive as an HTTP header is set as a Cloudflare rule instead; editing those two
files changes nothing. `check.js` warns about this on every run.

The four security headers are already live, set by a Cloudflare Response Header
Transform Rule named `security-headers` (Rules → Overview, on the
lithuaniadiscovery.com zone). To change them, edit that rule — not `_headers`.
Verify with `curl -sI https://lithuaniadiscovery.com/`.

A separate Netlify site (`discover-lithuania.netlify.app`) is still live and
serving an old build. It is not the production site.

## Deploy

Work happens on `main-local`. Production is `origin/main`.

```
node check.js && git push origin main-local:main
```

GitHub Pages rebuilds from `main`; a GitHub Action then purges the Cloudflare
cache. Allow a couple of minutes, and verify against the live domain rather
than the Pages URL — Cloudflare can still be serving the previous copy.

There is no staging environment. A push is live.

Credentials are in the macOS Keychain via `gh auth login`. Never write a token
into `.git/config` or any tracked file.

## Known gaps

Open items, not yet fixed. Check whether they still apply before acting.

- `generate-place-pages.js` reads `data.js`, which no longer holds the place
  list — the generator cannot currently regenerate pages.
- The generator only creates pages; it never deletes them. Renamed or removed
  places leave orphaned pages behind, still listed in the sitemap.
- 8 orphaned static pages exist. Some still earn search traffic, so they are
  deliberately left in place pending a decision from Niv.
- 2 live places have no static page: `horizons-lake-resort`, `kultura-kaunas`.
- `/assets/js/traffic-filter.js` is referenced from 202 files without a `?v=`
  string, so it cannot be cache-busted.
