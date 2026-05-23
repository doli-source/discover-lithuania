# Admin Panel + Saved Places Screen — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a private password-protected admin panel at `/admin` for Niv to manage place status (approve/hide/pending), and wire up the existing "saved places" bookmark state to a dedicated `/saved` screen.

**Architecture:**
- Admin panel: new `AdminScreen` in `screens.jsx`, rendered in `app.jsx` when `screen === 'admin'`. Admin overrides are stored in `localStorage` under `lt_admin` and applied reactively via `useMemo`. Filtering hidden places happens in `effectivePlaces` computed in `App`.
- Saved screen: new `SavedScreen` in `screens.jsx`. The save/unsave logic (`savedSet`, `toggleSaved`) already exists in `app.jsx` — only the screen and navigation wiring is missing.
- Export: The admin panel generates a new `data.js` by serializing `window.LT_DATA` with overrides applied, and downloads it for manual deploy.

**Tech Stack:** React 18 (CDN/UMD), Babel standalone, localStorage, vanilla JS globals from `window.LT_DATA`.

---

## File Map

| File | Changes |
|------|---------|
| `data.js` | Add `status` + `source` fields to all 138 places |
| `app.jsx` | Add `adminOverrides` state, `applyAdminOverride`, `effectivePlaces` memo, admin route (early return), saved route, `onSavedClick` prop on NavBar |
| `screens.jsx` | Add `ADMIN_PASSWORD` constant, `AdminScreen` + `AdminLogin` components, `SavedScreen` component |
| `styles.css` | Add admin panel CSS, saved screen CSS |
| `index.html` | Bump `?v=` cache-busting suffix |

---

## Task 1 — Add `status` and `source` to all places in data.js

**Files:**
- Modify: `data.js` (PLACES array — 138 objects)

**Rule:**
- Place has `"niv"` text (non-null) → `"status": "approved", "source": "niv"`
- Place has `"niv": null` → `"status": "pending", "source": "ai"`

- [ ] **Step 1: Run the transformation script**

Run from project directory:
```bash
node << 'SCRIPT'
const fs = require('fs');
const src = fs.readFileSync('data.js', 'utf8');

// Find PLACES array bounds by bracket matching
const marker = 'const PLACES = [';
const startLabel = src.indexOf(marker);
const startIdx = startLabel + marker.length - 1; // points to '['
let depth = 0, endIdx = -1;
for (let i = startIdx; i < src.length; i++) {
  if (src[i] === '[') depth++;
  else if (src[i] === ']') {
    depth--;
    if (depth === 0) { endIdx = i + 1; break; }
  }
}

const before = src.slice(0, startIdx);
const after  = src.slice(endIdx);
const places = JSON.parse(src.slice(startIdx, endIdx));

const updated = places.map(p => ({
  ...p,
  status: p.niv ? 'approved' : 'pending',
  source: p.niv ? 'niv' : 'ai'
}));

fs.writeFileSync('data.js', before + JSON.stringify(updated, null, 2) + after);
console.log(`Done. Approved: ${updated.filter(p=>p.status==='approved').length}, Pending: ${updated.filter(p=>p.status==='pending').length}`);
SCRIPT
```

Expected output: `Done. Approved: 58, Pending: 80`

- [ ] **Step 2: Verify a sample place**

```bash
grep -A 15 '"kalve-coffee-vasario"' data.js | head -15
```

Expected: object contains `"status": "pending"` and `"source": "ai"` (since kalve has `niv: null`).

```bash
grep -A 15 '"espresin"' data.js | head -15
```

Expected: object contains `"status": "approved"` and `"source": "niv"`.

- [ ] **Step 3: Commit**

```bash
git add data.js
git commit -m "feat: add status and source fields to all 138 places"
```

---

## Task 2 — Admin state + effectivePlaces in app.jsx

**Files:**
- Modify: `app.jsx` (inside `App()` function, and at module level)

- [ ] **Step 1: Add `adminOverrides` state + `applyAdminOverride` function**

In `app.jsx`, inside the `App()` function, after the existing `savedSet` state line (line ~80), add:

```javascript
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
```

- [ ] **Step 2: Add `effectivePlaces` memo**

