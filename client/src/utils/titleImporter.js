const OPENAI_KEY = "fourrealm_openai_key";
const TMDB_KEY = "fourrealm_tmdb_key";

export function getStoredKey() { return localStorage.getItem(OPENAI_KEY) || ""; }
export function setStoredKey(key) {
  const clean = String(key || "").trim();
  if (clean) localStorage.setItem(OPENAI_KEY, clean);
  else localStorage.removeItem(OPENAI_KEY);
}
export function getTmdbKey() { return localStorage.getItem(TMDB_KEY) || ""; }
export function setTmdbKey(key) {
  const clean = String(key || "").trim();
  if (clean) localStorage.setItem(TMDB_KEY, clean);
  else localStorage.removeItem(TMDB_KEY);
}

export function sanitizeCover(raw) {
  let url = String(raw || "").trim().replace(/^[\s"'`(<]+|[\s"'`)>]+$/g, "");
  if (!url) return "";
  if (/^\/\//.test(url)) url = "https:" + url;
  if (/^www\./i.test(url)) url = "https://" + url;

  let parsed;
  try { parsed = new URL(url); } catch { return ""; }
  if (!/^https?:$/.test(parsed.protocol)) return "";
  if (/google\.[a-z.]+\/search|\/search\?|wikipedia\.org\/wiki\//i.test(url)) return "";

  const path = parsed.pathname || "";
  const imageExt = /\.(jpe?g|png|webp|avif)$/i.test(path);
  const trustedImageHost = /(image\.tmdb\.org|cdn\.akamai\.steamstatic\.com|steamcdn-a\.akamaihd\.net|m\.media-amazon\.com|upload\.wikimedia\.org|images-na\.ssl-images-amazon\.com|\.googleusercontent\.com)$/i.test(parsed.hostname);
  return imageExt || (trustedImageHost && path.length > 1) ? url : "";
}

function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  return start >= 0 && end > start ? text.slice(start, end + 1) : "";
}

export function buildGoogleAiUrl({ title, type }) {
  const mediaType = type === "games" ? "video game"
    : type === "series" ? "TV series or Netflix show"
    : type === "music" ? "music album or artist"
    : "film or movie";
  const pillars = type === "games" ? "narrative, action, discovery, mechanic"
    : type === "series" ? "emotional, thrilling, cozy, mystery"
    : type === "music" ? "energetic, melancholic, chill, intense"
    : "drama, exciting, healing, thriller";
  const extraFields = type === "series" ? " seasons, episodes," : type === "music" ? " artist, genre," : "";
  const prompt = [
    `Find metadata for this ${mediaType}: "${title}".`,
    "Return one best match only as plain JSON with keys:",
    `title, original_title, year, media_type, pillar,${extraFields} subcategory, score, cover, trailer, trailerUrl, source, confidence, reason.`,
    `pillar must be one of: ${pillars}.`,
    "cover must be a directly-loadable HD HTTPS image URL ending in .jpg/.jpeg/.png/.webp. No markdown. JSON only."
  ].join(" ");
  return `https://www.google.com/search?udm=50&q=${encodeURIComponent(prompt)}`;
}

export function coerceResult(data, type) {
  const gamePillars    = ["narrative", "action", "discovery", "mechanic"];
  const filmPillars    = ["drama", "exciting", "healing", "thriller"];
  const seriesPillars  = ["emotional", "thrilling", "cozy", "mystery"];
  const musicPillars   = ["energetic", "melancholic", "chill", "intense"];

  const allowed = type === "games" ? gamePillars
    : type === "series" ? seriesPillars
    : type === "music" ? musicPillars
    : filmPillars;

  const pillarMap = {
    // games
    story: "narrative", narrative: "narrative", combat: "action", action: "action",
    adventure: type === "games" ? "discovery" : type === "series" ? "thrilling" : "exciting",
    discovery: "discovery", exploration: "discovery", mechanic: "mechanic", puzzle: "mechanic",
    // films
    drama: "drama", romance: "drama", exciting: "exciting", thriller: "thriller",
    mystery: type === "series" ? "mystery" : "thriller", healing: "healing", cozy: type === "series" ? "cozy" : "healing",
    // series
    emotional: "emotional", thrilling: "thrilling",
    // music
    energetic: "energetic", melancholic: "melancholic", chill: "chill", intense: "intense",
    upbeat: "energetic", sad: "melancholic", ambient: "chill", heavy: "intense",
  };

  const rawPillar = String(data.pillar || data.affect || data.gameplay || data.mood || "").toLowerCase();
  const mapped = allowed.find((key) => rawPillar.includes(key))
    || Object.entries(pillarMap).find(([key, value]) => rawPillar.includes(key) && allowed.includes(value))?.[1]
    || allowed[type === "music" ? 2 : 0]; // music defaults to chill, others to first
  const rawScore = data.score === "" || data.score == null ? null : Number(data.score);

  const base = {
    title: String(data.title || data.name || "Untitled").replace(/^\[([^\]]+)\]\([^)]+\)/, "$1").trim(),
    original_title: String(data.original_title || data.originalTitle || "").trim(),
    year: String(data.year || "").trim(),
    media_type: type === "games" ? "game" : type === "series" ? "series" : type === "music" ? "music" : "film",
    pillar: mapped,
    subcategory: String(data.subcategory || data.genre || data.type || "").trim(),
    score: Number.isFinite(rawScore) ? rawScore : null,
    cover: sanitizeCover(data.cover || data.poster || data.image || data.cover_url || data.poster_url),
    trailer: String(data.trailer || data.trailerUrl || "").trim(),
    trailerUrl: String(data.trailerUrl || data.trailer || "").trim(),
    source: String(data.source || "AI search import").trim(),
    confidence: Math.max(0, Math.min(1, Number(data.confidence ?? 0.7))),
    reason: String(data.reason || data.note || "Imported metadata candidate.").trim(),
  };

  if (type === "series") {
    base.seasons  = data.seasons  ? String(data.seasons)  : "";
    base.episodes = data.episodes ? String(data.episodes) : "";
  }
  if (type === "music") {
    base.artist = String(data.artist || "").trim();
    base.genre  = String(data.genre  || data.subcategory || "").trim();
  }

  return base;
}

export function parseFreeform(text, { type }) {
  const raw = String(text || "").trim();
  if (!raw) throw new Error("Nothing to parse.");
  const jsonText = extractJson(raw);
  if (jsonText) return coerceResult(JSON.parse(jsonText), type);

  const read = (labels) => {
    for (const label of labels) {
      const match = raw.match(new RegExp(`^\\s*[-*]?\\s*${label}\\s*[:：-]\\s*(.+)$`, "im"));
      if (match) return match[1].trim();
    }
    return "";
  };
  const title = read(["title", "name"]) || raw.split(/\r?\n/)[0].replace(/^#+\s*/, "").trim();
  const yearMatch = raw.match(/\b(19|20)\d{2}\b/);
  const scoreRaw = read(["score", "priority"]);
  const trailer = read(["trailer", "trailerUrl", "youtube", "official trailer"]);

  return coerceResult({
    title,
    original_title: read(["original_title", "original title"]),
    year: yearMatch ? yearMatch[0] : read(["year"]),
    pillar: read(["pillar", "affect", "gameplay"]),
    subcategory: read(["subcategory", "genre", "type"]),
    score: scoreRaw ? Number(String(scoreRaw).replace(",", ".").match(/\d+(\.\d+)?/)?.[0]) : null,
    cover: read(["cover", "poster", "image", "poster url"]),
    trailer,
    trailerUrl: trailer,
    source: read(["source"]) || "Google AI paste",
    confidence: 0.72,
    reason: read(["reason", "note"]) || "Parsed from pasted AI/search answer.",
  }, type);
}

export async function fetchPoster({ title, type }) {
  const cleaned = String(title || "")
    .replace(/^\[([^\]]+)\]\([^)]+\)$/, "$1")
    .replace(/\s*[:\-–—]\s*(Season|Part|Episode)\s*\d+.*$/i, "")
    .replace(/\s*\((Season|Part)\s*\d+\)\s*$/i, "")
    .replace(/\s*\(Nintendo Switch\)\s*$/i, "")
    .trim();
  if (!cleaned) return "";

  const tmdbKey = getTmdbKey();
  const needsTmdb = type === "films" || type === "series";
  if (needsTmdb && tmdbKey) {
    const endpoints = type === "series" ? ["tv", "movie"] : ["movie", "tv"];
    for (const endpoint of endpoints) {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/search/${endpoint}?api_key=${encodeURIComponent(tmdbKey)}&query=${encodeURIComponent(cleaned)}&language=en-US&page=1`);
        if (!res.ok) continue;
        const data = await res.json();
        const poster = data?.results?.[0]?.poster_path;
        if (poster) return `https://image.tmdb.org/t/p/w780${poster}`;
      } catch { /* try next */ }
    }
  }

  const hint = type === "games" ? "video game cover"
    : type === "series" ? "TV series poster"
    : type === "music" ? "album cover"
    : "movie poster";
  for (const query of [`${cleaned} ${hint}`, cleaned]) {
    try {
      const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=5&prop=pageimages&piprop=original%7Cthumbnail&pithumbsize=780&format=json&origin=*`);
      if (!res.ok) continue;
      const data = await res.json();
      const pages = Object.values(data?.query?.pages || {}).sort((a, b) => (a.index || 99) - (b.index || 99));
      for (const page of pages) {
        const src = page?.original?.source || page?.thumbnail?.source;
        const clean = sanitizeCover(src);
        if (!clean || /logo|icon|symbol|wordmark|\.svg|banner|flag|map/i.test(clean)) continue;
        if (type !== "music" && page?.original?.width && page?.original?.height && page.original.width >= page.original.height) continue;
        return clean;
      }
    } catch { /* try next */ }
  }
  return "";
}

export async function lookup({ title, type, apiKey, model = "gpt-4.1-mini" }) {
  const key = String(apiKey || getStoredKey()).trim();
  if (!key) throw new Error("Missing OpenAI API key.");
  setStoredKey(key);

  const response = await fetch("/api/ai/lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, type, apiKey: key, model }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `AI request failed (${response.status})`);
  return coerceResult(payload, type);
}