import * as XLSX from "xlsx";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { writeFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

function makeXlsx(rows) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

// v3 — empty files
const v3db = resolve(__dirname, "../../database");
writeFileSync(resolve(v3db, "series.xlsx"), makeXlsx([]));
writeFileSync(resolve(v3db, "music.xlsx"), makeXlsx([]));
console.log("v3: created empty series.xlsx + music.xlsx");
