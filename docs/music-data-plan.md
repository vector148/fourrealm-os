# Plan: FourRealm OS — Music Database Expansion

## Goal
Populate `database/music.xlsx` with full metadata for ~60+ curated tracks, then source piano-solo sheet links from YouTube creators.

## Music Schema (from codebase)
Each row in `music.xlsx` should contain:

| Field | Type | Notes |
|-------|------|-------|
| `id` | number | Auto-increment |
| `title` | string | Track title |
| `artist` | string | Composer / performer |
| `year` | number | Release year |
| `genre` | string | EDM, Pop, Soundtrack, Piano, etc. |
| `mood` | string | Drives taxonomy mapping |
| `score` | number | 0–10 user rating |
| `status` | string | `owned` / `listened` / `planning` |
| `cover` | string | YouTube thumbnail or album art URL |
| `source` | string | `youtube`, `spotify`, `netease` |
| `subcategory` | string | `epic`, `remix`, `melancholic`, `chill`, `horror`, `pop-vn`, `pop-en`, `pop-cn` |
| `album` | string | Album / OST name |
| `youtubeId` | string | YouTube video ID |
| `sheetUrl` | string | Link to piano sheet (if available) |

## Data Sources (free, no key where possible)

1. **YouTube Data API v3** — title, channel, thumbnails, duration (needs API key)
2. **MusicBrainz API** — metadata, artist, release year, album (no key needed)
3. **Last.fm API** — tags, genre (needs free API key)
4. **NetEase Cloud Music** — Chinese track metadata (web scrape or unofficial API)
5. **Spotify Web API** — preview URLs, album art (needs Client ID/Secret)

## Piano Sheet Sources

| Creator | YouTube Channel | Notes |
|---------|----------------|-------|
| Patrik Pietschmann | @PatrikPietschmann | Epic / soundtrack covers |
| Toms Mucenieks | @TomsMucenieks | EDM / pop piano |
| Jove Mucenieks | @JoveMucenieks | (verify handle) |
| Kassia | @KassiaPiano | Anime / pop |
| PianiCast | @PianiCast | Tutorial + sheets |

## Automation Script Roadmap

```
scripts/
  seed-music-catalog.js   ← list of tracks from user request
  fetch-metadata.js       ← MusicBrainz + YouTube batch fetch
  match-sheets.js         ← search YouTube for "{title} piano tutorial"
  write-xlsx.js           ← merge into database/music.xlsx
```

## Execution Steps

1. **Phase 1 — Catalog Preparation**
   - Finalize `seed-music-catalog.js` with all 60+ tracks.
   - Assign `subcategory` and infer initial `mood` from album classification.

2. **Phase 2 — Metadata Enrichment**
   - Run `fetch-metadata.js` against MusicBrainz.
   - Fill missing `year`, `artist`, `album`, `genre`.
   - Fetch YouTube IDs for tracks that have official uploads.

3. **Phase 3 — Sheet Matching**
   - For each track, query YouTube: `"{title} piano cover patrik pietschmann"`, etc.
   - Store first matching `videoId` in `sheetUrl` column.

4. **Phase 4 — Import to Excel**
   - Convert JSON array to XLSX via `xlsx` package.
   - Write to `database/music.xlsx`.
   - Verify via `GET /api/music` endpoint.

5. **Phase 5 — Manual Review**
   - Open app → Music tab.
   - Spot-check covers, genres, mood mappings.
   - Adjust taxonomy in `client/src/utils/taxonomy.js` if new moods appear.

## Mood → Taxonomy Mapping (existing)

| User Album | Affect | Mood (inferred) | Pillar |
|------------|--------|-----------------|--------|
| Epic | Kích thích, Dễ chịu | `intense` | Intense |
| Remix | Kích thích, Dễ chịu | `energetic` | Energetic |
| Da diết | Kích thích, Khó chịu | `melancholic` | Melancholic |
| Chill chill | Thư giãn, Dễ chịu | `chill` | Chill |
| Sợ hãi | Trung tính, Khó chịu | `intense` | Intense |
| Pop Chung Chung | Trung tính, Dễ chịu | `energetic` / `chill` | Energetic / Chill |

## Next Action
- [ ] Review & approve this plan.
- [ ] Provide **YouTube Data API key** (if available) OR agree to use MusicBrainz-only fallback.
- [ ] Run `seed-music-catalog.js` → `fetch-metadata.js` → `write-xlsx.js` pipeline.
