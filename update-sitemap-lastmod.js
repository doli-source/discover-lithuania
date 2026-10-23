#!/usr/bin/env node
// Sets each sitemap <lastmod> to the date of the last commit that touched the
// page's HTML file, so Google sees which pages really changed. Run after any
// generator that rewrites sitemap.xml (generate-place-pages.js stamps today's
// date on every place), then commit sitemap.xml.
//   node update-sitemap-lastmod.js
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = __dirname;
const BASE = 'https://lithuaniadiscovery.com';
const file = path.join(ROOT, 'sitemap.xml');

function htmlFor(urlPath) {
  const p = urlPath.split('?')[0].replace(/^\/|\/$/g, '');
  const candidates = p ? [`${p}/index.html`, `${p}.html`] : ['index.html'];
  return candidates.find((c) => fs.existsSync(path.join(ROOT, c)));
}

// Lines that change for technical reasons only (cache-busting, analytics,
// redirects) do not make a page "modified" for Google, so they are skipped.
const TECHNICAL = /\?v=\d|gtag\(|send_page_view|traffic_type|traffic-filter|googletagmanager|location\.(replace|search)|lang=he|^\s*$/;

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

function lastCommitDate(rel) {
  try {
    const commits = git(['log', '-n', '30', '--format=%H %cs', '--', rel]).trim().split('\n').filter(Boolean);
    for (const line of commits) {
      const [sha, date] = line.split(' ');
      const diff = git(['show', '--format=', '-U0', sha, '--', rel]);
      const real = diff.split('\n').some((l) =>
        /^[+-]/.test(l) && !/^(\+\+\+|---)/.test(l) && !TECHNICAL.test(l.slice(1)));
      if (real) return date;
    }
    return commits.length ? commits[commits.length - 1].split(' ')[1] : '';
  } catch { return ''; }
}

let changed = 0, missing = 0;
const out = fs.readFileSync(file, 'utf8').replace(
  /(<loc>([^<]+)<\/loc>\s*<lastmod>)([^<]*)(<\/lastmod>)/g,
  (whole, pre, loc, old, post) => {
    const rel = htmlFor(loc.replace(BASE, '') || '/');
    if (!rel) { missing++; return whole; }
    const d = lastCommitDate(rel);
    if (!d || d === old) return whole;
    changed++;
    return pre + d + post;
  }
);
fs.writeFileSync(file, out, 'utf8');
console.log(`lastmod updated on ${changed} URL(s)` + (missing ? `, ${missing} with no matching file` : ''));
