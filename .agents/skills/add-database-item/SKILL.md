---
name: add-database-item
description: Adds a new game, film, series, or song to the FourRealm OS database. Strictly uses Wikipedia/Wikidata for factual metadata and URL scraping. NEVER downloads images or uses AI image generation. 100% DMCA-Safe.
---

# Add Database Item (V3 Safe Edition)

This skill adds a new entry to the appropriate `.xlsx` database file in the `server/` (or `database/`) folder. It strictly adheres to "Fair Use" principles for open-source repositories by ensuring no copyrighted files are downloaded or hosted.

## Execution Steps

1. **Identify the Target Database**
   Determine whether the item goes into `games.xlsx`, `films.xlsx`, `series.xlsx`, or `music.xlsx`.

2. **Search for Metadata (Safe Zones ONLY)**
   - Use the `search_web` tool to find the item's factual metadata (exact release date `YYYY-MM-DD`, genre, developer, director, etc.). 
   - **CRITICAL RESTRICTION**: You MUST ONLY search and extract data from **Wikipedia, Wikimedia Commons, or Wikidata**. Do NOT scrape Steam, IMDb, IGDB, Apple Music, Spotify, or other storefronts. 
   - **CRITICAL DATE CHECK**: You must find the exact release date in `YYYY-MM-DD` format (e.g., 2023-04-12) for the `releaseDate` field. 

3. **Fetch Cover URL (Hotlinking Only)**
   - Find the cover art image URL from the Wikipedia/Wikimedia page.
   - **CRITICAL**: ONLY extract the URL. You are strictly **FORBIDDEN** from downloading the image file. We only store the URL string in the `cover` column.
   - **CRITICAL**: You are strictly **FORBIDDEN** from using the `generate_image` tool to create AI fallback covers. The v3 repository must remain completely clean of AI-generated derivatives of copyrighted works.
   - If a Wikipedia image URL is found, set the `cover` field to this URL. If not, leave it empty.

4. **Fetch Trailer URL**
   - Search for an official YouTube trailer URL. Storing a YouTube watch link is completely safe and legal. Extract the watch URL and store it in the `trailerUrl` field.

5. **Read and Update Database**
   - Read the target `.xlsx` file using a Node script.
   - Ensure the new entry correctly maps all data to the file's existing headers. The primary fields usually include: `title`, `releaseDate`, `cover`, `trailerUrl`.
   - Write the updated JSON back to the `.xlsx` file.

6. **Confirm Completion**
   - Respond to the user confirming the item has been safely added. Remind them that the cover is being hotlinked from Wikipedia and no files were downloaded to their local machine, ensuring 100% DMCA compliance for this open-source template.
