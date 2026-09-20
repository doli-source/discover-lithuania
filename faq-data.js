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

  // coast-3day is stored as duration "weekend", which would print
  // "Three Days on the Coast (a weekend)" — a sentence that argues with
  // itself. Where the id states a day count, the id wins.
  const durationOf = (it) => {
    const m = /(\d+)\s*day/.exec(it.id || '');
    if (m) {
      const n = Number(m[1]);
      return n === 1 ? DURATION.day
           : { en: `${n} days`, he: `${n} ימים` };
    }
    return DURATION[it.duration];
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
      const d = durationOf(route);
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


  // ── Section pages ───────────────────────────────────────────────────────
  // Same rule as the regions: every answer is computed, none is written.

  const topOverall = (places, kinds, n) =>
    places.filter((p) => kinds.includes(p.kind) && p.rating)
          .sort((a, b) => b.rating - a.rating).slice(0, n);

  const named = (list) => list.map((p) => `${p.name} (${p.rating}/5)`).join(', ');

  function sectionFaq(section, data, lang) {
    const he = lang === 'he';
    const { REGIONS: regions, PLACES: places, DISHES: dishes, ITINERARIES: its, FACTS: facts } = data;
    const out = [];
    const push = (qHe, aHe, qEn, aEn) => out.push(he ? { q: qHe, a: aHe } : { q: qEn, a: aEn });

    const eat = places.filter((p) => p.kind === 'restaurant' || p.kind === 'cafe');
    const stays = places.filter((p) => p.kind === 'stay' || p.kind === 'hotel');
    const prices = [...new Set(places.map((p) => p.price).filter((v) => v && v.includes('€')))].sort();
    const dishNames = (dishes || []).map((d) => (he ? d.he?.name : d.en?.name)).filter(Boolean);
    const durList = (its || []).map((i) => {
      const d = durationOf(i); const title = he ? i.he?.title : i.en?.title;
      return d && title ? `"${title}" (${he ? d.he : d.en})` : null;
    }).filter(Boolean);

    if (section === 'food') {
      if (dishNames.length) {
        const first = (dishes || [])[0];
        const desc = he ? first?.he?.desc : first?.en?.desc;
        push('מה האוכל הליטאי המסורתי שכדאי לנסות?',
             `${dishNames.join(', ')}. ${desc || ''}`.trim(),
             'What traditional Lithuanian food should I try?',
             `${dishNames.join(', ')}. ${desc || ''}`.trim());
      }
      const topEat = topOverall(places, ['restaurant'], 5);
      if (topEat.length) push('איפה המסעדות הכי טובות בליטא?', `המדורגות הגבוה ביותר במדריך: ${named(topEat)}.`,
                              'Where are the best restaurants in Lithuania?', `The highest rated on this guide are ${named(topEat)}.`);
      const topCafe = topOverall(places, ['cafe'], 5);
      if (topCafe.length) push('איפה הקפה הכי טוב בליטא?', `בתי הקפה המדורגים הגבוה ביותר: ${named(topCafe)}.`,
                               'Where is the best coffee in Lithuania?', `The highest rated cafés here are ${named(topCafe)}.`);
      if (prices.length) push('כמה עולה לאכול בחוץ בליטא?',
                              `לפי ${eat.length} המסעדות ובתי הקפה במדריך, הטווחים הם ${prices.slice(0, 5).join(', ')} לאדם.`,
                              'How much does eating out cost in Lithuania?',
                              `Across the ${eat.length} restaurants and cafés listed here, ranges run ${prices.slice(0, 5).join(', ')} per person.`);
    }

    if (section === 'stays') {
      if (stays.length) {
        const byRegion = {};
        for (const p of stays) byRegion[p.region] = (byRegion[p.region] || 0) + 1;
        const spread = Object.entries(byRegion).sort((a, b) => b[1] - a[1]).slice(0, 5)
          .map(([rid, n]) => { const r = regions.find((x) => x.id === rid); return `${r ? (he ? r.he.name : r.en.name) : rid} (${n})`; }).join(', ');
        push('איפה אפשר לישון בליטא?', `במדריך ${stays.length} מקומות לינה, פרוסים על ${Object.keys(byRegion).length} אזורים: ${spread}.`,
             'Where can you stay in Lithuania?', `This guide lists ${stays.length} places to stay across ${Object.keys(byRegion).length} regions: ${spread}.`);
        const topStay = topOverall(places, ['stay', 'hotel'], 5);
        if (topStay.length) push('מה מקומות הלינה המדורגים הכי גבוה?', `${named(topStay)}.`,
                                 'What are the highest-rated places to stay?', `${named(topStay)}.`);
      }
    }

    if (section === 'routes') {
      if (durList.length) {
        push('אילו מסלולים מוכנים יש במדריך?', `${durList.length} מסלולים: ${durList.join(', ')}.`,
             'What ready-made routes does this guide have?', `${durList.length} routes: ${durList.join(', ')}.`);
        const lens = [...new Set((its || []).map(durationOf).filter(Boolean).map((d) => he ? d.he : d.en))];
        push('כמה זמן צריך לטיול בליטא?', `המסלולים במדריך נעים בין ${lens.join(' ל')} — אפשר לשלב ביניהם.`,
             'How long do you need for a trip to Lithuania?', `The routes here run from ${lens.join(' to ')}, and they can be combined.`);
      }
    }

    if (section === 'home') {
      const kinds = {};
      for (const p of places) kinds[p.kind] = (kinds[p.kind] || 0) + 1;
      const spread = Object.entries(kinds).sort((a, b) => b[1] - a[1]).slice(0, 5)
        .map(([k, n]) => `${n} ${plural(k, n, lang)}`).join(', ');
      push('מה יש במדריך הזה?', `${places.length} מקומות ב-${regions.length} אזורים: ${spread}. כל מקום נבדק אישית.`,
           'What is in this guide?', `${places.length} places across ${regions.length} regions: ${spread}. Each one visited or vetted personally.`);
      push('אילו אזורים בליטא מכוסים?', regions.map((r) => he ? r.he.name : r.en.name).join(', ') + '.',
           'Which parts of Lithuania does it cover?', regions.map((r) => he ? r.he.name : r.en.name).join(', ') + '.');
      const best = topOverall(places, ['restaurant', 'cafe', 'stay', 'hotel', 'culture', 'nature'], 5);
      if (best.length) push('מה המקומות המדורגים הכי גבוה בליטא?', `${named(best)}.`,
                            'What are the highest-rated places in Lithuania?', `${named(best)}.`);
      if (dishNames.length) push('מה אוכלים בליטא?', `המנות המסורתיות במדריך: ${dishNames.join(', ')}.`,
                                 'What do people eat in Lithuania?', `The traditional dishes covered here: ${dishNames.join(', ')}.`);
      if (durList.length) push('כמה ימים כדאי להקדיש לליטא?', `במדריך ${durList.length} מסלולים מוכנים: ${durList.join(', ')}.`,
                               'How many days should you spend in Lithuania?', `This guide has ${durList.length} ready-made routes: ${durList.join(', ')}.`);
      const f = (facts || [])[0];
      const ft = he ? f?.he : f?.en;
      if (ft) push('מה כדאי לדעת על ליטא?', ft, 'What is worth knowing about Lithuania?', ft);
    }

    return out;
  }


  // ── Questions taken from real searches ──────────────────────────────────
  // faq-queries.json holds the queries each page actually receives, pulled
  // from Search Console. Most are not phrased as questions — "trakai vacation
  // rentals", "חבילות ספא בדרוסקינינקאי" — so each is classified by intent and
  // asked back in the words the searcher used. A page only gets a question if
  // someone actually searched for that thing.

  // Hebrew has no \\b, and a substring match is actively wrong here: the word
  // דרוסקינינקאי contains the letters of סקי, so a plain match classified the
  // town's own name as a question about skiing. Each Hebrew term is therefore
  // anchored between non-letters.
  const heWord = (...words) => words.map((w) => `(?<![א-ת])${w}(?![א-ת])`).join('|');

  const INTENTS = [
    { id: 'eat',    re: new RegExp('\\b(eat|restaurant|restaurants|dinner|lunch|food|brunch|sandwich|shakshuka|pizza|kebab|bakery|bakeries)\\b|' + heWord('מסעדה','מסעדות','לאכול','אוכל','ארוחה','מסעדת'), 'i') },
    { id: 'coffee', re: new RegExp('\\b(coffee|cafe|café|roaster|roasters|espresso)\\b|' + heWord('קפה','קפייה'), 'i') },
    { id: 'spa',    re: new RegExp('\\b(spa|wellness|thermal|aqua ?park|sauna)\\b|' + heWord('ספא','מרחצאות','בריכה'), 'i') },
    { id: 'ski',    re: new RegExp('\\b(ski|skiing|snow arena)\\b|' + heWord('סקי','שלג','מגלשי'), 'i') },
    { id: 'stay',   re: new RegExp('\\b(hotel|hotels|stay|accommodation|rental|rentals|apartment|cabin|resort|camping)\\b|' + heWord('לינה','מלון','מלונות','צימר','צימרים','אכסניה'), 'i') },
    { id: 'price',  re: new RegExp('\\b(price|prices|cost|cheap|expensive|budget|how much)\\b|' + heWord('מחיר','מחירים','עלות') + '|כמה עולה', 'i') },
    { id: 'days',   re: new RegExp('\\b(how long|how many days|days|itinerary|weekend)\\b|' + heWord('מסלול','מסלולים') + '|כמה ימים|כמה זמן', 'i') },
    { id: 'see',    re: new RegExp('\\b(castle|museum|attraction|attractions|things to do|sightseeing|old town|beach|dune)\\b|' + heWord('אטרקציות','טירה','מוזיאון','חוף','לראות'), 'i') },
  ];

  const classify = (q) => (INTENTS.find((i) => i.re.test(q)) || { id: 'see' }).id;

  // One question per intent, phrased around the place and, where it reads
  // naturally, the searcher's own wording.
  function questionFor(intent, place, lang, sample) {
    const he = lang === 'he';
    // Section pages have no place of their own — the subject is the country.
    const where = place || (he ? 'ליטא' : 'Lithuania');
    const at = he ? `ב${where}` : `in ${where}`;
    switch (intent) {
      case 'eat':    return he ? `איפה כדאי לאכול ${at}?`            : `Where should you eat ${at}?`;
      case 'coffee': return he ? `איפה הקפה הכי טוב ${at}?`          : `Where is the best coffee ${at}?`;
      case 'spa':    return he ? `מה יש בתחום הספא ${at}?`           : `What spa and wellness is there ${at}?`;
      case 'ski':    return he ? `אפשר לעשות סקי ${at}?`             : `Can you ski ${at}?`;
      case 'stay':   return he ? `איפה אפשר לישון ${at}?`            : `Where can you stay ${at}?`;
      case 'price':  return he ? `כמה עולה לאכול ${at}?`             : `How much does eating out cost ${at}?`;
      case 'days':   return he ? `כמה זמן כדאי להקדיש ${at}?`        : `How long do you need ${at}?`;
      case 'see':    return he ? `מה יש לראות ולעשות ${at}?`         : `What is there to see and do ${at}?`;
      default:       return he ? `מה יש לראות ולעשות ${at}?`         : `What is there to see and do ${at}?`;
    }
  }

  // Which intents a page has the data to answer.
  function answerFor(intent, ctx, lang) {
    const he = lang === 'he';
    const { places, place, regions, its, dishes } = ctx;
    const pick = (kinds, n) => places.filter((p) => kinds.includes(p.kind) && p.rating)
                                     .sort((a, b) => b.rating - a.rating).slice(0, n);
    const list = (arr) => arr.map((p) => `${p.name} (${p.rating}/5)`).join(', ');

    if (intent === 'eat' || intent === 'general' || intent === 'see') {
      const counts = {};
      for (const p of places) counts[p.kind] = (counts[p.kind] || 0) + 1;
      const spread = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
        .map(([k, n]) => `${n} ${plural(k, n, lang)}`).join(', ');
      if (intent === 'eat') {
        const top = pick(['restaurant', 'cafe'], 4);
        if (!top.length) return null;
        return he ? `המקומות המדורגים הגבוה ביותר במדריך: ${list(top)}.`
                  : `The highest rated on this guide are ${list(top)}.`;
      }
      if (!places.length) return null;
      return he ? `במדריך ${places.length} מקומות ${place ? 'ב' + place : ''}: ${spread}. כל מקום נבדק אישית.`
                : `This guide lists ${places.length} places${place ? ' in ' + place : ''}: ${spread}. Each one visited or vetted personally.`;
    }
    if (intent === 'coffee') {
      const top = pick(['cafe'], 4);
      if (!top.length) return null;
      return he ? `בתי הקפה המדורגים הגבוה ביותר: ${list(top)}.` : `The highest rated cafés here are ${list(top)}.`;
    }
    if (intent === 'spa') {
      const top = pick(['wellness', 'stay', 'hotel'], 4);
      if (!top.length) return null;
      return he ? `מקומות הספא והלינה במדריך: ${list(top)}.` : `The spa and wellness places listed here: ${list(top)}.`;
    }
    if (intent === 'ski') {
      const snow = places.find((p) => /\bsnow\b|\bski\b|סקי|שלג/i.test(p.name));
      if (!snow) return null;
      return he ? `כן — ${snow.name} מופיע במדריך${snow.rating ? ` (${snow.rating}/5)` : ''}.`
                : `Yes — ${snow.name} is listed here${snow.rating ? ` (${snow.rating}/5)` : ''}.`;
    }
    if (intent === 'stay') {
      const top = pick(['stay', 'hotel'], 4);
      if (!top.length) return null;
      const n = places.filter((p) => p.kind === 'stay' || p.kind === 'hotel').length;
      return he ? `${n} מקומות לינה במדריך. המדורגים הגבוה ביותר: ${list(top)}.`
                : `${n} places to stay are listed. The highest rated are ${list(top)}.`;
    }
    if (intent === 'price') {
      const pr = [...new Set(places.map((p) => p.price).filter((v) => v && v.includes('€')))].sort().slice(0, 4);
      if (!pr.length) return null;
      return he ? `לפי המקומות שבמדריך, הטווחים הם ${pr.join(', ')} לאדם.`
                : `Across the places listed here, ranges run ${pr.join(', ')} per person.`;
    }
    if (intent === 'days') {
      const routes = (its || []).filter((i) => !ctx.regionId || i.region === ctx.regionId);
      const named = routes.map((i) => { const d = durationOf(i); const t = he ? i.he?.title : i.en?.title;
        return d && t ? `"${t}" (${he ? d.he : d.en})` : null; }).filter(Boolean);
      if (!named.length) return null;
      return he ? `מסלולים מוכנים במדריך: ${named.join(', ')}.` : `Ready-made routes here: ${named.join(', ')}.`;
    }
    return null;
  }

  // Build a page's FAQ from its own search queries.
  function queryFaq(path, ctx, lang) {
    const data = window.LT_FAQ_QUERIES;
    if (!data || !data.pages) return [];
    const entry = data.pages[path] || data.pages[path.replace(/\/$/, '')];
    if (!entry) return [];

    const seen = new Set();
    const out = [];
    for (const row of entry[lang] || []) {
      const intent = classify(row.q);
      if (seen.has(intent)) continue;
      const a = answerFor(intent, ctx, lang);
      if (!a) continue;
      seen.add(intent);
      out.push({ q: questionFor(intent, ctx.place, lang, row.q), a, from: row.q, impressions: row.impressions });
      if (out.length >= 8) break;
    }
    return out;
  }

  window.LT_FAQ = { regionFaq, sectionFaq, queryFaq, faqSchema, regionName };

})();
