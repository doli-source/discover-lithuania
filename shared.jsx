// Shared UI components, i18n strings, and placeholder image generator

const STRINGS = {
  he: {
    siteName: 'Atrask Lietuvą',
    siteSub: 'מדריך טיולים לליטא',
    tagline: 'גלה את ליטא — לאט, טעים, ובלי לחץ',
    heroSubtitle: 'מסלולים, מקומות אוכל, וכל מה שצריך כדי לאהוב את הארץ הקטנה והקסומה הזו.',
    cta: 'בנה לי מסלול',
    ctaSecond: 'מקומות אוכל',
    nav: { home: 'בית', explore: 'גלה', routes: 'מסלולים', food: 'אוכל', stays: 'לינה', about: 'על ליטא' },
    kinds: { all: 'הכל', cafe: 'בתי קפה', restaurant: 'מסעדות', market: 'שוק / בר', culture: 'תרבות', nature: 'טבע', stay: 'לינה' },
    minutes: 'דק׳',
    day: 'יום',
    week: 'שבוע',
    weekend: 'סופ״ש',
    short: 'קצר',
    region: 'אזור',
    stops: 'תחנות',
    save: 'שמור',
    saved: 'נשמר',
    addToTrip: 'הוסף לטיול',
    inTrip: 'בטיול שלך',
    yourTrip: 'הטיול שלך',
    emptyTrip: 'עוד לא הוספת מקומות. התחל לגלוש!',
    factsLabel: 'ידעת ש…',
    seeRoute: 'ראה מסלול',
    backHome: 'חזרה',
    exploreCta: 'גלה את כל המקומות',
    routesCta: 'בנה את הטיול שלך',
    discover: 'גלה',
    discoverSub: 'בחר אזור והתחל לטייל',
    flagshipRoutes: 'מסלולים מומלצים',
    tasteSub: 'מה לאכול ואיפה',
    eatPlay: 'אוכל, קפה, אווירה',
    weatherNote: 'מאי-ספטמבר מומלץ',
    open: 'פתח'
  },
  en: {
    siteName: 'Atrask Lietuvą',
    siteSub: 'A Traveler\'s Guide to Lithuania',
    tagline: 'Discover Lithuania — slow, tasty, unrushed',
    heroSubtitle: 'Routes, food, and everything you need to fall for this small, magical country.',
    cta: 'Plan a Route',
    ctaSecond: 'Where to Eat',
    nav: { home: 'Home', explore: 'Explore', routes: 'Routes', food: 'Food', stays: 'Stays', about: 'About' },
    kinds: { all: 'All', cafe: 'Cafés', restaurant: 'Restaurants', market: 'Markets & Bars', culture: 'Culture', nature: 'Nature', stay: 'Stays' },
    minutes: 'min',
    day: 'day',
    week: 'week',
    weekend: 'wknd',
    short: 'short',
    region: 'Region',
    stops: 'Stops',
    save: 'Save',
    saved: 'Saved',
    addToTrip: 'Add to Trip',
    inTrip: 'In your trip',
    yourTrip: 'Your Trip',
    emptyTrip: 'Nothing saved yet. Start exploring!',
    factsLabel: 'Did you know…',
    seeRoute: 'See route',
    backHome: 'Back',
    exploreCta: 'Explore all places',
    routesCta: 'Plan your trip',
    discover: 'Discover',
    discoverSub: 'Pick a region and go',
    flagshipRoutes: 'Curated Routes',
    tasteSub: 'What to eat & where',
    eatPlay: 'Food, coffee, atmosphere',
    weatherNote: 'May–Sept recommended',
    open: 'Open'
  }
};

// Decorative placeholder — striped diagonal pattern with caption
function Placeholder({ label, accent = '#C28840', tone = 'warm', kind = 'rect', aspect = '4/3', children, style = {} }) {
  const tones = {
    warm: ['#f6efe4', '#ecdfca'],
    cool: ['#e8eef1', '#d6e0e6'],
    forest: ['#e4ebdf', '#d0dac6'],
    sea: ['#e0eaec', '#c9dadd'],
    stone: ['#ece8e2', '#dad4ca'],
    sunset: ['#f5e4d4', '#ead0b4']
  };
  const [a, b] = tones[tone] || tones.warm;
  const pid = 'p' + Math.random().toString(36).slice(2, 8);
  return (
    <div className="ph" style={{ aspectRatio: aspect, background: a, ...style }}>
      <svg className="ph-svg" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <pattern id={pid} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <rect width="14" height="14" fill={a} />
            <rect width="6" height="14" fill={b} />
          </pattern>
          <linearGradient id={pid + 'g'} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(0,0,0,0)" />
            <stop offset="1" stopColor="rgba(40,30,20,0.18)" />
          </linearGradient>
        </defs>
        <rect width="200" height="150" fill={`url(#${pid})`} />
        <rect width="200" height="150" fill={`url(#${pid}g)`} />
        <circle cx="170" cy="28" r="14" fill={accent} opacity="0.85" />
      </svg>
      <div className="ph-label">
        <span className="ph-dot" style={{ background: accent }}></span>
        <span className="ph-text">{label}</span>
      </div>
      {children}
    </div>
  );
}

