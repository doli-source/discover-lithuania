#!/usr/bin/env node
// Generates a static HTML page per place, for search engines to index.
// Run: node generate-place-pages.js
//
// Reads the same two sources the browser does — published Supabase rows plus
// the places supabase-data.js appends inline. It used to read data.js, which
// stopped holding the place list when Supabase took over, so it could no
// longer regenerate anything.

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://lithuaniadiscovery.com';
const SUPABASE_URL = 'https://hsovwydscmwyyvsemudg.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzb3Z3eWRzY213eXl2c2VtdWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMDkzOTEsImV4cCI6MjEwMTY4NTM5MX0.OdiHpVogpp_5U7v-XxHdapRhpP-Zz--7Yw82X0zWruA';

// Pages kept although the place has left the data — they still rank, so
// deleting them would throw away the traffic they earn. Must stay in sync
// with the same list in check.js.
const KEPT_ORPHANS = new Set([
  'alantos-irgai-sodybos-ir-nameli',
  'atvira-meno-galerija-open-gallery',
  'muskatas',
  'naked-noah',
  'rooma-apartments-vilnius',
  'sicilia-druskininkai',
  'toli-toli-druskininkai',
  'vila-gervalis',
]);

async function rest(table, qs) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase ${table}: ${res.status} ${res.statusText}`);
  return res.json();
}

// Mirrors the mapping in supabase-data.js. If that file's shape changes,
// this has to change with it.
async function loadPlaces() {
  const [rows, translations] = await Promise.all([
    rest('places', 'select=*&order=slug'),
    rest('place_translations', 'select=*'),
  ]);

  const byPlace = {};
  for (const t of translations) (byPlace[t.place_id] ||= {})[t.lang] = t;

  const fromDb = rows
    .filter((p) => p.is_published)
    .map((p) => {
      const en = byPlace[p.id]?.en || {};
      const he = byPlace[p.id]?.he || {};
      return {
        id: p.slug,
        region: p.region_id,
        kind: p.category_id,
        name: en.name || p.slug,
        type: en.type_label || '',
        typeHe: he.type_label || '',
        rating: parseFloat(p.rating) || null,
        reviews: p.review_count,
        price: p.price_range,
        emoji: p.emoji || '📍',
        niv: en.niv_tip || en.description || '',
        nivHe: he.niv_tip || he.description || '',
        lat: p.lat,
        lng: p.lng,
        hours: p.hours_en || '',
        hoursHe: p.hours_he || '',
        website: p.website || '',
      };
    });

  // The inline PLACES.push({...}) entries in supabase-data.js are part of the
  // live list too. Pull them out rather than duplicating them here.
  const src = fs.readFileSync(path.join(__dirname, 'supabase-data.js'), 'utf8');
  const inline = [];
  for (const m of src.matchAll(/PLACES\.push\((\{[\s\S]*?\n\s{4}\})\);/g)) {
    try { inline.push(eval(`(${m[1]})`)); }
    catch (e) { console.warn(`  ! could not parse an inline place: ${e.message}`); }
  }

  const seen = new Set();
  return [...fromDb, ...inline].filter((p) => !seen.has(p.id) && seen.add(p.id));
}

async function loadHebrewNames(places) {
  const [regions, translations] = await Promise.all([
    rest('regions', 'select=id,name_he'),
    rest('place_translations', 'select=place_id,lang,name'),
  ]);
  for (const r of regions) if (r.name_he) REGION_NAMES_HE[r.id] = r.name_he;

  // Hebrew place names are keyed by the row UUID, so map them back via slug.
  const rows = await rest('places', 'select=id,slug');
  const uuidToSlug = Object.fromEntries(rows.map((r) => [r.id, r.slug]));
  const byName = {};
  for (const t of translations) {
    if (t.lang === 'he' && t.name && uuidToSlug[t.place_id]) byName[uuidToSlug[t.place_id]] = t.name;
  }
  for (const p of places) if (byName[p.id]) p.nameHe = byName[p.id];
}
const TODAY = new Date().toISOString().slice(0, 10);

// Set once the live list is loaded; the page template renders it as copy.
let TOTAL_PLACES = 0;

const REGION_NAMES = {
  vilnius:      'Vilnius',
  trakai:       'Trakai',
  kaunas:       'Kaunas',
  klaipeda:     'Klaipėda',
  curonian:     'Curonian Spit (Nida)',
  countryside:  'Lithuanian Countryside',
  druskininkai: 'Druskininkai',
  palanga:      'Palanga',
  moletai:      'Molėtai',
  zarasai:      'Zarasai',
};

// Filled from the regions table at startup.
const REGION_NAMES_HE = {};

// A Hebrew place page is a real page at its own URL, not the English one with
// the text swapped client-side. Everything a crawler reads — title, meta
// description, Open Graph, schema — has to be Hebrew in the served HTML.
const STRINGS = {
  en: {
    dir: 'ltr', country: 'Lithuania', site: 'Discover Lithuania',
    about: 'About', details: 'Details', type: 'Type', hours: 'Hours',
    price: 'Price', website: 'Website', region: 'Region', map: 'Map',
    openMaps: 'Open in Google Maps', ctaTitle: 'Explore on the interactive map',
    ctaBtn: 'Open in Discover Lithuania →', reviews: (n) => `(${n} reviews)`,
    cta: (name, n) => `See ${name} alongside all ${n} handpicked places in Lithuania.`,
    fallbackDesc: (name, kind, region) => `${name} is a ${kind.toLowerCase()} in ${region}, Lithuania.`,
  },
  he: {
    dir: 'rtl', country: 'ליטא', site: 'גלה את ליטא',
    about: 'על המקום', details: 'פרטים', type: 'סוג', hours: 'שעות פתיחה',
    price: 'מחיר', website: 'אתר', region: 'אזור', map: 'מפה',
    openMaps: 'פתח ב‑Google Maps', ctaTitle: 'על המפה האינטראקטיבית',
    ctaBtn: 'פתח ב‑גלה את ליטא ←', reviews: (n) => `(${n} ביקורות)`,
    cta: (name, n) => `${name} יחד עם עוד ${n} מקומות נבחרים בליטא.`,
    fallbackDesc: (name, kind, region) => `${name} — ${kind} ב${region}, ליטא.`,
  },
};

const KIND_LABEL_HE = {
  cafe: 'בית קפה', restaurant: 'מסעדה', market: 'שוק',
  culture: 'אתר תרבות', nature: 'אתר טבע', stay: 'מקום לינה',
  hotel: 'מלון', info: 'אטרקציה', wellness: 'ספא ובריאות',
};

const KIND_SCHEMA = {
  cafe:       'CafeOrCoffeeShop',
  restaurant: 'Restaurant',
  market:     'LocalBusiness',
  culture:    'TouristAttraction',
  nature:     'TouristAttraction',
  stay:       'LodgingBusiness',
  hotel:      'LodgingBusiness',
  info:       'TouristAttraction',
  wellness:   'HealthAndBeautyBusiness',
};

const KIND_LABEL = {
  cafe:       'Café',
  restaurant: 'Restaurant',
  market:     'Market',
  culture:    'Cultural Attraction',
  nature:     'Nature Spot',
  stay:       'Place to Stay',
  hotel:      'Hotel',
  info:       'Attraction',
  wellness:   'Wellness & Spa',
};

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Everything that differs between the two language versions of one place,
// resolved in one spot so the schema and the page can never disagree.
function view(p, lang) {
  const he = lang === 'he';
  const S = STRINGS[lang];
  const region = he ? (REGION_NAMES_HE[p.region] || REGION_NAMES[p.region] || p.region)
                    : (REGION_NAMES[p.region] || p.region);
  const kind = he ? (KIND_LABEL_HE[p.kind] || p.typeHe || '')
                  : (KIND_LABEL[p.kind] || p.type || '');
  const name = he ? (p.nameHe || p.name) : p.name;
  const blurb = he ? (p.nivHe || p.niv || '') : (p.niv || '');
  const hours = he ? (p.hoursHe || p.hours || '') : (p.hours || '');
  const typeLabel = he ? (p.typeHe || p.type || '') : (p.type || '');

  const enUrl = `${BASE_URL}/places/${p.id}/`;
  const heUrl = `${BASE_URL}/places/${p.id}/he/`;
  const desc = blurb
    ? blurb.slice(0, 155) + (blurb.length > 155 ? '…' : '')
    : S.fallbackDesc(name, kind, region);

  return {
    S, he, lang, region, kind, name, blurb, hours, typeLabel, desc,
    enUrl, heUrl,
    url: he ? heUrl : enUrl,
    title: `${name} — ${region}, ${S.country} | ${S.site}`,
  };
}

function buildSchema(p, lang) {
  const v = view(p, lang);
  const baseSchemaType = KIND_SCHEMA[p.kind] || 'LocalBusiness';
  // Google's review-snippet rich result requires the parent object to be
  // LocalBusiness (or a subtype). TouristAttraction is a plain Place, so on
  // its own it triggers "Invalid object type for field '<parent_node>'" in
  // Search Console whenever aggregateRating is present. Combine both types
  // to keep the TouristAttraction semantics while satisfying that rule.
  const schemaType = baseSchemaType === 'TouristAttraction'
    ? ['TouristAttraction', 'LocalBusiness']
    : baseSchemaType;
  const regionName = v.region;
  const url = v.url;

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': schemaType,
        '@id': url,
        name: v.name,
        description: v.blurb,
        inLanguage: lang,
        url: url,
        image: `${BASE_URL}/og-preview.png`,
        ...(p.lat && p.lng ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: p.lat,
            longitude: p.lng,
          },
          hasMap: `https://www.google.com/maps?q=${p.lat},${p.lng}`,
        } : {}),
        ...(p.rating ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: p.rating,
            reviewCount: p.reviews || 1,
            bestRating: 5,
          },
        } : {}),
        ...(v.hours ? { openingHours: v.hours } : {}),
        ...(p.website ? { url: p.website, sameAs: [p.website] } : {}),
        ...(p.price ? { priceRange: p.price } : {}),
        address: {
          '@type': 'PostalAddress',
          addressLocality: regionName,
          addressCountry: 'LT',
        },
        tourBookingPage: `${BASE_URL}/?place=${p.id}`,
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url: url,
        name: `${v.name} — ${regionName} | ${v.S.site}`,
        description: v.blurb,
        inLanguage: lang,
        isPartOf: { '@id': `${BASE_URL}/#website` },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: v.S.site, item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: regionName, item: `${BASE_URL}/explore/${p.region}/` },
            { '@type': 'ListItem', position: 3, name: v.name, item: url },
          ],
        },
      },
    ],
  };

  return JSON.stringify(schema, null, 2);
}

