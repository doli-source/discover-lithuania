# Three Backstage branches split 1,260 impressions. One page or three?

## The question

Backstage Roasters has three location pages on the site. Generic brand
queries ("backstage roasters", "backstage cafe roastery", "backstage cafe
vilnius") land at positions 24-85 with zero clicks. Is that one page's
problem, or three pages cannibalizing each other?

## The numbers, split by country

Pulled fresh from Search Console (180-day window, `query` + `page` +
`country` dimensions, filtered to queries containing "backstage"). All but
a handful of stray single-digit impressions from other countries are
Lithuania (ltu) — same as every other finding in this project, this is
domestic search, not tourist search.

Three confirmed distinct branches (verified against Supabase — three
different lat/lng, same brand website):

| slug | coordinates |
|---|---|
| backstage-cafe-vokie-i-str | 54.6784, 25.2849 |
| backstage-roastery-hq | 54.6533, 25.2280 |
| backstage-roastery-caf | 54.6748, 25.2660 |

Generic (non-location) queries, split across pages:

| query | vokie-i-str | roastery-hq | roastery-caf | total impressions | clicks |
|---|---|---|---|---|---|
| backstage cafe roastery | 87i @56.0 | 81i @41.1 (+53i @46.0 via `?place=`) | 83i @70.2 (+61i @71.0 via `?place=`, +25i @78.3 `/he`) | ~395 | 0 |
| backstage roasters | — | 121i @29.9 (+40i @52.7 `?place=`) | 66i @53.4 (+1i `?place=`) | ~228 | 0 |
| backstage cafe vilnius | 103i @33.5 (+25i @63.4 `/he`) | 39i @71.0 (+6i @70.3 `?place=`) | 61i @57.6 (+20i @76.0 `/he`) | ~254 | 0 |
| backstage cafe (bare) | — | 26i @64.4 (+81i @73.9) | 80i @76.0 | ~187 | 0 |

Location-specific queries behave differently — they already concentrate
correctly on one page:

| query | page | impressions | position |
|---|---|---|---|
| backstage cafe vokieciu g | vokie-i-str only | 90i | 40.8 |
| backstage cafe vokiečių str | vokie-i-str only | 89i | 22.2 |
| backstage cafe menu / meniu | vokie-i-str only | 87-88i | ~41 |

## What was checked

- Confirmed against Supabase that these are three genuinely distinct
  physical branches (different coordinates across Vilnius), not a
  duplicate-data-entry problem. Ruling that out first mattered — if two
  rows had been the same place entered twice, the fix would be a data
  delete, not a content/structure decision.
- Confirmed the split is selective, not universal: queries that already
  name a location or street ("vokieciu g", "vokiečių str", "menu") land on
  exactly one page and rank reasonably (position ~22-41). Queries with no
  location signal ("backstage roasters", "backstage cafe roastery",
  "backstage cafe vilnius", "backstage cafe") get split across two or three
  pages, each also carrying `?place=` and `/he` variants, and rank badly
  (30-85).

## What was ruled out

- Not a "one page is just weak" problem — every one of the three pages
  shows up in the split for the ambiguous queries, so it's not that one
  branch's page needs fixing in isolation.
- Not a data-quality problem (duplicate branches) — verified three real,
  separate coordinates.

## Recommendation

This is textbook keyword cannibalization on the ambiguous, no-location
queries specifically — not on the whole brand. Two options, both
technical/structural rather than content:

1. Pick one branch page as the canonical target for the ambiguous queries
   (internal links, title tag emphasis) and let the other two keep
   competing only for their own location-specific queries, which already
   work.
2. Build a single hub/index for "Backstage Roasters" that lists all three
   branches and is the one page meant to catch the ambiguous, no-location
   searches, linking out to each branch's own page for location-specific
   intent.

Option 2 is cleaner long-term but is closer to a new page/structure
decision than a pure technical tweak — flagging it as something to confirm
before building, since new pages sit closer to the visual/structure line
than a title-tag or internal-link change does.

## What would have to be true for this to be wrong

If splitting the queries isn't actually costing clicks — i.e. if a single
consolidated page would land in the same 30-85 position range anyway
because of the same map-pack/knowledge-panel effect documented in the
"near me" and branded-query briefs — then fixing the cannibalization alone
won't produce clicks. See brief 03 for evidence that a large share of
branded queries get zero clicks even at good, uncannibalized positions;
that pattern applies here too and should be treated as a ceiling on how
much this fix alone can achieve.
