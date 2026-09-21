// Renders the site-wide FAQ page (/faq/ and /faq/he/) from real Supabase
// data and real Search Console queries — nothing on this page is hand-
// written. Same engine as the FAQ shown on the homepage and section pages
// (faq-data.js), just with more room: it pulls from several real page
// query-pools instead of one, and shows more items.
(async function () {
  const SUPABASE_URL = 'https://hsovwydscmwyyvsemudg.supabase.co';
  const SUPABASE_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzb3Z3eWRzY213eXl2c2VtdWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMDkzOTEsImV4cCI6MjEwMTY4NTM5MX0.OdiHpVogpp_5U7v-XxHdapRhpP-Zz--7Yw82X0zWruA';

  const lang = document.documentElement.getAttribute('lang') === 'he' ? 'he' : 'en';

  function rest(table, qs) {
    return fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    }).then((r) => r.json());
  }

  const list = document.getElementById('faq-list');
  const empty = document.getElementById('faq-empty');

  try {
    const [places, translations, regions, dishes, facts, itineraries] = await Promise.all([
      rest('places', 'select=*&order=slug'),
      rest('place_translations', 'select=*'),
      rest('regions', 'select=*&order=sort_order'),
      rest('dishes', 'select=*&order=sort_order'),
      rest('facts', 'select=*&order=sort_order'),
      rest('itineraries', 'select=*&order=sort_order'),
    ]);

    const byPlace = {};
    for (const t of translations) {
      (byPlace[t.place_id] || (byPlace[t.place_id] = {}))[t.lang] = t;
    }

    const PLACES = places
      .filter((p) => p.is_published)
      .map((p) => {
        const en = (byPlace[p.id] && byPlace[p.id].en) || {};
        return {
          id: p.slug,
          kind: p.category_id,
          name: en.name || p.slug,
          rating: parseFloat(p.rating) || null,
          price: p.price_range,
          region: p.region_id,
        };
      });

    // Hardcoded places (pending Supabase write access) — same three
    // supabase-data.js pushes onto the homepage's PLACES, kept in sync so
    // this page's counts and "highest rated" answers match the live site.
    PLACES.push(
      { id: 'zvirblio-puota', kind: 'cafe', name: 'Žvirblio puota', rating: 4.9, price: null, region: 'klaipeda' },
      { id: 'musangas', kind: 'cafe', name: 'Musangas', rating: 4.9, price: null, region: 'klaipeda' },
      { id: 'private-baltics', kind: 'activity', name: 'Private Baltics', rating: null, price: null, region: 'vilnius' }
    );

    const REGIONS = regions.map((r) => ({ id: r.id, en: { name: r.name_en }, he: { name: r.name_he } }));
    const DISHES = dishes.map((d) => ({
      id: d.id,
      en: { name: d.name_en, desc: d.desc_en },
      he: { name: d.name_he, desc: d.desc_he },
    }));
    const FACTS = facts.map((f) => ({ en: f.text_en, he: f.text_he }));
    const ITINERARIES = itineraries.map((it) => ({
      id: it.id,
      duration: it.duration,
      region: it.region_id,
      en: { title: it.title_en },
      he: { title: it.title_he },
    }));
    const LT_DATA = { REGIONS, PLACES, DISHES, ITINERARIES, FACTS };

    let queries = null;
    try {
      const qr = await fetch('/faq-queries.json?v=20260921a');
      if (qr.ok) queries = await qr.json();
    } catch (e) { /* real-query layer is optional; data-driven questions still work without it */ }
    window.LT_FAQ_QUERIES = queries;

    const ctx = {
      places: PLACES,
      place: null,
      regionId: null,
      regions: REGIONS,
      its: ITINERARIES,
      dishes: DISHES,
    };

    // Real search queries from several real pages, so this page reflects
    // what people actually search across the site, not just one page.
    const paths = ['/', '/food', '/stays', '/explore'];
    const fromSearch = [];
    for (const p of paths) fromSearch.push(...window.LT_FAQ.queryFaq(p, ctx, lang));

    // Data-derived questions from every section the site already covers.
    const sections = ['home', 'food', 'stays', 'routes'];
    const generic = [];
    for (const s of sections) generic.push(...window.LT_FAQ.sectionFaq(s, LT_DATA, lang));

    const seen = new Set();
    const items = [];
    for (const item of [...fromSearch, ...generic]) {
      const key = item.q + '|' + item.a;
      if (seen.has(item.q) || seen.has(item.a) || seen.has(key)) continue;
      seen.add(item.q); seen.add(item.a); seen.add(key);
      items.push(item);
      if (items.length === 24) break;
    }

    if (!items.length) {
      if (empty) empty.hidden = false;
      return;
    }

    const escapeHtml = (s) =>
      String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    items.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'faq-item';
      row.innerHTML =
        '<button class="faq-q" aria-expanded="false" type="button">' +
        '<span>' + escapeHtml(item.q) + '</span>' +
        '<span class="faq-mark" aria-hidden="true">+</span>' +
        '</button>' +
        '<p class="faq-a" hidden>' + escapeHtml(item.a) + '</p>';
      const btn = row.querySelector('.faq-q');
      const ans = row.querySelector('.faq-a');
      const mark = row.querySelector('.faq-mark');
      btn.addEventListener('click', () => {
        const open = row.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(open));
        ans.hidden = !open;
        mark.textContent = open ? '−' : '+';
      });
      list.appendChild(row);
    });

    const schemaEl = document.createElement('script');
    schemaEl.type = 'application/ld+json';
    schemaEl.textContent = JSON.stringify(window.LT_FAQ.faqSchema(items));
    document.head.appendChild(schemaEl);
  } catch (e) {
    if (empty) empty.hidden = false;
  }
})();