function buildPage(p, lang) {
  const v = view(p, lang);
  const S = v.S;
  const regionName = v.region;
  const kindLabel = v.kind;
  const title = v.title;
  const desc = v.desc;
  const url = v.url;
  const mapsEmbed = p.lat && p.lng
    ? `https://www.google.com/maps?q=${p.lat},${p.lng}&output=embed`
    : null;

  const starsHtml = p.rating
    ? `<span class="stars" aria-label="${p.rating}/5">${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5 - Math.round(p.rating))}</span> <span class="rating-num">${p.rating}</span>${p.reviews ? ` <span class="reviews">${S.reviews(p.reviews.toLocaleString())}</span>` : ''}`
    : '';

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${S.dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escHtml(title)}</title>
  <meta name="description" content="${escHtml(desc)}">
  <meta name="author" content="Niv Shimoni">
  <meta name="robots" content="index, follow">
  <meta name="google-site-verification" content="_NgLgo4VNBGD8IwmD2KyfQWC4dG7SJygKnMQWiOzuk4">

  <script src="/assets/js/traffic-filter.js"></script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-0YD451PRX4"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('set','user_properties',{traffic_type:window.__trafficType||'real'});gtag('config','G-0YD451PRX4',{send_page_view:false});</script>

  <link rel="canonical" href="${url}">
  <link rel="alternate" hreflang="en" href="${v.enUrl}">
  <link rel="alternate" hreflang="he" href="${v.heUrl}">
  <link rel="alternate" hreflang="x-default" href="${v.enUrl}">

  <meta property="og:type" content="place">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${escHtml(title)}">
  <meta property="og:description" content="${escHtml(desc)}">
  <meta property="og:image" content="${BASE_URL}/og-preview.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  ${p.lat ? `<meta property="og:latitude" content="${p.lat}">` : ''}
  ${p.lng ? `<meta property="og:longitude" content="${p.lng}">` : ''}

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escHtml(title)}">
  <meta name="twitter:description" content="${escHtml(desc)}">
  <meta name="twitter:image" content="${BASE_URL}/og-preview.png">

  <script type="application/ld+json">
