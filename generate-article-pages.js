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
  // about/index.html is deliberately absent: it carries three data-he strings,
  // so a Hebrew version of it would be an English page with a Hebrew nav bar.
  'blog/trakai-day-trip.html': 'blog/trakai-day-trip',
  'blog/best-restaurants-vilnius.html': 'blog/best-restaurants-vilnius',
  'blog/best-coffee-vilnius.html': 'blog/best-coffee-vilnius',
  'blog/5-days-in-lithuania.html': 'blog/5-days-in-lithuania',
  'blog/cepelinai-brigita-uyar.html': 'blog/cepelinai-brigita-uyar',
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
  const out = html.replace(
    /<([a-zA-Z0-9]+)((?:[^>]*?\s)?data-he="([^"]*)"[^>]*)>([\s\S]*?)<\/\1>/g,
    (whole, tag, attrs, he, inner) => {
      // Only swap leaf text. An element wrapping more markup keeps its children,
      // which the runtime script would have replaced wholesale — matching that
      // here would drop links, so those are left for the script.
      if (/<[a-zA-Z]/.test(inner)) return whole;
      applied++;
      return `<${tag}${attrs}>${he}</${tag}>`;
    }
  );
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

// The Hebrew title and description come from the page's own Hebrew: the h1 and
// the first substantial Hebrew paragraph. Nothing is invented here.
function hebrewMeta(html, rel) {
  const h1 = html.match(/<h1[^>]*\sdata-he="([^"]*)"/);
  const title = h1 ? unesc(h1[1]) : null;

  let desc = null;
  for (const m of html.matchAll(/data-he="([^"]{80,})"/g)) {
    const t = unesc(m[1]);
    if (HEB.test(t) && !/^[\s\W]*$/.test(t)) { desc = stripTags(t).slice(0, 158); break; }
  }
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

  const { html: bodyHe, applied } = applyHebrew(original);
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
