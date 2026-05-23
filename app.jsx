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

const VALID_SCREENS = ['home', 'explore', 'routes', 'food', 'stays'];

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
  };

  const nav = (s, p = {}) => {
    setScreen(s);
    setParams(p);
    setOpenPlaceId(null);
    history.pushState(null, '', buildURL(s, p, null, lang));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSaved = (id) => {
    setSavedSet(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
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

  return (
    <div className="app">
      <NavBar lang={lang} setLang={setLang} screen={screen} nav={nav} t={t} savedCount={savedSet.size} />

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
    </div>
  );
}

function NavBar({ lang, setLang, screen, nav, t, savedCount }) {
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
            <button
              key={item.id}
              className={`nav-link ${screen === item.id ? 'active' : ''}`}
              onClick={() => nav(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="nav-actions">
          {savedCount > 0 && (
            <button className="saved-btn" aria-label={t.yourTrip}>
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
          <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="mobile-nav">
          {items.map(item => (
            <button
              key={item.id}
              className={`mobile-link ${screen === item.id ? 'active' : ''}`}
              onClick={() => { nav(item.id); setMobileOpen(false); }}
            >
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
            {lang === 'he'
              ? 'מדריך אישי לליטא — בלי פאתוס, רק מה שכיף.'
              : 'A friendly guide to Lithuania — no pretense, just what\'s fun.'}
          </p>
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
            {REGIONS.slice(0, 4).map(r => (
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
