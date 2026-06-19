// Filter engine

import { slug, itemKey, getYear } from "./helpers.js";
import { getTaxonomy } from "./taxonomy.js";

const STATUS_ALIASES = {
  active: ["active", "playing", "watching"],
  completed: ["completed"],
  upcoming: ["upcoming", "wishlist"],
  dropped: ["dropped"],
};

export function applyFilters(items, { query = "", status = "all", pillar = "all", type = "games" }) {
  let result = items;

  if (status !== "all" && type !== "music") {
    const accepted = STATUS_ALIASES[status] || [status];
    result = result.filter((i) => accepted.includes(String(i.status).toLowerCase()));
  }

  if (pillar !== "all") {
    result = result.filter((i) => getTaxonomy(i, type).key === pillar);
  }

  if (query.trim()) {
    const q = query.toLowerCase().trim();
    result = result.filter((i) =>
      String(i.title || "").toLowerCase().includes(q) ||
      String(i.originalTitle || "").toLowerCase().includes(q)
    );
  }

  // Sort by year descending
  result = result.sort((a, b) => {
    const ya = parseInt(getYear(a)) || 0;
    const yb = parseInt(getYear(b)) || 0;
    return yb - ya;
  });

  return result;
}

export function countByStatus(items) {
  const counts = { completed: 0, active: 0, wishlist: 0, upcoming: 0, dropped: 0, total: 0 };
  for (const item of items) {
    const s = String(item.status || "").toLowerCase();
    counts.total++;
    if (s === "completed") counts.completed++;
    else if (s === "active" || s === "playing" || s === "watching") counts.active++;
    else if (s === "wishlist") counts.wishlist++;
    else if (s === "upcoming") counts.upcoming++;
    else if (s === "dropped") counts.dropped++;
  }
  return counts;
}
