# Design Spec: Admin Panel + Saved Places
**Date:** 2026-05-23  
**Status:** Approved

---

## Overview

Two new features for Discover Lithuania:
1. **Admin Panel** — Private management UI for Niv only (`/admin` route)
2. **Saved Places** — End-user bookmarking with a dedicated screen

---

## Feature 1: Admin Panel

### Access
- Route: `/admin` inside the existing React SPA (not in the nav)
- Password gate on load: simple hardcoded code (e.g. `niv2024`) stored in `localStorage` after first pass — so Niv doesn't type it every time
- No backend. No separate HTML file. Just a hidden route.

### Data Model

**In `data.js`** — add two fields to every place:
```js
status: "approved" | "pending" | "hidden"   // default: "approved" for Niv's, "pending" for AI-added
source: "niv" | "ai"
```

**In `localStorage`** — admin overrides (used for live edits before export):
```json
{
  "adminOverrides": {
    "place-id": { "status": "approved", "notes": "optional note" }
  }
}
```

The main app merges `PLACES` with `adminOverrides` at load time — so status changes take effect immediately in Niv's browser.

### Admin UI

Full-screen table. Columns (right to left — RTL):
| סטטוס | מקור | אזור | מקום | סוג | דירוג | גוגל מפות | הערה |

- **Status badge** — click to cycle: ✅ approved → ⏳ pending → 🚫 hidden → ✅
- **Source badge** — 🟢 ניב / 🤖 AI (read-only, from `data.js`)
- **Region** — separate column with text label (Vilnius, Kaunas, etc.)
- **Name** — place name
- **Kind** — café / restaurant / stay / culture / nature / market
- **Rating** — ★ 4.8 (from `data.js`)
- **Maps link** — 🗺 opens `mapUrl` in new tab (shows "—" if missing)
- **Notes** — inline editable text field

**Filter bar (top):**
- Dropdown: All regions / specific region
- Dropdown: All kinds
- Dropdown: All statuses
- Search input (filters by name)
- **Export data.js** button (downloads updated file)

**Hidden rows** — shown at 40% opacity, below approved/pending rows.

### Export
- "Export data.js" generates a new `data.js` file with all current status/notes baked in
- User downloads and replaces the file, then deploys — makes changes permanent for all users

### App Integration
- `shared.jsx` or `app.jsx`: on load, read `adminOverrides` from localStorage, merge into `PLACES`
- Filter: places with `status === "hidden"` are excluded from all screens (Explore, Food, Stays, etc.)

---

## Feature 2: Saved Places

### Heart Button
- ❤️ icon on every `PlaceCard` (top-left corner, overlays the card)
- 🤍 = not saved, ❤️ = saved
- Tap to toggle. Saves to `localStorage`: `savedPlaces = ["id1", "id2"]`

### Saved Screen
- New tab in NavBar: **❤ שמורים** with a count badge (e.g. `5`)
- Route: `/saved`
- Shows all saved places organized by **region** (same region order as Explore)
- Each saved place shown as a compact card: emoji + name + type + unsave button
- Empty state: friendly message in Hebrew ("עדיין לא שמרת מקומות. לחץ על ❤ בכרטיס מקום להוספה.")
- 100% local — no internet required

### Nav Change
- NavBar gains 5th tab: ❤ שמורים
- Badge count updates in real time as user saves/unsaves

---

## Files Affected

| File | Changes |
|------|---------|
| `data.js` | Add `status` + `source` to all 138 places |
| `app.jsx` | Add `/admin` route, `/saved` route, admin password gate, localStorage merge logic |
| `screens.jsx` | Add `AdminScreen` component, `SavedScreen` component |
| `shared.jsx` | Add heart button to `PlaceCard`, add `useSaved` hook |
| `styles.css` | Admin table styles, saved screen styles, heart button styles |
| `index.html` | Bump `?v=` cache-busting param |

---

## Constraints
- No backend, no external services
- All persistence via `localStorage`
- Static site on Netlify — no build step, CDN React
- Export data.js is the mechanism for permanent admin changes

---

## Out of Scope (for now)
- Multi-user admin
- Google Drive / database sync
- Server-side status filtering
- Saved places sync across devices
