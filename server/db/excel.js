import * as XLSX from "xlsx";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_DIR = resolve(__dirname, "../../database");

export function dbPath(filename) {
  return resolve(DB_DIR, filename);
}

export function readExcel(filename) {
  const path = dbPath(filename);
  if (!existsSync(path)) return [];
  const buf = readFileSync(path);
  const wb = XLSX.read(buf, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, { defval: "" });
}

export function writeExcel(filename, rows) {
  const path = dbPath(filename);
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, path);
}

export function readJson(filename) {
  const path = dbPath(filename);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

export function writeJson(filename, data) {
  const path = dbPath(filename);
  writeFileSync(path, JSON.stringify(data, null, 2), "utf8");
}
