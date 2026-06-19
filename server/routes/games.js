import { Router } from "express";
import { readExcel, writeExcel } from "../db/excel.js";

const router = Router();
const FILE = "games.xlsx";

router.get("/", (_, res) => {
  try {
    res.json(readExcel(FILE));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/:id", (req, res) => {
  try {
    const rows = readExcel(FILE);
    const idx = rows.findIndex((r) => String(r.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ error: "Not found" });
    rows[idx] = { ...rows[idx], ...req.body, id: rows[idx].id };
    writeExcel(FILE, rows);
    res.json(rows[idx]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", (req, res) => {
  try {
    const rows = readExcel(FILE);
    const maxId = rows.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0);
    const item = { ...req.body, id: maxId + 1 };
    rows.push(item);
    writeExcel(FILE, rows);
    res.status(201).json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:id", (req, res) => {
  try {
    const rows = readExcel(FILE);
    const filtered = rows.filter((r) => String(r.id) !== String(req.params.id));
    if (filtered.length === rows.length) return res.status(404).json({ error: "Not found" });
    writeExcel(FILE, filtered);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
