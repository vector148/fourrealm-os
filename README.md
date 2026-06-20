# FourRealm OS

**Personal entertainment atlas** — track games and films you play, watch, plan, and wishlist. Self-hosted, runs locally, data stays on your machine.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Buy Me a Coffee](https://img.shields.io/badge/Support-Buy%20Me%20a%20Coffee-ffdd00?logo=buy-me-a-coffee)](https://buymeacoffee.com/Vector148)

---

## What it does

- **Library** — grid view of everything you own, filtered by status and genre pillar
- **Planning** — per-pillar queue board, drag to reorder
- **Wishlist** — separate list of things you want, add to library when ready
- **History** — last 24 completed items with stats
- **Ranking** — scored items sorted by rating, filterable by pillar and year

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite 5 |
| Backend | Express + Node.js (ESM) |
| Data | Excel files via SheetJS |
| Fonts | Inter + Lexend (Google Fonts) |

---

## 🚀 Quick Start (For Non-IT Users)

You don't need any coding knowledge to run this app locally. Just follow these steps:

### Step 1: Download the App
1. Click the green **Code** button at the top of this GitHub page.
2. Select **Download ZIP**.
3. Extract the ZIP file to a folder on your computer (e.g., `C:\fourrealm-os`).

### Step 2: Install Node.js
The app needs Node.js to run the local server.
- **Normal Install (Recommended):** Go to [nodejs.org](https://nodejs.org) and download the **LTS** installer. Run it like a normal program.
- **Portable Install (No Admin Rights):** Download the "Prebuilt Binaries" (.zip) for Windows x64 from [nodejs.org/en/download](https://nodejs.org/en/download). Extract it into a folder, e.g., `C:\fourrealm-os\tools\node-v24`, and add that folder to your system PATH via terminal before proceeding.

### Step 3: Run the App
1. Open your terminal: Press the `Windows` key, type `cmd`, and hit Enter.
2. Move into your app folder by typing:
   ```cmd
   cd C:\fourrealm-os
   ```
3. Install the required background packages (only needed the first time!):
   ```cmd
   npm install
   ```
4. Start the app:
   ```cmd
   npm run dev
   ```

That's it! Keep the terminal open and visit **http://localhost:5173** in your web browser to enjoy your app.

---

## Filling your database

The `database/` folder has 7 Excel files — all start empty (headers only). You fill them.

| File | Purpose |
|------|---------|
| `games.xlsx` | Your game library |
| `films.xlsx` | Your film library |
| `series.xlsx` | Your series library |
| `music.xlsx` | Your music library |
| `upcoming_games.xlsx` | Games you want |
| `upcoming_films.xlsx` | Films you want |
| `upcoming_series.xlsx` | Series you want |

The app reads these files live via the Express API. Edit a file → save → refresh browser → data updates instantly. No restart needed.

---

## Free image sources for covers

Use only copyright-free or public domain sources. Do NOT use Steam, PlayStation Store, Nintendo eShop, or any storefront — those images are copyrighted.

| Source | How to get the URL |
|--------|--------------------|
| **Wikimedia Commons** | Search at [commons.wikimedia.org](https://commons.wikimedia.org) → click image → right-click → "Copy image address" |
| **Wikipedia** | Open the game/film page → click the cover image → "More details" → "Original file" → copy URL |
| **IGDB (free tier)** | [api.igdb.com](https://api.igdb.com) — free API key, returns cover URLs in format `//images.igdb.com/igdb/image/upload/t_cover_big/XXXXX.jpg` |
| **OpenLibrary** | For books adapted to films: `https://covers.openlibrary.org/b/id/XXXXX-L.jpg` |
| **Your own photos** | Put images in `database/covers/` folder, reference as `/covers/your-image.jpg` via the API |

**Recommended prompt addition for AI when asking for data:**
```
For the cover field, use Wikipedia or Wikimedia Commons image URLs only.
Example format: https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg
Do NOT use Steam, PlayStation, Nintendo, TMDB, or any storefront URLs.
```

---

## How to fill data

You have four options to fill the blank databases:

### Option A — Ask an AI (ChatGPT, Claude, Gemini)

<details>
<summary>Click to see prompts for AI (Copy & Paste)</summary>

**For games.xlsx:**
```text
Generate 20 rows of data for a games database. Return as a JSON array. Each object must have exactly these keys:
id (integer, sequential), title (string), originalTitle (string), year (integer), played (boolean), gameplay (Narrative/Action/Discovery/Mechanic), subcategory (string), score (0-10 or null), status (completed/playing/wishlist/dropped/upcoming), date (YYYY-MM-DD or ""), purchase (""), complete (""), rank (integer or null), cover (Wikimedia Commons or Wikipedia image URL only — NO storefronts), trailer (YouTube nocookie embed URL or ""), trailerUrl (YouTube watch URL or ""), source ("manual")
Only return the JSON array, no markdown.
```
Paste the JSON into [jsoncsv.com](https://jsoncsv.com), convert to CSV, and paste into Excel.

**For films.xlsx:**
```text
Generate 15 rows for a films database. Return as JSON array with exactly these keys:
id (integer), title (string), year (integer), watched (boolean), affect (Drama/Exciting/Healing/Thriller), score (0-10 or null), status (completed/watching/wishlist/dropped), date (YYYY-MM-DD or ""), cover (Wikimedia Commons or Wikipedia image URL only — NO storefronts), trailer (""), trailerUrl (""), source ("manual")
Only return the JSON array, no markdown.
```
</details>

---

### Option B — Use an AI IDE directly

If you use **Cursor**, **Windsurf**, or **Kiro**, just open this project and ask:

> "Add 20 games to `database/games.xlsx` with real metadata. Use Wikimedia Commons/Wikipedia URLs for covers. NO storefront images."

The AI reads the file structure and writes data directly — no copy-paste needed.

---

### Option C — Edit Excel manually

Open `database/games.xlsx` in Excel or Google Sheets, add rows below the header, save. Refresh the browser.

---

### Option D — POST via API

```bash
curl -X POST http://localhost:3001/api/games \
  -H "Content-Type: application/json" \
  -d '{"title":"Super Awesome Game","year":2017,"gameplay":"Action","score":9.1,"status":"completed","cover":"https://example.com/cover.webp"}'
```

---

## Column reference

### games.xlsx

| Column | Type | Values |
|--------|------|--------|
| id | integer | 1, 2, 3… |
| title | string | Display title |
| originalTitle | string | Original language title |
| year | integer | Release year |
| played | boolean | true / false |
| gameplay | string | Narrative / Action / Discovery / Mechanic |
| subcategory | string | Open World, Puzzle, JRPG, etc. |
| score | number\|null | 0–10 or empty |
| status | string | completed / playing / wishlist / dropped / upcoming |
| date | string | YYYY-MM-DD |
| cover | string | Direct image URL |
| trailer | string | YouTube nocookie embed URL |
| trailerUrl | string | YouTube watch URL |
| source | string | Where you got the data |

### films.xlsx

| Column | Type | Values |
|--------|------|--------|
| id | integer | 1, 2, 3… |
| title | string | Display title |
| year | integer | Release year |
| watched | boolean | true / false |
| affect | string | Drama / Exciting / Healing / Thriller |
| score | number\|null | 0–10 or empty |
| status | string | completed / watching / wishlist / dropped |
| date | string | YYYY-MM-DD |
| cover | string | Direct image URL |
| trailer | string | YouTube embed URL |
| trailerUrl | string | YouTube watch URL |
| source | string | |

---

## API reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server status |
| GET | `/api/games` | All games |
| POST | `/api/games` | Add game |
| PUT | `/api/games/:id` | Update game |
| DELETE | `/api/games/:id` | Delete game |
| GET | `/api/films` | All films |
| POST | `/api/films` | Add film |
| PUT | `/api/films/:id` | Update film |
| DELETE | `/api/films/:id` | Delete film |
| GET | `/api/wishlist/games` | Game wishlist |
| POST | `/api/wishlist/games` | Add to wishlist |
| DELETE | `/api/wishlist/games/:title` | Remove from wishlist |
| GET | `/api/wishlist/films` | Film wishlist |
| POST | `/api/wishlist/films` | Add to wishlist |
| DELETE | `/api/wishlist/films/:title` | Remove from wishlist |
| GET | `/api/planning` | Planning board state |
| PUT | `/api/planning` | Save planning board |

---

## Project structure

```
fourrealm-os/
├── server/
│   ├── index.js           Entry point (port 3001)
│   ├── db/excel.js        SheetJS read/write helpers
│   └── routes/            games, films, wishlist, planning
├── client/
│   └── src/
│       ├── App.jsx
│       ├── api/index.js   Fetch wrappers → Express
│       ├── hooks/         useGames, useFilms, useWishlist, usePlanning
│       ├── pages/         Overview (more pages in progress)
│       └── styles/
├── database/              ← Edit these files to add your data
│   ├── games.xlsx
│   ├── films.xlsx
│   ├── series.xlsx
│   ├── music.xlsx
│   ├── upcoming_games.xlsx
│   ├── upcoming_films.xlsx
│   └── upcoming_series.xlsx
└── package.json
```

---

## License

MIT — free to use, modify, distribute. See [LICENSE](LICENSE).

---

If this saves you time → [![Buy Me a Coffee](https://img.shields.io/badge/Support-Buy%20Me%20a%20Coffee-ffdd00?logo=buy-me-a-coffee)](https://buymeacoffee.com/Vector148)
