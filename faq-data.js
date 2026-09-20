// Builds the FAQ shown on region and section pages.
//
// Every answer is derived from data already on the site — place counts,
// ratings, price ranges, itinerary durations. Nothing here is written by hand,
// so nothing here can be wrong in a way the data is not.
//
// Questions people do ask but the data cannot answer — is it safe, when is the
// best time to visit, is it expensive overall — are deliberately absent.

(function () {
  const CAT = {
    cafe:       { en: ['café', 'cafés'],                 he: ['בית קפה', 'בתי קפה'] },
    restaurant: { en: ['restaurant', 'restaurants'],      he: ['מסעדה', 'מסעדות'] },
    culture:    { en: ['cultural site', 'cultural sites'],he: ['אתר תרבות', 'אתרי תרבות'] },
    market:     { en: ['market', 'markets'],              he: ['שוק', 'שווקים'] },
    stay:       { en: ['place to stay', 'places to stay'],he: ['מקום לינה', 'מקומות לינה'] },
    nature:     { en: ['nature spot', 'nature spots'],    he: ['אתר טבע', 'אתרי טבע'] },
    wellness:   { en: ['spa', 'spas'],                    he: ['ספא', 'מרכזי ספא'] },
    hotel:      { en: ['hotel', 'hotels'],                he: ['מלון', 'מלונות'] },
    activity:   { en: ['activity', 'activities'],         he: ['פעילות', 'פעילויות'] },
    bar:        { en: ['bar', 'bars'],                    he: ['בר', 'ברים'] },
    info:       { en: ['visitor centre', 'visitor centres'], he: ['מרכז מידע', 'מרכזי מידע'] },
  };

  const DURATION = {
    day:     { en: 'one day',     he: 'יום אחד' },
    weekend: { en: 'a weekend',   he: 'סוף שבוע' },
    '3day':  { en: 'three days',  he: 'שלושה ימים' },
  };

  const plural = (kind, n, lang) => {
    const c = CAT[kind];
    if (!c) return kind;
    return n === 1 ? c[lang][0] : c[lang][1];
  };

  const regionName = (region, lang) =>
    lang === 'he' ? region.he.name : region.en.name;

  function breakdown(places, lang) {
    const counts = {};
    for (const p of places) counts[p.kind] = (counts[p.kind] || 0) + 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([kind, n]) => `${n} ${plural(kind, n, lang)}`)
      .join(lang === 'he' ? ', ' : ', ');
  }

  function topRated(places, n) {
    return places
      .filter((p) => (p.kind === 'restaurant' || p.kind === 'cafe') && p.rating)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, n);
  }

  function priceRanges(places) {
    const seen = [...new Set(places.map((p) => p.price).filter((v) => v && v.includes('€')))];
    return seen.sort().slice(0, 4);
  }

  // Returns [{q, a}] for one region, in one language.
  function regionFaq(region, allPlaces, itineraries, lang) {
    const places = allPlaces.filter((p) => p.region === region.id);
    if (!places.length) return [];
    const name = regionName(region, lang);
    const he = lang === 'he';
    const out = [];

    out.push(he
      ? { q: `מה יש לראות ולעשות ב${name}?`,
          a: `במדריך ${places.length} מקומות ב${name}: ${breakdown(places, 'he')}. כל מקום נבדק אישית.` }
      : { q: `What is there to see and do in ${name}?`,
          a: `This guide lists ${places.length} places in ${name}: ${breakdown(places, 'en')}. Each one has been visited or vetted personally.` });

    const top = topRated(places, 4);
    if (top.length) {
      const named = top.map((p) => `${p.name} (${p.rating}/5)`).join(', ');
      out.push(he
        ? { q: `איפה הכי כדאי לאכול ב${name}?`, a: `המקומות המדורגים הגבוה ביותר במדריך: ${named}.` }
        : { q: `Where are the best places to eat in ${name}?`, a: `The highest rated on this guide are ${named}.` });
    }

    const prices = priceRanges(places);
    if (prices.length) {
      out.push(he
        ? { q: `כמה עולה לאכול ב${name}?`, a: `לפי המקומות שבמדריך, הטווחים הנפוצים הם ${prices.join(', ')} לאדם.` }
        : { q: `How much does eating out cost in ${name}?`, a: `Across the places listed here, typical ranges are ${prices.join(', ')} per person.` });
    }

    const route = (itineraries || []).find((i) => i.region === region.id);
    if (route) {
      const d = DURATION[route.duration];
      const title = he ? route.he?.title : route.en?.title;
      if (d && title) {
        out.push(he
          ? { q: `כמה זמן צריך ב${name}?`, a: `במדריך יש מסלול מוכן ל${name} — "${title}", ${d.he}.` }
          : { q: `How long do you need in ${name}?`, a: `This guide has a ready-made route for ${name} — "${title}", ${d.en}.` });
      }
    }
    return out;
  }

  function faqSchema(items) {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: items.map((i) => ({
        '@type': 'Question',
        name: i.q,
        acceptedAnswer: { '@type': 'Answer', text: i.a },
      })),
    };
  }

  window.LT_FAQ = { regionFaq, faqSchema, regionName };
})();
