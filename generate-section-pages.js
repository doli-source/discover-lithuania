#!/usr/bin/env node
// Builds the Hebrew shell for every region and section page, so Hebrew has a
// real URL whose served HTML is Hebrew — title, description, Open Graph,
// schema — instead of an English page relabelled after load.
//
// These are SPA pages: the body is a #root that app.jsx fills. Only the head
// differs between languages, so a Hebrew shell is the English file with its
// head rewritten. app.jsx reads the trailing /he/ path segment and renders
// Hebrew.
//
// Run: node generate-section-pages.js [--dry-run]

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const BASE_URL = 'https://lithuaniadiscovery.com';
const TODAY = new Date().toISOString().slice(0, 10);

// Titles and descriptions are written against the queries these pages already
// receive in Search Console, not against what the page happens to be about.
// The comment on each line is the query and its impressions over 180 days.
const PAGES = {
  '': {
    he: {
      // "ליטא" 3 (pos 51) · "וילנה" 3 (pos 52) · "ליטואניה" 7 · "בירת ליטא" 5
      title: 'טיול לליטא — מדריך: מסעדות, אטרקציות ולינה | גלה את ליטא',
      desc: 'מדריך טיול לליטא: מסעדות ובתי קפה נבחרים בוילנה ובקובנה, טירת טראקאי, ספא בדרוסקינינקאי, חופי פלאנגה ומסלולים מוכנים לכל אזור.',
    },
    en: {
      // "best restaurants for dinner" 458 · "where to eat in vilnius" 49
      title: 'Lithuania Travel Guide — Where to Eat, Stay & What to See',
      desc: 'A Lithuania travel guide built from places actually visited — where to eat in Vilnius and Kaunas, Trakai castle, Druskininkai spas, Baltic beaches and ready-made routes.',
    },
  },
  'explore': {
    he: {
      // "וילנה" · "קלייפדה" 5 · "דרוסקינינקאי" · "קובנה ליטא" 5
      title: 'אזורי ליטא — וילנה, טראקאי, קובנה, קלייפדה ועוד | גלה את ליטא',
      desc: 'כל אזורי ליטא במקום אחד: וילנה, טראקאי, קובנה, קלייפדה, רצועת קורשה, פלאנגה, דרוסקינינקאי, מולטאי, זרסאי והכפר הליטאי.',
    },
    en: {
      title: 'Explore Lithuania by Region — Vilnius, Trakai, Kaunas & More',
      desc: 'Lithuania region by region — Vilnius, Trakai, Kaunas, Klaipėda, the Curonian Spit, Palanga, Druskininkai, Molėtai, Zarasai and the countryside.',
    },
  },
  'blog': {
    he: {
      title: 'מדריכים וכתבות על ליטא — אוכל, מסלולים וטיולי יום | גלה את ליטא',
      desc: 'מדריכים מלאים לליטא: המסעדות הטובות בוילנה, בתי הקפה הטובים, טיול יום לטראקאי, חמישה ימים בליטא ומתכון צפלינאי אותנטי.',
    },
    en: {
      // "best restaurants for dinner" 458 · "best coffee shops nearby" 72
      title: 'Lithuania Guides — Best Restaurants, Coffee & Day Trips',
      desc: 'In-depth Lithuania guides — the best restaurants in Vilnius, the best specialty coffee, a Trakai day trip, five days in Lithuania and how cepelinai are really made.',
    },
  },
  'explore/vilnius': {
    he: {
      // "וילנה מסעדות" 40 · "וילנה" 3 · "ליטא וילנה" 3
      title: 'וילנה — מסעדות, בתי קפה ומה לעשות | גלה את ליטא',
      desc: 'מדריך וילנה: המסעדות ובתי הקפה הכי טובים בעיר, העיר העתיקה, אוז\'ופיס ואתרים שכדאי לראות — מקומות נבחרים אחד-אחד.',
    },
    en: {
      // "where to eat in vilnius" 49 · "coffee roasters vilnius" 40 · "restauranter i vilnius" 69
      title: 'Vilnius Guide — Where to Eat, Drink & What to See',
      desc: 'Where to eat and drink in Vilnius — handpicked restaurants, specialty coffee roasters and cafés, plus the Old Town, Užupis and what is worth your time.',
    },
  },
  'explore/trakai': {
    he: {
      // "טרקאי" 7 · "טרקאי ליטא" 3 · "טרקאי וילנה" 3
      title: 'טראקאי — טירת האי, קיביני וטיול יום מוילנה | גלה את ליטא',
      desc: 'טירת האי של טראקאי על אגם גלווה, קיביני קראים טריים, שיט וחופים — טיול היום הקל ביותר מוילנה.',
    },
    en: {
      // "trakai castle" 55 · "trakai island castle" 47
      title: 'Trakai Island Castle — Day Trip from Vilnius',
      desc: 'Trakai Island Castle on Lake Galvė, Karaim kibinai, kayaking and lakeside beaches — the easiest day trip from Vilnius, with where to eat when you arrive.',
    },
  },
  'explore/klaipeda': {
    he: {
      // "קלייפדה ליטא" 8 · "קלייפדה" 5
      title: 'קלייפדה — עיר הנמל ושער לרצועת קורשה | גלה את ליטא',
      desc: 'קלייפדה, עיר הנמל היחידה של ליטא: עיר עתיקה בסגנון גרמני, מסעדות דגים ושער המעבר לרצועת קורשה ולנידה.',
    },
    en: {
      title: 'Klaipėda Guide — Old Town, Port & Curonian Spit',
      desc: 'Klaipėda, Lithuania\'s only port city — half-timbered old town, smoked fish and seafood, and the ferry gateway to the Curonian Spit and Nida.',
    },
  },
  'explore/druskininkai': {
    he: {
      // "חבילות ספא בדרוסקינינקאי" 6 · "ספא בליטא דרוסקינינקאי" 3 · "סקי בליטא" 8
      title: 'דרוסקינינקאי — ספא, סנואו ארנה ויערות אורנים | גלה את ליטא',
      desc: 'עיר הספא של ליטא: מרחצאות מינרליים וחבילות ספא, אולם הסקי המקורה Snow Arena, פארק המים ויערות דזוקיה.',
    },
    en: {
      title: 'Druskininkai — Spa Resorts, Snow Arena & Aquapark',
      desc: 'Lithuania\'s spa capital — mineral baths and spa hotels, the indoor Snow Arena, the aquapark, and pine forest trails into Dzūkija National Park.',
    },
  },
  'explore/kaunas': {
    he: {
      // "אטרקציות בקובנה" 3 · "קובנה ליטא" 5
      title: 'קובנה — אטרקציות, מוזיאונים ומסעדות | גלה את ליטא',
      desc: 'קובנה: אדריכלות מודרניסטית בין-מלחמתית, מוזיאון צ\'ורליוניס והפורט התשיעי, סצנת קפה צעירה ומסעדות נבחרות.',
    },
    en: {
      title: 'Kaunas Guide — Modernist Architecture, Museums & Food',
      desc: 'Kaunas — interwar modernist architecture, the Ninth Fort and Čiurlionis museum, Žalgiris basketball, and a young coffee and restaurant scene.',
    },
  },
  'explore/curonian': {
    he: {
      title: 'רצועת קורשה ונידה — דיונות, חופים וכפרי דייגים | גלה את ליטא',
      desc: 'רצועת קורשה, אתר מורשת עולמית של אונסק"ו: דיונת פרנידיס, כפר נידה, בית תומס מאן ויערות אורנים בין המפרץ לים הבלטי.',
    },
    en: {
      title: 'Curonian Spit & Nida — UNESCO Dunes and Beaches',
      desc: 'The Curonian Spit, a UNESCO World Heritage site — the Parnidis dune, Nida village, the Thomas Mann house and pine forest between lagoon and Baltic sea.',
    },
  },
  'explore/palanga': {
    he: {
      title: 'פלאנגה — חוף הים הבלטי, המזח ומוזיאון הענבר | גלה את ליטא',
      desc: 'עיר החוף של ליטא: חוף חול ארוך, המזח המפורסם, מוזיאון הענבר בארמון טישקביץ\' ורחוב באסנביצ\'יאוס.',
    },
    en: {
      title: 'Palanga — Baltic Beach, Pier & Amber Museum',
      desc: 'Lithuania\'s beach resort — a long sand beach, the wooden pier at sunset, the Amber Museum in Tiškevičiai Palace, and the Basanavičiaus street strip.',
    },
  },
  'explore/moletai': {
    he: {
      title: 'מולטאי — אגמים, מצפה הכוכבים ויערות | גלה את ליטא',
      desc: 'אזור האגמים של מולטאי: מצפה הכוכבים ומוזיאון האתנוקוסמולוגיה, מגדל תצפית לבנורס, שיט וצימרים על המים.',
    },
    en: {
      title: 'Molėtai — Lakes, Observatory & Forest Escapes',
      desc: 'The Molėtai lake district — the astronomical observatory and Ethnocosmology museum, the Labanoras viewing tower, and lakeside cabins and swimming.',
    },
  },
  'explore/zarasai': {
    he: {
      title: 'זרסאי — עיר חמשת האגמים וטבע צפוני | גלה את ליטא',
      desc: 'זרסאי בצפון-מזרח ליטא: טיילת על האגם, חמישה אגמים סביב העיר, קמפינג, יקב ומסעדות מקומיות.',
    },
    en: {
      title: 'Zarasai — Five Lakes, Promenade & Northern Nature',
      desc: 'Zarasai in Lithuania\'s north-east — a promenade built out over the lake, five lakes around town, camping, a winery and honest local bistros.',
    },
  },
  'explore/countryside': {
    he: {
      title: 'הכפר הליטאי — אחוזות, פארקים לאומיים וצימרים | גלה את ליטא',
      desc: 'ליטא הכפרית: פארקים לאומיים דזוקיה ואוקשטאיטיה, אחוזות היסטוריות, סוסים, בתי עץ ביער וצימרים על אגמים.',
    },
    en: {
      title: 'Lithuanian Countryside — National Parks, Manors & Cabins',
      desc: 'Rural Lithuania — Dzūkija and Aukštaitija national parks, historic manor estates, horse riding, treehouses and lakeside cabins away from the cities.',
    },
  },
  'food': {
    he: {
      // "אוכל ליטאי" 2 (pos 8.5) · "אוכל כשר בליטא" 2
      title: 'אוכל ליטאי — מסעדות, בתי קפה ומה לאכול | גלה את ליטא',
      desc: 'מה לאכול בליטא ואיפה: צפלינאי, קיביני ומרק סלק קר, לצד מסעדות ובתי קפה נבחרים בוילנה, קובנה ובחוף.',
    },
    en: {
      // "best restaurants for dinner" 458 · "best restaurants near me" 82 · "where to eat in vilnius" 49
      title: 'Where to Eat in Lithuania — Restaurants & Cafés',
      desc: 'Where to eat in Lithuania — handpicked restaurants for lunch and dinner, specialty coffee and brunch spots, and the dishes worth ordering in each region.',
    },
  },
  'stays': {
    he: {
      title: 'לינה בליטא — מלונות, צימרים ובתי עץ | גלה את ליטא',
      desc: 'איפה לישון בליטא: מלונות בוטיק בוילנה, מלונות ספא בדרוסקינינקאי, צימרים על אגמים ובתי עץ ביער.',
    },
    en: {
      title: 'Where to Stay in Lithuania — Hotels, Spas & Cabins',
      desc: 'Where to stay in Lithuania — boutique hotels in Vilnius, spa hotels in Druskininkai, lakeside cabins and forest treehouses, each one visited.',
    },
  },
  'routes': {
    he: {
      // The routes run one day, a weekend and three days. There is no
      // week-long route, and the title should not offer one.
      title: 'מסלולי טיול בליטא — מיום אחד ועד שלושה ימים | גלה את ליטא',
      desc: 'מסלולי טיול מוכנים בליטא: יום בוילנה, סופ"ש ספא בדרוסקינינקאי, שלושה ימים בחוף הבלטי וסופ"ש ביערות.',
    },
    en: {
      title: 'Lithuania Itineraries — Ready-Made Routes for 1–3 Days',
      desc: 'Ready-made Lithuania itineraries — a perfect day in Vilnius, a Druskininkai spa weekend, three days on the Baltic coast and a weekend in the forests.',
    },
  },
};

