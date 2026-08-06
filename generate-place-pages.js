#!/usr/bin/env node
// Generates static HTML place pages for SEO
// Output: /places/[id]/index.html for each of the 166 places
// Run: node generate-place-pages.js

const fs = require('fs');
const path = require('path');

// Load data
let content = fs.readFileSync(path.join(__dirname, 'data.js'), 'utf8');
content = content.replace('window._DL_DATA_VERSION =', 'global._DL_DATA_VERSION =');
content = content.replace('window.LT_DATA =', 'global.LT_DATA =');
eval(content);
const { PLACES, REGIONS } = global.LT_DATA;

const BASE_URL = 'https://lithuaniadiscovery.com';
const TODAY = new Date().toISOString().slice(0, 10);

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

function buildSchema(p) {
  const schemaType = KIND_SCHEMA[p.kind] || 'LocalBusiness';
  const regionName = REGION_NAMES[p.region] || p.region;
  const url = `${BASE_URL}/places/${p.id}/`;

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': schemaType,
        '@id': url,
        name: p.name,
        description: p.niv || '',
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
        ...(p.hours ? { openingHours: p.hours } : {}),
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
        name: `${p.name} — ${regionName} | Discover Lithuania`,
        description: p.niv || '',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Discover Lithuania', item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: regionName, item: `${BASE_URL}/explore/${p.region}/` },
            { '@type': 'ListItem', position: 3, name: p.name, item: url },
          ],
        },
      },
    ],
  };

  return JSON.stringify(schema, null, 2);
}

function buildPage(p) {
  const regionName = REGION_NAMES[p.region] || p.region;
  const kindLabel = KIND_LABEL[p.kind] || p.type || '';
  const title = `${p.name} — ${regionName}, Lithuania | Discover Lithuania`;
  const desc = p.niv
    ? p.niv.slice(0, 155) + (p.niv.length > 155 ? '…' : '')
    : `${p.name} is a ${kindLabel.toLowerCase()} in ${regionName}, Lithuania.`;
  const url = `${BASE_URL}/places/${p.id}/`;
  const mapsEmbed = p.lat && p.lng
    ? `https://www.google.com/maps?q=${p.lat},${p.lng}&output=embed`
    : null;

  const starsHtml = p.rating
    ? `<span class="stars" aria-label="${p.rating} out of 5 stars">${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5 - Math.round(p.rating))}</span> <span class="rating-num">${p.rating}</span>${p.reviews ? ` <span class="reviews">(${p.reviews.toLocaleString()} reviews)</span>` : ''}`
    : '';

  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escHtml(title)}</title>
  <meta name="description" content="${escHtml(desc)}">
  <meta name="author" content="Niv Shimoni">
  <meta name="robots" content="index, follow">
  <meta name="google-site-verification" content="_NgLgo4VNBGD8IwmD2KyfQWC4dG7SJygKnMQWiOzuk4">

  <script async src="https://www.googletagmanager.com/gtag/js?id=G-0YD451PRX4"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-0YD451PRX4',{send_page_view:false});</script>

  <link rel="canonical" href="${url}">
  <link rel="alternate" hreflang="en" href="${url}">
  <link rel="alternate" hreflang="x-default" href="${url}">

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
${buildSchema(p)}
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
    <a href="${BASE_URL}/">Discover Lithuania</a>
    <span class="topbar-sep">›</span>
    <a href="${BASE_URL}/explore/${p.region}/">${escHtml(regionName)}</a>
    <span class="topbar-sep">›</span>
    <span>${escHtml(p.name)}</span>
  </nav>

  <header class="hero">
    <div class="kind-pill">${escHtml(kindLabel)}</div>
    <h1 class="place-name">${escHtml(p.emoji || '')} ${escHtml(p.name)}</h1>
    <p class="region-line"><a href="${BASE_URL}/explore/${p.region}/">${escHtml(regionName)}</a>, Lithuania</p>
    ${p.rating ? `<div class="rating-row">${starsHtml}</div>` : ''}
  </header>

  <main class="content">
    ${p.niv ? `
    <div class="card">
      <h2>About</h2>
      <p class="description">${escHtml(p.niv)}</p>
    </div>` : ''}

    <div class="card">
      <h2>Details</h2>
      <div class="details-grid">
        ${p.type ? `<div class="detail"><div class="detail-label">Type</div><div class="detail-value">${escHtml(p.type)}</div></div>` : ''}
        ${p.hours ? `<div class="detail"><div class="detail-label">Hours</div><div class="detail-value">${escHtml(p.hours)}</div></div>` : ''}
        ${p.price ? `<div class="detail"><div class="detail-label">Price</div><div class="detail-value">${escHtml(p.price)}</div></div>` : ''}
        ${p.website ? `<div class="detail"><div class="detail-label">Website</div><div class="detail-value"><a href="${escHtml(p.website)}" target="_blank" rel="noopener">${escHtml(p.website.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a></div></div>` : ''}
        <div class="detail"><div class="detail-label">Region</div><div class="detail-value"><a href="${BASE_URL}/explore/${p.region}/">${escHtml(regionName)}</a></div></div>
        ${p.lat && p.lng ? `<div class="detail"><div class="detail-label">Map</div><div class="detail-value"><a href="https://www.google.com/maps?q=${p.lat},${p.lng}" target="_blank" rel="noopener">Open in Google Maps</a></div></div>` : ''}
      </div>
    </div>

    ${mapsEmbed ? `
    <div class="card" style="padding: 0; overflow: hidden;">
      <iframe
        class="map-frame"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        src="${mapsEmbed}"
        title="${escHtml(p.name)} location map"
        aria-label="Map showing location of ${escHtml(p.name)}">
      </iframe>
    </div>` : ''}

    <div class="card cta-card">
      <h2>Explore on the interactive map</h2>
      <p>See ${escHtml(p.name)} alongside all ${PLACES.length} handpicked places in Lithuania.</p>
      <a class="cta-btn" href="${BASE_URL}/?place=${p.id}">Open in Discover Lithuania →</a>
    </div>
  </main>
</body>
</html>`;
}

// Generate pages
const placesDir = path.join(__dirname, 'places');
if (!fs.existsSync(placesDir)) fs.mkdirSync(placesDir);

let created = 0;
for (const p of PLACES) {
  const dir = path.join(placesDir, p.id);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const html = buildPage(p);
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
  created++;
}

console.log(`✓ Generated ${created} place pages in /places/`);

// Generate sitemap entries
const sitemapEntries = PLACES.map(p =>
  `  <url>\n    <loc>${BASE_URL}/places/${p.id}/</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
).join('\n');

// Read existing sitemap and append
let sitemap = fs.readFileSync(path.join(__dirname, 'sitemap.xml'), 'utf8');

// Remove existing /places/ entries if any
sitemap = sitemap.replace(/\s*<url>\s*<loc>[^<]*\/places\/[^<]*<\/loc>[\s\S]*?<\/url>/g, '');

// Insert before closing </urlset>
sitemap = sitemap.replace('</urlset>', `${sitemapEntries}\n</urlset>`);

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap, 'utf8');
console.log(`✓ Updated sitemap.xml with ${created} place URLs`);

console.log('\nDone! Run this script after any data.js update.');
