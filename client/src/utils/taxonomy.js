// Taxonomy — pillar/affect/mood definitions

export const GAME_PILLARS = [
  { key: "narrative", label: "Narrative", color: "pill-red",    dot: "#ff4757" },
  { key: "action",    label: "Action",    color: "pill-yellow", dot: "#ffa502" },
  { key: "discovery", label: "Discovery", color: "pill-green",  dot: "#2ed573" },
  { key: "mechanic",  label: "Mechanic",  color: "pill-blue",   dot: "#1e90ff" },
];

export const FILM_AFFECTS = [
  { key: "thriller", label: "Thriller", color: "pill-red",    dot: "#ff4757" },
  { key: "exciting", label: "Exciting", color: "pill-yellow", dot: "#ffa502" },
  { key: "healing",  label: "Healing",  color: "pill-green",  dot: "#2ed573" },
  { key: "drama",    label: "Drama",    color: "pill-blue",   dot: "#1e90ff" },
];

export const SERIES_AFFECTS = [
  { key: "thriller", label: "Thriller", color: "pill-red",    dot: "#ff4757" },
  { key: "exciting", label: "Exciting", color: "pill-yellow", dot: "#ffa502" },
  { key: "healing",  label: "Healing",  color: "pill-green",  dot: "#2ed573" },
  { key: "drama",    label: "Drama",    color: "pill-blue",   dot: "#1e90ff" },
];

export const MUSIC_MOODS = [
  { key: "pop_en",  label: "English-Pop",        color: "pill-white",  dot: "#ffffff" },
  { key: "pop_cn",  label: "Chinese-Pop",        color: "pill-white",  dot: "#ffffff" },
  { key: "pop_vn",  label: "Viet-Pop",           color: "pill-white",  dot: "#ffffff" },
  { key: "separator", label: "|",                color: "transparent", dot: "transparent" },
  { key: "epic",    label: "Epic",               color: "pill-red",    dot: "#ff4757" },
  { key: "edm",     label: "EDM",                color: "pill-yellow", dot: "#ffa502" },
  { key: "chill",   label: "Chill",              color: "pill-green",  dot: "#2ed573" },
  { key: "wistful", label: "Melancholy",         color: "pill-blue",   dot: "#1e90ff" },
  { key: "horror",  label: "Gothic",             color: "pill-purple", dot: "#a55eea" },
];

const GAMEPLAY_MAP = {
  narrative: "narrative", story: "narrative",
  action: "action", combat: "action", fighting: "action",
  discovery: "discovery", exploration: "discovery", adventure: "discovery",
  mechanic: "mechanic", puzzle: "mechanic", strategy: "mechanic",
};

const AFFECT_MAP = {
  thriller: "thriller", horror: "thriller", crime: "thriller", survival: "thriller", disaster: "thriller",
  exciting: "exciting", action: "exciting", scifi: "exciting", "sci-fi": "exciting", adventure: "exciting", fantasy: "exciting",
  healing: "healing", romance: "healing", comedy: "healing", cozy: "healing", comfort: "healing",
  drama: "drama", psychological: "drama", detective: "drama", mystery: "drama", historical: "drama", biography: "drama",
};

const SERIES_MAP = {
  thriller: "thriller", survival: "thriller", disaster: "thriller", horror: "thriller", crime: "thriller",
  exciting: "exciting", action: "exciting", scifi: "exciting", "sci-fi": "exciting", adventure: "exciting", fantasy: "exciting",
  healing: "healing", romance: "healing", comedy: "healing", cozy: "healing", comfort: "healing",
  drama: "drama", psychological: "drama", detective: "drama", mystery: "drama", historical: "drama", biography: "drama",
};

const MUSIC_MAP = {
  epic: "epic", ost: "epic", soundtrack: "epic", trailer: "epic", tension: "epic",
  edm: "edm", remix: "edm", electronic: "edm", hype: "edm", energetic: "edm",
  wistful: "wistful", "da diet": "wistful", sad: "wistful", melancholic: "wistful", emotional: "wistful",
  chill: "chill", meditation: "chill", ambient: "chill", piano: "chill", relaxing: "chill",
  horror: "horror", scary: "horror", dark: "horror",
  pop_en: "pop_en", english: "pop_en",
  pop_cn: "pop_cn", chinese: "pop_cn", cpop: "pop_cn",
  pop_vn: "pop_vn", vietnamese: "pop_vn", vpop: "pop_vn",
};

export function inferGamePillar(gameplay = "", subcategory = "") {
  const gp = String(gameplay).toLowerCase().trim();
  const exact = GAME_PILLARS.find((p) => p.key === gp || GAMEPLAY_MAP[gp] === p.key);
  if (exact) return exact;

  const raw = (gameplay + " " + subcategory).toLowerCase();
  for (const [k, v] of Object.entries(GAMEPLAY_MAP)) {
    if (raw.includes(k)) {
      const found = GAME_PILLARS.find((p) => p.key === v);
      if (found) return found;
    }
  }
  return GAME_PILLARS[0];
}

export function inferFilmAffect(affect = "") {
  const af = String(affect).toLowerCase().trim();
  const exact = FILM_AFFECTS.find((p) => p.key === af || AFFECT_MAP[af] === p.key);
  if (exact) return exact;

  const raw = String(affect).toLowerCase();
  for (const [k, v] of Object.entries(AFFECT_MAP)) {
    if (raw.includes(k)) {
      const found = FILM_AFFECTS.find((p) => p.key === v);
      if (found) return found;
    }
  }
  return FILM_AFFECTS[0];
}

export function inferSeriesAffect(affect = "") {
  const af = String(affect).toLowerCase().trim();
  const exact = SERIES_AFFECTS.find((p) => p.key === af || SERIES_MAP[af] === p.key);
  if (exact) return exact;

  const raw = String(affect).toLowerCase();
  for (const [k, v] of Object.entries(SERIES_MAP)) {
    if (raw.includes(k)) {
      const found = SERIES_AFFECTS.find((p) => p.key === v);
      if (found) return found;
    }
  }
  return SERIES_AFFECTS[0];
}

export function inferMusicMood(mood = "", genre = "") {
  const raw = (mood + " " + genre).toLowerCase();
  for (const [k, v] of Object.entries(MUSIC_MAP)) {
    if (raw.includes(k)) {
      const found = MUSIC_MOODS.find((p) => p.key === v);
      if (found) return found;
    }
  }
  return MUSIC_MOODS[2]; // default: chill
}

export function getTaxonomy(item, type) {
  if (type === "games")  return inferGamePillar(item.gameplay, item.subcategory);
  if (type === "series") return inferSeriesAffect(item.affect);
  if (type === "music")  return inferMusicMood(item.mood, item.genre);
  return inferFilmAffect(item.affect);
}

export function getRealmDefs(type) {
  if (type === "games")  return GAME_PILLARS;
  if (type === "series") return SERIES_AFFECTS;
  if (type === "music")  return MUSIC_MOODS;
  return FILM_AFFECTS;
}
