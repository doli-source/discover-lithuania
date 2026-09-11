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
    '/screens.jsx?v=20260909b',
    '/app.jsx?v=20260817b',
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
        status:  p.is_published ? 'approved' : 'hidden',
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
        descHe:     s.desc_he || '',
        descEn:     s.desc_en || '',
      })),
    }));

    // Hardcoded places (pending Supabase write access)
    PLACES.push({
      id:      'zvirblio-puota',
      region:  'klaipeda',
      kind:    'cafe',
      name:    'Žvirblio puota',
      type:    'Bakery',
      typeHe:  'מאפייה',
      rating:  4.9,
      reviews: 134,
      price:   null,
      emoji:   '🥐',
      niv:     'A beautiful sourdough bakery at Liepų g. 64 in Klaipėda — known for exceptional cinnamon cardamom buns, creative brioche with caramelized onion and chorizo, and crusty sourdough loaves. Friendly staff, lovely atmosphere, and the kind of quality that makes it worth a special trip.',
      nivHe:   'מאפייה סיאורדו מקסימה ברחוב ליפו 64 בקלייפדה — ידועה בלחמניות קינמון והל יוצאות דופן, בריוש יצירתי עם בצל מקורמל וצ\'וריסו ולחמי מחמצת פריכים. צוות ידידותי, אווירה נעימה, ואיכות שמצדיקה ביקור מיוחד.',
      status:  'approved',
      source:  'niv',
      lat:     null,
      lng:     null,
      hours:   'Closes 19:00',
      hoursHe: 'סגירה 19:00',
      website: 'https://zvirbliopuota.lt/',
    });
    PLACES.push({
      id:      'musangas',
      region:  'klaipeda',
      kind:    'cafe',
      name:    'Musangas',
      type:    'Coffee Roaster',
      typeHe:  'בית קלייה לקפה',
      rating:  4.9,
      reviews: 137,
      price:   null,
      emoji:   '☕',
      niv:     'Minimalist coffee roaster and café at Liepų g. 64 in Klaipėda — a beautiful space with style, expert baristas, and outstanding coffee. Right next door to Žvirblio puota bakery, making them the perfect Klaipėda combo.',
      nivHe:   'בית קלייה לקפה מינימליסטי ובית קפה ברחוב ליפו 64 בקלייפדה — חלל יפהפה עם סטייל, בריסטה מקצועית וקפה מצוין. ממוקם ממש לצד מאפיית Žvirblio puota — שילוב מושלם.',
      status:  'approved',
      source:  'niv',
      lat:     null,
      lng:     null,
      hours:   'Closes 19:00',
      hoursHe: 'סגירה 19:00',
      website: 'https://musangas.lt/',
    });
    PLACES.push({
      id:      'private-baltics',
      region:  'vilnius',
      kind:    'activity',
      name:    'Private Baltics',
      type:    'Private Tours & Transfers',
      typeHe:  'סיורים פרטיים והסעות',
      rating:  null,
      reviews: null,
      price:   null,
      emoji:   '🗺️',
      niv:     'Boutique travel organizer offering private tours and transfers across the Baltics since 2005. Whether you need a private guide for Vilnius, a transfer to Trakai, or a full Baltic itinerary — Private Baltics delivers a personalized, high-quality experience.',
      nivHe:   'מארגן נסיעות בוטיק המציע סיורים פרטיים והסעות ברחבי מדינות הבלטי מאז 2005. בין אם אתם מחפשים מדריך פרטי לווילנה, הסעה לטראקאי, או מסלול מרובה ימים — Private Baltics מספקים חוויה אישית ואיכותית.',
      status:  'approved',
      source:  'niv',
      lat:     null,
      lng:     null,
      hours:   '',
      hoursHe: '',
      website: 'https://www.privatebaltics.com/',
    });

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
