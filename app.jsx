// Main app — nav, screen routing, tweaks, language toggle

// Prevent iOS Safari from restoring scroll position on pushState
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

const { useState, useEffect, useMemo } = React;
const { REGIONS, PLACES, LANDMARKS, DISHES, ITINERARIES, FACTS, MAP_URL } = window.LT_DATA;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "amber",
  "fontPair": "editorial",
  "density": "comfortable",
  "rounded": "soft"
}/*EDITMODE-END*/;

const PALETTES = {
  amber:   { name: { he: 'ענברי', en: 'Amber' },   primary: '#C28840', primaryDark: '#9c6a2b', accent: '#4A7C8C', sage: '#7a9e7a', cream: '#dce6c8', ink: '#1f2a1a', tint: '#cbd9b2' },
  forest:  { name: { he: 'יער', en: 'Forest' },    primary: '#5F7A4A', primaryDark: '#465c34', accent: '#C28840', sage: '#7a9e7a', cream: '#e8efd9', ink: '#1c2218', tint: '#d3deca' },
  baltic:  { name: { he: 'בלטי', en: 'Baltic' },   primary: '#4A7C8C', primaryDark: '#356575', accent: '#C28840', sage: '#7a9e7a', cream: '#e6f0ee', ink: '#152229', tint: '#cee0dc' },
  brick:   { name: { he: 'לבני', en: 'Brick' },    primary: '#A85D4A', primaryDark: '#874434', accent: '#5F7A4A', sage: '#9a7a5a', cream: '#f1ebda', ink: '#291710', tint: '#e7dcc5' }
};

const FONT_PAIRS = {
  editorial: { name: { he: 'אדיטוריאל', en: 'Editorial' }, display: '"Instrument Serif", "Frank Ruhl Libre", serif', body: '"Rubik", system-ui, sans-serif' },
  modern:    { name: { he: 'מודרני', en: 'Modern' },     display: '"Bricolage Grotesque", "Rubik", sans-serif', body: '"Rubik", system-ui, sans-serif' },
  classic:   { name: { he: 'קלאסי', en: 'Classic' },     display: '"Frank Ruhl Libre", "Cormorant Garamond", serif', body: '"Heebo", system-ui, sans-serif' }
};

// ─── URL deep-link helpers ──────────────────────────────────────────────────
// URL scheme:
//   /               → home
//   /explore        → explore all regions
//   /explore/vilnius → explore, region pre-selected
//   /routes         → routes list
//   /routes/vilnius-day → specific itinerary open
//   /food           → food screen
//   /stays          → stays screen
//   ?place=ID       → place modal overlay (works on any screen)
//   ?lang=en        → language override (default: he)

const VALID_SCREENS = ['home', 'explore', 'routes', 'food', 'stays', 'saved', 'admin'];

