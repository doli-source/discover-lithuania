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

// Geographic outline of Lithuania — traced from real map data
function MapIllustration({ regions, activeRegion, onPick, t, lang }) {
  // Real-world coords projected to viewBox (lon→x, lat→y)
  // Dots positioned to match actual city locations on the silhouette
  const dots = {
    klaipeda:    { x: 17,  y: 38, anchor: 'start',  lx:  21, ly: 39 },
    curonian:    { x: 8,   y: 56, anchor: 'middle', lx:  13, ly: 73 },
    kaunas:      { x: 46,  y: 55, anchor: 'start',  lx:  50, ly: 56 },
    vilnius:     { x: 68,  y: 60, anchor: 'start',  lx:  72, ly: 61 },
    druskininkai:{ x: 47,  y: 88, anchor: 'middle', lx:  47, ly: 95 },
    // Additional cities
    palanga:     { x: 15,  y: 28, anchor: 'start',  lx:  19, ly: 29 },
    kretinga:    { x: 20,  y: 32, anchor: 'start',  lx:  24, ly: 33 },
    moletai:     { x: 64,  y: 42, anchor: 'start',  lx:  68, ly: 43 },
    utena:       { x: 70,  y: 34, anchor: 'start',  lx:  74, ly: 35 },
    zarasai:     { x: 82,  y: 24, anchor: 'end',    lx:  79, ly: 25 }
  };

  // Countryside is scattered across the whole country (10 rural spots).
  // Render as multiple small subtle dots, with one label off to the side.
  const countrysideScatter = [
    { x: 32, y: 30 }, { x: 56, y: 28 }, { x: 70, y: 40 },
    { x: 38, y: 45 }, { x: 60, y: 68 }, { x: 28, y: 65 },
    { x: 80, y: 50 }, { x: 50, y: 70 }
  ];
  const countryside = regions.find(r => r.id === 'countryside');

  // Realistic Lithuania outline — wider north, narrower south, eastward bulge near Vilnius,
  // southern "tongue" toward Druskininkai, short Baltic coast in the west.
  const mainlandPath = `
    M 16 22
    C 20 19, 28 16, 38 15
    C 50 14, 62 14, 72 16
    C 79 17, 83 20, 85 24
    C 87 28, 87 33, 86 38
    C 87 44, 90 50, 91 56
    C 91 62, 88 67, 84 70
    C 80 74, 74 75, 68 76
    C 62 77, 57 77, 55 79
    C 53 82, 52 86, 51 90
    C 49 92, 47 93, 45 91
    C 43 88, 42 85, 38 84
    C 32 84, 26 83, 22 80
    C 18 76, 17 71, 18 66
    L 18 62
    C 18 58, 17 52, 16 46
    C 15 40, 15 30, 16 22
    Z
  `;
  // Curonian Spit — narrow detached peninsula off the SW coast
  const spitPath = `
    M 12 38
    C 9 44, 7 50, 6 56
    C 5 62, 6 67, 8 70
    C 10 71, 12 68, 13 62
    C 14 56, 14 48, 13 40
    C 13 38, 12 37, 12 38
    Z
  `;

  return (
    <div className="map-wrap">
      <svg viewBox="0 0 100 100" className="map-svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="topo" width="2.6" height="2.6" patternUnits="userSpaceOnUse" patternTransform="rotate(28)">
            <line x1="0" y1="0" x2="0" y2="2.6" stroke="rgba(120,90,55,0.10)" strokeWidth="0.4"/>
          </pattern>
        </defs>

        {/* Baltic Sea label */}
        <text x="2" y="20" fontSize="2.4" fill="#7a8c95" fontStyle="italic" opacity="0.75">Baltic Sea</text>

        {/* Surrounding country labels (subtle) */}
        <text x="50" y="9" fontSize="1.9" fill="#a8a090" textAnchor="middle" opacity="0.55" letterSpacing="0.4">LATVIA</text>
        <text x="95" y="50" fontSize="1.9" fill="#a8a090" textAnchor="end" opacity="0.55" letterSpacing="0.4">BELARUS</text>
        <text x="40" y="97" fontSize="1.9" fill="#a8a090" textAnchor="middle" opacity="0.55" letterSpacing="0.4">POLAND</text>

        {/* Lithuania mainland */}
        <path d={mainlandPath} fill="#f4ead8" stroke="#c4a878" strokeWidth="0.6" strokeDasharray="1 0.7"/>
        <path d={mainlandPath} fill="url(#topo)"/>

        {/* Curonian Spit */}
        <path d={spitPath} fill="#f4ead8" stroke="#c4a878" strokeWidth="0.5" strokeDasharray="0.8 0.6"/>
        <path d={spitPath} fill="url(#topo)"/>

        {/* Curonian Lagoon — water between spit and mainland */}
        <path d="M 13 40 C 14 48, 14 56, 13 62 C 12 67, 14 70, 17 70 L 17 60 C 17 52, 16 44, 15 40 Z"
              fill="#dde7e8" opacity="0.7"/>

        {/* Country name watermark */}
        <text x="50" y="50" fontSize="3.2" fill="#c4a878" textAnchor="middle"
              opacity="0.18" letterSpacing="0.8" fontStyle="italic" fontFamily="serif">
          LIETUVA
        </text>

        {/* Countryside — scattered rural spots across the country */}
        {countryside && (
          <g onClick={() => onPick && onPick('countryside')} style={{ cursor: 'pointer' }}>
            {countrysideScatter.map((c, i) => {
              const active = activeRegion === 'countryside';
              return (
                <circle key={i} cx={c.x} cy={c.y} r={active ? 1.4 : 1}
                        fill={countryside.accent}
                        opacity={active ? 0.95 : 0.55}>
                  {active && (
                    <animate attributeName="opacity" values="0.95;0.4;0.95"
                      dur="2.4s" begin={`${i*0.2}s`} repeatCount="indefinite"/>
                  )}
                </circle>
              );
            })}
            <text x="50" y="22" fontSize="2.2" fill={countryside.accent}
                  textAnchor="middle" fontStyle="italic"
                  fontWeight={activeRegion === 'countryside' ? 700 : 500}
                  opacity={activeRegion === 'countryside' ? 1 : 0.75}>
              · {countryside[lang].name} ·
            </text>
          </g>
        )}

        {/* Dots & labels */}
        {regions.filter(r => r.id !== 'countryside').map(r => {
          const d = dots[r.id];
          if (!d) return null;
          const active = r.id === activeRegion;
          return (
            <g key={r.id} onClick={() => onPick && onPick(r.id)} style={{ cursor: 'pointer' }}>
              {active && (
                <circle cx={d.x} cy={d.y} r="5" fill="none" stroke={r.accent} strokeWidth="0.4" opacity="0.55">
                  <animate attributeName="r" values="4;6;4" dur="2.4s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.55;0.15;0.55" dur="2.4s" repeatCount="indefinite"/>
                </circle>
              )}
              <circle cx={d.x} cy={d.y} r={active ? 2.4 : 1.8} fill={r.accent} opacity={active ? 1 : 0.9}/>
              <text x={d.lx} y={d.ly} fontSize="2.4"
                    fill="#3a2e1f"
                    textAnchor={d.anchor}
                    fontWeight={active ? 700 : 500}>
                {r[lang].name}
              </text>
            </g>
          );
        })}

        {/* Compass rose */}
        <g transform="translate(94, 12)">
          <circle r="2.6" fill="none" stroke="#8b7355" strokeWidth="0.3"/>
          <path d="M 0 -2.2 L 0.5 0 L 0 2.2 L -0.5 0 Z" fill="#8b7355"/>
          <text x="0" y="-3.6" fontSize="1.8" fill="#8b7355" textAnchor="middle">N</text>
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
