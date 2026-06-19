// Score engine — deterministic pillar breakdown from a 0–10 score

const SEEDS = {
  narrative: [0.35, 0.25, 0.20, 0.20],
  action:    [0.20, 0.40, 0.25, 0.15],
  discovery: [0.20, 0.15, 0.40, 0.25],
  mechanic:  [0.15, 0.20, 0.25, 0.40],
};

// Returns { narrative, action, discovery, mechanic } as 0–100 integers
export function breakdown(score, pillar = "narrative") {
  const s = Math.max(0, Math.min(10, Number(score) || 0));
  const weights = SEEDS[pillar] || SEEDS.narrative;
  const [n, a, d, m] = weights.map((w) => clamp(Math.round(s * w * 10)));
  return { narrative: n, action: a, discovery: d, mechanic: m };
}

function clamp(v) { return Math.max(0, Math.min(100, v)); }

// Convert score to star string ★★★★☆
export function toStars(score) {
  const s = Number(score) || 0;
  const full = Math.round(s / 2);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

export function fmt(score) {
  if (score == null || score === "") return "–";
  return parseFloat(score).toFixed(1);
}
