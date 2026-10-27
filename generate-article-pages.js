#!/usr/bin/env node
// Builds the Hebrew version of the hand-written static pages — the blog posts
// and the about page. Their Hebrew already exists in data-he attributes and is
// swapped in after load, which leaves the served HTML English: English title,
// English description, English body until JavaScript runs.
//
// This writes that same Hebrew into the HTML itself, so a crawler reads a
// Hebrew page without having to execute anything.
//
// Run: node generate-article-pages.js [--dry-run]

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const BASE_URL = 'https://lithuaniadiscovery.com';
const dryRun = process.argv.includes('--dry-run');

// source file → [English URL path, Hebrew URL path]
const ARTICLES = {
  'about/index.html': 'about',
  'blog/trakai-day-trip.html': 'blog/trakai-day-trip',
  'blog/best-restaurants-vilnius.html': 'blog/best-restaurants-vilnius',
  'blog/best-coffee-vilnius.html': 'blog/best-coffee-vilnius',
  'blog/5-days-in-lithuania.html': 'blog/5-days-in-lithuania',
  'blog/cepelinai-brigita-uyar.html': 'blog/cepelinai-brigita-uyar',
  'blog/agnes-br-ceramics.html': 'blog/agnes-br-ceramics',
  'blog/doyou-place.html': 'blog/doyou-place',
  'blog/zagares-beigeliai.html': 'blog/zagares-beigeliai',
  'blog/jekaterina-brew-bakery.html': 'blog/jekaterina-brew-bakery',
  'blog/ieva-elvyra-natural-wine.html': 'blog/ieva-elvyra-natural-wine',
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const unesc = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
                      .replace(/&amp;/g, '&').replace(/&#39;/g, "'");
const stripTags = (s) => s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const HEB = /[֐-׿]/;

const failures = [];

// Replace each element's text with its data-he value, the same substitution the
// page's own script performs at runtime.
function applyHebrew(html) {
  let applied = 0;
  let out = '';
  let i = 0;

  // A regex cannot find the end of a start tag here: data-en values on the
  // 5-days post contain <a href="…">, and the ">" inside that quoted value
  // ends the match early. Scan instead, tracking whether we are inside an
  // attribute value, so the tag boundary is the real one.
  while (i < html.length) {
    const lt = html.indexOf('<', i);
    if (lt === -1) { out += html.slice(i); break; }

    const nameMatch = /^<([a-zA-Z][a-zA-Z0-9]*)/.exec(html.slice(lt, lt + 24));
    if (!nameMatch) { out += html.slice(i, lt + 1); i = lt + 1; continue; }

    // Walk to the ">" that actually closes this start tag.
    let j = lt + 1, quote = null;
    while (j < html.length) {
      const c = html[j];
      if (quote) { if (c === quote) quote = null; }
      else if (c === '"' || c === "'") quote = c;
      else if (c === '>') break;
      j++;
    }
    if (j >= html.length) { out += html.slice(i); break; }

    const tag = nameMatch[1];
    const attrs = html.slice(lt + 1 + tag.length, j);
    const he = /(?:^|\s)data-he=("([^"]*)"|'([^']*)')/.exec(attrs);
    const close = `</${tag}>`;
    const closeAt = html.indexOf(close, j + 1);

    if (!he || closeAt === -1) { out += html.slice(i, j + 1); i = j + 1; continue; }

    const inner = html.slice(j + 1, closeAt);
    // A container holding another data-he element keeps its children, or the
    // nested translation is discarded before it is applied.
    if (/data-he=/.test(inner) || /<[a-zA-Z][a-zA-Z0-9]*\s[^>]*data-he/.test(inner)) {
      out += html.slice(i, j + 1); i = j + 1; continue;
    }

    const value = he[2] !== undefined ? he[2] : he[3];
    out += html.slice(i, lt) + `<${tag}${attrs}>` + value + close;
    i = closeAt + close.length;
    applied++;
  }
  return { html: out, applied };
}


// FAQ schema is what an answer engine actually reads, so a Hebrew page whose
// JSON-LD still asks its questions in English is answering for the wrong
// audience. The translations are already on the page in data-he; this pairs
// each English string with its Hebrew and rewrites the schema.
function translateSchema(html, source) {
  const pairs = new Map();
  for (const m of source.matchAll(
    /<[a-zA-Z0-9]+(?:[^>]*?\s)?data-he="([^"]*)"[^>]*>([^<]+)</g
  )) {
    const he = unesc(m[1]).trim();
    const en = unesc(m[2]).trim();
    if (en && he && en !== he) pairs.set(en, he);
  }

  let swapped = 0;
  const out = html.replace(
    /("(?:name|text|headline|description)":\s*")([^"]+)(")/g,
    (whole, open, value, close) => {
      const en = unesc(value).trim();
      const he = pairs.get(en);
      if (!he) return whole;
      swapped++;
      return open + he.replace(/"/g, '\\"') + close;
    }
  );
  return { html: out, swapped };
}

