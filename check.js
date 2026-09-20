#!/usr/bin/env node
// Pre-deploy invariant check. Run with: node check.js
//
// Every rule here exists because the invariant it guards was broken in
// production at least once. Exits non-zero if any check fails.

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SITE = 'https://lithuaniadiscovery.com';
const SUPABASE_URL = 'https://hsovwydscmwyyvsemudg.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzb3Z3eWRzY213eXl2c2VtdWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMDkzOTEsImV4cCI6MjEwMTY4NTM5MX0.OdiHpVogpp_5U7v-XxHdapRhpP-Zz--7Yw82X0zWruA';

// Static pages kept on purpose although the place is gone from the data.
// They still earn search traffic; removing them would drop those rankings.
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

const failures = [];
const warnings = [];
const fail = (rule, detail) => failures.push({ rule, detail });
const warn = (rule, detail) => warnings.push({ rule, detail });

function contentFiles() {
  const exts = new Set(['.html', '.xml', '.txt', '.json', '.jsx']);
  const skip = new Set(['node_modules', '.git', 'admin', '.netlify', 'docs', '.superpowers']);
  const out = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (skip.has(e.name)) continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (exts.has(path.extname(e.name))) out.push(p);
    }
  })(ROOT);
  return out;
}

const rel = (p) => path.relative(ROOT, p);

// The live list is the published Supabase rows plus the places that
// supabase-data.js appends by hand. Querying only Supabase undercounts.
async function livePlaces() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/places?select=slug,is_published&order=slug`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  if (!res.ok) throw new Error(`Supabase ${res.status} ${res.statusText}`);
  const fromDb = (await res.json()).filter((p) => p.is_published).map((p) => p.slug);

  const src = fs.readFileSync(path.join(ROOT, 'supabase-data.js'), 'utf8');
  const hardcoded = [...src.matchAll(/PLACES\.push\(\{\s*id:\s*'([^']+)'/g)].map((m) => m[1]);

  return [...new Set([...fromDb, ...hardcoded])];
}

// 1. The place count in meta must equal the number of published places.
//    Broken once: directories were counted instead of the data, giving 175
//    in every meta tag while the rendered page said 169.
//    "over 160" and "160+" are approximations, not claims of an exact figure,
//    so they only fail once the real count drops below them.
function checkCount(live, files) {
  const pat = /(?<![\d.])(over\s+|מעל\s+)?(\d{2,4})(\+)?\s+(?:handpicked|places|Picks|מקומות)/g;
  for (const f of files) {
    for (const m of fs.readFileSync(f, 'utf8').matchAll(pat)) {
      const [text, prefix, digits, plus] = m;
      const n = Number(digits);
      const approx = Boolean(prefix || plus);
      if (approx ? n > live.length : n !== live.length) {
        fail('place-count', `${rel(f)}: "${text.trim()}" — data has ${live.length}`);
      }
    }
  }
}

// 2. Every published place needs a static page, and every static page should
//    map to a published place unless it is deliberately kept.
function checkPages(live) {
  const dir = path.join(ROOT, 'places');
  if (!fs.existsSync(dir)) return fail('place-pages', 'places/ is missing');
  const onDisk = new Set(
    fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
  );

  for (const slug of live) {
    if (!onDisk.has(slug)) fail('place-pages', `no static page for "${slug}"`);
  }
  const liveSet = new Set(live);
  for (const d of onDisk) {
    if (!liveSet.has(d) && !KEPT_ORPHANS.has(d)) {
      fail('place-pages', `orphan page "${d}" — add to KEPT_ORPHANS or delete it`);
    }
  }
  for (const k of KEPT_ORPHANS) {
    if (liveSet.has(k)) warn('place-pages', `"${k}" is back in the data — drop it from KEPT_ORPHANS`);
  }
}

// 3b. Every published place needs a Hebrew page, and the two must point at
//     each other. A Hebrew URL whose metadata is English — or which no
//     hreflang declares — is why Hebrew queries sat at position 50+.
function checkHebrewPair(live) {
  const heb = /[\u0590-\u05FF]/;
  for (const slug of live) {
    const en = path.join(ROOT, 'places', slug, 'index.html');
    const he = path.join(ROOT, 'places', slug, 'he', 'index.html');
    if (!fs.existsSync(he)) { fail('hebrew-pair', `no Hebrew page for "${slug}"`); continue; }
    if (!fs.existsSync(en)) continue;

    const h = fs.readFileSync(he, 'utf8');
    const title = (h.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
    const desc = (h.match(/name="description" content="([^"]*)"/) || [])[1] || '';
    if (!heb.test(title)) fail('hebrew-pair', `${slug}/he/ has a non-Hebrew <title>`);
    if (!heb.test(desc)) fail('hebrew-pair', `${slug}/he/ has a non-Hebrew description`);
    if (!/"inLanguage":\s*"he"/.test(h)) fail('hebrew-pair', `${slug}/he/ schema has no inLanguage:he`);
    if (!h.includes(`/places/${slug}/he/"`)) fail('hebrew-pair', `${slug}/he/ is not self-canonical`);

    const e = fs.readFileSync(en, 'utf8');
    if (!e.includes(`hreflang="he" href="${SITE}/places/${slug}/he/"`)) {
      fail('hebrew-pair', `${slug} (en) does not declare its Hebrew alternate`);
    }
  }
}