// Small inline icons
const Icon = {
  arrow: (props) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14M13 5l7 7-7 7"/></svg>,
  arrowL: (props) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 12H5M11 5l-7 7 7 7"/></svg>,
  bookmark: (props) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
  bookmarkFill: (props) => <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
  pin: (props) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  clock: (props) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  close: (props) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6L6 18M6 6l12 12"/></svg>,
  star: (props) => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" {...props}><path d="M12 .587l3.668 7.568L24 9.75l-6 5.847 1.42 8.282L12 19.771l-7.42 4.108L6 15.597 0 9.75l8.332-1.595z"/></svg>,
  compass: (props) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polygon points="16 8 14 14 8 16 10 10 16 8"/></svg>,
  route: (props) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M6 17V9a4 4 0 0 1 4-4h4a4 4 0 0 1 0 8h-4a4 4 0 0 0 0 8h4"/></svg>,
  spoon: (props) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14 4c0 2-2 4-2 6s2 4 2 4l-1 9h-2l-1-9s2-2 2-4-2-4-2-6a3 3 0 0 1 6 0z"/></svg>,
  home: (props) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 11l9-8 9 8M5 10v10h14V10"/></svg>,
  globe: (props) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>
};

function MapIllustration({ regions, activeRegion, onPick, t, lang }) {
  // Map data-place IDs to app region IDs
  const placeToRegion = {
    vilnius: 'vilnius',
    kaunas: 'kaunas',
    klaipeda: 'klaipeda',
    nida: 'curonian',
    druskininkai: 'druskininkai',
    kretinga: 'kretinga',
    palanga: 'palanga',
    moletai: 'moletai',
    utena: 'utena',
    zarasai: 'zarasai',
  };

  function handleClick(placeKey) {
    const regionId = placeToRegion[placeKey] || placeKey;
    if (onPick) onPick(regionId);
  }

  const isActive = (placeKey) => activeRegion === (placeToRegion[placeKey] || placeKey);

  return (
    <div className="map-wrap">
      <svg viewBox="0 0 1000 760" className="map-svg lt-map-svg" role="img"
           aria-label="Clickable illustrated map of Lithuania" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="lt-topo" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(28)">
            <line x1="0" y1="0" x2="0" y2="26" stroke="rgba(120,90,55,0.10)" strokeWidth="2"/>
          </pattern>
        </defs>

        {/* Background */}
        <rect x="0" y="0" width="1000" height="760" rx="28" fill="#f3ead9" />
        <rect x="0" y="0" width="260" height="760" fill="#dce8eb" opacity=".62" />

        {/* Sea & country labels */}
        <text className="lt-sea-label" x="80" y="205">Baltic Sea</text>
        <text className="lt-region-label" x="485" y="115">LATVIA</text>
        <text className="lt-region-label" x="820" y="495">BELARUS</text>
        <text className="lt-region-label" x="425" y="725">POLAND</text>

        {/* Lithuania outline */}
        <path className="lt-country" d="M 804.64 286.81 L 815.15 374.51 L 723.41 437.20 L 697.44 547.72 L 575.94 621.48 L 467.78 620.15 L 440.91 559.83 L 383.51 538.89 L 374.56 488.93 L 386.50 435.32 L 337.03 404.24 L 219.84 369.94 L 196.04 205.37 L 324.21 145.32 L 511.89 157.88 L 621.82 138.52 L 637.52 179.24 L 697.07 191.82 L 804.64 286.81 Z" />
        <path d="M 804.64 286.81 L 815.15 374.51 L 723.41 437.20 L 697.44 547.72 L 575.94 621.48 L 467.78 620.15 L 440.91 559.83 L 383.51 538.89 L 374.56 488.93 L 386.50 435.32 L 337.03 404.24 L 219.84 369.94 L 196.04 205.37 L 324.21 145.32 L 511.89 157.88 L 621.82 138.52 L 637.52 179.24 L 697.07 191.82 L 804.64 286.81 Z" fill="url(#lt-topo)" />

        {/* Country watermark */}
        <text className="lt-country-word" x="515" y="405" textAnchor="middle">LIETUVA</text>

        {/* Countryside scatter dots */}
        <g onClick={() => handleClick('countryside')} style={{cursor:'pointer'}}>
          {[
            {cx:413.60,cy:299.56},{cx:525.51,cy:338.71},{cx:324.08,cy:407.24},
            {cx:659.80,cy:456.18},{cx:458.37,cy:495.34},{cx:547.89,cy:240.82}
          ].map((c,i) => (
            <circle key={i} cx={c.cx} cy={c.cy} r={isActive('countryside') ? 11 : 9}
                    fill="#5F7A4A" opacity={isActive('countryside') ? 0.75 : 0.45}/>
          ))}
          <text className="lt-countryside" x="515" y="235" textAnchor="middle"
                opacity={isActive('countryside') ? 1 : 0.85}
                fontWeight={isActive('countryside') ? 800 : 700}>
            · {lang === 'he' ? 'הכפר' : 'Countryside'} ·
          </text>
        </g>

        {/* Vilnius */}
        <g className="lt-place-link" onClick={() => handleClick('vilnius')} style={{cursor:'pointer'}}>
          <circle className="lt-hit" cx="668.71" cy="468.48" r="42"/>
          <circle className={`lt-place-dot${isActive('vilnius') ? ' lt-place-active lt-place-vilnius' : ''}`} cx="668.71" cy="468.48" r={isActive('vilnius') ? 26 : 21} fill="#C28840"/>
          <rect className="lt-label-bg" x="698" y="449" width="96" height="34" rx="9" opacity={isActive('vilnius') ? 1 : 0.88}/>
          <text className="lt-place-label" x="710" y="474" textAnchor="start" fontWeight={isActive('vilnius') ? 800 : 800}>Vilnius</text>
        </g>

        {/* Kaunas */}
        <g className="lt-place-link" onClick={() => handleClick('kaunas')} style={{cursor:'pointer'}}>
          <circle className="lt-hit" cx="514.72" cy="427.11" r="38"/>
          <circle className={`lt-place-dot${isActive('kaunas') ? ' lt-place-active' : ''}`} cx="514.72" cy="427.11" r={isActive('kaunas') ? 20 : 16} fill="#7E6A4E"/>
          <rect className="lt-label-bg" x="540" y="410" width="92" height="32" rx="9"/>
          <text className="lt-place-label" x="552" y="434" textAnchor="start" fontWeight={isActive('kaunas') ? 800 : 800}>Kaunas</text>
        </g>

        {/* Klaipėda */}
        <g className="lt-place-link" onClick={() => handleClick('klaipeda')} style={{cursor:'pointer'}}>
          <circle className="lt-hit" cx="205.94" cy="269.54" r="32"/>
          <circle className={`lt-place-dot${isActive('klaipeda') ? ' lt-place-active' : ''}`} cx="205.94" cy="269.54" r={isActive('klaipeda') ? 20 : 16} fill="#4A7C8C"/>
          <rect className="lt-label-bg" x="230" y="274" width="100" height="32" rx="9"/>
          <text className="lt-place-label" x="242" y="298" textAnchor="start" fontWeight={isActive('klaipeda') ? 800 : 800}>Klaipėda</text>
        </g>

        {/* Curonian Spit (Nida) */}
        <g className="lt-place-link" onClick={() => handleClick('nida')} style={{cursor:'pointer'}}>
          <circle className="lt-hit" cx="190.27" cy="347.58" r="34"/>
          <circle className={`lt-place-dot${isActive('nida') ? ' lt-place-active' : ''}`} cx="190.27" cy="347.58" r={isActive('nida') ? 20 : 16} fill="#B89968"/>
          <rect className="lt-label-bg" x="210" y="378" width="248" height="33" rx="9"/>
          <text className="lt-place-label" x="222" y="402" textAnchor="start" fontWeight={isActive('nida') ? 800 : 800}>Curonian Spit (Nida)</text>
        </g>

        {/* Druskininkai */}
        <g className="lt-place-link" onClick={() => handleClick('druskininkai')} style={{cursor:'pointer'}}>
          <circle className="lt-hit" cx="524.06" cy="599.94" r="38"/>
          <circle className={`lt-place-dot${isActive('druskininkai') ? ' lt-place-active' : ''}`} cx="524.06" cy="599.94" r={isActive('druskininkai') ? 20 : 16} fill="#A85D4A"/>
          <rect className="lt-label-bg" x="461" y="628" width="150" height="34" rx="9"/>
          <text className="lt-place-label" x="536" y="653" textAnchor="middle" fontWeight={isActive('druskininkai') ? 800 : 800}>Druskininkai</text>
        </g>

        {/* Kretinga */}
        <g className="lt-place-link" onClick={() => handleClick('kretinga')} style={{cursor:'pointer'}}>
          <circle className="lt-hit" cx="217.16" cy="233.23" r="31"/>
          <circle className={`lt-place-dot${isActive('kretinga') ? ' lt-place-active' : ''}`} cx="217.16" cy="233.23" r={isActive('kretinga') ? 20 : 16} fill="#8A6B4A"/>
          <rect className="lt-label-bg" x="246" y="236" width="102" height="32" rx="9"/>
          <text className="lt-place-label" x="258" y="260" textAnchor="start" fontWeight={isActive('kretinga') ? 800 : 800}>Kretinga</text>
        </g>

        {/* Palanga */}
        <g className="lt-place-link" onClick={() => handleClick('palanga')} style={{cursor:'pointer'}}>
          <circle className="lt-hit" cx="197.47" cy="227.61" r="30"/>
          <circle className={`lt-place-dot${isActive('palanga') ? ' lt-place-active' : ''}`} cx="197.47" cy="227.61" r={isActive('palanga') ? 20 : 16} fill="#D4A05A"/>
          <rect className="lt-label-bg" x="225" y="184" width="94" height="32" rx="9"/>
          <text className="lt-place-label" x="237" y="208" textAnchor="start" fontWeight={isActive('palanga') ? 800 : 800}>Palanga</text>
        </g>

        {/* Molėtai */}
        <g className="lt-place-link" onClick={() => handleClick('moletai')} style={{cursor:'pointer'}}>
          <circle className="lt-hit" cx="684.07" cy="362.32" r="38"/>
          <circle className={`lt-place-dot${isActive('moletai') ? ' lt-place-active' : ''}`} cx="684.07" cy="362.32" r={isActive('moletai') ? 20 : 16} fill="#4A6B7E"/>
          <rect className="lt-label-bg" x="573" y="375" width="96" height="32" rx="9"/>
          <text className="lt-place-label" x="657" y="399" textAnchor="end" fontWeight={isActive('moletai') ? 800 : 800}>Molėtai</text>
        </g>

        {/* Utena */}
        <g className="lt-place-link" onClick={() => handleClick('utena')} style={{cursor:'pointer'}}>
          <circle className="lt-hit" cx="704.47" cy="309.82" r="38"/>
          <circle className={`lt-place-dot${isActive('utena') ? ' lt-place-active' : ''}`} cx="704.47" cy="309.82" r={isActive('utena') ? 20 : 16} fill="#6B8A5A"/>
          <rect className="lt-label-bg" x="728" y="304" width="78" height="32" rx="9"/>
          <text className="lt-place-label" x="740" y="328" textAnchor="start" fontWeight={isActive('utena') ? 800 : 800}>Utena</text>
        </g>

        {/* Zarasai */}
        <g className="lt-place-link" onClick={() => handleClick('zarasai')} style={{cursor:'pointer'}}>
          <circle className="lt-hit" cx="776.77" cy="263.75" r="38"/>
          <circle className={`lt-place-dot${isActive('zarasai') ? ' lt-place-active' : ''}`} cx="776.77" cy="263.75" r={isActive('zarasai') ? 20 : 16} fill="#5A8A8A"/>
          <rect className="lt-label-bg" x="676" y="238" width="92" height="32" rx="9"/>
          <text className="lt-place-label" x="756" y="262" textAnchor="end" fontWeight={isActive('zarasai') ? 800 : 800}>Zarasai</text>
        </g>

        {/* Compass */}
        <g transform="translate(910 145)">
          <circle r="35" fill="none" stroke="#8b7355" strokeWidth="3"/>
          <path d="M 0 -28 L 8 0 L 0 28 L -8 0 Z" fill="#8b7355"/>
          <text x="0" y="-48" fontSize="24" fill="#8b7355" textAnchor="middle">N</text>
        </g>
      </svg>
    </div>
  );
}