After the `applyAdminOverride` function, add:

```javascript
const effectivePlaces = useMemo(() => {
  return PLACES
    .map(p => ({ ...p, ...(adminOverrides[p.id] || {}) }))
    .filter(p => p.status !== 'hidden');
}, [adminOverrides]);
```

- [ ] **Step 3: Replace `places={PLACES}` with `places={effectivePlaces}` in all screens**

In `app.jsx`, in the `return (...)` of `App`, update every screen that receives `places`:

```jsx
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
```

Also update `openPlaceData` to use `effectivePlaces`:
```javascript
const openPlaceData = openPlaceId ? effectivePlaces.find(p => p.id === openPlaceId) : null;
```

- [ ] **Step 4: Commit**

```bash
git add app.jsx
git commit -m "feat: add adminOverrides state and effectivePlaces filtering"
```

---

## Task 3 — Router + render wiring in app.jsx

**Files:**
- Modify: `app.jsx`

- [ ] **Step 1: Add 'saved' and 'admin' to VALID_SCREENS**

Change:
```javascript
const VALID_SCREENS = ['home', 'explore', 'routes', 'food', 'stays'];
```
To:
```javascript
const VALID_SCREENS = ['home', 'explore', 'routes', 'food', 'stays', 'saved', 'admin'];
```

- [ ] **Step 2: Add admin early-return render in App()**

In `App()`, immediately before the main `return (...)`, add:

```jsx
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
```

- [ ] **Step 3: Add SavedScreen to main render + pass onSavedClick to NavBar**

In the main `return (...)`, add the saved screen after stays:

```jsx
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
```

And update `<NavBar>` to add the `onSavedClick` prop:

```jsx
<NavBar
  lang={lang}
  setLang={setLang}
  screen={screen}
  nav={nav}
  t={t}
  savedCount={savedSet.size}
  onSavedClick={() => nav('saved')}
/>
```

- [ ] **Step 4: Update NavBar to accept and use `onSavedClick`**

In the `NavBar` function signature, add `onSavedClick`:

```javascript
function NavBar({ lang, setLang, screen, nav, t, savedCount, onSavedClick }) {
```

In the JSX, update the `saved-btn` click handler:

```jsx
{savedCount > 0 && (
  <button className="saved-btn" onClick={onSavedClick} aria-label={t.yourTrip}>
    <Icon.bookmarkFill/>
    <span>{savedCount}</span>
  </button>
)}
```

- [ ] **Step 5: Commit**

```bash
git add app.jsx
git commit -m "feat: wire admin + saved routes, NavBar saved button navigation"
```

---

## Task 4 — SavedScreen in screens.jsx

**Files:**
- Modify: `screens.jsx` (append before the last line)

- [ ] **Step 1: Append SavedScreen component to screens.jsx**

Add this complete component to the end of `screens.jsx` (before the final blank line):

```jsx
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
```

- [ ] **Step 2: Verify in browser**

Open app locally, save 2–3 places via the bookmark button on any PlaceCard, then click the bookmark count button in the NavBar. Confirm:
- Navigates to `/saved`
- Shows saved places grouped by region
- Clicking a saved-card opens the PlaceModal
- Clicking the bookmark icon in the saved-card removes it from the list

- [ ] **Step 3: Commit**

```bash
git add screens.jsx
git commit -m "feat: add SavedScreen with region grouping"
```

---

## Task 5 — AdminScreen in screens.jsx

**Files:**
- Modify: `screens.jsx` (append after SavedScreen)

- [ ] **Step 1: Add ADMIN_PASSWORD constant at the top of screens.jsx**

At line 1 of `screens.jsx`, after the comment, add:

```javascript
const ADMIN_PASSWORD = 'discover-lt-admin'; // ← change this before deploying
```

- [ ] **Step 2: Append AdminLogin + AdminScreen to screens.jsx**

Add after `SavedScreen`:

