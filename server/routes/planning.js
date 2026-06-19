import { Router } from "express";
import { readJson, writeJson } from "../db/excel.js";

const router = Router();
const FILE = "planning.json";

router.get("/", (_, res) => {
  try {
    res.json(readJson(FILE) || { games: {}, films: {} });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/", (req, res) => {
  try {
    writeJson(FILE, req.body);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
