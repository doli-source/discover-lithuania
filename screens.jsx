// All screens for the Lithuania travel app — wired to Niv's curated places

const ADMIN_PASSWORD = 'discover-lt-admin'; // ← change this before deploying

const { useState, useEffect, useMemo, useRef } = React;

// ─── PLACE CARD (shared) ────────────────────────────────────────────────
function PlaceCard({ place, region, lang, t, onClick, saved, onToggleSave, accent }) {
  const tones = ['warm', 'stone', 'sea', 'forest', 'sunset'];
  const nivText = lang === 'he' ? place.nivHe : place.niv;
  const typeLabel = lang === 'he' ? place.typeHe : place.type;
  const ph = `${place.name} · ${place.type}`;
  const tone = tones[place.id.charCodeAt(0) % tones.length];
  return (
    <article className={`niv-card ${place.niv ? 'has-tip' : ''}`} onClick={onClick}>
      <div className="niv-card-img" style={{ background: `linear-gradient(135deg, ${(accent || (region && region.accent) || '#C28840')}22, ${(accent || (region && region.accent) || '#C28840')}10)` }}>
        <span className="niv-emoji-big" aria-hidden="true">{place.emoji}</span>
        <button
          className={`bookmark ${saved ? 'on' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggleSave && onToggleSave(place.id); }}
          aria-label={t.save}
        >
          {saved ? <Icon.bookmarkFill /> : <Icon.bookmark />}
        </button>
      </div>
      <div className="niv-card-body">
        <div className="niv-card-type">{typeLabel}</div>
        <h3 className="niv-card-name">{place.name}</h3>
        <div className="niv-card-meta">
          <span className="niv-rating"><Icon.star /> {place.rating.toFixed(1)} <span className="reviews">({place.reviews.toLocaleString()})</span></span>
          {place.price && <span className="niv-price">{place.price}</span>}
        </div>
        {nivText && (
          <p className="niv-tip">"{nivText}"</p>
        )}
      </div>
    </article>
  );
}

// ─── HOME ────────────────────────────────────────────────────────────────
function HomeScreen({ lang, t, regions, places, landmarks, dishes, itineraries, facts, mapUrl, nav, savedSet, toggleSaved, openPlace }) {
  const [factIdx, setFactIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFactIdx(i => (i + 1) % facts.length), 5500);
    return () => clearInterval(id);
  }, [facts.length]);

  const stats = useMemo(() => {
    const total = places.length;
    const cities = new Set(places.map(p => p.region)).size;
    return { total, cities };
  }, [places]);

  const nivPicks = places.filter(p => p.niv);
  const topRoutes = itineraries.slice(0, 3);
  const tasteSample = dishes.slice(0, 4);

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="eyebrow-dot"></span>
            <span>{lang === 'he' ? 'מדריך טיולים בליטא' : 'A traveler\'s guide to Lithuania'}</span>
            <span className="eyebrow-dot"></span>
          </div>
          <h1 className="hero-title">
            {lang === 'he'
              ? <>גלה את <em>ליטא</em><br />לאט, טעים, ובלי לחץ.</>
              : <>Discover <em>Lithuania</em><br />slow, tasty, unrushed.</>}
          </h1>
          <p className="hero-sub">
            {lang === 'he'
              ? `${stats.total} מקומות נבחרים — בתי קפה, מסעדות, טבע ולינה — מובחרים בקפידה.`
              : `${stats.total} handpicked places — cafés, restaurants, nature & stays — carefully chosen.`}
          </p>
          <div className="hero-stats-row">
            <div className="hstat"><span className="hstat-num">{stats.total}</span><span className="hstat-lbl">{lang === 'he' ? 'מקומות' : 'Places'}</span></div>
            <div className="hstat-sep"></div>
            <div className="hstat"><span className="hstat-num">{stats.cities}</span><span className="hstat-lbl">{lang === 'he' ? 'אזורים' : 'Regions'}</span></div>
          </div>
          <div className="hero-cta">
            <button className="btn btn-primary" onClick={() => nav('explore')}>
              {lang === 'he' ? 'גלה את כל המקומות' : 'Explore all places'} <Icon.arrow style={{ transform: lang === 'he' ? 'scaleX(-1)' : 'none' }} />
            </button>
            <a className="btn btn-ghost" href={mapUrl} target="_blank" rel="noopener noreferrer"
               onClick={(e) => { e.preventDefault(); window.open(mapUrl, '_blank', 'noopener,noreferrer'); }}>
              <Icon.pin /> {lang === 'he' ? 'פתח במפות Google' : 'Open Google Map'}
            </a>
          </div>
        </div>
        <div className="hero-scroll">
          <span>{lang === 'he' ? 'גלול למטה' : 'scroll'}</span>
          <div className="scroll-line"></div>
        </div>
      </section>

      {/* FACTS TICKER */}
      <section className="facts-strip">
        <span className="facts-label">{t.factsLabel}</span>
        <div className="facts-text" key={factIdx}>
          {facts[factIdx][lang]}
        </div>
      </section>

      {/* INTERACTIVE MAP */}
      <section className="section home-map-section">
        <div className="section-head">
          <div>
            <div className="section-eyebrow">{lang === 'he' ? 'מפה אינטרקטיבית' : 'Interactive map'}</div>
            <h2 className="section-title">{lang === 'he' ? 'בחר אזור ותתחיל לגלות' : 'Pick a region to explore'}</h2>
            <p className="section-sub">{lang === 'he' ? 'לחץ על אזור במפה לצפייה בכל המקומות בו.' : 'Tap any region on the map to see all its places.'}</p>
          </div>
        </div>
        <div className="home-map-wrap">
          <MapIllustration regions={regions} activeRegion={null} onPick={(regionId) => nav('explore', { region: regionId })} t={t} lang={lang} />
        </div>
      </section>

      {/* REGIONS */}
      <section className="section section-tinted">
        <div className="section-head">
          <div>
            <div className="section-eyebrow">01 — {lang === 'he' ? 'לאן' : 'Where'}</div>
            <h2 className="section-title">{lang === 'he' ? `${regions.length} אזורים לגלות` : `${regions.length} regions to explore`}</h2>
            <p className="section-sub">{lang === 'he' ? 'בחר אזור — וקבל את כל המקומות שם.' : 'Pick a region — get everything pinned there.'}</p>
          </div>
          <button className="link-btn" onClick={() => nav('explore')}>
            {t.exploreCta} <Icon.arrow style={{ transform: lang === 'he' ? 'scaleX(-1)' : 'none' }} />
          </button>
        </div>
        <div className="region-grid">
          {regions.map((r, i) => {
            const count = places.filter(p => p.region === r.id).length;
            return (
              <article className="region-card" key={r.id} onClick={() => nav('explore', { region: r.id })} style={{ '--accent': r.accent }}>
                <div className="region-visual">
                  <img className="region-photo" src={(window.REGION_IMAGES && window.REGION_IMAGES[r.id]) || `regions/${r.id}.jpg`} alt={r[lang].name} loading="lazy" />
                  <span className="region-num-big">0{i + 1}</span>
                  <span className="region-count-badge">
                    <span style={{ background: r.accent }}></span>
                    {count}
                  </span>
                </div>
                <div className="region-meta">
                  <span className="region-tag" style={{ color: r.accent }}>{r[lang].tag}</span>
                </div>
                <h3 className="region-name">{r[lang].name}</h3>
                <p className="region-blurb">{r[lang].blurb}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* TIPS — featured */}
      <section className="section">
        <div className="section-head">
          <div>
            <div className="section-eyebrow">★ {lang === 'he' ? 'מומלצים מיוחדים' : 'Featured picks'}</div>
            <h2 className="section-title">{lang === 'he' ? 'המקומות שלא תרצה לפספס' : "Don't miss these"}</h2>
            <p className="section-sub">{lang === 'he' ? 'המלצות עם הסבר למה שווה ללכת.' : "Recommendations with a note on why they're worth it."}</p>
          </div>
        </div>
        <div className="tips-grid tips-grid-home">
          {nivPicks.map(p => {
            const r = regions.find(re => re.id === p.region);
            return (
              <PlaceCard
                key={p.id}
                place={p}
                region={r}
                lang={lang}
                t={t}
                onClick={() => openPlace(p.id)}
                saved={savedSet.has(p.id)}
                onToggleSave={toggleSaved}
                accent={r && r.accent}
              />
            );
          })}
        </div>
      </section>

      {/* ROUTES PREVIEW */}
      <section className="section">
        <div className="section-head">
          <div>
            <div className="section-eyebrow">02 — {lang === 'he' ? 'איך' : 'How'}</div>
            <h2 className="section-title">{t.flagshipRoutes}</h2>
            <p className="section-sub">{lang === 'he' ? 'מסלולים מוכנים, מהיום הבודד עד שבוע שלם' : 'Ready-made routes, from a single day to a full week'}</p>
          </div>
          <button className="link-btn" onClick={() => nav('routes')}>
            {t.routesCta} <Icon.arrow style={{ transform: lang === 'he' ? 'scaleX(-1)' : 'none' }} />
          </button>
        </div>
        <div className="route-cards">
          {topRoutes.map(r => (
            <article className="route-card" key={r.id} onClick={() => nav('routes', { route: r.id })}>
              <div className="route-duration">
                <span className="dur-num">{r.stops.length}</span>
                <span className="dur-unit">{t.stops}</span>
              </div>
              <h3 className="route-title">{r[lang].title}</h3>
              <p className="route-tagline">{r[lang].tagline}</p>
              <div className="route-chips">
                <span className="chip-tiny">{t[r.duration] || r.duration}</span>
                {r.region && <span className="chip-tiny">{regions.find(re => re.id === r.region)?.[lang].name}</span>}
              </div>
              <div className="route-trail">
                {r.stops.slice(0, 5).map((_, i) => (
                  <span key={i} className={`trail-dot ${i === 0 ? 'first' : ''}`}></span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* TASTE PREVIEW */}
      <section className="section section-tinted">
        <div className="section-head">
          <div>
            <div className="section-eyebrow">03 — {lang === 'he' ? 'מה' : 'What'}</div>
            <h2 className="section-title">{lang === 'he' ? 'טעמים ליטאיים' : 'Lithuanian Tastes'}</h2>
            <p className="section-sub">{lang === 'he' ? 'המנות המסורתיות שכדאי להזמין — וכמובן איפה לאכול אותן.' : 'Traditional dishes worth ordering — and where to find them.'}</p>
          </div>
          <button className="link-btn" onClick={() => nav('food')}>
            {lang === 'he' ? 'תפריט מלא' : 'Full menu'} <Icon.arrow style={{ transform: lang === 'he' ? 'scaleX(-1)' : 'none' }} />
          </button>
        </div>
        <div className="taste-grid">
          {tasteSample.map((f, i) => (
            <article className="taste-card" key={f.id}>
              <div className="taste-visual" style={{ background: `linear-gradient(135deg, #A85D4A30, #A85D4A10)` }}>
                <span className="taste-emoji">{f.emoji || '🍲'}</span>
              </div>
              <div className="taste-body">
                <span className="taste-tag">{f.tag}</span>
                <h4 className="taste-name">{f[lang].name}</h4>
                <p className="taste-desc">{f[lang].desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="closing">
        <div className="closing-inner">
          <h2 className="closing-title">{lang === 'he' ? 'מוכן לארוז?' : 'Ready to pack?'}</h2>
          <p className="closing-sub">
            {lang === 'he'
              ? 'בנה לעצמך טיול אישי מתוך כל המקומות והמסלולים. כל מה שצריך — במקום אחד.'
              : 'Build your own trip from all the places and routes. Everything you need — in one place.'}
          </p>
          <div className="closing-cta">
            <button className="btn btn-primary btn-large" onClick={() => nav('routes')}>
              {t.cta} <Icon.arrow style={{ transform: lang === 'he' ? 'scaleX(-1)' : 'none' }} />
            </button>
            <a className="btn btn-ghost btn-large" href={mapUrl} target="_blank" rel="noopener noreferrer"
               onClick={(e) => { e.preventDefault(); window.open(mapUrl, '_blank', 'noopener,noreferrer'); }}>
              <Icon.pin /> {lang === 'he' ? 'כל המפה' : 'Full map'}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── EXPLORE ─────────────────────────────────────────────────────────────
function ExploreScreen({ lang, t, regions, places, params, nav, savedSet, toggleSaved, openPlace, mapUrl }) {
  const [activeRegion, setActiveRegion] = useState(params?.region || regions[0].id);
  const [activeKind, setActiveKind] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (params?.region) setActiveRegion(params.region);
  }, [params?.region]);

  const region = regions.find(r => r.id === activeRegion);
  const regionPlaces = places.filter(p => p.region === activeRegion);
  const filtered = regionPlaces
    .filter(p => activeKind === 'all' || p.kind === activeKind)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.type || '').toLowerCase().includes(search.toLowerCase()));

  const kinds = ['all', ...new Set(regionPlaces.map(p => p.kind))];

  return (
    <div className="explore">
      <div className="explore-header">
        {/* Map first so it appears at top on mobile */}
        <div className="explore-map-col">
          <MapIllustration regions={regions} activeRegion={activeRegion} onPick={setActiveRegion} t={t} lang={lang} />
        </div>
        <div className="explore-intro">
          <div className="section-eyebrow">{lang === 'he' ? 'גלה' : 'Explore'}</div>
          <h1 className="page-title">{lang === 'he' ? 'בחר אזור' : 'Pick a region'}</h1>
          <p className="page-sub">
            {lang === 'he'
              ? `${places.length} מקומות בכל הארץ, מסומנים אישית. לחץ על כרטיס למידע.`
              : `${places.length} places across the country. Click any card for details.`}
          </p>
        </div>
      </div>

      <div className="region-tabs">
        {regions.map(r => {
          const count = places.filter(p => p.region === r.id).length;
          return (
            <button
              key={r.id}
              className={`region-tab ${r.id === activeRegion ? 'active' : ''}`}
              onClick={() => setActiveRegion(r.id)}
              style={{ '--accent': r.accent }}
            >
              <span className="region-tab-name">{r[lang].name}</span>
              <span className="region-tab-tag">{r[lang].tag} · {count}</span>
            </button>
          );
        })}
      </div>

      <div className="region-detail">
        {/* Region banner — image + title + blurb */}
        <div className="region-banner" style={{ '--region-accent': region.accent }}>
          <div className="region-banner-img-wrap">
            <img
              className="region-banner-img"
              src={(window.REGION_IMAGES && window.REGION_IMAGES[region.id]) || `regions/${region.id}.jpg`}
              alt={region[lang].name}
            />
          </div>
          <div className="region-banner-body">
            <span className="region-banner-tag" style={{ color: region.accent }}>{region[lang].tag}</span>
            <h2 className="region-banner-title" style={{ color: region.accent }}>{region[lang].name}</h2>
            <p className="region-banner-blurb">{region[lang].blurb}</p>
          </div>
        </div>

        <div className="filter-bar">
          <div className="kind-chips">
            {kinds.map(k => (
              <button
                key={k}
                className={`chip ${k === activeKind ? 'active' : ''}`}
                onClick={() => setActiveKind(k)}
              >
                {t.kinds[k] || k}
                <span className="chip-count">{k === 'all' ? regionPlaces.length : regionPlaces.filter(p => p.kind === k).length}</span>
              </button>
            ))}
          </div>
          <input
            className="search-input"
            placeholder={lang === 'he' ? 'חיפוש לפי שם…' : 'Search by name…'}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="empty-state">{lang === 'he' ? 'לא נמצאו מקומות בקטגוריה הזו.' : 'No places match this filter.'}</p>
        ) : (
          <div className="places-grid places-grid-sm">
            {filtered.map(p => (
              <PlaceCard
                key={p.id}
                place={p}
                region={region}
                lang={lang}
                t={t}
                onClick={() => openPlace(p.id)}
                saved={savedSet.has(p.id)}
                onToggleSave={toggleSaved}
                accent={region.accent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROUTES ──────────────────────────────────────────────────────────────
function RoutesScreen({ lang, t, regions, places, landmarks, itineraries, params, openPlace }) {
  const [activeRoute, setActiveRoute] = useState(params?.route || itineraries[0].id);
  useEffect(() => { if (params?.route) setActiveRoute(params.route); }, [params?.route]);

  const route = itineraries.find(r => r.id === activeRoute);
  const region = route.region ? regions.find(r => r.id === route.region) : null;
  const findPlace = (id) => places.find(p => p.id === id) || null;
  const findLandmark = (id) => landmarks.find(l => l.id === id) || null;

  return (
    <div className="routes">
      <div className="routes-header">
        <div className="section-eyebrow">{lang === 'he' ? 'מסלולים' : 'Routes'}</div>
        <h1 className="page-title">{lang === 'he' ? 'מסלולים שמוכנים מראש' : 'Routes ready to walk'}</h1>
        <p className="page-sub">{lang === 'he' ? 'מהיום הבודד ועד טיול שבועי שלם — עם תחנות מהרשימה.' : "From a single day to a full week — with stops from the list."}</p>
      </div>

      <div className="route-tabs">
        {itineraries.map(r => (
          <button
            key={r.id}
            className={`route-tab ${r.id === activeRoute ? 'active' : ''}`}
            onClick={() => setActiveRoute(r.id)}
          >
            <span className="route-tab-dur">{t[r.duration] || r.duration}</span>
            <span className="route-tab-title">{r[lang].title}</span>
            <span className="route-tab-stops">{r.stops.length} {t.stops}</span>
          </button>
        ))}
      </div>

      <div className="route-detail">
        <div className="route-detail-head">
          <div className="route-detail-text">
            <div className="route-detail-tagline">{route[lang].tagline}</div>
            <h2 className="route-detail-title">{route[lang].title}</h2>
            <div className="route-detail-meta">
              <span className="meta-pill">{t[route.duration] || route.duration}</span>
              {region && <span className="meta-pill" style={{ color: region.accent, borderColor: region.accent + '55' }}>{region[lang].name}</span>}
              <span className="meta-pill">{route.stops.length} {t.stops}</span>
            </div>
          </div>
          <div className="route-detail-vis">
            <div className="route-visual" style={{ background: `linear-gradient(135deg, ${(region?.accent || '#C28840')}33, ${(region?.accent || '#C28840')}11)` }}>
              <span className="route-vis-num">{route.stops.length}</span>
              <span className="route-vis-label">{t.stops}</span>
            </div>
          </div>
        </div>

        <ol className="timeline">
          {route.stops.map((stop, i) => {
            const place = stop.placeId ? findPlace(stop.placeId) : null;
            const landmark = stop.landmarkId ? findLandmark(stop.landmarkId) : null;
            const stopName = place ? place.name : (landmark ? landmark[lang].name : '');
            const stopType = place ? (lang === 'he' ? place.typeHe : place.type) : (lang === 'he' ? 'אטרקציה' : 'Landmark');
            return (
              <li className="timeline-item" key={i}>
                <div className="timeline-time">{stop.time}</div>
                <div className="timeline-line">
                  <span className="timeline-dot"></span>
                  {i < route.stops.length - 1 && <span className="timeline-bar"></span>}
                </div>
                <div className="timeline-content" onClick={() => place && openPlace(place.id)} style={{ cursor: place ? 'pointer' : 'default' }}>
                  <h4 className="timeline-title">{stop[lang]}</h4>
                  {(place || landmark) && (
                    <div className="timeline-place">
                      <Icon.pin />
                      <span>{stopName}</span>
                      <span className="timeline-tip">— {stopType}</span>
                      {place && place.rating && <span className="timeline-rating"><Icon.star /> {place.rating.toFixed(1)}</span>}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

// ─── FOOD ────────────────────────────────────────────────────────────────
function FoodScreen({ lang, t, places, dishes, regions, openPlace, savedSet, toggleSaved }) {
  const venues = places.filter(p => ['cafe', 'restaurant', 'market'].includes(p.kind));
  const [filter, setFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  const filtered = venues
    .filter(v => filter === 'all' || v.kind === filter)
    .filter(v => regionFilter === 'all' || v.region === regionFilter);

  return (
    <div className="food">
      <div className="food-header">
        <div className="section-eyebrow">{lang === 'he' ? 'אוכל' : 'Food'}</div>
        <h1 className="page-title">{lang === 'he' ? 'איפה לאכול ולשתות' : 'Where to eat & drink'}</h1>
        <p className="page-sub">{lang === 'he' ? 'בתי קפה, מסעדות, שווקים וברים — מקומות נבחרים.' : "Cafés, restaurants, markets and bars — curated picks."}</p>
      </div>

      <div className="food-section">
        <h3 className="food-section-title">{lang === 'he' ? 'מה לטעום — מנות מסורתיות' : 'What to taste — traditional dishes'}</h3>
        <div className="dish-strip">
          {dishes.map((f, i) => (
            <article className="dish-card" key={f.id}>
              <div className="dish-visual" style={{ background: `linear-gradient(135deg, #A85D4A30, #C2884020)` }}>
                <span className="dish-emoji">{f.emoji || '🍲'}</span>
              </div>
              <div className="dish-body">
                <div className="dish-head">
                  <h4 className="dish-name">{f[lang].name}</h4>
                  <span className="dish-tag">{f.tag}</span>
                </div>
                <p className="dish-desc">{f[lang].desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="food-section">
        <h3 className="food-section-title">{lang === 'he' ? 'איפה לאכול' : 'Where to eat'}</h3>
        <div className="filter-bar centered">
          <div className="kind-chips">
            {['all', 'cafe', 'restaurant', 'market'].map(k => (
              <button key={k} className={`chip ${k === filter ? 'active' : ''}`} onClick={() => setFilter(k)}>
                {t.kinds[k] || k}
                <span className="chip-count">{k === 'all' ? venues.length : venues.filter(v => v.kind === k).length}</span>
              </button>
            ))}
          </div>
          <div className="kind-chips">
            <button className={`chip subtle ${regionFilter === 'all' ? 'active' : ''}`} onClick={() => setRegionFilter('all')}>
              {lang === 'he' ? 'כל האזורים' : 'All regions'}
            </button>
            {regions.filter(r => venues.some(v => v.region === r.id)).map(r => (
              <button key={r.id} className={`chip subtle ${regionFilter === r.id ? 'active' : ''}`} onClick={() => setRegionFilter(r.id)}>
                {r[lang].name}
              </button>
            ))}
          </div>
        </div>

        <div className="places-grid">
          {filtered.map(p => {
            const r = regions.find(re => re.id === p.region);
            return (
              <PlaceCard
                key={p.id}
                place={p}
                region={r}
                lang={lang}
                t={t}
                onClick={() => openPlace(p.id)}
                saved={savedSet.has(p.id)}
                onToggleSave={toggleSaved}
                accent={r && r.accent}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── STAYS ──────────────────────────────────────────────────────────────
function StaysScreen({ lang, t, places, regions, openPlace, savedSet, toggleSaved }) {
  const stays = places.filter(p => p.kind === 'stay');
  const [regionFilter, setRegionFilter] = useState('all');
  const filtered = stays.filter(s => regionFilter === 'all' || s.region === regionFilter);

  return (
    <div className="food">
      <div className="food-header">
        <div className="section-eyebrow">{lang === 'he' ? 'לינה' : 'Stays'}</div>
        <h1 className="page-title">{lang === 'he' ? 'איפה לישון בליטא' : 'Where to sleep in Lithuania'}</h1>
        <p className="page-sub">{lang === 'he' ? 'גלמפינג ביער, וילות על האגם, ספא בוטיק וריזורטים.' : 'Forest glamping, lakeside villas, boutique spa and resorts.'}</p>
      </div>

      <div className="filter-bar centered">
        <div className="kind-chips">
          <button className={`chip ${regionFilter === 'all' ? 'active' : ''}`} onClick={() => setRegionFilter('all')}>
            {lang === 'he' ? 'הכל' : 'All'}
            <span className="chip-count">{stays.length}</span>
          </button>
          {regions.filter(r => stays.some(s => s.region === r.id)).map(r => (
            <button key={r.id} className={`chip ${regionFilter === r.id ? 'active' : ''}`} onClick={() => setRegionFilter(r.id)}>
              {r[lang].name}
              <span className="chip-count">{stays.filter(s => s.region === r.id).length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="places-grid">
        {filtered.map(p => {
          const r = regions.find(re => re.id === p.region);
          return (
            <PlaceCard
              key={p.id}
              place={p}
              region={r}
              lang={lang}
              t={t}
              onClick={() => openPlace(p.id)}
              saved={savedSet.has(p.id)}
              onToggleSave={toggleSaved}
              accent={r && r.accent}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── PLACE DETAIL MODAL ──────────────────────────────────────────────────
function PlaceModal({ place, region, lang, t, onClose, saved, onToggleSaved, mapUrl }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, []);

  if (!place) return null;
  const typeLabel = lang === 'he' ? place.typeHe : place.type;
  const nivText = lang === 'he' ? place.nivHe : place.niv;
  const ph = `${place.name} · ${place.type}`;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><Icon.close /></button>
        <div className="modal-img">
          <div className="modal-img-bg" style={{ background: `linear-gradient(135deg, ${(region && region.accent) || '#C28840'}33, ${(region && region.accent) || '#C28840'}11)` }}>
            <span className="modal-emoji-big" aria-hidden="true">{place.emoji}</span>
          </div>
        </div>
        <div className="modal-body">
          <div className="modal-meta">
            <span className="modal-region" style={{ color: region?.accent }}>● {region?.[lang].name}</span>
            <span className="modal-kind">{typeLabel}</span>
            <span className="modal-rating"><Icon.star /> {place.rating.toFixed(1)} <span style={{ opacity: 0.55 }}>({place.reviews.toLocaleString()})</span></span>
            {place.price && <span className="modal-price">{place.price}</span>}
          </div>
          <h2 className="modal-title">{place.name}</h2>
          {nivText && (
            <blockquote className="modal-niv">
              <p>"{nivText}"</p>
            </blockquote>
          )}
          {!nivText && (
            <p className="modal-blurb">
              {lang === 'he'
                ? 'מקום ששווה ביקור. הוסף לטיול שלך כדי לראות אותו במסלול.'
                : "A place worth a stop. Add it to your trip to see it on your route."}
            </p>
          )}
          <div className="modal-actions">
            <button
              className={`btn ${saved ? 'btn-success' : 'btn-primary'}`}
              onClick={() => onToggleSaved(place.id)}
            >
              {saved ? <Icon.bookmarkFill /> : <Icon.bookmark />}
              {saved ? t.inTrip : t.addToTrip}
            </button>
            <button
              className="btn btn-ghost"
              onClick={(e) => {
                e.preventDefault();
                window.open(placeMapUrl(place), '_blank', 'noopener,noreferrer');
              }}
            >
              <Icon.pin /> {lang === 'he' ? 'פתח בגוגל מפות' : 'Open in Google Maps'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SAVED SCREEN ───────────────────────────────────────────────────────────
function SavedScreen({ savedSet, places, regions, lang, t, openPlace, toggleSaved }) {
  const savedPlaces = places.filter(p => savedSet.has(p.id));

  if (savedPlaces.length === 0) {
    return (
      <div className="saved-empty">
        <div className="saved-empty-icon">🔖</div>
        <h2 className="saved-empty-title">
          {lang === 'he' ? 'עדיין לא שמרת מקומות' : 'No saved places yet'}
        </h2>
        <p className="saved-empty-sub">
          {lang === 'he'
            ? 'לחץ על הסימנייה בכרטיס מקום כדי לשמור אותו כאן.'
            : 'Click the bookmark on any place card to save it here.'}
        </p>
      </div>
    );
  }

  const byRegion = regions
    .map(r => ({ ...r, places: savedPlaces.filter(p => p.region === r.id) }))
    .filter(r => r.places.length > 0);

  return (
    <div className="saved-screen">
      <div className="saved-header">
        <h1 className="saved-title">
          {lang === 'he' ? 'המקומות שלי' : 'My Places'}
        </h1>
        <p className="saved-count">
          {savedPlaces.length} {lang === 'he' ? 'מקומות שמורים' : 'saved places'}
        </p>
      </div>

      <div className="saved-regions">
        {byRegion.map(region => (
          <section key={region.id} className="saved-region">
            <h2 className="saved-region-title">
              {region[lang].name}
              <span className="saved-region-count">{region.places.length}</span>
            </h2>
            <div className="saved-cards">
              {region.places.map(place => (
                <div
                  key={place.id}
                  className="saved-card"
                  onClick={() => openPlace(place.id)}
                  role="button"
                  tabIndex={0}
                >
                  <span className="saved-emoji">{place.emoji}</span>
                  <div className="saved-info">
                    <div className="saved-name">{place.name}</div>
                    <div className="saved-type">
                      {lang === 'he' ? place.typeHe : place.type}
                    </div>
                  </div>
                  <button
                    className="saved-remove"
                    onClick={e => { e.stopPropagation(); toggleSaved(place.id); }}
                    aria-label={lang === 'he' ? 'הסר משמורים' : 'Remove'}
                    title={lang === 'he' ? 'הסר' : 'Remove'}
                  >
                    <Icon.bookmarkFill />
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

// ─── ADMIN PANEL ────────────────────────────────────────────────────────────
function AdminLogin({ onAuth }) {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (pwd === ADMIN_PASSWORD) {
      localStorage.setItem('lt_admin_authed', '1');
      onAuth();
    } else {
      setErr(true);
      setPwd('');
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <div className="admin-login-logo">⚙️</div>
        <h1 className="admin-login-title">Discover LT Admin</h1>
        <input
          className={`admin-login-input ${err ? 'input-err' : ''}`}
          type="password"
          value={pwd}
          onChange={e => { setPwd(e.target.value); setErr(false); }}
          placeholder="Password"
          autoFocus
        />
        {err && <p className="admin-login-err">Wrong password</p>}
        <button className="admin-login-btn" type="submit">Enter</button>
      </form>
    </div>
  );
}

const STATUS_CYCLE  = ['approved', 'pending', 'hidden'];
const STATUS_LABELS = { approved: '✅ מאושר', pending: '⏳ ממתין', hidden: '🚫 מוסתר' };
const STATUS_CLS    = { approved: 'status-approved', pending: 'status-pending', hidden: 'status-hidden' };

function AdminScreen({ allPlaces, adminOverrides, onOverride, regions }) {
  const [authed, setAuthed] = useState(
    () => localStorage.getItem('lt_admin_authed') === '1'
  );
  const [filter, setFilter] = useState({ region: '', kind: '', status: '', source: '', search: '' });
  const [sort, setSort]     = useState({ by: 'status', dir: 'asc' });
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [pendingNotes, setPendingNotes] = useState({});

  // Reset selection whenever filters or sort-key change (hooks must be before conditional return)
  useEffect(() => {
    setSelectedIds(new Set());
  }, [filter.region, filter.kind, filter.status, filter.source, filter.search, sort.by]);

  if (!authed) return <AdminLogin onAuth={() => setAuthed(true)} />;

  // Merge overrides into allPlaces for display
  const effective = allPlaces.map(p => ({
    ...p,
    status: (adminOverrides[p.id] && adminOverrides[p.id].status) ? adminOverrides[p.id].status : (p.status || 'pending'),
    source: p.source || 'ai',
    notes:  (adminOverrides[p.id] && adminOverrides[p.id].notes) ? adminOverrides[p.id].notes : ''
  }));

  // Apply filters
  const filtered = effective
    .filter(p => !filter.region || p.region === filter.region)
    .filter(p => !filter.kind   || p.kind   === filter.kind)
    .filter(p => !filter.status || p.status === filter.status)
    .filter(p => !filter.source || p.source === filter.source)
    .filter(p => !filter.search || p.name.toLowerCase().includes(filter.search.toLowerCase()));

  // Dynamic sort
  const statusOrder = { approved: 0, pending: 1, hidden: 2 };
  const sorted = [...filtered].sort((a, b) => {
    let va, vb;
    switch (sort.by) {
      case 'status':  va = statusOrder[a.status] ?? 1; vb = statusOrder[b.status] ?? 1; break;
      case 'source':  va = a.source === 'niv' ? 0 : 1; vb = b.source === 'niv' ? 0 : 1; break;
      case 'region':  va = a.region || ''; vb = b.region || ''; break;
      case 'name':    va = a.name || ''; vb = b.name || ''; break;
      case 'rating':  va = b.rating || 0; vb = a.rating || 0; break;
      default: return 0;
    }
    const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
    return sort.dir === 'asc' ? cmp : -cmp;
  });

  // Multi-select helpers
  const allSelected  = sorted.length > 0 && sorted.every(p => selectedIds.has(p.id));
  const someSelected = !allSelected && sorted.some(p => selectedIds.has(p.id));
  const selectedCount = sorted.filter(p => selectedIds.has(p.id)).length;

  function toggleSelectAll() {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allSelected) { sorted.forEach(p => next.delete(p.id)); }
      else             { sorted.forEach(p => next.add(p.id)); }
      return next;
    });
  }
  function toggleSelect(id) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function bulkSetStatus(status) {
    sorted.filter(p => selectedIds.has(p.id)).forEach(p => onOverride(p.id, { status }));
    setSelectedIds(new Set());
  }

  function cycleStatus(p) {
    const idx  = STATUS_CYCLE.indexOf(p.status);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    onOverride(p.id, { status: next });
  }

  function saveNote(id) {
    if (pendingNotes[id] !== undefined) {
      onOverride(id, { notes: pendingNotes[id] });
      setPendingNotes(prev => { const n = { ...prev }; delete n[id]; return n; });
    }
  }

  function handleExport() {
    const { REGIONS: R, LANDMARKS, DISHES, ITINERARIES, FACTS, MAP_URL } = window.LT_DATA;
    const updatedPlaces = allPlaces.map(p => ({ ...p, ...(adminOverrides[p.id] || {}) }));
    const out = [
      '(function() {\n',
      'const REGIONS = '     + JSON.stringify(R, null, 2)            + ';\n\n',
      'const PLACES = '      + JSON.stringify(updatedPlaces, null, 2) + ';\n\n',
      'const LANDMARKS = '   + JSON.stringify(LANDMARKS, null, 2)    + ';\n\n',
      'const ITINERARIES = ' + JSON.stringify(ITINERARIES, null, 2)  + ';\n\n',
      'const DISHES = '      + JSON.stringify(DISHES, null, 2)       + ';\n\n',
      'const FACTS = '       + JSON.stringify(FACTS, null, 2)        + ';\n\n',
      'window.LT_DATA = { REGIONS, PLACES, LANDMARKS, DISHES, ITINERARIES, FACTS, MAP_URL: '
        + JSON.stringify(MAP_URL) + ' };\n\n',
      '})();'
    ].join('');
    const blob = new Blob([out], { type: 'text/javascript' });
    const url  = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: 'data.js' }).click();
    URL.revokeObjectURL(url);
  }

  const regionMap   = Object.fromEntries(regions.map(r => [r.id, r]));
  const approvedCnt = effective.filter(p => p.status === 'approved').length;
  const pendingCnt  = effective.filter(p => p.status === 'pending').length;
  const hiddenCnt   = effective.filter(p => p.status === 'hidden').length;

  const SORT_LABELS = { status: 'סטטוס', source: 'מקור', region: 'אזור', name: 'שם', rating: 'דירוג' };

  return (
    <div className="admin-screen" dir="rtl">
      <div className="admin-topbar">
        <span className="admin-logo">⚙️ Discover LT — Admin</span>
        <div className="admin-stats">
          <span className="stat approved">✅ {approvedCnt}</span>
          <span className="stat pending">⏳ {pendingCnt}</span>
          <span className="stat hidden">🚫 {hiddenCnt}</span>
        </div>
        <button className="btn-export" onClick={handleExport}>⬇ Export data.js</button>
        <button
          className="btn-logout"
          onClick={() => { localStorage.removeItem('lt_admin_authed'); setAuthed(false); }}
        >
          יציאה
        </button>
      </div>

      <div className="admin-filters">
        <select value={filter.region} onChange={e => setFilter(f => ({ ...f, region: e.target.value }))}>
          <option value="">כל האזורים</option>
          {regions.map(r => <option key={r.id} value={r.id}>{r.he.name}</option>)}
        </select>
        <select value={filter.kind} onChange={e => setFilter(f => ({ ...f, kind: e.target.value }))}>
          <option value="">כל הסוגים</option>
          {['cafe','restaurant','stay','culture','nature','market'].map(k => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
          <option value="">כל הסטטוסים</option>
          <option value="approved">✅ מאושר</option>
          <option value="pending">⏳ ממתין</option>
          <option value="hidden">🚫 מוסתר</option>
        </select>
        <select value={filter.source} onChange={e => setFilter(f => ({ ...f, source: e.target.value }))}>
          <option value="">כל המקורות</option>
          <option value="niv">🟢 ניב</option>
          <option value="ai">🤖 AI</option>
        </select>
        <select value={sort.by} onChange={e => setSort(s => ({ ...s, by: e.target.value }))}>
          {Object.entries(SORT_LABELS).map(([k, v]) => (
            <option key={k} value={k}>מיון: {v}</option>
          ))}
        </select>
        <button
          className="sort-dir-btn"
          onClick={() => setSort(s => ({ ...s, dir: s.dir === 'asc' ? 'desc' : 'asc' }))}
          title={sort.dir === 'asc' ? 'סדר עולה — לחץ להפיך' : 'סדר יורד — לחץ להפיך'}
        >
          {sort.dir === 'asc' ? '↑' : '↓'}
        </button>
        <input
          type="search"
          placeholder="🔍 חיפוש מקום..."
          value={filter.search}
          onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
        />
        <span className="filter-count">{sorted.length} / {allPlaces.length}</span>
      </div>

      {selectedCount > 0 && (
        <div className="admin-bulk-bar">
          <span className="bulk-count">{selectedCount} נבחרו</span>
          <button className="bulk-btn bulk-approve" onClick={() => bulkSetStatus('approved')}>✅ אשר</button>
          <button className="bulk-btn bulk-pending" onClick={() => bulkSetStatus('pending')}>⏳ ממתין</button>
          <button className="bulk-btn bulk-hide"    onClick={() => bulkSetStatus('hidden')}>🚫 הסתר</button>
          <button className="bulk-clear" onClick={() => setSelectedIds(new Set())}>✕ בטל בחירה</button>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="col-check">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={el => { if (el) el.indeterminate = someSelected; }}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>סטטוס</th>
              <th>מקור</th>
              <th>אזור</th>
              <th>מקום</th>
              <th>סוג</th>
              <th>דירוג</th>
              <th>מפות</th>
              <th>הערה</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(p => {
              const reg     = regionMap[p.region];
              const noteVal = pendingNotes[p.id] !== undefined ? pendingNotes[p.id] : p.notes;
              const isSel   = selectedIds.has(p.id);
              return (
                <tr key={p.id} className={`admin-row ${p.status === 'hidden' ? 'row-hidden' : ''} ${isSel ? 'row-selected' : ''}`}>
                  <td className="col-check">
                    <input type="checkbox" checked={isSel} onChange={() => toggleSelect(p.id)} />
                  </td>
                  <td>
                    <button
                      className={`status-badge ${STATUS_CLS[p.status]}`}
                      onClick={() => cycleStatus(p)}
                      title="לחץ להחלפת סטטוס"
                    >
                      {STATUS_LABELS[p.status]}
                    </button>
                  </td>
                  <td>
                    <span className={`source-badge source-${p.source}`}>
                      {p.source === 'niv' ? '🟢 ניב' : '🤖 AI'}
                    </span>
                  </td>
                  <td className="col-region">{reg ? reg.he.name : p.region}</td>
                  <td className="col-name">
                    <div className="place-name">{p.name}</div>
                    <div className="place-id">{p.id}</div>
                  </td>
                  <td>
                    <span className="kind-badge">{p.emoji} {p.kind}</span>
                  </td>
                  <td className="col-rating">★ {p.rating ? p.rating.toFixed(1) : '—'}</td>
                  <td>
                    {p.mapUrl
                      ? <a href={p.mapUrl} target="_blank" rel="noopener noreferrer" className="maps-link">🗺 פתח</a>
                      : <span className="no-link">—</span>}
                  </td>
                  <td>
                    <input
                      className="note-input"
                      value={noteVal}
                      placeholder="הוסף הערה..."
                      onChange={e => setPendingNotes(n => ({ ...n, [p.id]: e.target.value }))}
                      onBlur={() => saveNote(p.id)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, ExploreScreen, RoutesScreen, FoodScreen, StaysScreen, PlaceModal, PlaceCard, SavedScreen, AdminScreen });