```jsx
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
  const [filter, setFilter] = useState({ region: '', kind: '', status: '', search: '' });
  const [pendingNotes, setPendingNotes] = useState({}); // unsaved note edits

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
    .filter(p => !filter.search || p.name.toLowerCase().includes(filter.search.toLowerCase()));

  // Sort: approved first, then pending, then hidden
  const sorted = [...filtered].sort((a, b) => {
    const order = { approved: 0, pending: 1, hidden: 2 };
    return (order[a.status] ?? 1) - (order[b.status] ?? 1);
  });

  function cycleStatus(p) {
    const idx = STATUS_CYCLE.indexOf(p.status);
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
    const updatedPlaces = allPlaces.map(p => ({
      ...p,
      ...(adminOverrides[p.id] || {})
    }));
    const out = [
      '(function() {\n',
      'const REGIONS = ' + JSON.stringify(R, null, 2) + ';\n\n',
      'const PLACES = '  + JSON.stringify(updatedPlaces, null, 2) + ';\n\n',
      'const LANDMARKS = '  + JSON.stringify(LANDMARKS, null, 2)  + ';\n\n',
      'const ITINERARIES = '+ JSON.stringify(ITINERARIES, null, 2)+ ';\n\n',
      'const DISHES = '  + JSON.stringify(DISHES, null, 2)  + ';\n\n',
      'const FACTS = '   + JSON.stringify(FACTS, null, 2)   + ';\n\n',
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

  return (
    <div className="admin-screen" dir="rtl">
      {/* Top bar */}
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

      {/* Filter bar */}
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
        <input
          type="search"
          placeholder="🔍 חיפוש מקום..."
          value={filter.search}
          onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
        />
        <span className="filter-count">{sorted.length} / {allPlaces.length}</span>
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
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
              const region   = regionMap[p.region];
              const noteVal  = pendingNotes[p.id] !== undefined ? pendingNotes[p.id] : p.notes;
              return (
                <tr key={p.id} className={`admin-row ${p.status === 'hidden' ? 'row-hidden' : ''}`}>
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
                  <td className="col-region">
                    {region ? region.he.name : p.region}
                  </td>
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
```

- [ ] **Step 3: Verify admin panel in browser**

Navigate to `http://localhost:[port]/admin` (or open `index.html` and go to `/admin`).
- Password gate appears
- Entering wrong password shows error
- Entering `discover-lt-admin` shows the full table
- Table shows all 138 places with status/source badges
- Clicking a status badge cycles it: ✅ → ⏳ → 🚫 → ✅
- Filter dropdowns narrow the table
- Search filters by name
- Hidden rows appear dimmed
- Maps link opens Google Maps (for places with `mapUrl`)
- Notes field saves on blur

- [ ] **Step 4: Verify hidden places disappear from main app**

In admin, set any one place to 🚫 hidden. Navigate to `/explore` — confirm that place no longer appears.

- [ ] **Step 5: Verify Export**

Click "Export data.js" — a file named `data.js` downloads. Open it and confirm:
- It is a valid JS file starting with `(function() {`
- The place you hid has `"status": "hidden"` in the PLACES array

- [ ] **Step 6: Commit**

```bash
git add screens.jsx
git commit -m "feat: add AdminLogin + AdminScreen with status cycling, filters, notes, export"
```

---

## Task 6 — CSS for admin panel and saved screen

**Files:**
- Modify: `styles.css` (append to end)

- [ ] **Step 1: Append all admin + saved CSS**

Append to the end of `styles.css`:

