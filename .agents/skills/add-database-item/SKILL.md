---
name: add-database-item
description: Adds a new game, film, series, or song to the FourRealm OS database. Automatically infers missing metadata, scrapes covers/trailers, falls back to rumor videos, and generates concept art via AI if official covers are missing.
---

# add-database-item Skill

This skill is designed to automatically infer, scrape, and insert data for games, films, series, and music into the FourRealm OS v2 database (`games.xlsx`, `films.xlsx`, etc.).

## Trigger
Use this skill when the user provides the name, a list of names, or an image containing multiple media items, and wants to add them to the database.

## Instructions

**BULK PROCESSING LOOP:** If the user provides multiple items (or an image with a list), you MUST process ALL of them in a continuous loop. Do not stop until the entire list is completed. For each item in the list, perform the following steps:

1. **Information Extraction & Existence Check**
   - Identify the title of the item and its target category (game, film, series, music).
   - Determine the correct database file (e.g., `games.xlsx`, `upcoming_games.xlsx`, `films.xlsx`).
   - **CRITICAL DUPLICATE CHECK**: Before doing any web search, run the helper script to check if the item already exists:
     ```bash
     node .agents/skills/add-database-item/scripts/helper.mjs check "<db_file_name>" "<title>"
     ```
     If the script outputs `EXISTS`, you MUST skip this item entirely, inform the user it was skipped, and move on to the next item in the list. Do not scrape or generate anything for it. If `NOT_FOUND`, proceed to the next step.
   - Use the `search_web` tool to find the item's metadata (exact release date, genre, developer/publisher for games, director for films). Search broadly across Wikipedia, Steam, IGDB, IMDb, TMDB, Apple Music API, Spotify, etc.
   - **CRITICAL DATE CHECK**: You MUST extract the exact release date in `YYYY-MM-DD` format (e.g., `2024-05-14`). Do NOT use or extract a `year` field. Store the date ONLY in the `releaseDate` field of the JSON payload.

2. **Fetching Trailer**
   - Use `search_web` to search YouTube for the official trailer (e.g., `<Title> official trailer site:youtube.com`).
   - If the item is unreleased and has no official trailer, search for "concept trailer", "rumor video", or "leaks" and use that YouTube URL instead.
   - **CRITICAL DEAD LINK CHECK**: Before using a YouTube URL, you must verify it is alive and embeddable by querying its `oembed` endpoint using a Node script. Run: `node -e "fetch('https://www.youtube.com/oembed?url=<YOUTUBE_URL>&format=json').then(r => console.log(r.status))"`. If it returns `404` or `401` or `403`, the video is dead or region-locked. You MUST find a different YouTube link and test it again until you get a `200` OK.

3. **Fetching Cover Image**
   - Search for a high-quality cover art image URL. This can be from Steam CDN (`cdn.akamai.steamstatic.com`), IMDb media, Wikipedia (`Special:FilePath`), or Apple Music artwork.
   - If a valid image URL is found, run the helper script to download it:
     ```bash
     node .agents/skills/add-database-item/scripts/helper.mjs download-cover "<image_url>" "<slugified_title>.jpg"
     ```
     This will download the image to `server/images/` and output the local path (e.g., `/images/<slugified_title>.jpg`). Use this path as the `cover` field.
   - **FALLBACK**: If NO valid cover image can be scraped from ANY source, you MUST automatically use your `generate_image` tool to create a concept art cover that matches the description/vibe of the item. Once generated, move the artifact image to `server/images/` using a shell command, and set the `cover` field to `/images/<artifact_name>.png`.

4. **Database Insertion**
   - Construct a JSON string matching the required schema. You can check existing files for the schema using `run_command` if unsure.
   - Run the helper script to insert the data:
     ```bash
     node .agents/skills/add-database-item/scripts/helper.mjs insert "<db_file_name>" '<json_string>'
     ```
     *(Note: Be careful with single quotes in bash/powershell. Use PowerShell-safe string escaping or write the JSON to a temporary file in the workspace first, then pass it to a custom node execution if the helper command fails.)*

5. **Completion**
   - Inform the user that the item has been fully processed and successfully added to the database. Mention any AI generation or fallback strategies that were used.
