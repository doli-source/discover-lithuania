// supabase-data.js — replaces data.js
// Fetches live data from Supabase, builds window.LT_DATA, then compiles & runs JSX.
// Any change saved in the admin panel is reflected on the next page load.

(async function () {
  const SUPABASE_URL = 'https://hsovwydscmwyyvsemudg.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzb3Z3eWRzY213eXl2c2VtdWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMDkzOTEsImV4cCI6MjEwMTY4NTM5MX0.OdiHpVogpp_5U7v-XxHdapRhpP-Zz--7Yw82X0zWruA';
  const MAP_URL = 'https://maps.app.goo.gl/JcnKq69fj1RMw1RL7';

  const JSX_SCRIPTS = [
    '/tweaks-panel.jsx?v=20260626b',
    '/shared.jsx?v=20260802a',
    '/screens.jsx?v=20260804e',
    '/app.jsx?v=20260724a',
  ];

  function rest(table, qs) {
    return fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    }).then(r => r.json());
  }

  // ─── Load Supabase data ─────────────────────────────────────────────────────
  try {
    const [places, translations, regions, landmarks, dishes, facts, itineraries, stops] = await Promise.all([
      rest('places',           'select=*&order=slug'),
      rest('place_translations','select=*'),
      rest('regions',          'select=*&order=sort_order'),
      rest('landmarks',        'select=*&order=name_en'),
      rest('dishes',           'select=*&order=sort_order'),
      rest('facts',            'select=*&order=sort_order'),
      rest('itineraries',      'select=*&order=sort_order'),
      rest('itinerary_stops',  'select=*&order=sort_order'),
    ]);

    // Translation lookup: place UUID → { en: {...}, he: {...} }
    const byPlace = {};
    for (const t of translations) {
      if (!byPlace[t.place_id]) byPlace[t.place_id] = {};
      byPlace[t.place_id][t.lang] = t;
    }

    // UUID → slug lookup (itinerary stops reference places by UUID)
    const uuidToSlug = {};
    for (const p of places) uuidToSlug[p.id] = p.slug;

    // Stops lookup: itinerary_id → stops[]
    const byItin = {};
    for (const s of stops) {
      if (!byItin[s.itinerary_id]) byItin[s.itinerary_id] = [];
      byItin[s.itinerary_id].push(s);
    }

    const PLACES = places.map(p => {
      const en = byPlace[p.id]?.en || {};
      const he = byPlace[p.id]?.he || {};
      return {
        id:      p.slug,
        region:  p.region_id,
        kind:    p.category_id,
        name:    en.name || p.slug,
        type:    en.type_label || '',
        typeHe:  he.type_label || '',
        rating:  parseFloat(p.rating) || null,
        reviews: p.review_count,
        price:   p.price_range,
        emoji:   p.emoji || '📍',
        niv:     en.niv_tip || en.description || '',
        nivHe:   he.niv_tip || he.description || '',
        status:  p.is_published ? 'approved' : 'draft',
        source:  p.source,
        lat:     p.lat,
        lng:     p.lng,
        hours:   p.hours_en || '',
        hoursHe: p.hours_he || '',
        website: p.website || '',
      };
    });

    const REGIONS = regions.map(r => ({
      id:          r.id,
      he:          { name: r.name_he, tag: r.tag_he,  blurb: r.blurb_he },
      en:          { name: r.name_en, tag: r.tag_en,  blurb: r.blurb_en },
      accent:      r.accent_color || '#C28840',
      placeholder: '',
    }));

    const LANDMARKS = landmarks.map(l => ({
      id:     l.id,
      region: l.region_id,
      he:     { name: l.name_he },
      en:     { name: l.name_en },
      lat:    l.lat,
      lng:    l.lng,
    }));

    // Special visual props only stored in code (not in DB)
    const DISH_VISUAL = {
      saltibarsciai: { liquid: '#f48fb1', spoon: true },
    };

    const DISHES = dishes.map(d => ({
      id:    d.id,
      emoji: d.emoji,
      bg:    d.bg_css,
      he:    { name: d.name_he, desc: d.desc_he, tag: d.tag_he },
      en:    { name: d.name_en, desc: d.desc_en, tag: d.tag_en },
      ...(DISH_VISUAL[d.id] || {}),
    }));

    const FACTS = facts.map(f => ({ en: f.text_en, he: f.text_he }));

    const ITINERARIES = itineraries.map(it => ({
      id:       it.id,
      duration: it.duration,
      region:   it.region_id || null,
      he:       { title: it.title_he, tagline: it.tagline_he },
      en:       { title: it.title_en, tagline: it.tagline_en },
      stops:    (byItin[it.id] || []).map(s => ({
        time:       s.time || '',
        timeEn:     s.time || '',
        placeId:    s.place_id ? (uuidToSlug[s.place_id] || null) : null,
        landmarkId: s.landmark_id || null,
        he:         s.note_he || '',
        en:         s.note_en || '',
      })),
    }));

    window.LT_DATA = { REGIONS, PLACES, LANDMARKS, DISHES, ITINERARIES, FACTS, MAP_URL };

  } catch (err) {
    console.error('[LT] Supabase fetch failed:', err);
    // Empty fallback so app.jsx doesn't crash
    window.LT_DATA = {
      REGIONS: [], PLACES: [], LANDMARKS: [],
      DISHES: [], ITINERARIES: [], FACTS: [], MAP_URL
    };
  }

  // ─── Compile & run JSX scripts in order ────────────────────────────────────
  try {
    for (const src of JSX_SCRIPTS) {
      const resp = await fetch(src);
      const code = await resp.text();
      const compiled = Babel.transform(code, { presets: ['react'], plugins: ['transform-block-scoping'], filename: src }).code;
      (0, eval)(compiled);
    }
  } catch (err) {
    console.error('[LT] Failed to compile/run app scripts:', err);
  }

  // ─── Remove loading overlay ─────────────────────────────────────────────────
  const overlay = document.getElementById('lt-loading');
  if (overlay) overlay.remove();

})();