// Hand-written Hebrew descriptions. Without these, the first paragraph is cut
// at 158 characters, which ended mid-word on these posts (GSC, Oct 2026).
const HE_DESC = {
  "blog/5-days-in-lithuania": "מסלול של 5 ימים בליטא: יומיים מלאים בעיר העתיקה של וילנה, טיול יום לטירת טראקאי, קובנה של הארט-דקו, ובוקר רגוע לפני הטיסה חזרה.",
  "blog/trakai-day-trip": "טרקאי נמצאת 28 ק״מ מווילנה: טירה מלבנים אדומות מהמאה ה-14 באמצע אגם גלבה, כפרי דייגים ותרבות קראית בת 600 שנה. כל מה שצריך ליום כיף מווילנה.",
  "blog/best-coffee-vilnius": "6 בתי הקפה הכי טובים בווילנה, מקלייניות ספיישלטי ועד בארי אספרסו קטנים. המקומות ששווים את הזמן שלכם, שנבחרו מתוך עשרות ביקורים ברחבי העיר.",
  "blog/doyou-place": "DOYOU PLACE: שלוש בקתות עץ משולשות ביער, על אגם, שעת נסיעה מווילנה. ביליתי שם כמה ימים, ואלה הרשמים שלי מהמקום.",
  "blog/zagares-beigeliai": "ארנסטה, האופה שמאחורי Žagarės Beigeliai, מספרת איך החזירה את הבייגלה לז'אגארה. בייגלים ולחם במחמצת בבית ישן מלבנים אדומות, הרחק מווילנה.",
  "blog/best-restaurants-vilnius": "9 המסעדות הכי טובות בווילנה, מפלוב ב-€5 ביד אוזבקית נסתרת ועד סטייקים מיובשים. איטלקי, יהודי ליטאי, אוזבקי וים תיכוני, עם יחס איכות-מחיר מצוין."
};

// Hebrew <title> overrides. Israelis search "וילנה" (one vav); the h1 says
// "בווילנה", so the title is phrased around the search term (GSC, Oct 2026).
const HE_TITLE = {
  'blog/best-restaurants-vilnius': 'מסעדות בוילנה: 9 המקומות הכי טובים (מדריך מקומי)',
  'blog/best-coffee-vilnius': 'בתי קפה בוילנה: 6 הכי טובים (מדריך מקומי)',
};

// The Hebrew title and description come from the page's own Hebrew: the h1 and
// the first substantial Hebrew paragraph. Nothing is invented here.
// Cut at the last full sentence that fits, or else at the last whole word.
function shortenAtBoundary(s, max) {
  s = s.trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  if (end > max * 0.5) return cut.slice(0, end + 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:\u2014-]+$/, '') + '…';
}

function hebrewMeta(html, rel) {
  const h1 = html.match(/<h1[^>]*\sdata-he="([^"]*)"/);
  const title = HE_TITLE[rel] || (h1 ? unesc(h1[1]) : null);

  let desc = null;
  for (const m of html.matchAll(/data-he="([^"]{80,})"/g)) {
    const t = unesc(m[1]);
    if (HEB.test(t) && !/^[\s\W]*$/.test(t)) { desc = shortenAtBoundary(stripTags(t), 158); break; }
  }
  if (HE_DESC[rel]) desc = HE_DESC[rel];
  return { title, desc };
}

