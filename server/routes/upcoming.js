import { Router } from "express";
import { readExcel, writeExcel } from "../db/excel.js";

const router = Router();

const VALID_TYPES = ["games", "films", "series", "music"];
router.get("/:type", (req, res) => {
  const { type } = req.params;
  if (!VALID_TYPES.includes(type)) return res.status(400).json({ error: "Invalid type" });
  try {
    res.json(readExcel(`upcoming_${type}.xlsx`));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/upcoming/:type  — add item
router.post("/:type", (req, res) => {
  const { type } = req.params;
  if (!VALID_TYPES.includes(type)) return res.status(400).json({ error: "Invalid type" });
  try {
    const rows = readExcel(`upcoming_${type}.xlsx`);
    const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "_");
    if (rows.some((r) => slug(r.title) === slug(req.body.title))) {
      return res.status(409).json({ error: "Already in upcoming" });
    }
    rows.push(req.body);
    writeExcel(`upcoming_${type}.xlsx`, rows);
    res.status(201).json(req.body);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/upcoming/:type/:title — update item
router.put("/:type/:title", async (req, res) => {
  const { type, title } = req.params;
  if (!VALID_TYPES.includes(type)) return res.status(400).json({ error: "Invalid type" });
  try {
    const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "_");
    const rows = readExcel(`upcoming_${type}.xlsx`);
    const idx = rows.findIndex((r) => slug(r.title) === slug(decodeURIComponent(title)));
    if (idx === -1) return res.status(404).json({ error: "Not found in upcoming" });
    let item = { ...rows[idx], ...req.body };
    item = await processItemCover(item, type);
    rows[idx] = item;
    writeExcel(`upcoming_${type}.xlsx`, rows);
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/upcoming/:type/:title  — remove item
router.delete("/:type/:title", (req, res) => {
  const { type, title } = req.params;
  if (!VALID_TYPES.includes(type)) return res.status(400).json({ error: "Invalid type" });
  try {
    const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "_");
    const rows = readExcel(`upcoming_${type}.xlsx`);
    const filtered = rows.filter((r) => slug(r.title) !== slug(decodeURIComponent(title)));
    writeExcel(`upcoming_${type}.xlsx`, filtered);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
