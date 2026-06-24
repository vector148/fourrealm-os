// Shared utilities

export function slug(str) {
  return String(str || "").toLowerCase().replace(/[^a-z0-9]/g, "_");
}

export function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function getYear(item) {
  const candidates = [item?.releaseDate, item?.date, item?.completionDate, item?.purchase];
  for (const v of candidates) {
    const m = String(v || "").match(/(19|20)\d{2}/);
    if (m) return m[0];
  }
  return "";
}

export function itemKey(item) {
  return slug(item?.title || "");
}

export function toYoutubeEmbed(url) {
  if (!url) return "";
  const id = extractYoutubeId(url);
  if (!id) return "";
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
}

export function extractYoutubeId(url) {
  if (!url) return "";
  const m = String(url).match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/
  );
  return m ? m[1] : "";
}

export function getTrailerInfo(item) {
  const raw = item?.trailerUrl || item?.trailer || item?.youtube || "";
  const embed = toYoutubeEmbed(raw);
  const watch = item?.trailerUrl || item?.trailer || item?.youtube || "";
  return { embed, watch };
}

// Normalize a raw game row from Excel into the app's shape
export function normalizeGame(row) {
  return {
    id: row.id ?? "",
    title: String(row.title || "").trim(),
    originalTitle: String(row.originalTitle || row.original_title || "").trim(),
    releaseDate: String(row.releaseDate || "").trim(),
    played: row.played === true || String(row.played).toLowerCase() === "true",
    gameplay: String(row.gameplay || "Discovery").trim(),
    subcategory: String(row.subcategory || "").trim(),
    score: row.score === "" || row.score == null ? null : Number(row.score),
    status: String(row.status || "active").toLowerCase().trim(),
    date: String(row.date || "").trim(),
    purchase: String(row.purchase || "").trim(),
    completionDate: String(row.completionDate || "").trim(),
    rank: row.rank ? Number(row.rank) : null,
    cover: String(row.cover || "").trim(),
    trailer: String(row.trailer || "").trim(),
    trailerUrl: String(row.trailerUrl || row.trailer_url || row.youtube || "").trim(),
    source: String(row.source || "").trim(),
  };
}

// Normalize a raw film row from Excel
export function normalizeFilm(row) {
  return {
    id: row.id ?? "",
    title: String(row.title || "").trim(),
    releaseDate: String(row.releaseDate || "").trim(),
    watched: row.watched === true || String(row.watched).toLowerCase() === "true",
    affect: String(row.affect || "Drama").trim(),
    score: row.score === "" || row.score == null ? null : Number(row.score),
    status: String(row.status || "active").toLowerCase().trim(),
    date: String(row.date || "").trim(),
    cover: String(row.cover || "").trim(),
    trailer: String(row.trailer || "").trim(),
    trailerUrl: String(row.trailerUrl || row.trailer_url || row.youtube || "").trim(),
    source: String(row.source || "").trim(),
  };
}