Object.assign(window, { STRINGS, Placeholder, Icon, MapIllustration, RegionArt });

// Per-region SVG illustration. Each is a horizon scene with unique silhouettes.
function RegionArt({ id, accent }) {
  const dark = accent;
  const mid = accent + 'AA';
  const light = accent + '44';
  const sky = accent + '18';

  const scenes = {
    vilnius: (
      // Old town: cathedral + Gediminas tower + baroque spires
      <g>
        <rect x="0" y="0" width="200" height="180" fill={sky}/>
        <circle cx="40" cy="40" r="14" fill="#ffffff" opacity="0.5"/>
        {/* Hill */}
        <path d="M 0 200 L 0 150 Q 50 130 100 145 Q 150 130 200 155 L 200 200 Z" fill={light}/>
        {/* Gediminas tower on hill */}
        <rect x="58" y="120" width="14" height="38" fill={dark}/>
        <path d="M 58 120 L 65 110 L 72 120 Z" fill={dark}/>
        <rect x="62" y="128" width="3" height="6" fill="#ffffff" opacity="0.6"/>
        {/* Cathedral */}
        <rect x="90" y="135" width="40" height="40" fill={mid}/>
        <path d="M 90 135 L 110 115 L 130 135 Z" fill={dark}/>
        <rect x="106" y="128" width="8" height="14" fill={dark}/>
        <circle cx="110" cy="125" r="3" fill="#ffffff" opacity="0.7"/>
        {/* Baroque spires */}
        <rect x="145" y="125" width="6" height="50" fill={mid}/>
        <path d="M 145 125 L 148 110 L 151 125 Z" fill={dark}/>
        <circle cx="148" cy="118" r="2" fill="#ffffff" opacity="0.6"/>
        <rect x="160" y="135" width="5" height="40" fill={mid}/>
        <path d="M 160 135 L 162.5 120 L 165 135 Z" fill={dark}/>
        {/* Trees */}
        <ellipse cx="20" cy="170" rx="10" ry="14" fill={dark} opacity="0.7"/>
        <ellipse cx="185" cy="172" rx="9" ry="12" fill={dark} opacity="0.7"/>
      </g>
    ),
    kaunas: (
      // Modernist boxy buildings — Bauhaus rhythm
      <g>
        <rect x="0" y="0" width="200" height="180" fill={sky}/>
        <circle cx="160" cy="35" r="12" fill="#ffffff" opacity="0.55"/>
        <path d="M 0 180 L 200 180 L 200 155 Q 100 145 0 158 Z" fill={light}/>
        <rect x="20" y="115" width="32" height="55" fill={mid}/>
        <rect x="26" y="125" width="4" height="6" fill="#ffffff" opacity="0.55"/>
        <rect x="34" y="125" width="4" height="6" fill="#ffffff" opacity="0.55"/>
        <rect x="42" y="125" width="4" height="6" fill="#ffffff" opacity="0.55"/>
        <rect x="26" y="138" width="4" height="6" fill="#ffffff" opacity="0.55"/>
        <rect x="34" y="138" width="4" height="6" fill="#ffffff" opacity="0.55"/>
        <rect x="42" y="138" width="4" height="6" fill="#ffffff" opacity="0.55"/>
        <rect x="62" y="100" width="38" height="70" fill={dark}/>
        <rect x="68" y="110" width="26" height="3" fill="#ffffff" opacity="0.5"/>
        <rect x="68" y="120" width="26" height="3" fill="#ffffff" opacity="0.5"/>
        <rect x="68" y="130" width="26" height="3" fill="#ffffff" opacity="0.5"/>
        <rect x="68" y="140" width="26" height="3" fill="#ffffff" opacity="0.5"/>
        <rect x="68" y="150" width="26" height="3" fill="#ffffff" opacity="0.5"/>
        <rect x="110" y="125" width="28" height="45" fill={mid}/>
        <circle cx="124" cy="135" r="6" fill="#ffffff" opacity="0.4"/>
        <rect x="148" y="118" width="36" height="52" fill={dark}/>
        <rect x="154" y="125" width="6" height="4" fill="#ffffff" opacity="0.55"/>
        <rect x="164" y="125" width="6" height="4" fill="#ffffff" opacity="0.55"/>
        <rect x="174" y="125" width="6" height="4" fill="#ffffff" opacity="0.55"/>
        <rect x="154" y="135" width="6" height="4" fill="#ffffff" opacity="0.55"/>
        <rect x="164" y="135" width="6" height="4" fill="#ffffff" opacity="0.55"/>
        <rect x="174" y="135" width="6" height="4" fill="#ffffff" opacity="0.55"/>
      </g>
    ),
    klaipeda: (
      // Port — ship masts, lighthouse
      <g>
        <rect x="0" y="0" width="200" height="180" fill={sky}/>
        <circle cx="155" cy="40" r="10" fill="#ffffff" opacity="0.55"/>
        {/* Sea */}
        <path d="M 0 180 L 200 180 L 200 110 Q 100 105 0 115 Z" fill={light}/>
        <path d="M 0 130 Q 50 125 100 130 T 200 128" stroke={mid} strokeWidth="1.5" fill="none" opacity="0.4"/>
        <path d="M 0 145 Q 50 140 100 145 T 200 143" stroke={mid} strokeWidth="1.5" fill="none" opacity="0.35"/>
        {/* Lighthouse */}
        <path d="M 35 170 L 40 95 L 50 95 L 55 170 Z" fill={mid}/>
        <rect x="38" y="90" width="14" height="8" fill={dark}/>
        <rect x="40" y="82" width="10" height="10" fill="#ffffff" opacity="0.7"/>
        <path d="M 40 82 L 45 75 L 50 82 Z" fill={dark}/>
        <line x1="52" y1="86" x2="65" y2="80" stroke="#ffffff" strokeWidth="1" opacity="0.4"/>
        {/* Ship */}
        <rect x="90" y="125" width="60" height="14" fill={dark}/>
        <path d="M 90 139 L 95 145 L 145 145 L 150 139 Z" fill={dark}/>
        <line x1="110" y1="125" x2="110" y2="90" stroke={dark} strokeWidth="2"/>
        <line x1="135" y1="125" x2="135" y2="95" stroke={dark} strokeWidth="2"/>
        <path d="M 110 95 L 110 120 L 128 110 Z" fill={mid} opacity="0.8"/>
        <path d="M 135 100 L 135 120 L 148 112 Z" fill={mid} opacity="0.8"/>
      </g>
    ),
    curonian: (
      // Sand dunes
      <g>
        <rect x="0" y="0" width="200" height="180" fill={sky}/>
        <circle cx="155" cy="38" r="12" fill="#ffffff" opacity="0.55"/>
        {/* Sea on left */}
        <path d="M 0 180 L 0 120 Q 25 125 50 130 L 50 180 Z" fill={accent + '33'}/>
        {/* Dunes */}
        <path d="M 0 180 L 200 180 L 200 130 Q 175 110 145 120 Q 110 90 80 115 Q 50 100 30 125 Q 15 120 0 130 Z" fill={light}/>
        <path d="M 30 180 L 200 180 L 200 145 Q 170 130 140 138 Q 100 115 70 135 Q 50 130 30 145 Z" fill={mid} opacity="0.6"/>
        <path d="M 60 180 L 200 180 L 200 160 Q 160 152 130 158 Q 100 148 80 158 Q 70 156 60 160 Z" fill={dark} opacity="0.5"/>
        {/* Sparse grass */}
        <line x1="70" y1="150" x2="72" y2="142" stroke={dark} strokeWidth="0.8" opacity="0.8"/>
        <line x1="73" y1="150" x2="74" y2="143" stroke={dark} strokeWidth="0.8" opacity="0.8"/>
        <line x1="125" y1="155" x2="127" y2="146" stroke={dark} strokeWidth="0.8" opacity="0.8"/>
        <line x1="128" y1="155" x2="129" y2="147" stroke={dark} strokeWidth="0.8" opacity="0.8"/>
        <line x1="175" y1="148" x2="177" y2="140" stroke={dark} strokeWidth="0.8" opacity="0.8"/>
      </g>
    ),
    countryside: (
      // Pine forest with cabin
      <g>
        <rect x="0" y="0" width="200" height="180" fill={sky}/>
        <circle cx="40" cy="40" r="10" fill="#ffffff" opacity="0.55"/>
        <path d="M 0 180 L 200 180 L 200 150 Q 100 140 0 155 Z" fill={light}/>
        {/* Pine trees back row */}
        {[15, 35, 55, 70, 90, 105, 125, 145, 165, 185].map((x, i) => (
          <g key={i}>
            <path d={`M ${x} 150 L ${x-7} 145 L ${x-4} 145 L ${x-7} 135 L ${x-3} 135 L ${x-6} 122 L ${x} 105 L ${x+6} 122 L ${x+3} 122 L ${x+7} 135 L ${x+3} 135 L ${x+7} 145 L ${x+4} 145 L ${x+7} 150 Z`} fill={dark} opacity={0.55 + (i%3)*0.1}/>
          </g>
        ))}
        {/* Cabin */}
        <rect x="78" y="135" width="44" height="28" fill={mid}/>
        <path d="M 76 135 L 100 118 L 124 135 Z" fill={dark}/>
        <rect x="94" y="145" width="12" height="18" fill={dark}/>
        <rect x="86" y="142" width="6" height="6" fill="#ffffff" opacity="0.55"/>
        <rect x="108" y="142" width="6" height="6" fill="#ffffff" opacity="0.55"/>
        {/* Smoke */}
        <path d="M 112 122 Q 110 115 113 110 Q 117 105 114 100" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.5"/>
      </g>
    ),
    druskininkai: (
      // Lake + spa pavilion + trees
      <g>
        <rect x="0" y="0" width="200" height="180" fill={sky}/>
        <circle cx="155" cy="35" r="11" fill="#ffffff" opacity="0.55"/>
        {/* Hills */}
        <path d="M 0 130 Q 60 105 100 115 Q 140 100 200 125 L 200 145 L 0 145 Z" fill={mid} opacity="0.5"/>
        {/* Forest line */}
        <path d="M 0 145 Q 30 138 60 142 Q 90 135 120 140 Q 150 132 200 142 L 200 150 L 0 150 Z" fill={dark} opacity="0.7"/>
        {/* Spa pavilion */}
        <rect x="80" y="120" width="40" height="32" fill={mid}/>
        <path d="M 75 120 L 100 102 L 125 120 Z" fill={dark}/>
        <rect x="88" y="128" width="6" height="14" fill={dark}/>
        <rect x="106" y="128" width="6" height="14" fill={dark}/>
        <rect x="97" y="128" width="6" height="14" fill={dark}/>
        {/* Lake (foreground) */}
        <path d="M 0 180 L 200 180 L 200 152 Q 100 148 0 155 Z" fill={accent + '44'}/>
        <path d="M 0 162 Q 50 158 100 162 T 200 161" stroke="#ffffff" strokeWidth="1" fill="none" opacity="0.4"/>
        <path d="M 0 172 Q 50 168 100 172 T 200 171" stroke="#ffffff" strokeWidth="1" fill="none" opacity="0.4"/>
        {/* Reflection */}
        <rect x="85" y="152" width="30" height="3" fill={dark} opacity="0.25"/>
      </g>
    ),
    kretinga: (
      // Manor garden — formal hedges, manor house
      <g>
        <rect x="0" y="0" width="200" height="180" fill={sky}/>
        <circle cx="40" cy="38" r="10" fill="#ffffff" opacity="0.55"/>
        <path d="M 0 180 L 200 180 L 200 155 L 0 155 Z" fill={light}/>
        {/* Manor */}
        <rect x="60" y="100" width="80" height="55" fill={mid}/>
        <path d="M 56 100 L 100 78 L 144 100 Z" fill={dark}/>
        <rect x="96" y="88" width="8" height="12" fill={dark}/>
        <rect x="94" y="120" width="12" height="35" fill={dark}/>
        <rect x="70" y="118" width="10" height="14" fill="#ffffff" opacity="0.5"/>
        <rect x="120" y="118" width="10" height="14" fill="#ffffff" opacity="0.5"/>
        <rect x="70" y="138" width="10" height="14" fill="#ffffff" opacity="0.5"/>
        <rect x="120" y="138" width="10" height="14" fill="#ffffff" opacity="0.5"/>
        {/* Formal hedges */}
        <ellipse cx="25" cy="168" rx="14" ry="6" fill={dark}/>
        <ellipse cx="50" cy="170" rx="10" ry="5" fill={dark}/>
        <ellipse cx="150" cy="170" rx="10" ry="5" fill={dark}/>
        <ellipse cx="175" cy="168" rx="14" ry="6" fill={dark}/>
        {/* Path */}
        <path d="M 95 178 L 100 155 L 105 178 Z" fill="#ffffff" opacity="0.4"/>
      </g>
    ),
    palanga: (
      // Beach pier + sea + sun
      <g>
        <rect x="0" y="0" width="200" height="180" fill={sky}/>
        <circle cx="60" cy="45" r="16" fill="#ffffff" opacity="0.6"/>
        {/* Sea */}
        <path d="M 0 180 L 200 180 L 200 105 L 0 105 Z" fill={light}/>
        <path d="M 0 115 Q 25 110 50 115 T 100 114 T 150 115 T 200 114" stroke={mid} strokeWidth="1.2" fill="none" opacity="0.5"/>
        <path d="M 0 128 Q 25 124 50 128 T 100 127 T 150 128 T 200 127" stroke={mid} strokeWidth="1.2" fill="none" opacity="0.5"/>
        <path d="M 0 142 Q 25 138 50 142 T 100 141 T 150 142 T 200 141" stroke={dark} strokeWidth="1.2" fill="none" opacity="0.45"/>
        {/* Sun reflection */}
        <ellipse cx="60" cy="120" rx="20" ry="4" fill="#ffffff" opacity="0.4"/>
        <ellipse cx="60" cy="135" rx="14" ry="2" fill="#ffffff" opacity="0.3"/>
        {/* Pier */}
        <rect x="40" y="100" width="120" height="6" fill={dark}/>
        <line x1="50" y1="106" x2="50" y2="175" stroke={dark} strokeWidth="3"/>
        <line x1="80" y1="106" x2="80" y2="175" stroke={dark} strokeWidth="3"/>
        <line x1="110" y1="106" x2="110" y2="175" stroke={dark} strokeWidth="3"/>
        <line x1="140" y1="106" x2="140" y2="175" stroke={dark} strokeWidth="3"/>
        {/* Sand */}
        <path d="M 0 180 L 200 180 L 200 165 Q 100 170 0 172 Z" fill={accent + '55'}/>
      </g>
    ),
    moletai: (
      // Starry sky with observatory dome
      <g>
        <rect x="0" y="0" width="200" height="180" fill={accent + '33'}/>
        {/* Stars */}
        <circle cx="25" cy="20" r="1.5" fill="#ffffff"/>
        <circle cx="55" cy="35" r="1" fill="#ffffff" opacity="0.85"/>
        <circle cx="80" cy="22" r="1.3" fill="#ffffff"/>
        <circle cx="110" cy="40" r="1" fill="#ffffff" opacity="0.7"/>
        <circle cx="135" cy="18" r="1.5" fill="#ffffff"/>
        <circle cx="165" cy="30" r="1" fill="#ffffff" opacity="0.85"/>
        <circle cx="185" cy="15" r="1.5" fill="#ffffff"/>
        <circle cx="40" cy="60" r="1" fill="#ffffff" opacity="0.7"/>
        <circle cx="100" cy="65" r="1.2" fill="#ffffff" opacity="0.85"/>
        <circle cx="160" cy="60" r="1" fill="#ffffff" opacity="0.7"/>
        {/* Moon */}
        <circle cx="50" cy="45" r="10" fill="#ffffff" opacity="0.75"/>
        <circle cx="53" cy="42" r="9" fill={accent + '33'}/>
        {/* Hills */}
        <path d="M 0 180 L 200 180 L 200 130 Q 150 110 100 125 Q 50 110 0 130 Z" fill={dark}/>
        {/* Observatory dome */}
        <rect x="90" y="115" width="20" height="20" fill={mid}/>
        <path d="M 88 115 A 12 12 0 0 1 112 115 Z" fill={mid}/>
        <line x1="100" y1="105" x2="100" y2="98" stroke={mid} strokeWidth="2"/>
        <rect x="98" y="118" width="4" height="14" fill={dark}/>
        {/* Pine silhouettes */}
        <path d="M 30 170 L 25 155 L 28 155 L 23 145 L 27 145 L 22 132 L 30 120 L 38 132 L 33 145 L 37 145 L 32 155 L 35 155 L 30 170 Z" fill={dark}/>
        <path d="M 165 170 L 160 158 L 163 158 L 158 148 L 162 148 L 157 135 L 165 122 L 173 135 L 168 148 L 172 148 L 167 158 L 170 158 L 165 170 Z" fill={dark}/>
      </g>
    ),
    utena: (
      // Multiple connected lakes from above + canoe
      <g>
        <rect x="0" y="0" width="200" height="180" fill={sky}/>
        <circle cx="40" cy="35" r="10" fill="#ffffff" opacity="0.55"/>
        {/* Land */}
        <path d="M 0 180 L 200 180 L 200 0 L 0 0 Z" fill={light}/>
        {/* Pine forest scatter */}
        {[[30,60],[55,90],[15,110],[75,140],[170,55],[180,100],[150,135],[35,150]].map(([x,y],i)=>(
          <path key={i} d={`M ${x} ${y+8} L ${x-4} ${y+3} L ${x-2} ${y+3} L ${x-3} ${y-2} L ${x} ${y-8} L ${x+3} ${y-2} L ${x+2} ${y+3} L ${x+4} ${y+3} Z`} fill={dark} opacity="0.7"/>
        ))}
        {/* Lakes (organic shapes) */}
        <ellipse cx="60" cy="80" rx="22" ry="14" fill={accent + '88'} transform="rotate(-20 60 80)"/>
        <ellipse cx="120" cy="65" rx="18" ry="12" fill={accent + '88'} transform="rotate(15 120 65)"/>
        <ellipse cx="100" cy="120" rx="32" ry="18" fill={accent + '99'} transform="rotate(-10 100 120)"/>
        <ellipse cx="155" cy="105" rx="14" ry="10" fill={accent + '88'}/>
        <path d="M 75 78 Q 95 80 105 105" stroke={accent + '88'} strokeWidth="3" fill="none"/>
        <path d="M 132 78 Q 130 90 130 110" stroke={accent + '88'} strokeWidth="3" fill="none"/>
        {/* Canoe on main lake */}
        <ellipse cx="100" cy="120" rx="10" ry="2.5" fill={dark}/>
        <line x1="100" y1="118" x2="100" y2="115" stroke={dark} strokeWidth="1.5"/>
      </g>
    ),
    zarasai: (
      // Island town between lakes — boardwalk
      <g>
        <rect x="0" y="0" width="200" height="180" fill={sky}/>
        <circle cx="160" cy="35" r="10" fill="#ffffff" opacity="0.55"/>
        {/* Water */}
        <rect x="0" y="0" width="200" height="180" fill={accent + '55'}/>
        {/* Island (light land) */}
        <ellipse cx="100" cy="105" rx="55" ry="28" fill={light}/>
        <ellipse cx="100" cy="105" rx="55" ry="28" fill={mid} opacity="0.3"/>
        {/* Trees on island */}
        <ellipse cx="75" cy="100" rx="6" ry="8" fill={dark} opacity="0.75"/>
        <ellipse cx="125" cy="100" rx="6" ry="8" fill={dark} opacity="0.75"/>
        <ellipse cx="105" cy="95" rx="5" ry="7" fill={dark} opacity="0.75"/>
        {/* House on island */}
        <rect x="92" y="105" width="16" height="14" fill={mid}/>
        <path d="M 90 105 L 100 96 L 110 105 Z" fill={dark}/>
        <rect x="98" y="110" width="4" height="9" fill={dark}/>
        {/* Boardwalk to island */}
        <rect x="0" y="148" width="50" height="4" fill={dark} opacity="0.9"/>
        <rect x="150" y="148" width="50" height="4" fill={dark} opacity="0.9"/>
        {/* Posts */}
        <rect x="10" y="148" width="2" height="14" fill={dark} opacity="0.7"/>
        <rect x="25" y="148" width="2" height="14" fill={dark} opacity="0.7"/>
        <rect x="40" y="148" width="2" height="14" fill={dark} opacity="0.7"/>
        <rect x="160" y="148" width="2" height="14" fill={dark} opacity="0.7"/>
        <rect x="175" y="148" width="2" height="14" fill={dark} opacity="0.7"/>
        <rect x="190" y="148" width="2" height="14" fill={dark} opacity="0.7"/>
        {/* Ripples */}
        <path d="M 0 130 Q 50 128 100 130 T 200 130" stroke="#ffffff" strokeWidth="0.8" fill="none" opacity="0.4"/>
        <path d="M 0 165 Q 50 163 100 165 T 200 165" stroke="#ffffff" strokeWidth="0.8" fill="none" opacity="0.4"/>
      </g>
    )
  };

  return (
    <svg viewBox="0 0 200 180" className="region-art" preserveAspectRatio="xMidYMid slice">
      {scenes[id] || scenes.countryside}
    </svg>
  );
}

// Build a Google Maps URL that opens directly on the place
function placeMapUrl(place) {
  // Use a per-place override if provided
  if (place.mapUrl) return place.mapUrl;
  const cityName = {
    vilnius: 'Vilnius',
    kaunas: 'Kaunas',
    klaipeda: 'Klaipėda',
    curonian: 'Nida',
    countryside: '',
    druskininkai: 'Druskininkai',
    palanga: 'Palanga',
    kretinga: 'Kretinga',
    moletai: 'Molėtai',
    utena: 'Utena',
    zarasai: 'Zarasai'
  }[place.region] || '';
  // Simplest reliable Google Maps URL: pure ?q= search
  const query = [place.name, cityName, 'Lithuania'].filter(Boolean).join(' ');
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}`;
}
window.placeMapUrl = placeMapUrl;
