// Main app — nav, screen routing, tweaks, language toggle

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
  const lang        = qs.get('lang')  || 'he';
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
  if (lang && lang !== 'he') qs.set('lang',  lang);
  return path + (qs.toString() ? '?' + qs.toString() : '');
}

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
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

  useEffect(() => {
    const baseTitle = lang === 'he' ? 'גלה את ליטא' : 'Discover Lithuania';
    let title = `${baseTitle} — ${lang === 'he' ? 'מדריך טיולים אישי' : "A Traveler's Guide"}`;
    let description = lang === 'he'
      ? 'מדריך טיולים אישי לליטא — 141 מקומות נבחרים'
      : "A curated travel guide to Lithuania — 141 handpicked places. By Niv Shimoni.";
    if (screen === 'explore' && params.region) {
      const region = REGIONS.find(r => r.id === params.region);
      if (region) { title = `${region[lang].name} — ${region[lang].tag} | ${baseTitle}`; description = region[lang].blurb; }
    } else if (screen === 'explore') {
      title = lang === 'he' ? `כל האזורים | ${baseTitle}` : `Explore all regions | ${baseTitle}`;
    } else if (screen === 'routes') {
      title = lang === 'he' ? `מסלולים | ${baseTitle}` : `Routes | ${baseTitle}`;
    } else if (screen === 'food') {
      title = lang === 'he' ? `איפה לאכול | ${baseTitle}` : `Food & drink | ${baseTitle}`;
    } else if (screen === 'stays') {
      title = lang === 'he' ? `איפה לישון | ${baseTitle}` : `Where to sleep | ${baseTitle}`;
    }
    document.title = title;
    const setMeta = (sel, attr, val) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, val); };
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
  }, [screen, params, lang]);

  useEffect(() => {
    const onPop = () => {
      const { screen, params, openPlaceId, lang } = parseURL();
      setScreen(screen); setParams(params); setOpenPlaceId(openPlaceId); setLangState(lang);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const t = STRINGS[lang];
  const palette = PALETTES[tweaks.palette] || PALETTES.amber;
  const fonts = FONT_PAIRS[tweaks.fontPair] || FONT_PAIRS.editorial;

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

  const setLang = (newLang) => {
    setLangState(newLang);
    const p = new URLSearchParams(location.search);
    if (newLang === 'he') p.delete('lang'); else p.set('lang', newLang);
    const qs = p.toString();
    history.replaceState(null, '', qs ? '?' + qs : location.pathname);
  };

  const nav = (s, p = {}) => {
    setScreen(s);
    setParams(p);
    setOpenPlaceId(null);
    history.pushState(null, '', buildURL(s, p, null, lang));
    setTimeout(() => window.scrollTo(0, 0), 0);
  };

  const toggleSaved = (id) => {
    setSavedSet(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const openPlace = (id) => {
    setOpenPlaceId(id);
    const p = new URLSearchParams(location.search);
    p.set('place', id);
    history.pushState(null, '', '?' + p.toString());
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

  if (screen === 'admin') {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <AdminScreen allPlaces={PLACES} adminOverrides={adminOverrides} onOverride={applyAdminOverride} regions={REGIONS} />
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
          <SavedScreen savedSet={savedSet} places={effectivePlaces} regions={REGIONS} lang={lang} t={t}
            openPlace={openPlace} toggleSaved={toggleSaved} />
        )}
      </main>
      <Footer lang={lang} t={t} nav={nav} />
      {openPlaceData && (
        <PlaceModal place={openPlaceData} region={openPlaceRegion} lang={lang} t={t}
          onClose={closePlace} saved={savedSet.has(openPlaceId)} onToggleSaved={toggleSaved} mapUrl={MAP_URL} />
      )}
      <Tweaks lang={lang} tweaks={tweaks} setTweak={setTweak} />
      <a className="wa-float"
        href={`https://wa.me/972534228282?text=${encodeURIComponent(lang === 'en' ? 'Hey Niv! I have a question about Lithuania 🌿' : 'היי ניב! יש לי שאלה על ליטא 🌿')}`}
        target="_blank" rel="noopener noreferrer" aria-label="צור קשר בוואטסאפ">
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
    { id: 'stays', label: t.nav.stays }
  ];

  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>
        </button>
        <button className="brand" onClick={() => nav('home')}>
          <span className="brand-mark">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M12 2 L14 9 L21 11 L14 13 L12 22 L10 13 L3 11 L10 9 Z" opacity="0.95"/>
            </svg>
          </span>
          <span className="brand-text">
            <span className="brand-name">{t.siteName}</span>
            <span className="brand-sub">{t.siteSub}</span>
          </span>
        </button>
        <nav className="nav-links">
          {items.map(item => (
            <button key={item.id} className={`nav-link ${screen === item.id ? 'active' : ''}`} onClick={() => nav(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="nav-actions">
          {savedCount > 0 && (
            <button className="saved-btn" onClick={onSavedClick} aria-label={t.yourTrip}>
              <Icon.bookmarkFill/><span>{savedCount}</span>
            </button>
          )}
          <button className="lang-toggle" onClick={() => setLang(lang === 'he' ? 'en' : 'he')} aria-label="Toggle language">
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
            <button key={item.id} className={`mobile-link ${screen === item.id ? 'active' : ''}`}
              onClick={() => { nav(item.id); setMobileOpen(false); }}>
              {item.label}
            </button>
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
            {lang === 'he' ? 'מדריך אישי לליטא — בלי פאתוס, רק מה שכיף.' : 'A friendly guide to Lithuania — no pretense, just what\'s fun.'}
          </p>
          <div className="footer-about">
            <p className="footer-about-bio">
              {lang === 'he' ? 'ניב שמעוני. יזם, עובד עם AI, ומבלה בליטא יותר ממה שתכנן. האתר הזה הוא התוצאה.'
                : 'Niv Shimoni. Entrepreneur, AI builder, and someone who keeps ending up in Lithuania. This site is the result.'}
            </p>
            <a className="footer-contact" href="mailto:Niv.shimoni@gmail.com">Niv.shimoni@gmail.com</a>
          </div>
        </div>
        <div className="footer-cols">
          <div className="footer-col">
            <h5>{lang === 'he' ? 'גלה' : 'Explore'}</h5>
            <button onClick={() => nav('explore')}>{t.nav.explore}</button>
            <button onClick={() => nav('routes')}>{t.nav.routes}</button>
            <button onClick={() => nav('food')}>{t.nav.food}</button>
          </div>
          <div className="footer-col">
            <h5>{lang === 'he' ? 'אזורים' : 'Regions'}</h5>
            {REGIONS.map(r => (
              <button key={r.id} onClick={() => nav('explore', { region: r.id })}>{r[lang].name}</button>
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