function parseURL() {
  const seg = location.pathname.replace(/^\//, '').split('/').filter(Boolean);
  const qs  = new URLSearchParams(location.search);

  const rawScreen = seg[0] || 'home';
  const screen    = VALID_SCREENS.includes(rawScreen) ? rawScreen : 'home';
  const params    = {};

  if (screen === 'explore' && seg[1]) params.region = seg[1];
  if (screen === 'routes'  && seg[1]) params.route  = seg[1];

  const openPlaceId = qs.get('place') || null;
  const lang        = qs.get('lang')  || 'en';

  return { screen, params, openPlaceId, lang };
}

function buildURL(screen, params, openPlaceId, lang) {
  let path = '/';
  if (screen && screen !== 'home') {
    path = '/' + screen;
    if (screen === 'explore' && params?.region) path += '/' + params.region;
    if (screen === 'routes'  && params?.route)  path += '/' + params.route;
  }

  const qs = new URLSearchParams();
  if (openPlaceId)           qs.set('place', openPlaceId);
  if (lang && lang !== 'en') qs.set('lang',  lang);

  return path + (qs.toString() ? '?' + qs.toString() : '');
}
// ────────────────────────────────────────────────────────────────────────────

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Initialise state from the current URL
  const [lang,        setLangState]  = useState(() => parseURL().lang);
  const [screen,      setScreen]     = useState(() => parseURL().screen);
  const [params,      setParams]     = useState(() => parseURL().params);
  const [savedSet, setSavedSet]      = useState(() => new Set(JSON.parse(localStorage.getItem('lt_saved') || '[]')));
  const [adminOverrides, setAdminOverrides] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lt_admin') || '{}'); }
    catch { return {}; }
  });

  function applyAdminOverride(id, patch) {
    setAdminOverrides(prev => {
      const next = { ...prev, [id]: { ...(prev[id] || {}), ...patch } };
      localStorage.setItem('lt_admin', JSON.stringify(next));
      return next;
    });
  }

  const effectivePlaces = useMemo(() => {
    return PLACES
      .map(p => ({ ...p, ...(adminOverrides[p.id] || {}) }))
      .filter(p => p.status !== 'hidden');
  }, [adminOverrides]);

  const [openPlaceId, setOpenPlaceId] = useState(() => parseURL().openPlaceId);

  useEffect(() => {
    localStorage.setItem('lt_saved', JSON.stringify([...savedSet]));
  }, [savedSet]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
  }, [lang]);

  // SEO: per-route <title>, meta description, canonical URL + TouristTrip JSON-LD
  useEffect(() => {
    const baseTitle = lang === 'he' ? 'גלה את ליטא' : 'LithuaniaDiscovery';
    let title = `${baseTitle} — ${lang === 'he' ? 'מדריך טיולים אישי' : "A Traveler's Guide to Lithuania"}`;
    let description = lang === 'he'
      ? 'מדריך טיולים אישי לליטא — 160 מקומות נבחרים: בתי קפה, מסעדות, אתרי טבע ולינה, ב-12 אזורים. מאת ניב שמעוני.'
      : "A curated travel guide to Lithuania — 160 handpicked cafés, restaurants, stays, nature spots and ready-made routes across 12 regions. By Niv Shimoni.";
    let canonicalPath = '/';
    let touristTrip = null;

    // Place modal open — highest priority for SEO
    if (openPlaceData) {
      const regionName = openPlaceRegion ? openPlaceRegion.en.name : 'Lithuania';
      const placeType  = openPlaceData.type || 'Place';
      title       = `${openPlaceData.name} – ${placeType} in ${regionName} | LithuaniaDiscovery`;
      description = openPlaceData.niv
        ? openPlaceData.niv.slice(0, 160)
        : `${openPlaceData.name} — ${placeType} in ${regionName}, Lithuania.${openPlaceData.rating ? ` Rated ${openPlaceData.rating}/5.` : ''}`;
      canonicalPath = `/?place=${openPlaceData.id}`;

      document.title = title;
      const setMeta = (selector, attr, value) => { const el = document.querySelector(selector); if (el) el.setAttribute(attr, value); };
      setMeta('meta[name="description"]', 'content', description);
      setMeta('meta[property="og:title"]', 'content', title);
      setMeta('meta[property="og:description"]', 'content', description);
      setMeta('meta[name="twitter:title"]', 'content', title);
      setMeta('meta[name="twitter:description"]', 'content', description);
      setMeta('link[rel="canonical"]', 'href', `https://lithuaniadiscovery.com${canonicalPath}`);
      setMeta('meta[property="og:url"]', 'content', `https://lithuaniadiscovery.com${canonicalPath}`);
      return;
    }

    if (screen === 'explore' && params.region) {
      const region = REGIONS.find(r => r.id === params.region);
      if (region) {
        title = `${region[lang].name} — ${region[lang].tag} | ${baseTitle}`;
        description = region[lang].blurb;
        canonicalPath = `/explore/${params.region}`;
      }
    } else if (screen === 'explore') {
      title = lang === 'he' ? `כל האזורים | ${baseTitle}` : `Explore all regions | ${baseTitle}`;
      canonicalPath = '/explore';
    } else if (screen === 'routes' && params.route) {
      const itin = ITINERARIES.find(i => i.id === params.route);
      if (itin) {
        title = `${itin[lang].title} — ${itin[lang].tagline} | ${baseTitle}`;
        description = lang === 'he'
          ? `מסלול: ${itin.he.title}. ${itin.he.tagline}. ${itin.stops.length} תחנות בליטא.`
          : `Itinerary: ${itin.en.title}. ${itin.en.tagline}. ${itin.stops.length} stops across Lithuania.`;
        canonicalPath = `/routes/${params.route}`;
        touristTrip = {
          '@context': 'https://schema.org',
          '@type': 'TouristTrip',
          name: itin.en.title,
          description: `${itin.en.tagline}. ${itin.stops.length} stops across Lithuania.`,
          url: `https://lithuaniadiscovery.com/routes/${params.route}`,
          touristType: ['Cultural tourist', 'Nature lover', 'Food traveler'],
          itinerary: {
            '@type': 'ItemList',
            itemListElement: itin.stops.map((s, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: s.en
            }))
          }
        };
      }
    } else if (screen === 'routes') {
      title = lang === 'he' ? `מסלולים מוכנים מראש | ${baseTitle}` : `Ready-made routes | ${baseTitle}`;
      canonicalPath = '/routes';
    } else if (screen === 'food') {
      title = lang === 'he' ? `איפה לאכול ולשתות בליטא | ${baseTitle}` : `Where to eat & drink in Lithuania | ${baseTitle}`;
      canonicalPath = '/food';
    } else if (screen === 'stays') {
      title = lang === 'he' ? `איפה לישון בליטא | ${baseTitle}` : `Where to sleep in Lithuania | ${baseTitle}`;
      canonicalPath = '/stays';
    }

    document.title = title;
    const setMeta = (selector, attr, value) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);

    // Update canonical + og:url
    const canonicalUrl = `https://lithuaniadiscovery.com${canonicalPath}`;
    setMeta('link[rel="canonical"]', 'href', canonicalUrl);
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);

    // Inject / remove TouristTrip JSON-LD
    const ldId = 'ld-tourist-trip';
    let ldEl = document.getElementById(ldId);
    if (touristTrip) {
      if (!ldEl) {
        ldEl = document.createElement('script');
        ldEl.type = 'application/ld+json';
        ldEl.id = ldId;
        document.head.appendChild(ldEl);
      }
      ldEl.textContent = JSON.stringify(touristTrip, null, 0);
    } else if (ldEl) {
      ldEl.remove();
    }
  }, [screen, params, lang, openPlaceData, openPlaceRegion]);

  // SEO: BreadcrumbList + FAQ schema (home page only)
  useEffect(() => {
    const BASE = 'https://lithuaniadiscovery.com';
    const crumbs = [{ name: lang === 'he' ? 'בית' : 'Home', url: `${BASE}/` }];
    const screenNames = { explore: { he: 'גלה', en: 'Explore' }, routes: { he: 'מסלולים', en: 'Routes' }, food: { he: 'אוכל ושתייה', en: 'Food & Drink' }, stays: { he: 'לינה', en: 'Stays' } };
    if (screen !== 'home' && screenNames[screen]) crumbs.push({ name: screenNames[screen][lang], url: `${BASE}/${screen}` });
    if (screen === 'explore' && params.region) {
      const region = REGIONS.find(r => r.id === params.region);
      if (region) crumbs.push({ name: region[lang].name, url: `${BASE}/explore/${params.region}` });
    }
    if (screen === 'routes' && params.route) {
      const itin = ITINERARIES.find(i => i.id === params.route);
      if (itin) crumbs.push({ name: itin[lang].title, url: `${BASE}/routes/${params.route}` });
    }

    const breadcrumb = crumbs.length > 1 ? {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url }))
    } : null;

    const faq = screen === 'home' ? {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What is the best time to visit Lithuania?',
          acceptedAnswer: { '@type': 'Answer', text: 'May to September offers the best weather. June–August is warm and lively, with festivals and long daylight hours.' } },
        { '@type': 'Question', name: 'What currency does Lithuania use?',
          acceptedAnswer: { '@type': 'Answer', text: 'Lithuania uses the Euro (€). Very affordable compared to Western Europe — coffee ~€3, a full meal €8–15.' } },
        { '@type': 'Question', name: 'Is English widely spoken in Lithuania?',
          acceptedAnswer: { '@type': 'Answer', text: 'Yes, especially in Vilnius, Kaunas, and tourist areas. Most young people and service staff speak good English.' } },
        { '@type': 'Question', name: 'How many days do you need to visit Lithuania?',
          acceptedAnswer: { '@type': 'Answer', text: '3–7 days gives you a full experience. Vilnius alone is worth 2 days; add a day trip to Trakai Castle, and Kaunas or the Curonian Spit.' } },
        { '@type': 'Question', name: 'Is Lithuania safe for tourists?',
          acceptedAnswer: { '@type': 'Answer', text: 'Yes, Lithuania is one of the safest countries in Europe with very low crime rates. Vilnius Old Town is safe to walk at night.' } },
        { '@type': 'Question', name: 'What is Lithuania known for?',
          acceptedAnswer: { '@type': 'Answer', text: 'Lithuania is known for its medieval Vilnius Old Town (UNESCO), the Curonian Spit dunes, Baltic amber, castle islands in Trakai, and an emerging café and food scene.' } }
      ]
    } : null;

    const inject = (id, data) => {
      let el = document.getElementById(id);
      if (data) {
        if (!el) { el = document.createElement('script'); el.type = 'application/ld+json'; el.id = id; document.head.appendChild(el); }
        el.textContent = JSON.stringify(data);
      } else if (el) { el.remove(); }
    };
    inject('ld-breadcrumb', breadcrumb);
    inject('ld-faq', faq);
  }, [screen, params, lang, openPlaceData]);

  // SEO: LocalBusiness schema when a place modal is open
  useEffect(() => {
    const inject = (id, data) => {
      let el = document.getElementById(id);
      if (data) {
        if (!el) { el = document.createElement('script'); el.type = 'application/ld+json'; el.id = id; document.head.appendChild(el); }
        el.textContent = JSON.stringify(data);
      } else if (el) { el.remove(); }
    };
    if (openPlaceData) {
      const kindMap = { cafe: 'CafeOrCoffeeShop', restaurant: 'Restaurant', stay: 'LodgingBusiness', nature: 'TouristAttraction', bar: 'BarOrPub', bakery: 'Bakery' };
      const lb = {
        '@context': 'https://schema.org',
        '@type': kindMap[openPlaceData.kind] || 'LocalBusiness',
        name: openPlaceData.name,
        description: openPlaceData.niv || openPlaceData.en?.blurb || openPlaceData.type,
        url: openPlaceData.mapUrl || `https://lithuaniadiscovery.com/explore/${openPlaceData.region}`,
        ...(openPlaceData.rating && { aggregateRating: { '@type': 'AggregateRating', ratingValue: openPlaceData.rating, reviewCount: openPlaceData.reviews || 1, bestRating: 5 } }),
        ...(openPlaceData.price && { priceRange: openPlaceData.price })
      };
      inject('ld-local-business', lb);
    } else {
      inject('ld-local-business', null);
    }
  }, [openPlaceData]);

  // Handle browser back / forward
  useEffect(() => {
    const onPop = () => {
      const { screen, params, openPlaceId, lang } = parseURL();
      setScreen(screen);
      setParams(params);
      setOpenPlaceId(openPlaceId);
      setLangState(lang);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const t = STRINGS[lang];
  const palette = PALETTES[tweaks.palette] || PALETTES.amber;
  const fonts = FONT_PAIRS[tweaks.fontPair] || FONT_PAIRS.editorial;

  // Apply CSS vars
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', palette.primary);
    root.style.setProperty('--primary-dark', palette.primaryDark);
    root.style.setProperty('--accent', palette.accent);
    root.style.setProperty('--cream', palette.cream);
    root.style.setProperty('--ink', palette.ink);
    root.style.setProperty('--tint', palette.tint);
    root.style.setProperty('--sage', palette.sage);
    root.style.setProperty('--font-display', fonts.display);
    root.style.setProperty('--font-body', fonts.body);
    const densityMap = { compact: '0.85', comfortable: '1', spacious: '1.2' };
    root.style.setProperty('--density', densityMap[tweaks.density] || '1');
    const radiusMap = { sharp: '2px', soft: '12px', round: '20px' };
    root.style.setProperty('--radius', radiusMap[tweaks.rounded] || '12px');
  }, [palette, fonts, tweaks.density, tweaks.rounded]);

  // Language toggle — replaceState so switching lang doesn't clutter history
  const setLang = (newLang) => {
    setLangState(newLang);
    const p = new URLSearchParams(location.search);
    if (newLang === 'he') p.delete('lang'); else p.set('lang', newLang);
    const qs = p.toString();
    history.replaceState(null, '', qs ? '?' + qs : location.pathname);
    ga('language_toggle', { to: newLang });
  };

  const ga = (event, params) => { if (typeof gtag === 'function') gtag('event', event, params); };

  const nav = (s, p = {}) => {
    setScreen(s);
    setParams(p);
    setOpenPlaceId(null);
    history.pushState(null, '', buildURL(s, p, null, lang));
    ga('page_view', { screen_name: s, ...(p.region && { region: p.region }), ...(p.route && { route: p.route }), language: lang });
    if (!(s === 'explore' && p.region)) {
      setTimeout(() => window.scrollTo(0, 0), 10);
      setTimeout(() => window.scrollTo(0, 0), 100);
    }
  };

  const toggleSaved = (id) => {
    setSavedSet(prev => {
      const next = new Set(prev);
      const adding = !next.has(id);
      if (adding) next.add(id); else next.delete(id);
      const place = effectivePlaces.find(p => p.id === id);
      ga(adding ? 'place_save' : 'place_unsave', { place_id: id, place_name: place?.name, region: place?.region });
      return next;
    });
  };

  const openPlace = (id) => {
    setOpenPlaceId(id);
    const p = new URLSearchParams(location.search);
    p.set('place', id);
    history.pushState(null, '', '?' + p.toString());
    const place = effectivePlaces.find(pl => pl.id === id);
    ga('place_open', { place_id: id, place_name: place?.name, place_kind: place?.kind, region: place?.region });
  };
  const closePlace = () => {
    setOpenPlaceId(null);
    const p = new URLSearchParams(location.search);
    p.delete('place');
    const qs = p.toString();
    history.pushState(null, '', qs ? '?' + qs : location.pathname);
  };
  const openPlaceData = openPlaceId ? effectivePlaces.find(p => p.id === openPlaceId) : null;
  const openPlaceRegion = openPlaceData ? REGIONS.find(r => r.id === openPlaceData.region) : null;

  // Admin panel — full-screen, no NavBar/Footer
  if (screen === 'admin') {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <AdminScreen
          allPlaces={PLACES}
          adminOverrides={adminOverrides}
          onOverride={applyAdminOverride}
          regions={REGIONS}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <NavBar lang={lang} setLang={setLang} screen={screen} nav={nav} t={t} savedCount={savedSet.size} onSavedClick={() => nav('saved')} />

      <main className="main">
        {screen === 'home' && (
          <HomeScreen lang={lang} t={t} regions={REGIONS} places={effectivePlaces} landmarks={LANDMARKS}
            dishes={DISHES} itineraries={ITINERARIES} facts={FACTS} mapUrl={MAP_URL} nav={nav}
            savedSet={savedSet} toggleSaved={toggleSaved} openPlace={openPlace} />
        )}
        {screen === 'explore' && (
          <ExploreScreen lang={lang} t={t} regions={REGIONS} places={effectivePlaces} mapUrl={MAP_URL} params={params} nav={nav}
            savedSet={savedSet} toggleSaved={toggleSaved} openPlace={openPlace} />
        )}
        {screen === 'routes' && (
          <RoutesScreen lang={lang} t={t} regions={REGIONS} places={effectivePlaces} landmarks={LANDMARKS} itineraries={ITINERARIES}
            params={params} openPlace={openPlace} />
        )}
        {screen === 'food' && (
          <FoodScreen lang={lang} t={t} places={effectivePlaces} dishes={DISHES} regions={REGIONS}
            savedSet={savedSet} toggleSaved={toggleSaved} openPlace={openPlace} />
        )}
        {screen === 'stays' && (
          <StaysScreen lang={lang} t={t} places={effectivePlaces} regions={REGIONS}
            savedSet={savedSet} toggleSaved={toggleSaved} openPlace={openPlace} />
        )}
        {screen === 'saved' && (
          <SavedScreen
            savedSet={savedSet}
            places={effectivePlaces}
            regions={REGIONS}
            lang={lang}
            t={t}
            openPlace={openPlace}
            toggleSaved={toggleSaved}
          />
        )}
        {screen === 'blog' && (
          <BlogScreen lang={lang} t={t} />
        )}
      </main>

      <Footer lang={lang} t={t} nav={nav} />

      {openPlaceData && (
        <PlaceModal
          place={openPlaceData}
          region={openPlaceRegion}
          lang={lang}
          t={t}
          onClose={closePlace}
          saved={savedSet.has(openPlaceId)}
          onToggleSaved={toggleSaved}
          mapUrl={MAP_URL}
        />
      )}

      <Tweaks lang={lang} tweaks={tweaks} setTweak={setTweak} />

      <a
        className="wa-float"
        href={`https://wa.me/972534228282?text=${encodeURIComponent(lang === 'en' ? 'Hey Niv! I have a question about Lithuania 🌿' : 'היי ניב! יש לי שאלה על ליטא 🌿')}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="צור קשר בוואטסאפ"
        onClick={() => ga('whatsapp_click', { screen, language: lang })}
      >
        <svg viewBox="0 0 24 24" fill="white" width="28" height="28" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.535 5.845L.057 23.25c-.09.334.232.635.563.52l5.565-1.935A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-1.9 0-3.68-.512-5.21-1.402l-.374-.218-3.878 1.348 1.306-3.77-.24-.39A9.711 9.711 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
        </svg>
      </a>
    </div>
  );
}

function NavBar({ lang, setLang, screen, nav, t, savedCount, onSavedClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const items = [
    { id: 'home', label: t.nav.home },
    { id: 'explore', label: t.nav.explore },
    { id: 'routes', label: t.nav.routes },
    { id: 'food', label: t.nav.food },
    { id: 'stays', label: t.nav.stays },
    { id: 'blog', label: t.nav.blog }
  ];

  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>
        </button>
        <a className="brand" href="/" onClick={(e) => { e.preventDefault(); nav('home'); }}>
          <span className="brand-mark">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M12 2 L14 9 L21 11 L14 13 L12 22 L10 13 L3 11 L10 9 Z" opacity="0.95"/>
            </svg>
          </span>
          <span className="brand-text">
            <span className="brand-name">{t.siteName}</span>
            <span className="brand-sub">{t.siteSub}</span>
          </span>
        </a>

        <nav className="nav-links">
          {items.map(item => (
            <a
              key={item.id}
              href={item.id === 'home' ? '/' : `/${item.id}`}
              className={`nav-link ${screen === item.id ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); nav(item.id); }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          {savedCount > 0 && (
            <button className="saved-btn" onClick={onSavedClick} aria-label={t.yourTrip}>
              <Icon.bookmarkFill/>
              <span>{savedCount}</span>
            </button>
          )}
          <button
            className="lang-toggle"
            onClick={() => setLang(lang === 'he' ? 'en' : 'he')}
            aria-label="Toggle language"
          >
            <Icon.globe/>
            <span className={lang === 'he' ? 'active' : ''}>עב</span>
            <span className="lang-sep">·</span>
            <span className={lang === 'en' ? 'active' : ''}>EN</span>
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="mobile-nav">
          {items.map(item => (
            <a
              key={item.id}
              href={item.id === 'home' ? '/' : `/${item.id}`}
              className={`mobile-link ${screen === item.id ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); nav(item.id); setMobileOpen(false); }}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

function Footer({ lang, t, nav }) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <h3 className="footer-name">{t.siteName}</h3>
          <p className="footer-sub">
            {lang === 'he'
              ? 'מדריך אישי לליטא — בלי פאתוס, רק מה שכיף.'
              : 'A friendly guide to Lithuania — no pretense, just what\'s fun.'}
          </p>
          <div className="footer-about">
            <p className="footer-about-bio">
              {lang === 'he'
                ? 'ניב שמעוני. יזם, עובד עם AI, ומבלה בליטא יותר ממה שתכנן. האתר הזה הוא התוצאה.'
                : 'Niv Shimoni. Entrepreneur, AI builder, and someone who keeps ending up in Lithuania. This site is the result.'}
            </p>
            <div className="footer-social">
              <a className="footer-social-icon" href="mailto:Niv.shimoni@gmail.com" title="Gmail" aria-label="Email">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="4" fill="#EA4335"/>
                  <path d="M4 7.5L12 13L20 7.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <rect x="4" y="7" width="16" height="11" rx="1" stroke="white" strokeWidth="1.5" fill="none"/>
                </svg>
              </a>
              <a className="footer-social-icon" href="https://www.instagram.com/nivshimoni/" target="_blank" rel="noopener noreferrer" title="Instagram" aria-label="Instagram">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#F58529"/>
                      <stop offset="50%" stopColor="#DD2A7B"/>
                      <stop offset="100%" stopColor="#8134AF"/>
                    </linearGradient>
                  </defs>
                  <rect width="24" height="24" rx="6" fill="url(#ig-grad)"/>
                  <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.5" fill="none"/>
                  <circle cx="17" cy="7" r="1" fill="white"/>
                  <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" stroke="white" strokeWidth="1.5" fill="none"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-cols">
          <div className="footer-col">
            <h5>{lang === 'he' ? 'גלה' : 'Explore'}</h5>
            <a href="/explore" onClick={(e) => { e.preventDefault(); nav('explore'); }}>{t.nav.explore}</a>
            <a href="/routes" onClick={(e) => { e.preventDefault(); nav('routes'); }}>{t.nav.routes}</a>
            <a href="/food" onClick={(e) => { e.preventDefault(); nav('food'); }}>{t.nav.food}</a>
          </div>
          <div className="footer-col">
            <h5>{lang === 'he' ? 'אזורים' : 'Regions'}</h5>
            {REGIONS.map(r => (
              <a key={r.id} href={`/explore/${r.id}`} onClick={(e) => { e.preventDefault(); nav('explore', { region: r.id }); }}>{r[lang].name}</a>
            ))}
          </div>
          <div className="footer-col">
            <h5>{lang === 'he' ? 'מידע' : 'Info'}</h5>
            <button>{lang === 'he' ? 'מטבע: יורו (€)' : 'Currency: Euro (€)'}</button>
            <button>{lang === 'he' ? 'שפה: ליטאית' : 'Language: Lithuanian'}</button>
            <button>{lang === 'he' ? 'אזור זמן: +2 GMT' : 'Time: +2 GMT'}</button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 · {lang === 'he' ? 'מדריך לא רשמי' : 'An unofficial guide'}</span>
        <span className="footer-tag">Made with ♥ for the curious traveler</span>
      </div>
    </footer>
  );
}

function Tweaks({ lang, tweaks, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label={lang === 'he' ? 'צבע נושא' : 'Theme color'}>
        <TweakColor
          label={lang === 'he' ? 'פלטה' : 'Palette'}
          value={PALETTES[tweaks.palette]?.primary || PALETTES.amber.primary}
          options={['amber','forest','baltic','brick'].map(k => PALETTES[k].primary)}
          onChange={(v) => {
            const found = Object.entries(PALETTES).find(([_, p]) => p.primary === v);
            if (found) setTweak('palette', found[0]);
          }}
        />
      </TweakSection>
      <TweakSection label={lang === 'he' ? 'טיפוגרפיה' : 'Typography'}>
        <TweakSelect
          label={lang === 'he' ? 'פונטים' : 'Font pair'}
          value={tweaks.fontPair}
          options={Object.entries(FONT_PAIRS).map(([k, v]) => ({ value: k, label: v.name[lang] }))}
          onChange={(v) => setTweak('fontPair', v)}
        />
      </TweakSection>
      <TweakSection label={lang === 'he' ? 'תצוגה' : 'Display'}>
        <TweakRadio
          label={lang === 'he' ? 'צפיפות' : 'Density'}
          value={tweaks.density}
          options={[
            { value: 'compact', label: lang === 'he' ? 'דחוס' : 'Compact' },
            { value: 'comfortable', label: lang === 'he' ? 'נוח' : 'Cozy' },
            { value: 'spacious', label: lang === 'he' ? 'מרווח' : 'Roomy' }
          ]}
          onChange={(v) => setTweak('density', v)}
        />
        <TweakRadio
          label={lang === 'he' ? 'פינות' : 'Corners'}
          value={tweaks.rounded}
          options={[
            { value: 'sharp', label: lang === 'he' ? 'חדות' : 'Sharp' },
            { value: 'soft', label: lang === 'he' ? 'רכות' : 'Soft' },
            { value: 'round', label: lang === 'he' ? 'עגולות' : 'Round' }
          ]}
          onChange={(v) => setTweak('rounded', v)}
        />
      </TweakSection>
    </TweaksPanel>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
