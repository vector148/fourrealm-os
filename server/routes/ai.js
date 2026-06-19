import { Router } from "express";

const router = Router();

const PILLARS = {
  games: ["narrative", "action", "discovery", "mechanic"],
  films: ["drama", "exciting", "healing", "thriller"],
};

function buildPrompt({ title, type }) {
  const mediaType = type === "games" ? "game" : "film, Netflix series, or TV series";
  const pillars = PILLARS[type].join(", ");
  return [
    `Find the intended ${mediaType} for this title: ${title}.`,
    "Return one best match only as JSON, no markdown.",
    `pillar must be one of: ${pillars}.`,
    "Return keys: title, original_title, year, media_type, pillar, subcategory, score, cover, trailer, trailerUrl, source, confidence, reason.",
    "cover must be a directly loadable HTTPS poster/image URL. Prefer Wikimedia Commons or Wikipedia URLs. Do NOT use Steam, TMDB, IGDB, Apple, or Amazon.",
    "trailer should be a YouTube nocookie embed URL when possible; trailerUrl should be the regular YouTube watch URL.",
    "If unsure, lower confidence and explain briefly in reason."
  ].join("\n");
}

function normalize(value) {
  if (value == null) return "";
  return String(value).trim();
}

router.post("/lookup", async (req, res) => {
  try {
    const title = normalize(req.body?.title);
    const type = req.body?.type === "films" ? "films" : "games";
    const model = normalize(req.body?.model) || "gpt-4.1-mini";
    const apiKey = normalize(req.body?.apiKey) || normalize(process.env.OPENAI_API_KEY);

    if (!title) return res.status(400).json({ error: "Missing title" });
    if (!apiKey) return res.status(400).json({ error: "Missing OpenAI API key" });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You are a precise entertainment metadata assistant. Output valid JSON only." },
          { role: "user", content: buildPrompt({ title, type }) },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(response.status).json({ error: payload.error?.message || `OpenAI request failed (${response.status})` });
    }

    const text = payload.choices?.[0]?.message?.content;
    if (!text) return res.status(502).json({ error: "OpenAI returned no content" });

    let data;
    try { data = JSON.parse(text); }
    catch { return res.status(502).json({ error: "OpenAI returned invalid JSON", raw: text }); }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || "AI lookup failed" });
  }
});

export default router;