const failures = [];
const dryRun = process.argv.includes('--dry-run');

function replaceHead(html, { title, desc, canonical, enUrl, heUrl, lang }) {
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

  let out = html
    .replace(/<html[^>]*>/, `<html lang="${lang}" dir="${dir}">`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(title)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(desc)}">`)
    .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(title)}">`)
    .replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(desc)}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonical}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${canonical}">`)
    .replace(/<meta property="og:locale" content="[^"]*">/, `<meta property="og:locale" content="${lang === 'he' ? 'he_IL' : 'en_US'}">`)
    // Tells app.jsx not to overwrite the metadata below with its own. The
    // insert used to run unconditionally, so every regeneration stacked one
    // more copy onto the page — the section pages shipped carrying two. Strip
    // whatever is there, then put exactly one back.
    .replace(/[ \t]*<meta name="lt-static-seo" content="1">\n/g, '')
    .replace(/<link rel="canonical"/, `<meta name="lt-static-seo" content="1">\n  <link rel="canonical"`);

  // Rewrite the whole hreflang set rather than patching individual lines, so
  // the two languages can never end up declaring different pairs.
  const alts =
    `  <link rel="alternate" hreflang="en" href="${enUrl}">\n` +
    `  <link rel="alternate" hreflang="he" href="${heUrl}">\n` +
    `  <link rel="alternate" hreflang="x-default" href="${enUrl}">`;
  out = out.replace(/(?:[ \t]*<link rel="alternate" hreflang="[^"]*" href="[^"]*">\n?)+/, alts + '\n');

  return out;
}