```css
/* ═══════════════════════════════════════════════════════════════
   ADMIN PANEL
═══════════════════════════════════════════════════════════════ */

.admin-screen {
  min-height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  direction: rtl;
}

/* Top bar */
.admin-topbar {
  background: #1e1e2e;
  color: #fff;
  padding: 0 20px;
  height: 52px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 100;
}
.admin-logo { font-weight: 700; font-size: 14px; color: #a78bfa; }
.admin-stats { display: flex; gap: 12px; margin-right: auto; }
.admin-stats .stat { font-size: 13px; padding: 3px 10px; border-radius: 999px; font-weight: 600; }
.admin-stats .stat.approved { background: rgba(16,185,129,0.2); color: #6ee7b7; }
.admin-stats .stat.pending  { background: rgba(245,158,11,0.2); color: #fcd34d; }
.admin-stats .stat.hidden   { background: rgba(239,68,68,0.2);  color: #fca5a5; }

.btn-export {
  background: #10b981;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
.btn-export:hover { background: #059669; }

.btn-logout {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.25);
  color: rgba(255,255,255,0.7);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
}
.btn-logout:hover { background: rgba(255,255,255,0.1); }

/* Filter bar */
.admin-filters {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 10px 20px;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  position: sticky;
  top: 52px;
  z-index: 99;
}
.admin-filters select,
.admin-filters input[type="search"] {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 7px 10px;
  font-size: 13px;
  background: #fff;
  color: #374151;
  direction: rtl;
}
.admin-filters input[type="search"] { flex: 1; min-width: 140px; }
.filter-count { font-size: 12px; color: #9ca3af; white-space: nowrap; }

/* Table */
.admin-table-wrap { overflow-x: auto; }
.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  background: #fff;
}
.admin-table th {
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
  padding: 10px 14px;
  text-align: right;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #9ca3af;
  white-space: nowrap;
  position: sticky;
  top: 93px; /* topbar + filters */
  z-index: 50;
}
.admin-table td {
  padding: 10px 14px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}
.admin-row:hover td { background: #fafafa; }
.row-hidden td { opacity: 0.4; }

/* Status badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  white-space: nowrap;
  transition: opacity 0.15s;
}
.status-badge:hover { opacity: 0.8; }
.status-approved { background: #d1fae5; color: #065f46; }
.status-pending  { background: #fef3c7; color: #92400e; }
.status-hidden   { background: #fee2e2; color: #991b1b; }

/* Source badge */
.source-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 7px;
  border-radius: 4px;
  font-size: 12px;
}
.source-niv { background: #ede9fe; color: #5b21b6; }
.source-ai  { background: #f1f5f9; color: #64748b; }

/* Table columns */
.col-region { color: #6b7280; font-size: 12px; white-space: nowrap; }
.col-name .place-name { font-weight: 600; }
.col-name .place-id   { font-size: 10px; color: #d1d5db; font-family: monospace; margin-top: 2px; }
.col-rating { color: #f59e0b; font-weight: 700; white-space: nowrap; }
.kind-badge { background: #f1f5f9; color: #64748b; border-radius: 4px; padding: 3px 7px; font-size: 11px; white-space: nowrap; }
.maps-link  { color: #3b82f6; text-decoration: none; font-size: 12px; white-space: nowrap; }
.maps-link:hover { text-decoration: underline; }
.no-link    { color: #d1d5db; font-size: 12px; }
.note-input {
  width: 100%;
  min-width: 140px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 5px 8px;
  font-size: 12px;
  background: #fafafa;
  color: #374151;
  direction: rtl;
}
.note-input:focus { outline: none; border-color: #a78bfa; background: #fff; }

/* Admin login */
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1e1e2e;
}
.admin-login-form {
  background: #2d2d40;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 40px 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 320px;
}
.admin-login-logo  { font-size: 40px; }
.admin-login-title { color: #fff; font-size: 20px; font-weight: 700; margin: 0; }
.admin-login-input {
  width: 100%;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  padding: 12px 16px;
  background: rgba(255,255,255,0.07);
  color: #fff;
  font-size: 15px;
  text-align: center;
  letter-spacing: 2px;
}
.admin-login-input::placeholder { color: rgba(255,255,255,0.4); letter-spacing: 0; }
.admin-login-input.input-err { border-color: #f87171; }
.admin-login-err  { color: #f87171; font-size: 13px; margin: -8px 0 0; }
.admin-login-btn  {
  width: 100%;
  background: #a78bfa;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
.admin-login-btn:hover { background: #8b5cf6; }

/* ═══════════════════════════════════════════════════════════════
   SAVED SCREEN
═══════════════════════════════════════════════════════════════ */

.saved-screen {
  max-width: 760px;
  margin: 0 auto;
  padding: 32px 20px 80px;
}

.saved-header { margin-bottom: 28px; }
.saved-title  { font-family: var(--font-display); font-size: 32px; font-weight: 700; color: var(--ink); margin: 0 0 6px; }
.saved-count  { font-size: 14px; color: var(--primary); margin: 0; }

.saved-region { margin-bottom: 32px; }
.saved-region-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--primary-dark);
  margin: 0 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.saved-region-count {
  background: var(--primary);
  color: #fff;
  border-radius: 999px;
  padding: 1px 8px;
  font-size: 11px;
  font-weight: 600;
}

.saved-cards { display: flex; flex-direction: column; gap: 8px; }
.saved-card {
  background: #fff;
  border: 1px solid #e8ddc8;
  border-radius: var(--radius, 12px);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: box-shadow 0.15s, transform 0.1s;
}
.saved-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); transform: translateY(-1px); }
.saved-emoji      { font-size: 24px; flex-shrink: 0; }
.saved-info       { flex: 1; min-width: 0; }
.saved-name       { font-weight: 600; font-size: 14px; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.saved-type       { font-size: 12px; color: var(--primary); margin-top: 2px; }
.saved-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--primary);
  padding: 6px;
  border-radius: 6px;
  display: flex;
  flex-shrink: 0;
  opacity: 0.7;
}
.saved-remove:hover { opacity: 1; background: rgba(194,136,64,0.1); }

.saved-empty {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
}
.saved-empty-icon  { font-size: 56px; margin-bottom: 16px; }
.saved-empty-title { font-family: var(--font-display); font-size: 24px; font-weight: 700; color: var(--ink); margin: 0 0 10px; }
.saved-empty-sub   { font-size: 15px; color: #9ca3af; max-width: 280px; line-height: 1.6; margin: 0; }
```