${buildSchema(p, lang)}
  </script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #faf5ec;
      --text: #1a1208;
      --muted: #6b5a3e;
      --accent: #C28840;
      --card: #ffffff;
      --border: #e8dcc8;
    }
    @media (prefers-color-scheme: dark) {
      :root { --bg: #1a1208; --text: #f0e8d8; --muted: #a89070; --card: #2a1e10; --border: #3a2e1e; }
    }
    :root[data-theme="light"] { --bg: #faf5ec; --text: #1a1208; --muted: #6b5a3e; --card: #ffffff; --border: #e8dcc8; }
    :root[data-theme="dark"]  { --bg: #1a1208; --text: #f0e8d8; --muted: #a89070; --card: #2a1e10; --border: #3a2e1e; }

    body { font-family: 'Bricolage Grotesque', system-ui, sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }

    .topbar { background: var(--bg); border-bottom: 1px solid var(--border); padding: 0.75rem 1.5rem; display: flex; align-items: center; gap: 1rem; }
    .topbar a { color: var(--accent); text-decoration: none; font-weight: 500; font-size: 0.9rem; }
    .topbar a:hover { text-decoration: underline; }
    .topbar-sep { color: var(--muted); }

    .hero { max-width: 860px; margin: 0 auto; padding: 2.5rem 1.5rem 1.5rem; }
    .kind-pill { display: inline-block; background: var(--accent); color: #fff; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; padding: 0.25rem 0.7rem; border-radius: 999px; margin-bottom: 1rem; }
    .place-name { font-family: 'Instrument Serif', Georgia, serif; font-size: clamp(2rem, 5vw, 3rem); line-height: 1.15; margin-bottom: 0.5rem; }
    .region-line { color: var(--muted); font-size: 0.95rem; margin-bottom: 1rem; }
    .region-line a { color: var(--muted); text-decoration: underline; }
    .rating-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; font-size: 0.95rem; }
    .stars { color: var(--accent); letter-spacing: 0.05em; }
    .rating-num { font-weight: 600; }
    .reviews { color: var(--muted); }

    .content { max-width: 860px; margin: 0 auto; padding: 0 1.5rem 3rem; display: grid; gap: 1.5rem; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; }
    .card h2 { font-size: 1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); margin-bottom: 0.75rem; }
    .description { font-size: 1.05rem; line-height: 1.75; color: var(--text); }
    .details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
    .detail { }
    .detail-label { font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); margin-bottom: 0.2rem; }
    .detail-value { font-size: 0.95rem; }
    .detail-value a { color: var(--accent); text-decoration: none; word-break: break-all; }
    .detail-value a:hover { text-decoration: underline; }
    .map-frame { width: 100%; height: 320px; border: 0; border-radius: 8px; }
    .cta-card { text-align: center; background: var(--accent); border-color: var(--accent); color: #fff; }
    .cta-card h2 { color: rgba(255,255,255,0.8); }
    .cta-btn { display: inline-block; margin-top: 0.75rem; background: #fff; color: var(--accent); font-weight: 700; font-size: 1rem; padding: 0.75rem 2rem; border-radius: 8px; text-decoration: none; transition: opacity 0.15s; }
    .cta-btn:hover { opacity: 0.9; }
    .breadcrumb { font-size: 0.8rem; color: var(--muted); }
    .breadcrumb a { color: var(--muted); text-decoration: underline; }
  </style>
</head>
<body>
  <nav class="topbar" aria-label="breadcrumb">
    <a href="${v.he ? BASE_URL + '/?lang=he' : BASE_URL + '/'}">${escHtml(S.site)}</a>
    <span class="topbar-sep">›</span>
    <a href="${BASE_URL}/explore/${p.region}/">${escHtml(regionName)}</a>
    <span class="topbar-sep">›</span>
    <span>${escHtml(v.name)}</span>
  </nav>

  <header class="hero">
    <div class="kind-pill">${escHtml(kindLabel)}</div>
    <h1 class="place-name">${escHtml(p.emoji || '')} ${escHtml(v.name)}</h1>
    <p class="region-line"><a href="${BASE_URL}/explore/${p.region}/${v.he ? '?lang=he' : ''}">${escHtml(regionName)}</a>, ${escHtml(S.country)}</p>
    ${p.rating ? `<div class="rating-row">${starsHtml}</div>` : ''}
  </header>

  <main class="content">
    ${v.blurb ? `
    <div class="card">
      <h2>${escHtml(S.about)}</h2>
      <p class="description">${escHtml(v.blurb)}</p>
    </div>` : ''}

    <div class="card">
      <h2>${escHtml(S.details)}</h2>
      <div class="details-grid">
        ${v.typeLabel ? `<div class="detail"><div class="detail-label">${escHtml(S.type)}</div><div class="detail-value">${escHtml(v.typeLabel)}</div></div>` : ''}
        ${v.hours ? `<div class="detail"><div class="detail-label">${escHtml(S.hours)}</div><div class="detail-value">${escHtml(v.hours)}</div></div>` : ''}
        ${p.price ? `<div class="detail"><div class="detail-label">${escHtml(S.price)}</div><div class="detail-value">${escHtml(p.price)}</div></div>` : ''}
        ${p.website ? `<div class="detail"><div class="detail-label">${escHtml(S.website)}</div><div class="detail-value"><a href="${escHtml(p.website)}" target="_blank" rel="noopener">${escHtml(p.website.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a></div></div>` : ''}
        <div class="detail"><div class="detail-label">${escHtml(S.region)}</div><div class="detail-value"><a href="${BASE_URL}/explore/${p.region}/${v.he ? '?lang=he' : ''}">${escHtml(regionName)}</a></div></div>
        ${p.lat && p.lng ? `<div class="detail"><div class="detail-label">${escHtml(S.map)}</div><div class="detail-value"><a href="https://www.google.com/maps?q=${p.lat},${p.lng}" target="_blank" rel="noopener">${escHtml(S.openMaps)}</a></div></div>` : ''}
      </div>
    </div>

    ${mapsEmbed ? `
    <div class="card" style="padding: 0; overflow: hidden;">
      <iframe
        class="map-frame"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        src="${mapsEmbed}"
        title="${escHtml(v.name)} — ${escHtml(S.map)}"
        aria-label="${escHtml(v.name)} — ${escHtml(S.map)}">
      </iframe>
    </div>` : ''}

    <div class="card cta-card">
      <h2>${escHtml(S.ctaTitle)}</h2>
      <p>${escHtml(S.cta(v.name, TOTAL_PLACES))}</p>
      <a class="cta-btn" href="${BASE_URL}/?place=${p.id}${v.he ? '&lang=he' : ''}">${escHtml(S.ctaBtn)}</a>
    </div>
  </main>

  <script src="/accessibility.js?v=5"></script>
  <script>/* ga-events-v1 */
(function(){
  var slug   = '${p.id}';
  var name   = ${JSON.stringify(p.name)};
  var region = '${p.region}';
  var kind   = '${p.kind}';
  var lang   = new URLSearchParams(location.search).get('lang') || 'en';

  function ga(event, params) {
    if (typeof gtag === 'function') gtag('event', event, params);
  }

  window.addEventListener('DOMContentLoaded', function() {
    ga('place_page_view', {
      place_id: slug, place_name: name,
      place_kind: kind, region: region, language: lang
    });
  });

  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.cta-btn');
    if (btn) {
      ga('cta_click', {
        place_id: slug, place_name: name, region: region, language: lang
      });
    }
  });

  var mapObserved = false;
  var mapFrame = document.querySelector('.map-frame');
  if (mapFrame && window.IntersectionObserver) {
    new IntersectionObserver(function(entries, obs) {
      if (!mapObserved && entries[0].isIntersecting) {
        mapObserved = true;
        ga('map_view', {
          place_id: slug, place_name: name, region: region, language: lang
        });
        obs.disconnect();
      }
    }, { threshold: 0.5 }).observe(mapFrame);
  }
})();
</script>
<script>/* he-support-v1 */
(function(){
  var lang = new URLSearchParams(location.search).get('lang');
  if (lang !== 'he') return;
  document.documentElement.lang = 'he';
  document.documentElement.dir  = 'rtl';
  // ?lang=he shows Hebrew but its title, description and schema stay English,
  // so it is not the page Google should index for Hebrew. Point it at the real
  // Hebrew page, which is Hebrew all the way down.
  var _c = document.querySelector('link[rel="canonical"]');
  if (_c && _c.href.indexOf('/he/') === -1) _c.href = _c.href.replace(/\\/$/, '') + '/he/';
  var _og = document.querySelector('meta[property="og:url"]');
  if (_og && _og.content.indexOf('/he/') === -1) _og.content = _og.content.replace(/\\/$/, '') + '/he/';
  var L = {
    'About this place':'על המקום הזה',
    'Details':'פרטים',
    'Type':'סוג',
    'Hours':'שעות פעילות',
    'Price':'מחיר',
    'Region':'אזור',
    'See it on the map':'ראה על המפה',
    'Discover Lithuania':'גלה את ליטא',
    "A Traveler's Guide":'מדריך הטיול שלך'
  };
  document.querySelectorAll('.card-title,.detail-label,.logo-name,.logo-sub').forEach(function(el){
    var t = el.textContent.trim();
    if (L[t]) el.textContent = L[t];
  });
  var d = document.querySelector('.description[data-he]');
  if (d) d.textContent = d.dataset.he;
  var tp = document.querySelector('.detail-value[data-he]');
  if (tp) tp.textContent = tp.dataset.he;
  document.querySelectorAll('.region-line').forEach(function(el){
    el.innerHTML = el.innerHTML.replace(/, Lithuania/, ', ליטא');
  });
  document.querySelectorAll('.rating-row span').forEach(function(el){
    el.textContent = el.textContent.replace(/\\(([\\d,]+) reviews\\)/, '($1 ביקורות)');
  });
  document.querySelectorAll('.cta-btn').forEach(function(el){
    el.textContent = 'פתח ב‑Discover Lithuania ←';
  });
  document.querySelectorAll('a[href^="https://lithuaniadiscovery.com"]').forEach(function(a){
    var h = a.getAttribute('href');
    if (h && !h.includes('lang=he')) a.href = h + (h.includes('?') ? '&' : '?') + 'lang=he';
  });
})();
</script>
</body>
</html>`;
}

(async () => {
  const dryRun = process.argv.includes('--dry-run');
  // Existing pages carry hand-applied fixes (breadcrumbs, hreflang) and were
  // built from an older template, so rewriting them all would change visible
  // copy across the site. Only missing pages are written unless --all says so.
  const rewriteAll = process.argv.includes('--all');
  // Rewrite named slugs only — for repairing a single stale page without
  // touching the wording of the other 176.
  const onlyArg = process.argv.find((a) => a.startsWith('--only='));
  const only = onlyArg ? new Set(onlyArg.slice(7).split(',')) : null;

  const PLACES = await loadPlaces();
  TOTAL_PLACES = PLACES.length;
  await loadHebrewNames(PLACES);

  const placesDir = path.join(__dirname, 'places');
  if (!fs.existsSync(placesDir)) fs.mkdirSync(placesDir);

  const onDisk = new Set(
    fs.readdirSync(placesDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
  );
  const live = new Set(PLACES.map((p) => p.id));

  let written = 0;
  const added = [];
  for (const p of PLACES) {
    const dir = path.join(placesDir, p.id);
    const heDir = path.join(dir, 'he');
    const isNew = !onDisk.has(p.id);
    if (isNew) added.push(p.id);

    // The English page may carry hand-applied fixes, so it is only rewritten
    // when it is new or --all is passed. The Hebrew page has no such history:
    // it is generated output, always written.
    if (isNew || rewriteAll || only?.has(p.id)) {
      if (!dryRun) {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'index.html'), buildPage(p, 'en'), 'utf8');
      }
      written++;
    }
    if (!dryRun) {
      if (!fs.existsSync(heDir)) fs.mkdirSync(heDir, { recursive: true });
      fs.writeFileSync(path.join(heDir, 'index.html'), buildPage(p, 'he'), 'utf8');
    }
  }

  // Places that left the data leave their page behind. Anything not on the
  // keep list is stale and has to go, or the sitemap keeps advertising it.
  const stale = [...onDisk].filter((d) => !live.has(d) && !KEPT_ORPHANS.has(d));
  if (!dryRun) {
    for (const d of stale) fs.rmSync(path.join(placesDir, d), { recursive: true, force: true });
  }

  // Kept orphans stay in the sitemap — they are indexed and earning clicks.
  const sitemapSlugs = [...PLACES.map((p) => p.id), ...[...KEPT_ORPHANS].filter((o) => onDisk.has(o))];
  const liveSlugs = new Set(PLACES.map((p) => p.id));

  // Each language pair is one <url> carrying both alternates, which is how
  // Google wants hreflang expressed in a sitemap.
  const entries = sitemapSlugs
    .flatMap((slug) => {
      const en = `${BASE_URL}/places/${slug}/`;
      const he = `${BASE_URL}/places/${slug}/he/`;
      const alts = liveSlugs.has(slug)
        ? `\n    <xhtml:link rel="alternate" hreflang="en" href="${en}"/>` +
          `\n    <xhtml:link rel="alternate" hreflang="he" href="${he}"/>` +
          `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${en}"/>`
        : '';
      const url = (loc, extra) =>
        `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${TODAY}</lastmod>\n` +
        `    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>${extra}\n  </url>`;
      return liveSlugs.has(slug) ? [url(en, alts), url(he, alts)] : [url(en, '')];
    })
    .join('\n');

  if (!dryRun) {
    const sitemapPath = path.join(__dirname, 'sitemap.xml');
    let sitemap = fs.readFileSync(sitemapPath, 'utf8');
    sitemap = sitemap.replace(/\s*<url>\s*<loc>[^<]*\/places\/[^<]*<\/loc>[\s\S]*?<\/url>/g, '');
    sitemap = sitemap.replace('</urlset>', `${entries}\n</urlset>`);
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');
  }

  const verb = dryRun ? 'would write' : 'wrote';
  const scope = rewriteAll ? 'all pages' : 'missing pages only';
  const urlCount = (entries.match(/<loc>/g) || []).length;
  console.log(`${verb} ${written} English page(s) (${scope}) · ${PLACES.length} Hebrew pages · ${urlCount} sitemap URLs`);
  if (added.length) console.log(`  new:     ${added.join(', ')}`);
  if (stale.length) console.log(`  ${dryRun ? 'would remove' : 'removed'}: ${stale.join(', ')}`);
  if (dryRun) console.log('\nDry run — nothing was written.');
  else console.log('\nDone. Run node check.js before pushing.');
})().catch((e) => {
  console.error(`\x1b[31mGeneration failed:\x1b[0m ${e.message}`);
  process.exit(1);
});
