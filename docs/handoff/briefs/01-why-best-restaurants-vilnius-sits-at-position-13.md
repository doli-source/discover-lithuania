# Why does /blog/best-restaurants-vilnius sit at position 13 for a 458-impression query?

## The question

`best restaurants for dinner` gets 458 impressions over 180 days, ranks at
position 13.3, and gets 0 clicks. The page is
`/blog/best-restaurants-vilnius`. Page one starts at position ~10, so this is
close, not far.

## The numbers, split by country

Pulled fresh from Search Console (180-day window, `query` + `country` +
`page` dimensions):

| query | impressions | clicks | position | country | page |
|---|---|---|---|---|---|
| best restaurants for dinner | 458 | 0 | 13.3 | 100% ltu | /blog/best-restaurants-vilnius |
| best restaurants near me | 82 | 1 | 11.0 | 100% ltu | /blog/best-restaurants-vilnius |

Both queries are 100% Lithuania. Zero impressions from any other country.
This is not tourist search volume — it's people already in Lithuania,
searching in English, on the same page.

## What was checked

- Confirmed the 458-impression figure is real and entirely domestic (not an
  artifact of mixing tourist and local traffic, which would have been a
  meaningless total per the standing rule on this project).
- Confirmed a second, related query (`best restaurants near me`, 82
  impressions) lands on the exact same page at a slightly better position
  (11.0), suggesting the page is not universally weak — it's close to page
  one on more than one related query.
- Did not check on-page factors: title tag wording, whether "dinner" appears
  in the title/meta description, internal links pointing to the page,
  competing pages on the same domain, or backlink profile. That's the
  natural next step and it's cheap.

## What was ruled out

- This is not a content-depth problem in the sense of "the page doesn't
  exist" — it exists, it's indexed, it's already near page one on a related
  query. A rewrite is not obviously required.
- This is not an international-tourism opportunity being missed — the
  audience is 100% local, so any fix should be framed around what a
  Lithuanian resident searching in English wants, not a visiting tourist.

## Recommendation

Treat this as a technical/on-page pass, not a content pass — the owner ruled
out new content, and nothing here suggests new content is what's missing
anyway. Concretely: check whether the page's `<title>` and meta description
contain "dinner" (the query has clear intent — "for dinner" — that a generic
"best restaurants" title may not be matching), check for competing internal
pages that might be splitting relevance, and check internal linking into
this URL. Position 13 with 458 impressions and a related query already at
11 suggests a small, technical push could cross into page one.

## What would have to be true for this to be wrong

If the position-13 plateau is actually a domain-wide authority ceiling
(the whole site doesn't yet have enough authority to rank any single page
above position ~10-13 for competitive terms like this), on-page tweaks to
this one URL won't move it — that would only show up by comparing this
page's trajectory against other pages competing for similarly competitive
terms. Also: if the real intent behind "for dinner" is different enough
from "best restaurants" that satisfying it requires actual new content
(e.g., a dinner-specific angle: reservations, evening atmosphere, late-night
options), then the owner's content ban does block a full fix, and the
honest answer is this needs content money can't currently buy.