- [ ] **Step 2: Verify styles render correctly**

Open the app. Check:
- Admin login screen: dark background, centered form, purple button
- Admin table: sticky header, colored status badges, dimmed hidden rows
- Saved screen: clean cards with region groupings, bookmark remove button

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "feat: add admin panel and saved screen CSS"
```

---

## Task 7 — Bump cache version + deploy

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Increment version suffix in index.html**

In `index.html`, change all `?v=20260523c` occurrences to `?v=20260523d`:

```html
<script src="data.js?v=20260523d"></script>
<script src="region-images.js"></script>
<script type="text/babel" src="tweaks-panel.jsx?v=20260523d"></script>
<script type="text/babel" src="shared.jsx?v=20260523d"></script>
<script type="text/babel" src="screens.jsx?v=20260523d"></script>
<script type="text/babel" src="app.jsx?v=20260523d"></script>
```

- [ ] **Step 2: Commit + deploy**

```bash
git add index.html
git commit -m "chore: bump cache version to 20260523d for admin+saved release"
npx netlify-cli@latest deploy --prod
```

- [ ] **Step 3: Smoke test on production**

- Open `https://discover-lithuania.netlify.app` — main app loads normally
- Navigate to `/saved` — shows empty state (first visit)
- Save a place — bookmark count appears in nav, clicking it shows saved screen
- Navigate to `/admin` — password prompt appears
- Enter `discover-lt-admin` — admin table loads with all 138 places
- Change a status — confirm it takes effect immediately in the main app (hidden places disappear from explore)

---

## Self-Review

**Spec coverage check:**
- ✅ `/admin` route with password gate
- ✅ Status field (approved/pending/hidden) per place in data.js
- ✅ Source field (niv/ai) per place
- ✅ Status cycling on click
- ✅ Region column in admin table
- ✅ Google Maps link per row
- ✅ Notes field per row
- ✅ Export data.js button
- ✅ Hidden places filtered from all app screens
- ✅ Admin overrides via localStorage (immediate in Niv's browser)
- ✅ Saved screen at `/saved`
- ✅ NavBar bookmark button navigates to `/saved`
- ✅ Saved places organized by region
- ✅ Unsave from saved screen

**Placeholder scan:** No TBDs or vague steps.

**Type consistency:**
- `applyAdminOverride(id, patch)` used consistently across app.jsx and the AdminScreen call
- `effectivePlaces` is the array passed to all user-facing screens; `allPlaces` (raw PLACES) is passed only to AdminScreen
- `adminOverrides` shape: `{ [placeId: string]: { status?: string, notes?: string } }`