let wrote = 0;
for (const [rel, cfg] of Object.entries(PAGES)) {
  const enFile = path.join(ROOT, rel, 'index.html');
  if (!fs.existsSync(enFile)) { failures.push(`missing source: ${rel}/index.html`); continue; }

  const enUrl = rel ? `${BASE_URL}/${rel}/` : `${BASE_URL}/`;
  const heUrl = rel ? `${BASE_URL}/${rel}/he/` : `${BASE_URL}/he/`;
  const src = fs.readFileSync(enFile, 'utf8');

  const en = replaceHead(src, { ...cfg.en, canonical: enUrl, enUrl, heUrl, lang: 'en' });
  const he = replaceHead(src, { ...cfg.he, canonical: heUrl, enUrl, heUrl, lang: 'he' });

  for (const [label, out, file] of [
    ['en', en, enFile],
    ['he', he, path.join(ROOT, rel, 'he', 'index.html')],
  ]) {
    const wanted = cfg[label].title
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    if (!out.includes(`<title>${wanted}</title>`)) {
      failures.push(`${rel} (${label}): title was not applied`);
      continue;
    }
    if (!dryRun) {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, out, 'utf8');
    }
    wrote++;
  }
}

console.log(`${dryRun ? 'would write' : 'wrote'} ${wrote} files across ${Object.keys(PAGES).length} sections`);
if (failures.length) {
  console.error(`\n\x1b[31m${failures.length} problem(s):\x1b[0m`);
  failures.forEach((f) => console.error(`  ${f}`));
  process.exit(1);
}
if (dryRun) console.log('\nDry run — nothing was written.');
else console.log('\nDone. Run node check.js before pushing.');
