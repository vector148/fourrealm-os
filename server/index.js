import express from "express";
import cors from "cors";
import gamesRouter from "./routes/games.js";
import filmsRouter from "./routes/films.js";
import seriesRouter from "./routes/series.js";
import musicRouter from "./routes/music.js";
import upcomingRouter from "./routes/upcoming.js";
import planningRouter from "./routes/planning.js";
import aiRouter from "./routes/ai.js";

const app = express();
const PORT = Number(process.env.PORT ?? 3001);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.use("/api/games", gamesRouter);
app.use("/api/films", filmsRouter);
app.use("/api/series", seriesRouter);
app.use("/api/music", musicRouter);
app.use("/api/upcoming", upcomingRouter);
app.use("/api/planning", planningRouter);
app.use("/api/ai", aiRouter);

app.get("/api/health", (_, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`FourRealm API running on http://localhost:${PORT}`);
});


