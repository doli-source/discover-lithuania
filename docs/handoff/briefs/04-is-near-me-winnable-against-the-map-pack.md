# Is the "near me" cluster winnable against a local map pack?

## The question

Do "near me" / "nearby" queries have real upside if pushed further with SEO,
or is the click-through structurally capped by something SEO can't touch
(a Google Maps local pack sitting above the organic results)?

## The numbers, split by country

Pulled fresh from Search Console (180-day window, `query` + `country` +
`page` dimensions):

| query | impressions | clicks | position | country | page |
|---|---|---|---|---|---|
| focaccia near me | 159 | 0 | 5.1 | 100% ltu | /places/focacceria/ |
| best restaurants near me | 82 | 1 | 11.0 | 100% ltu | /blog/best-restaurants-vilnius |
| best coffee shops nearby | 72 | 0 | 12.1 | 100% ltu | /blog/best-coffee-vilnius |

All three, 100% Lithuania. This is local residents, not tourists — exactly
the population Google's local map pack is built to serve first.

## What was checked

`focaccia near me` sits at position 5.1 — a genuinely good organic
position, the kind that normally earns a few percent CTR — and still got
**zero clicks** across 159 impressions over 180 days. That combination
(good position, zero clicks) is the signature of something above the
organic listing eating the clicks, not a relevance or ranking problem.

## What was ruled out

- Not a relevance/targeting problem — position 5 for a specific,
  well-matched query proves the page is seen as relevant.
- Not a tourist/local mismatch — the audience is already local, which is
  the map pack's strongest use case (proximity search), so if anything this
  makes map-pack dominance more likely, not less.
- Not (necessarily) a title/snippet problem — that would show up as some
  clicks at a low rate, not a flat zero at position 5.

## What was not checked

Did not pull an actual SERP screenshot to visually confirm a map pack is
rendering above the organic result for these queries. The zero-click
pattern is strong circumstantial evidence, not direct proof. A five-minute
manual check (search "focaccia near me" from a Lithuania-based IP or via
Search Console's URL inspection preview) would close that gap.

## Recommendation

Don't spend more on-site SEO effort chasing the "near me" cluster — the
data says the ceiling here isn't organic ranking, it's the map pack, and no
amount of page content or technical SEO moves a map pack position. The
lever for this traffic is Google Business Profile work: reviews, category
selection, proximity signals, photos — which is a different skill set than
site SEO (and one already in the owner's own toolkit as a Google Business
Profile optimizer). This also means the content-writing ban doesn't cost
anything here — content was never going to fix this.

## What would have to be true for this to be wrong

If a manual SERP check shows no map pack actually renders for these
queries, the zero-click-at-position-5 pattern needs a different
explanation — most likely a snippet/title problem specific to that page,
which would then be worth an on-page fix after all. Also: if the business
doesn't have (and can't reasonably get) Google Business Profile listings
for the featured places, redirecting effort toward Business Profile work
has no destination, and the honest answer becomes "this traffic isn't
winnable right now."
