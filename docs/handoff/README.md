# Handoff

Everything needed to pick this project up cold.

## Read in this order

1. **`../../CLAUDE.md`** — the working agreement. What is derived from what,
   which config files are inert, the bilingual structure, the deploy rules.
   Read this before touching anything.
2. **`SESSION-2026-09-20.md`** — the full account of the 20 September session:
   what was broken, what changed, what was measured, what is still open.
   Section 6 is the brief.

## Folders

| | |
|---|---|
| `research/` | Baselines exported from Search Console and GA4. Regenerate with the scripts listed in the session doc — do not hand-edit. |
| `briefs/` | Research briefs. One file per question, named for the question. |
| `inbox/` | Files coming in from outside — exports, notes, screenshots, anything to be shared back into a session. |

## The two things most likely to trip you up

**The site runs on GitHub Pages, not Netlify.** `netlify.toml` and `_headers`
are in the repo and neither is read. Headers are Cloudflare rules.

**Never quote an impression count without splitting it by country.** Two
conclusions were drawn wrongly this session from unsplit totals — one
overstating an opportunity, one dismissing the largest one on the site.

## Before any deploy

```bash
node check.js && git push origin main-local:main
```

14 rules, each guarding an invariant that has already been broken in production
at least once. A non-zero exit means do not deploy.