let wrote = 0;
for (const [src, rel] of Object.entries(ARTICLES)) {
  const file = path.join(ROOT, src);
  if (!fs.existsSync(file)) { failures.push(`missing: ${src}`); continue; }

  const original = fs.readFileSync(file, 'utf8');
  const { title, desc } = hebrewMeta(original, rel);
  if (!title) { failures.push(`${src}: no Hebrew <h1> to build a title from`); continue; }
  if (!desc) { failures.push(`${src}: no Hebrew text long enough for a description`); continue; }

  let { html: bodyHe, applied } = applyHebrew(original);

  // Counts rendered from data rather than written as copy, so they carry no
  // data-he of their own and stayed English on the Hebrew page.
  bodyHe = bodyHe
    .replace(/\((\d[\d,]*)\s+reviews\)/g, '($1 ביקורות)')
    .replace(/(?<![a-zA-Z])diesel(?![a-zA-Z])/g, 'דיזל')
    .replace(/(\d+)\s*km(?![a-zA-Z])/g, '$1 ק״מ')
    .replace(/~(\d+)h(?![a-zA-Z])/g, '~$1 שעות')
    .replace(/>Steak</g, '>סטייק<');
  const { html: translated, swapped } = translateSchema(bodyHe, original);
  if (applied < 5) { failures.push(`${src}: only ${applied} Hebrew swaps — check the markup`); continue; }

  const enUrl = `${BASE_URL}/${rel}`;
  const heUrl = `${BASE_URL}/${rel}/he/`;
  const fullTitle = `${title} | גלה את ליטא`;

  let out = translated
    .replace(/<html[^>]*>/, '<html lang="he" dir="rtl">')
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(fullTitle)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(desc)}">`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${esc(fullTitle)}">`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${esc(desc)}">`)
    .replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${esc(fullTitle)}">`)
    .replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${esc(desc)}">`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${heUrl}">`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${heUrl}">`)
    .replace(/<meta property="og:locale" content="[^"]*"\s*\/?>/, '<meta property="og:locale" content="he_IL">')
    .replace(/"inLanguage":\s*"en"/g, '"inLanguage": "he"');

  // The article-level headline and description in the schema have no data-he
  // twin to pair with — they mirror the head meta, so they take the Hebrew
  // title and description computed above. Proper nouns are left alone.
  const jsonEsc = (v) => v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  out = out
    .replace(/("headline":\s*")[^"]+(")/g, `$1${jsonEsc(title)}$2`)
    .replace(/("description":\s*")[^"]{40,}(")/g, `$1${jsonEsc(desc)}$2`);

  const alts =
    `  <link rel="alternate" hreflang="en" href="${enUrl}">\n` +
    `  <link rel="alternate" hreflang="he" href="${heUrl}">\n` +
    `  <link rel="alternate" hreflang="x-default" href="${enUrl}">`;
  out = out.replace(/(?:[ \t]*<link rel="alternate" hreflang="[^"]*" href="[^"]*"\s*\/?>\n?)+/g, alts + '\n');
  if (!/hreflang="he"/.test(out)) out = out.replace(/<link rel="canonical"[^>]*>/, (m) => `${m}\n${alts}`);

  // The English page must declare the Hebrew alternate back.
  let en = original;
  if (!en.includes(`hreflang="he" href="${heUrl}"`)) {
    en = en.replace(/(?:[ \t]*<link rel="alternate" hreflang="[^"]*" href="[^"]*"\s*\/?>\n?)+/g, alts + '\n');
    if (!en.includes(`hreflang="he" href="${heUrl}"`)) {
      en = en.replace(/<link rel="canonical"[^>]*>/, (m) => `${m}\n${alts}`);
    }
  }

  if (!dryRun) {
    const heFile = path.join(ROOT, rel, 'he', 'index.html');
    fs.mkdirSync(path.dirname(heFile), { recursive: true });
    fs.writeFileSync(heFile, out, 'utf8');
    if (en !== original) fs.writeFileSync(file, en, 'utf8');
  }
  wrote++;
  console.log(`  ${rel}  ${applied} body · ${swapped} schema  "${title.slice(0, 40)}"`);
}

console.log(`\n${dryRun ? 'would write' : 'wrote'} ${wrote} Hebrew article pages`);
if (failures.length) {
  console.error(`\n\x1b[31m${failures.length} problem(s):\x1b[0m`);
  failures.forEach((f) => console.error(`  ${f}`));
  process.exit(1);
}
if (dryRun) console.log('Dry run — nothing was written.');
