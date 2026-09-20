# Branded restaurant queries rank 6-11 and get zero clicks. Is that structural?

## The question

Across the site's branded place-name queries, a lot of them sit at position
6-11 (a normally decent range) and still get zero clicks. Is this
per-page — something wrong with individual pages — or a pattern across the
whole domain?

## The numbers

Pulled from Search Console (180-day window, `query` + `page` dimensions),
filtered to a list of ~40 known place/brand names on the site, then
narrowed to queries at position 6-11 with exactly zero clicks:

**368 branded queries were checked in total. Roughly 140 of them (about
38%) fall in the position 6-11, zero-click bucket.** This is not a few
unlucky pages — it's the dominant pattern for branded search on this site.
A sample, largest first:

| query | page | impressions | position | clicks |
|---|---|---|---|---|
| tempo v39 | /places/tempo-v39/ | 798 | 9.6 | 0 |
| brew palanga | /places/brew-palanga/ | 365 | 8.4 | 0 |
| tempo vilnius | /places/tempo-v39/ | 244 | 9.7 | 0 |
| spricas brunch | /places/spricas-brunch/ | 243 | 6.3 | 0 |
| osh vilnius | /places/osh-halal/ | 99 | 9.7 | 0 |
| adata bar | /places/adata-bar/ | 86 | 10.4 | 0 |
| donde vilnius | /places/donde/ | 78 | 10.6 | 0 |
| mon vilnius | /places/mon/ | 66 | 9.3 | 0 |
| baleboste vilnius | /places/baleboste/ | 63 | 9.2 | 0 |
| snapas trakai | /places/snapas-kava-ir-desertai/ | 60-62 | 9.0-9.4 | 0 |

Nearly 40 different pages, nearly 140 different queries, all landing in the
same narrow position band (mostly 6-11, several tight around 8-10), all
with literally zero clicks over 180 days. `spricas brunch` at position 6.3
with 243 impressions and zero clicks is the clearest single data point —
that position should convert some visible fraction of searches under
normal organic CTR curves.

## What was checked

- Confirmed this isn't one or two anomalies — it spans dozens of unrelated
  places, categories (cafes, bars, restaurants, a horse farm, a spa), and
  page templates. A template bug on one page type would show up narrower
  than this.
- Confirmed the position clustering itself is unusual: organic results
  don't normally bunch this tightly around position 8-10 across so many
  unrelated queries — that specific signature (consistent position just
  below the fold, consistent zero clicks) matches what brief 04 already
  found and evidenced for the "near me" cluster: a local map pack or
  knowledge panel sitting above the organic result and absorbing the click.
  A named-business search ("tempo v39", "brew palanga") is exactly the
  query type Google prioritizes a Business Profile panel for — more so
  than a generic "near me" search.

## What was NOT checked, and matters

**This list does not have a country split.** The backstage-specific pull in
brief 02 confirmed 100% Lithuania for that subset, and every other finding
on this project has been overwhelmingly domestic, so it's reasonable to
expect the same here — but per this project's own standard, an impression
total without a country split is not yet evidence, and this one hasn't
been split. If real budget or time is going to be committed on the strength
of this brief, the fix is a five-minute script re-run with `country` added
as a third dimension. Flagging honestly rather than presenting this as
fully verified.

Also not checked: an actual SERP screenshot for even one of these queries,
to visually confirm a map pack or knowledge panel is what's sitting above
the organic result. The position+zero-click signature is strong
circumstantial evidence, not a photograph of the cause.

## What was ruled out

- Not a small number of broken pages — the pattern is too wide and too
  consistent across unrelated place types for that.
- Not (obviously) a title/snippet quality problem specific to any one
  page — a bad snippet costs some clicks, not all of them, on dozens of
  different pages simultaneously.

## Recommendation

Treat this the same way as the "near me" finding in brief 04: this looks
structural, not fixable by better on-page SEO on any of these ~140 queries
individually. The lever, if there is one, is Google Business Profile
work — reviews, categories, photos — for the specific businesses, not more
site-side optimization. Before reallocating effort on this conclusion,
spend the five minutes on the country split and one SERP screenshot; if
both confirm the map-pack theory, this closes the loop on research
questions 3 and 4 together — they are very likely the same underlying
phenomenon.

## What would have to be true for this to be wrong

If the country split turns out to be mixed (not overwhelmingly Lithuania)
or a SERP check shows no map pack rendering for these queries, the
zero-click pattern needs a different explanation — most likely something
systemic on the technical side (a shared snippet/schema issue across
`/places/` pages) rather than a SERP-feature ceiling, which would actually
be good news: that kind of bug is fixable without touching Google Business
Profiles.
