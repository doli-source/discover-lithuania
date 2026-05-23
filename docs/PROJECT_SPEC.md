# Discover LT — Project Specification

> Personal travel guide for Lithuania by Niv.  
> Stack: Static HTML + React 18 (CDN) + Babel standalone. Hosted on Netlify.

---

## 1. Architecture

| File | Purpose |
|------|---------|
| `index.html` | Entry point. Loads all scripts with `?v=` cache-busting param |
| `data.js` | All content data (REGIONS, PLACES, ITINERARIES, DISHES, FACTS) |
| `app.jsx` | App shell, routing, URL deep-linking, NavBar, Footer |
| `screens.jsx` | All screen components (Home, Explore, Routes, Food, Stays) |
| `shared.jsx` | Shared UI (PlaceCard, PlaceModal, Icons, strings) |
| `tweaks-panel.jsx` | Design tweaks panel (palette, font, density) |
| `region-images.js` | Base64-encoded hero images per region (3.7 MB, rarely changes) |
| `styles.css` | All CSS |
| `netlify.toml` | Cache headers |
| `_redirects` | SPA fallback: `/* /index.html 200` |
| `docs/PROJECT_SPEC.md` | This file |

**Deployment:** `npx netlify-cli@latest deploy --prod` from project root.  
**Site:** https://discover-lithuania.netlify.app  
**Cache busting:** Update `?v=YYYYMMDD{letter}` in `index.html` script tags on every deploy with content changes.

---

## 2. URL Scheme

Clean path-based routing (no `?screen=` params):

| URL | What it shows |
|-----|---------------|
| `/` | Home screen |
| `/explore` | All regions |
| `/explore/vilnius` | Explore → Vilnius pre-selected |
| `/explore/curonian` | Explore → Curonian Spit |
| `/routes` | All itineraries |
| `/routes/vilnius-day` | Routes → specific itinerary open |
| `/food` | Food & restaurants screen |
| `/stays` | Stays screen |
| `?place=smoked-fish` | Opens place modal overlay on any screen |
| `?lang=en` | English (default: Hebrew) |

**Combining:** `/explore/kaunas?place=habits-bakery&lang=en`

---

## 3. Regions

| id | Name | Character |
|----|------|-----------|
| `vilnius` | Vilnius | Baroque capital, café culture, Užupis art republic |
| `kaunas` | Kaunas | Interwar Modernism / Bauhaus, young scene |
| `klaipeda` | Klaipėda | Port city, Baltic sea, Prussian old town |
| `curonian` | Curonian Spit (Nida) | UNESCO dunes, pine forests, fishing villages |
| `palanga` | Palanga | Baltic beach resort, amber museum, pier |
| `kretinga` | Kretinga | Manor & winter garden, Franciscan monastery |
| `countryside` | Countryside | General rural: Trakai, Kernavė, forests, mushrooms |
| `druskininkai` | Druskininkai | Spa town, mineral springs, Grūtas Park, Dzūkija forest |
| `moletai` | Molėtai | Astronomy capital, 300 lakes, dark-sky reserve |
| `utena` | Utena | Aukštaitija National Park gateway, lake country |
| `zarasai` | Zarasai | Romantic 5-lake town, ice-yachting, northeastern border |

---

## 4. Place Quality Criteria