// 3. No canonical target may be blocked by robots.txt.
//    Broken once: app.jsx canonicalled to /?place=<id> while robots.txt was
//    about to Disallow that exact pattern, orphaning every canonical target.
function checkCanonicalVsRobots() {
  const robotsPath = path.join(ROOT, 'robots.txt');
  if (!fs.existsSync(robotsPath)) return fail('robots', 'robots.txt is missing');

  const disallowed = fs
    .readFileSync(robotsPath, 'utf8')
    .split('\n')
    .filter((l) => /^\s*Disallow:/i.test(l))
    .map((l) => l.replace(/^\s*Disallow:\s*/i, '').trim())
    .filter(Boolean);

  const app = fs.readFileSync(path.join(ROOT, 'app.jsx'), 'utf8');
  const targets = [...app.matchAll(/canonicalPath\s*=\s*[`'"]([^`'"]+)/g)].map((m) => m[1]);

  for (const t of targets) {
    for (const d of disallowed) {
      // Turn a robots pattern such as /*?place= into a regex.
      const re = new RegExp('^' + d.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*'));
      const probe = t.replace(/\$\{[^}]+\}/g, 'x');
      if (re.test(probe)) {
        fail('canonical-vs-robots', `app.jsx canonicals to "${t}" but robots.txt disallows "${d}"`);
      }
    }
  }
}

// 3c. Region imagery must be real files. It once shipped as 3.3 MB of base64
//     inside a JavaScript file loaded on every page — 97% of the page weight,
//     downloaded in full whether or not a visitor ever saw one of the images.
function checkRegionImages() {
  const dir = path.join(ROOT, 'regions');
  if (!fs.existsSync(dir)) return fail('region-images', 'regions/ is missing');

  const screens = fs.readFileSync(path.join(ROOT, 'screens.jsx'), 'utf8');
  for (const m of screens.matchAll(/src=\{`(\/regions\/[^`]*)`\}/g)) {
    if (!m[1].startsWith('/')) fail('region-images', `relative image path: ${m[1]}`);
  }
  if (/REGION_IMAGES/.test(screens)) {
    fail('region-images', 'screens.jsx still reads window.REGION_IMAGES');
  }
  for (const f of contentFiles()) {
    if (f.endsWith('.html') && fs.readFileSync(f, 'utf8').includes('region-images.js')) {
      fail('region-images', `${rel(f)} still loads the deleted region-images.js`);
    }
  }
  const have = new Set(fs.readdirSync(dir).map((f) => f.replace(/\.[a-z]+$/, '')));
  for (const r of ['vilnius','trakai','kaunas','klaipeda','curonian','countryside',
                   'druskininkai','palanga','moletai','zarasai']) {
    if (!have.has(r)) fail('region-images', `no image for region "${r}"`);
  }
}

// 4. Config files that the host does not read are inert and must not be
//    trusted. The site runs on GitHub Pages, which ignores both of these.
function checkHostConfig() {
  for (const f of ['_headers', 'netlify.toml']) {
    if (fs.existsSync(path.join(ROOT, f))) {
      warn('inert-config', `${f} is a Netlify file — GitHub Pages ignores it, so its rules do nothing`);
    }
  }
}

// 5. Anything cached immutable must be versioned, or it can never be updated.
function checkImmutable() {
  const hp = path.join(ROOT, '_headers');
  if (!fs.existsSync(hp)) return;

  const blocks = fs.readFileSync(hp, 'utf8').split(/\n(?=\/)/);
  const immutable = blocks.filter((b) => /immutable/.test(b)).map((b) => b.split('\n')[0].trim());
  if (!immutable.length) return;

  const unversioned = new Set();
  for (const f of contentFiles().filter((f) => f.endsWith('.html'))) {
    const src = fs.readFileSync(f, 'utf8');
    for (const m of src.matchAll(/(?:src|href)="(\/[^"]*\.(?:js|css))"/g)) unversioned.add(m[1]);
  }

  const exempt = blocks
    .filter((b) => !/immutable/.test(b) && /Cache-Control/i.test(b))
    .map((b) => b.split('\n')[0].trim());

  for (const asset of unversioned) {
    const matched = immutable.some((pat) =>
      new RegExp('^' + pat.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$').test(asset)
    );
    // A content hash in the filename is its own cache buster.
    const hashed = /-[A-Za-z0-9_]{8,}\.(js|css)$/.test(asset);
    if (matched && !exempt.includes(asset) && !hashed) {
      fail('immutable-cache', `${asset} is cached immutable but referenced without ?v=`);
    }
  }
}

// 6. Cache rules live in two files; disagreement on one path is unpredictable.
function checkHeaderConflicts() {
  const hp = path.join(ROOT, '_headers');
  const tp = path.join(ROOT, 'netlify.toml');
  if (!fs.existsSync(hp) || !fs.existsSync(tp)) return;

  const inHeaders = new Set(
    fs.readFileSync(hp, 'utf8').split('\n').filter((l) => /^\//.test(l)).map((l) => l.trim())
  );
  const toml = fs.readFileSync(tp, 'utf8');
  for (const m of toml.matchAll(/for\s*=\s*"([^"]+)"/g)) {
    if (inHeaders.has(m[1])) continue;
    const covered = [...inHeaders].some((p) =>
      new RegExp('^' + p.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$').test(m[1])
    );
    if (covered) {
      warn('header-conflict', `netlify.toml sets "${m[1]}" but _headers also matches it — list it in both`);
    }
  }
}

// 7. Sitemap entries must exist on disk and be free of dead URLs.
function checkSitemap(live) {
  const sp = path.join(ROOT, 'sitemap.xml');
  if (!fs.existsSync(sp)) return fail('sitemap', 'sitemap.xml is missing');

  const locs = [...fs.readFileSync(sp, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (!locs.length) return fail('sitemap', 'sitemap.xml has no <loc> entries');

  for (const url of locs) {
    const p = url.replace(SITE, '').replace(/^\//, '').replace(/\/$/, '');
    if (!p) continue;
    const candidates = [p, `${p}/index.html`, `${p}.html`];
    if (!candidates.some((c) => fs.existsSync(path.join(ROOT, c)))) {
      fail('sitemap', `${url} has no file on disk`);
    }
  }
  for (const slug of live) {
    if (!locs.some((u) => u.includes(`/places/${slug}/`))) {
      warn('sitemap', `published place "${slug}" is not listed`);
    }
  }
}

// 8. Unpushed work is invisible work. Thirteen commits once sat local while
//    the live site served none of them.
function checkUnpushed() {
  try {
    const n = require('child_process')
      .execSync('git rev-list --count origin/main..HEAD 2>/dev/null', { cwd: ROOT })
      .toString().trim();
    if (Number(n) > 0) warn('deploy', `${n} commit(s) not pushed to origin/main`);
  } catch { /* no remote ref — nothing to compare */ }
}

(async () => {
  let live;
  try {
    live = await livePlaces();
  } catch (e) {
    console.error(`\x1b[31mCannot reach Supabase — no checks can run.\x1b[0m\n  ${e.message}`);
    process.exit(2);
  }

  const files = contentFiles();
  checkCount(live, files);
  checkPages(live);
  checkHebrewPair(live);
  checkRegionImages();
  checkCanonicalVsRobots();
  checkHostConfig();
  checkImmutable();
  checkHeaderConflicts();
  checkSitemap(live);
  checkUnpushed();

  console.log(`${live.length} published places · ${files.length} content files\n`);

  const group = (items) => {
    const by = {};
    for (const i of items) (by[i.rule] ||= []).push(i.detail);
    return by;
  };

  for (const [rule, items] of Object.entries(group(warnings))) {
    console.log(`\x1b[33mwarn  ${rule}\x1b[0m`);
    items.forEach((d) => console.log(`      ${d}`));
  }
  for (const [rule, items] of Object.entries(group(failures))) {
    console.log(`\x1b[31mFAIL  ${rule}\x1b[0m`);
    items.forEach((d) => console.log(`      ${d}`));
  }

  if (failures.length) {
    console.log(`\n\x1b[31m${failures.length} failure(s).\x1b[0m Do not deploy.`);
    process.exit(1);
  }
  console.log(`\n\x1b[32mAll checks passed.\x1b[0m${warnings.length ? ` ${warnings.length} warning(s).` : ''}`);
})();