### Must-have
- Rating ≥ 4.4 on Google Maps (exceptions for iconic/unique places)
- Minimum ~50 reviews (smaller towns may have fewer)
- No chains (no McDonald's, Hesburger, Maxima, etc.)
- Must be open and operating

### Style match — Niv's taste
- **Cafés:** Specialty/single-origin coffee, good pastries, interesting interior
- **Restaurants:** Local/seasonal cuisine, creative cooking, good wine list; OR very authentic local food
- **Stays:** Boutique, design-forward, or unique nature stays (glamping, treehouses, spa resorts)
- **Culture:** Unusual/off-beat museums, UNESCO sites, art spaces — not generic tourist traps
- **Nature:** Unique landscapes, activities (canoe, kayak, sauna, stargazing), scenic spots

### Not included
- Generic supermarkets/pharmacies
- Budget hotel chains
- Typical tourist souvenir shops
- Fast-food chains

---

## 5. Place Schema (data.js)

```javascript
{
  "id": "kebab-case-unique-id",      // unique, kebab-case, special chars removed
  "region": "vilnius",               // one of 11 region IDs
  "kind": "cafe",                    // cafe | restaurant | stay | culture | nature | market
  "name": "Exact Google Maps name",
  "type": "Short type (English)",    // e.g. "Coffee shop", "Fine dining", "National park"
  "typeHe": "Short type (Hebrew)",
  "rating": 4.7,                     // from Google Maps
  "reviews": 2400,                   // from Google Maps
  "price": "€10–25",                // null if free/N/A
  "emoji": "☕",
  "niv": "Niv's English recommendation (1-2 sentences)",   // null if not a standout
  "nivHe": "Niv's Hebrew recommendation",                  // null if niv is null
  "mapUrl": "https://maps.app.goo.gl/..."  // optional, only if verified link available
}
```

---

## 6. All Places by Region

### Vilnius (45 places)
*Cafés:* KALVE Coffee Vasario, RocketBean Kavinė, Yugen Tea, Espresinė, mon., StrangeLove, Coffee Circus Piano, BREW. Specialty Coffee, Art Cafe, Beigelistai, Backstage Roastery Café, Backstage Cafe Vokiečių str., Italala Caffè, Lola, La Madeleine Atelier, Mindaugo kepykla, Desertų klubas, Bundu, Backstage Roastery HQ, La petite France Vilnius  
*Restaurants:* BARN bistro (B'ARN), Tempo V39, Pachamama Dinner Club, Meat SteakHouse, Chačapuri, Focacceria, Baleboste, Le Travi, Donde, Mason Restoranas, 2 virėjai, Bistro n.2  
*Markets/Bars:* Naked Noah, Burbulio Vyninė, Adata Bar, Paupio Turgus, Benedikto Turgus, 3Mūzos Rooftop Bar, Po bačka  
*Culture:* MO Museum, Menų fabrikas Loftas, The Green House, Gediminas Castle, Atvira meno galerija, Atvira meno galerija (open gallery)

### Kaunas (10 places)
KURŠIS kavinė-baras, Snapas kava ir desertai, BōHEME HOUSE, Velvetti, Habits Bakery, NYC Coffee Co., City Coffee, Elska coffee, Uoksas, M.K. Čiurlionis Art Museum

### Klaipėda (9 places)
Kavos architektai, Klaipėdos žydų bendruomenė, Muskatas, Spricas Brunch, monai, Ateik Ateik, Klaipėda Castle Museum, Klaipėda Old Town, Clock Museum

### Curonian Spit / Nida (9 places)
The Dead Dunes, Vecekrugas Dune, Smoked fish, Senas Žvejas, Todá, Gitanos Blynai, Witches' Hill, Thomas Mann House, Nida Harbour

### Palanga (9 places)
Palanga Amber Museum, Birutė Park, Palanga Pier, Palanga Beach, BREW. Specialty Coffee, Fotokava, Cafe Banduke, J. Basanavičiaus Street, Caffeine

### Kretinga (9 places)
PAMIŠKĖ BOUTIQUE SPA, Kretinga Manor & Winter Garden, Franciscan Monastery & Church, Café Inside Old Palace, 313 Cable Park, Lourdes Grotto, Kretinga Manor Park, Kretinga Museum, Pajūrio Regional Park

### Countryside (10 places)
casa de campo glamping, HYTTE, Kupetaitė, Miško Rojus, DOYOU PLACE, Kernavė Archaeological Site, Trakai Island Castle, Anykščiai Treetop Path, Senoji Kibininė, Dzūkija Pine Forests

### Druskininkai (10 places)
Atokampis Boutique SPA & Resort, Horizons Lake Resort & Spa, Mana Sleep & Spa, Varena Treehouse, Aštriosios Kirsnos dvaras, Toli Toli, Grūtas Park, Sicilia, Druskininkai Aqua Park, Dzūkija National Park

### Molėtai (9 places)
Alantos Žirgai, Villa The Lake, www.pineplace.lt, Molėtai Astronomical Observatory, Museum of Ethnocosmology, Labanoras Observation Tower, Dubingiai Stud Farm, Molėtai Lake District, Molėtai Sculpture Park

### Utena (9 places)
Getaway to forest cab, Aukštaitija National Park, Vanilinis Dangus, Ancient Beekeeping Museum, Palūšė Wooden Church, Food Lab, Vila Gervalis, Utenos Alus Brewery, Ginučiai Hill Fort

### Zarasai (9 places)
Bistro Zarasai, Brut Wine Hotel & Restaurant, Monopolis, Lietaus Sodai, The Five Lakes of Zarasai, Lake Sartai, Zarasai Regional Museum, Zarasai Lake Promenade, Zarasai Camping & Leisure

---

## 7. Itineraries

| id | Title | Region | Duration |
|----|-------|--------|---------|
| `vilnius-day` | A Perfect Day in Vilnius | vilnius | day |
| `baltic-week` | The Classic Baltic Week | (multi) | week |
| `forest-weekend` | A Weekend in the Forests | countryside | weekend |
| `coast-3day` | Three Days on the Coast | klaipeda | short |
| `spa-weekend` | Druskininkai Spa Weekend | druskininkai | weekend |

---

## 8. Research Notes

### Region assignment rules
- **Trakai** → `countryside` (in Vilnius County but rural enough; referenced in vilnius itinerary as landmark)
- **Varėna area** → `druskininkai` (Alytus County, Dzūkija, same zone as Druskininkai)
- **Rietavas/Labardžiai** → `countryside` (Telšiai county, no specific region)
- **Elektrėnai Municipality** → `countryside` (rural, 25-40min from Vilnius)
- **Šilalė district** → `countryside` (western rural Lithuania)
- **Lazdijai district** → `druskininkai` (Alytus County, Dzūkija region)
- **Jokūbavas** → `kretinga` (Kretinga district municipality)
- **Molėtai area / Mindūnai** → `moletai`
- **Vyžiniai / Utena County** → `utena`
- **Žaugėdai (Molėtai district)** → `moletai`

### Known duplicates
- `atvira-meno-galerija` and `atvira-meno-galerija-open-gallery` are the same gallery (Švitrigailos g. 29, Vilnius) — both intentionally kept, both set to `vilnius`

### Verified vs estimated data
Places marked with `mapUrl` have verified Google Maps links.  
Ratings/reviews for newly added places (2025-05 batch) are from Google Maps / TripAdvisor research — verify before major updates.

---

## 9. Design Tweaks

| Setting | Options | Default |
|---------|---------|---------|
| Palette | amber, forest, baltic, brick | amber |
| Font pair | editorial, modern, classic | editorial |
| Density | compact, comfortable, spacious | comfortable |
| Corners | sharp, soft, round | soft |

---

## 10. Cache & Deployment

- `index.html` — no cache (served fresh by Netlify)
- `data.js` — `max-age=3600` (1h)
- `app.jsx`, `screens.jsx` etc. — `max-age=3600` (1h)
- `region-images.js` — `max-age=86400` (24h, rarely changes)

**To bust cache after changes:** increment the `?v=` suffix in `index.html` script tags.  
**Pattern:** `?v=YYYYMMDD{a|b|c...}` — e.g. `?v=20260523b`
